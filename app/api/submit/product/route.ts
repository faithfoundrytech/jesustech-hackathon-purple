import { NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth'
import dbConnect from '@/lib/dbConnect'
import Product from '@/models/Product'

export async function POST(request: Request) {
  try {
    // Check if user is authenticated
    const user = await getAuthenticatedUser()

    await dbConnect()

    const body = await request.json()

    // Validate required fields
    const requiredFields = [
      'name',
      'country',
      'categories',
      'description',
      'website',
      'yourName',
      'yourEmail',
    ]
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Create the product
    const product = await Product.create({
      name: body.name,
      country: body.country,
      category: Array.isArray(body.categories)
        ? body.categories
        : [body.categories],
      description: body.description,
      website: body.website,
      logo: body.logo || undefined,
      submittedBy: user._id,
      active: false, // Set to false as requested
    })

    return NextResponse.json({
      success: true,
      message: 'Product submitted successfully',
      data: {
        id: product._id,
        name: product.name,
        country: product.country,
        categories: product.category,
        description: product.description,
        website: product.website,
        logo: product.logo,
        active: product.active,
        createdAt: product.createdAt,
      },
    })
  } catch (error) {
    // Handle authentication errors
    if (error instanceof Response) {
      return error
    }

    console.error('Error submitting product:', error)
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to submit product',
      },
      { status: 500 }
    )
  }
}
