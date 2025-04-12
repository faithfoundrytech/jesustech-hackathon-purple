'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProductCard } from '@/components/product-card'
import useCollectionViewStore from '@/stores/collectionViewStore'

interface Product {
  _id: string
  name: string
  country: string
  category: string[]
  description: string
  website: string
  logo?: string
}

export default function ProductPage({
  params,
}: {
  params: { productId: string }
}) {
  const router = useRouter()
  const { products, getProducts } = useCollectionViewStore()
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])

  useEffect(() => {
    if (!products) {
      getProducts()
    }
  }, [getProducts, products])

  useEffect(() => {
    if (products && products.length > 0) {
      const foundProduct = products.find((p) => p._id === params.productId)
      if (foundProduct) {
        setProduct(foundProduct)

        // Find related products (up to 3) that share at least one category
        const related = products
          .filter((p) => p._id !== params.productId)
          .filter((p) =>
            p.category.some((cat) => foundProduct.category.includes(cat))
          )
          .slice(0, 3)
        setRelatedProducts(related)
      }
    }
  }, [products, params.productId])

  if (!product) {
    return (
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='flex items-center justify-center h-96'>
          <p className='text-gray-500'>Loading product details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      {/* Back Button */}
      <Button
        variant='ghost'
        className='mb-6 hover:bg-transparent p-0 flex items-center text-gray-600 hover:text-primary'
        onClick={() => router.back()}>
        <ArrowLeft className='w-5 h-5 mr-2' />
        Back
      </Button>

      {/* Product Details */}
      <div className='bg-white rounded-lg shadow-md p-6'>
        <div className='flex items-start gap-6'>
          {/* Logo */}
          <div className='relative w-32 h-32 flex-shrink-0'>
            <Image
              src={product.logo || '/diravinelogo.png'}
              alt={`${product.name} logo`}
              fill
              className='object-contain'
            />
          </div>

          {/* Company Info */}
          <div className='flex-1'>
            <div className='flex items-center justify-between'>
              <div>
                <h1 className='text-3xl font-bold text-gray-900'>
                  {product.name}
                </h1>
                <p className='text-gray-500 mt-1'>{product.country}</p>
              </div>
              <Button asChild>
                <a
                  href={product.website}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='bg-primary text-white hover:bg-primary/90'>
                  Visit Website
                </a>
              </Button>
            </div>

            {/* Category Tags */}
            <div className='flex flex-wrap gap-2 mt-4'>
              {product.category.map((cat) => (
                <Badge key={cat} variant='default'>
                  {cat}
                </Badge>
              ))}
            </div>

            {/* Description */}
            <div className='mt-6'>
              <h2 className='text-xl font-semibold text-gray-900 mb-2'>
                About
              </h2>
              <p className='text-gray-600 whitespace-pre-line'>
                {product.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className='mt-12'>
          <h2 className='text-2xl font-bold text-gray-900 mb-6'>
            Related Products
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct._id} product={relatedProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
