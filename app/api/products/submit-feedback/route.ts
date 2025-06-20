import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import ProductFeedback from '@/models/ProductFeedback'
import ProductFeedbackAnalytics from '@/models/ProductFeedbackAnalytics'
import { getCurrentUser } from '@/lib/auth'
import mongoose from 'mongoose'

export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    // Get current user
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user._id.toString()
    const body = await request.json()
    const { productId, type, added } = body

    if (!productId || !type || typeof added !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing required fields: productId, type, added' },
        { status: 400 }
      )
    }

    if (!['upvote', 'downvote', 'used'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be: upvote, downvote, or used' },
        { status: 400 }
      )
    }

    // Validate productId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json({ error: 'Invalid productId' }, { status: 400 })
    }

    const productObjectId = new mongoose.Types.ObjectId(productId)
    const userObjectId = new mongoose.Types.ObjectId(userId)

    // Find or create user feedback
    let userFeedback = await ProductFeedback.findOne({
      productId: productObjectId,
      userId: userObjectId,
    })

    if (!userFeedback) {
      userFeedback = new ProductFeedback({
        productId: productObjectId,
        userId: userObjectId,
        upVoted: false,
        downVoted: false,
        used: false,
      })
    }

    // Store previous state for analytics calculation
    const previousState = {
      upVoted: userFeedback.upVoted,
      downVoted: userFeedback.downVoted,
      used: userFeedback.used,
    }

    // Update user feedback based on type
    switch (type) {
      case 'upvote':
        userFeedback.upVoted = added
        // If upvoting, clear downvote
        if (added) {
          userFeedback.downVoted = false
        }
        break
      case 'downvote':
        userFeedback.downVoted = added
        // If downvoting, clear upvote
        if (added) {
          userFeedback.upVoted = false
        }
        break
      case 'used':
        userFeedback.used = added
        break
    }

    await userFeedback.save()

    // Find or create analytics record
    let analytics = await ProductFeedbackAnalytics.findOne({
      productId: productObjectId,
    })

    if (!analytics) {
      analytics = new ProductFeedbackAnalytics({
        productId: productObjectId,
        upVote: 0,
        downVote: 0,
        inUse: 0,
      })
    }

    // Update analytics based on the change
    switch (type) {
      case 'upvote':
        // Handle upvote change
        if (previousState.upVoted !== userFeedback.upVoted) {
          analytics.upVote += userFeedback.upVoted ? 1 : -1
        }
        // Handle downvote change (if it was cleared when upvoting)
        if (previousState.downVoted !== userFeedback.downVoted) {
          analytics.downVote += userFeedback.downVoted ? 1 : -1
        }
        break
      case 'downvote':
        // Handle downvote change
        if (previousState.downVoted !== userFeedback.downVoted) {
          analytics.downVote += userFeedback.downVoted ? 1 : -1
        }
        // Handle upvote change (if it was cleared when downvoting)
        if (previousState.upVoted !== userFeedback.upVoted) {
          analytics.upVote += userFeedback.upVoted ? 1 : -1
        }
        break
      case 'used':
        if (previousState.used !== userFeedback.used) {
          analytics.inUse += userFeedback.used ? 1 : -1
        }
        break
    }

    // Ensure analytics don't go below 0
    analytics.upVote = Math.max(0, analytics.upVote)
    analytics.downVote = Math.max(0, analytics.downVote)
    analytics.inUse = Math.max(0, analytics.inUse)

    await analytics.save()

    return NextResponse.json({
      success: true,
      userFeedback,
      analytics: {
        upVote: analytics.upVote,
        downVote: analytics.downVote,
        inUse: analytics.inUse,
      },
    })
  } catch (error) {
    console.error('Error submitting feedback:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
