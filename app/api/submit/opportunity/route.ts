import { NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth'
import dbConnect from '@/lib/dbConnect'
import Opportunity from '@/models/Opportunity'

export async function POST(request: Request) {
  try {
    // Check if user is authenticated
    const user = await getAuthenticatedUser()

    await dbConnect()

    const body = await request.json()

    // Validate required fields
    const requiredFields = [
      'name',
      'email',
      'country',
      'categories',
      'description',
      'type',
    ]
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Create the opportunity
    const opportunity = await Opportunity.create({
      name: body.name,
      email: body.email,
      country: body.country,
      ministry: body.ministry || undefined,
      categories: Array.isArray(body.categories)
        ? body.categories
        : [body.categories],
      description: body.description,
      createdBy: user._id,
      active: false, // Set to false as requested
      sponsored: body.sponsored || false,
      type: body.type,
    })

    return NextResponse.json({
      success: true,
      message: 'Opportunity submitted successfully',
      data: {
        id: opportunity._id,
        name: opportunity.name,
        email: opportunity.email,
        country: opportunity.country,
        ministry: opportunity.ministry,
        categories: opportunity.categories,
        description: opportunity.description,
        active: opportunity.active,
        sponsored: opportunity.sponsored,
        createdAt: opportunity.createdAt,
        type: opportunity.type,
      },
    })
  } catch (error) {
    // Handle authentication errors
    if (error instanceof Response) {
      return error
    }

    console.error('Error submitting opportunity:', error)
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to submit opportunity',
      },
      { status: 500 }
    )
  }
}
