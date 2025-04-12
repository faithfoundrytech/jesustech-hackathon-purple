export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import FeaturedProduct from '@/models/FeaturedProduct'

export async function GET(request: Request) {
  try {
    await dbConnect()

    // Get URL parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const currentDate = new Date()

    // Build query for active featured products
    const query = {
      status: true,
      $or: [
        // Products with no date range (always active)
        { startDate: { $exists: false }, endDate: { $exists: false } },
        // Products with only start date (active from start date)
        { startDate: { $lte: currentDate }, endDate: { $exists: false } },
        // Products with only end date (active until end date)
        { startDate: { $exists: false }, endDate: { $gte: currentDate } },
        // Products with both dates (active within range)
        {
          startDate: { $lte: currentDate },
          endDate: { $gte: currentDate },
        },
      ],
    }

    // Get total count for pagination
    const total = await FeaturedProduct.countDocuments(query)

    // Get featured products with pagination and populate product details
    const featuredProducts = await FeaturedProduct.find(query)
      .populate('productId')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    return NextResponse.json({
      success: true,
      data: {
        featuredProducts,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error: any) {
    console.error('Error listing featured products:', error)
    return NextResponse.json(
      { error: 'Failed to list featured products' },
      { status: 500 }
    )
  }
}
