export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import FeaturedProduct from '@/models/FeaturedProduct'
import Product from '@/models/Product'

export async function POST(request: Request) {
  try {
    await dbConnect()

    const body = await request.json()

    // Validate required fields
    if (!body.productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Check if product exists
    const product = await Product.findById(body.productId)
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Validate dates if provided
    if (body.startDate || body.endDate) {
      const startDate = body.startDate ? new Date(body.startDate) : null
      const endDate = body.endDate ? new Date(body.endDate) : null

      // Validate date format
      if (startDate && isNaN(startDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid start date format' },
          { status: 400 }
        )
      }

      if (endDate && isNaN(endDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid end date format' },
          { status: 400 }
        )
      }

      // Validate date logic
      if (startDate && endDate && startDate > endDate) {
        return NextResponse.json(
          { error: 'Start date must be before end date' },
          { status: 400 }
        )
      }
    }

    // Check if product is already featured
    const existingFeatured = await FeaturedProduct.findOne({
      productId: body.productId,
      status: true,
    })

    if (existingFeatured) {
      return NextResponse.json(
        { error: 'Product is already featured' },
        { status: 400 }
      )
    }

    // Create featured product
    const featuredProduct = await FeaturedProduct.create({
      productId: body.productId,
      status: body.status ?? true, // Default to true if not provided
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
    })

    return NextResponse.json({
      success: true,
      data: featuredProduct,
    })
  } catch (error: any) {
    console.error('Error creating featured product:', error)
    return NextResponse.json(
      { error: 'Failed to create featured product' },
      { status: 500 }
    )
  }
}
