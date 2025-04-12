export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Chat from '@/models/Chat'

export async function POST(request: Request) {
  try {
    await dbConnect()

    const { sessionId, name } = await request.json()

    // Validate required fields
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Generate default chat name if not provided
    const chatName = name || `Chat Session - ${new Date().toLocaleDateString()}`

    // Create new chat
    const chat = await Chat.create({
      name: chatName,
      sessionId,
      status: 'active',
      lastMessageAt: new Date(),
      messageCount: 0,
    })

    return NextResponse.json({
      success: true,
      data: {
        chat,
      },
    })
  } catch (error: any) {
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
