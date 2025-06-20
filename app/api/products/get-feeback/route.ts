import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import ProductFeedback from '@/models/ProductFeedback'
import ProductFeedbackAnalytics from '@/models/ProductFeedbackAnalytics'
import { getCurrentUser } from '@/lib/auth'
import mongoose from 'mongoose'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json(
        { error: 'Missing required parameter: productId' },
        { status: 400 }
      )
    }

    // Validate productId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json({ error: 'Invalid productId' }, { status: 400 })
    }

    const productObjectId = new mongoose.Types.ObjectId(productId)

    // Get analytics for the product
    const analytics = await ProductFeedbackAnalytics.findOne({
      productId: productObjectId,
    })

    // Build response object
    const response: {
      analytics: { upVote: number; downVote: number; inUse: number }
      userFeedback?: { upVoted: boolean; downVoted: boolean; used: boolean }
    } = {
      analytics: {
        upVote: analytics?.upVote || 0,
        downVote: analytics?.downVote || 0,
        inUse: analytics?.inUse || 0,
      },
    }

    // Get current user (optional - no error if not logged in)
    const user = await getCurrentUser()
    if (user) {
      // Get user's specific feedback for this product
      const userFeedback = await ProductFeedback.findOne({
        productId: productObjectId,
        userId: user._id,
      })

      response.userFeedback = userFeedback || {
        upVoted: false,
        downVoted: false,
        used: false,
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error getting feedback:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
