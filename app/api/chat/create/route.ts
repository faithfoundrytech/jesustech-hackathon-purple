export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Chat from '@/models/Chat'
import {
  getAuthenticatedUser,
  checkChatLimits,
  incrementChatCount,
} from '@/lib/auth'

export async function POST(request: Request) {
  try {
    await dbConnect()

    // Authenticate user
    const user = await getAuthenticatedUser()

    const { sessionId, name, chatType = 'product' } = await request.json()

    // Validate required fields
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Validate chat type
    if (!['product', 'opportunity'].includes(chatType)) {
      return NextResponse.json(
        { error: 'Invalid chat type. Must be "product" or "opportunity"' },
        { status: 400 }
      )
    }

    // Check chat limits
    const { canChat, remainingChats } = await checkChatLimits(user._id)
    if (!canChat) {
      return NextResponse.json(
        {
          error:
            'Monthly chat limit exceeded. You can create up to 3 chats per month.',
          remainingChats: 0,
        },
        { status: 429 }
      )
    }

    // Generate default chat name if not provided
    const chatName =
      name ||
      `${
        chatType.charAt(0).toUpperCase() + chatType.slice(1)
      } Chat - ${new Date().toLocaleDateString()}`

    // Create new chat
    const chat = await Chat.create({
      name: chatName,
      sessionId,
      userId: user._id,
      chatType,
      status: 'active',
      lastMessageAt: new Date(),
      messageCount: 0,
    })

    // Increment chat count
    await incrementChatCount(user._id)

    // Calculate remaining chats after this creation
    const newRemainingChats = remainingChats === -1 ? -1 : remainingChats - 1

    return NextResponse.json({
      success: true,
      data: {
        chat,
        remainingChats: newRemainingChats,
      },
    })
  } catch (error: unknown) {
    // Handle authentication errors
    if (error instanceof Response) {
      return error
    }

    console.error('Failed to create chat:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      },
      { status: 500 }
    )
  }
}
