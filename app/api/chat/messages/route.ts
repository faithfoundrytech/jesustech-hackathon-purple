export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Chat from '@/models/Chat'
import ChatMessage from '@/models/ChatMessage'

export async function GET(request: Request) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const chatId = searchParams.get('chatId')
    const sessionId = searchParams.get('sessionId')
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const skip = (page - 1) * limit

    if (!chatId || !sessionId) {
      return NextResponse.json(
        { error: 'Chat ID and session ID are required' },
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
      return NextResponse.json(
        { error: 'Chat not found or access denied' },
        { status: 404 }
      )
    }

    // Get messages for the chat
    const messages = await ChatMessage.find({ chatId })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .lean()

    const totalMessages = await ChatMessage.countDocuments({ chatId })

    return NextResponse.json({
      success: true,
      data: {
        messages,
        total: totalMessages,
        page,
        limit,
      },
    })
  } catch (error: any) {
    console.error('Failed to fetch chat messages:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      },
      { status: 500 }
    )
  }
}
