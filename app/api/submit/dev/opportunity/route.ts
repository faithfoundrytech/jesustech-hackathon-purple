import { NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Opportunity from '@/models/Opportunity'

export async function POST(request: Request) {
  try {
    await dbConnect()

    const body = await request.json()

    // Check if body is an array
    if (!Array.isArray(body)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Request body must be an array of opportunities',
        },
        { status: 400 }
      )
    }

    // Validate each opportunity in the array
    const requiredFields = [
      'name',
      'email',
      'country',
      'categories',
      'description',
      'type',
    ]

    const errors: string[] = []

    interface ValidatedOpportunity {
      name: string
      email: string
      country: string
      ministry?: string
      categories: string[]
      description: string
      active: boolean
      sponsored: boolean
      type: 'problem' | 'job'
    }

    const validatedOpportunities: ValidatedOpportunity[] = []

    body.forEach((opportunity, index) => {
      for (const field of requiredFields) {
        if (!opportunity[field]) {
          errors.push(
            `Opportunity at index ${index}: Missing required field: ${field}`
          )
        }
      }

      if (
        errors.length === 0 ||
        !errors.some((error) => error.includes(`index ${index}`))
      ) {
        validatedOpportunities.push({
          name: opportunity.name,
          email: opportunity.email,
          country: opportunity.country,
          ministry: opportunity.ministry || undefined,
          categories: Array.isArray(opportunity.categories)
            ? opportunity.categories
            : [opportunity.categories],
          description: opportunity.description,
          active: opportunity.active !== undefined ? opportunity.active : false,
          sponsored: opportunity.sponsored || false,
          type: opportunity.type,
        })
      }
    })

    if (errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation errors',
          details: errors,
        },
        { status: 400 }
      )
    }

    // Create all opportunities
    const createdOpportunities = await Opportunity.insertMany(
      validatedOpportunities
    )

    return NextResponse.json({
      success: true,
      message: `${createdOpportunities.length} opportunities created successfully`,
      data: createdOpportunities.map((opportunity) => ({
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
      })),
    })
  } catch (error) {
    console.error('Error creating opportunities:', error)
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to create opportunities',
      },
      { status: 500 }
    )
  }
}
