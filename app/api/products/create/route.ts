export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Product from '@/models/Product'

export async function POST(request: Request) {
  try {
    await dbConnect()

    const body = await request.json()

    // Function to validate a single product
    const validateProduct = (product: any) => {
      const requiredFields = [
        'name',
        'country',
        'category',
        'description',
        'website',
      ]
      for (const field of requiredFields) {
        if (!product[field]) {
          throw new Error(`Missing required field: ${field}`)
        }
      }
      return {
        name: product.name,
        country: product.country,
        category: Array.isArray(product.category)
          ? product.category
          : [product.category],
        description: product.description,
        website: product.website,
        logo: product.logo || null,
      }
    }

    // Check if the input is an array
    const isBulk = Array.isArray(body)
    const productsToCreate = isBulk ? body : [body]

    // Validate all products
    const validatedProducts = productsToCreate.map(validateProduct)

    // Create products
    const createdProducts = await Product.create(validatedProducts)

    return NextResponse.json({
      success: true,
      data: isBulk ? createdProducts : createdProducts[0],
    })
  } catch (error: any) {
    console.error('Error creating product(s):', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create product(s)' },
      { status: error.message ? 400 : 500 }
    )
  }
}
