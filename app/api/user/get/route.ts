import { NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getAuthenticatedUser()

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
    if (error instanceof Response) {
      return error
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get user',
      },
      { status: 500 }
    )
  }
}
