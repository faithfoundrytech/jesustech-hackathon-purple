import { NextResponse } from 'next/server'
import { getAuthenticatedUser, deleteUser } from '@/lib/auth'

export async function DELETE() {
  try {
    const user = await getAuthenticatedUser()

    const deletedUser = await deleteUser(user._id.toString())

    if (!deletedUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
        },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'User deleted successfully',
        user: {
          id: deletedUser._id,
          name: deletedUser.name,
          email: deletedUser.email,
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
        error: 'Failed to delete user',
      },
      { status: 500 }
    )
  }
}
