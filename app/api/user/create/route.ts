import { NextResponse } from 'next/server'
import { createOrUpdateUserFromClerk } from '@/lib/auth'
import { auth } from '@clerk/nextjs/server'

export async function POST() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      )
    }

    const user = await createOrUpdateUserFromClerk(userId)

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          status: user.status,
          image: user.image,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error creating/updating user:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create or update user',
      },
      { status: 500 }
    )
  }
}
