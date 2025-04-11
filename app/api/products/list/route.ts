export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Product from '@/models/Product'

export async function GET(request: Request) {
  try {
    await dbConnect()

    // Get URL parameters
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const country = searchParams.get('country')
    const category = searchParams.get('category')

    // Build query
    const query: any = {}

    // Add search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ]
    }

    // Filter by country
    if (country) {
      query.country = country
    }

    // Filter by category
    if (category) {
      query.category = category
    }

    // Get total count for pagination
    const total = await Product.countDocuments(query)

    // Get products with pagination
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    // Get unique countries and categories for filtering options
    const countries = await Product.distinct('country')
    const categories = await Product.distinct('category')

    return NextResponse.json({
      success: true,
      data: {
        products,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
        filters: {
          countries,
          categories,
        },
      },
    })
  } catch (error: any) {
    console.error('Error listing products:', error)
    return NextResponse.json(
      { error: 'Failed to list products' },
      { status: 500 }
    )
  }
}
