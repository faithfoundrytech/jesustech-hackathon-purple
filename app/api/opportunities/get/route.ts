import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Opportunity from '@/models/Opportunity'
import mongoose from 'mongoose'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const opportunityId = searchParams.get('opportunityId')

    if (!opportunityId) {
      return NextResponse.json(
        { error: 'Missing required parameter: opportunityId' },
        { status: 400 }
      )
    }

    // Validate opportunityId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(opportunityId)) {
      return NextResponse.json(
        { error: 'Invalid opportunityId' },
        { status: 400 }
      )
    }

    const opportunity = await Opportunity.findById(opportunityId)

    if (!opportunity) {
      return NextResponse.json(
        { error: 'Opportunity not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ opportunity })
  } catch (error) {
    console.error('Error getting opportunity:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
