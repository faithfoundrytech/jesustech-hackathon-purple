import { NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Product from '@/models/Product'

export async function POST(request: Request) {
  try {
    await dbConnect()

    const body = await request.json()

    // Check if body is an array
    if (!Array.isArray(body)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Request body must be an array of products',
        },
        { status: 400 }
      )
    }

    // Validate each product in the array
    const requiredFields = [
      'name',
      'country',
      'categories',
      'description',
      'website',
    ]

    const errors: string[] = []

    interface ValidatedProduct {
      name: string
      country: string
      category: string[]
      description: string
      website: string
      logo?: string
      active: boolean
      featured: boolean
    }

    const validatedProducts: ValidatedProduct[] = []

    body.forEach((product, index) => {
      for (const field of requiredFields) {
        if (!product[field]) {
          errors.push(
            `Product at index ${index}: Missing required field: ${field}`
          )
        }
      }

      if (
        errors.length === 0 ||
        !errors.some((error) => error.includes(`index ${index}`))
      ) {
        validatedProducts.push({
          name: product.name,
          country: product.country,
          category: Array.isArray(product.categories)
            ? product.categories
            : [product.categories],
          description: product.description,
          website: product.website,
          logo: product.logo || undefined,
          active: product.active !== undefined ? product.active : false,
          featured: product.featured || false,
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

    // Create all products
    const createdProducts = await Product.insertMany(validatedProducts)

    return NextResponse.json({
      success: true,
      message: `${createdProducts.length} products created successfully`,
      data: createdProducts.map((product) => ({
        id: product._id,
        name: product.name,
        country: product.country,
        categories: product.category,
        description: product.description,
        website: product.website,
        logo: product.logo,
        active: product.active,
        featured: product.featured,
        createdAt: product.createdAt,
      })),
    })
  } catch (error) {
    console.error('Error creating products:', error)
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to create products',
      },
      { status: 500 }
    )
  }
}
