export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Chat from '@/models/Chat'
import ChatMessage from '@/models/ChatMessage'
import {
  vercelAIClient,
  ChatMessage as AIChatMessage,
} from '@/lib/vercel-ai-sdk'
import { logger } from '@/utils/logger'

export async function POST(request: Request) {
  const context = 'ChatSendAPI'
  try {
    logger.info(context, 'Starting chat message send process')
    await dbConnect()

    const { chatId, sessionId, message } = await request.json()

    // Validate required fields
    if (!chatId || !sessionId || !message) {
      logger.warn(context, 'Missing required fields', {
        chatId,
        sessionId,
        hasMessage: !!message,
      })
      return NextResponse.json(
        { error: 'Chat ID, session ID, and message are required' },
        { status: 400 }
      )
    }

    // Verify chat exists and belongs to the session
    const chat = await Chat.findOne({
      _id: chatId,
      sessionId,
      status: 'active',
    })

    if (!chat) {
      logger.warn(context, 'Chat not found or access denied', {
        chatId,
        sessionId,
      })
      return NextResponse.json(
        { error: 'Chat not found or access denied' },
        { status: 404 }
      )
    }

    // Save the user's message
    logger.debug(context, 'Saving user message')
    const userMessage = await ChatMessage.create({
      chatId: chat._id,
      content: message,
      senderType: 'user',
      sessionId,
      createdAt: new Date(),
    })

    // Update chat
    await Chat.findByIdAndUpdate(chat._id, {
      $inc: { messageCount: 1 },
      lastMessageAt: new Date(),
    })

    // Get previous messages for context (limit to last 10)
    logger.debug(context, 'Fetching previous messages for context')
    const previousMessages = await ChatMessage.find({ chatId: chat._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()

    // Format messages for AI
    const aiMessages: AIChatMessage[] = previousMessages
      .reverse()
      .map((msg) => ({
        role: msg.senderType === 'ai' ? 'assistant' : 'user',
        content: msg.content,
      }))

    // Add the new message
    aiMessages.push({
      role: 'user',
      content: message,
    })

    // Create response with custom headers for chat ID
    logger.info(context, 'Starting AI response stream')
    const encoder = new TextEncoder()
    const customReadable = new ReadableStream({
      async start(controller) {
        try {
          let fullResponse = ''
          const startTime = Date.now()

          await vercelAIClient.sendMessage(
            aiMessages,
            {
              model: 'openai/chatgpt-4o-latest',
              temperature: 0.7,
              maxTokens: 2000,
            },
            (chunk: string) => {
              fullResponse += chunk
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ content: chunk })}\n\n`
                )
              )
            }
          )

          // Save the AI's response
          logger.debug(context, 'Saving AI response', {
            responseLength: fullResponse.length,
            processingTime: Date.now() - startTime,
          })

          await ChatMessage.create({
            chatId: chat._id,
            content: fullResponse,
            senderType: 'ai',
            sessionId,
            metadata: {
              aiModel: 'openai/chatgpt-4o-latest',
              processingTime: Date.now() - startTime,
            },
            createdAt: new Date(),
          })

          // Update chat again
          await Chat.findByIdAndUpdate(chat._id, {
            $inc: { messageCount: 1 },
            lastMessageAt: new Date(),
          })

          logger.info(context, 'AI response completed successfully', {
            chatId: chat._id ? chat._id.toString() : String(chat._id),
            processingTime: Date.now() - startTime,
          })

          controller.close()
        } catch (error) {
          logger.error(context, 'Error in AI response stream', error)
          controller.error(error)
        }
      },
    })

    return new NextResponse(customReadable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Chat-Id': chat._id?.toString() || '',
      },
    })
  } catch (error: any) {
    logger.error(context, 'Failed to process chat request', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      },
      { status: 500 }
    )
  }
}
