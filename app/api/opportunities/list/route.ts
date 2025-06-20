export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Opportunity from '@/models/Opportunity'

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
    const type = searchParams.get('type') // 'problem' or 'job'
    const featured = searchParams.get('featured') === 'true'

    // Build query
    const query: Record<string, unknown> = { active: true }

    // Add search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { ministry: { $regex: search, $options: 'i' } },
      ]
    }

    // Filter by country (handle multiple countries)
    if (country) {
      const countries = country.split(',').filter((c) => c.trim())
      if (countries.length > 0) {
        query.country = { $in: countries }
      }
    }

    // Filter by category (handle multiple categories)
    if (category) {
      const categories = category.split(',').filter((c) => c.trim())
      if (categories.length > 0) {
        query.categories = { $in: categories }
      }
    }

    // Filter by type
    if (type) {
      query.type = type
    }

    // Filter for featured opportunities
    if (featured) {
      query.sponsored = true
    }

    // Get total count for pagination
    const total = await Opportunity.countDocuments(query)

    // Get opportunities with pagination
    const opportunities = await Opportunity.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    // Get unique countries and categories for filtering options
    const countries = await Opportunity.distinct('country', { active: true })
    const categories = await Opportunity.distinct('categories', {
      active: true,
    })

    return NextResponse.json({
      success: true,
      data: {
        opportunities,
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
  } catch (error: unknown) {
    console.error('Error listing opportunities:', error)
    return NextResponse.json(
      { error: 'Failed to list opportunities' },
      { status: 500 }
    )
  }
}
