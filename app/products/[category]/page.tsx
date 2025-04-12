'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import useCollectionViewStore from '@/stores/collectionViewStore'
import { ProductCard } from '@/components/product-card'
import { Button } from '@/components/ui/button'

interface Product {
  _id: string
  name: string
  country: string
  category: string[]
  description: string
  website: string
  logo?: string
}

export default function CategoryPage({
  params,
}: {
  params: { category: string }
}) {
  const router = useRouter()
  const { products } = useCollectionViewStore()
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([])

  const decodedCategory = decodeURIComponent(params.category)
  const categoryName = decodedCategory
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  useEffect(() => {
    if (products && products.length > 0) {
      const filtered = products.filter((product) =>
        product.category.some(
          (cat) => cat.toLowerCase() === decodedCategory.toLowerCase()
        )
      )
      setCategoryProducts(filtered)
    }
  }, [products, decodedCategory])

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      <div className='mb-8'>
        <Button
          variant='ghost'
          className='mb-4 hover:bg-transparent p-0 flex items-center text-gray-600 hover:text-primary'
          onClick={() => router.back()}>
          <ArrowLeft className='w-5 h-5 mr-2' />
          Back
        </Button>

        <h1 className='text-3xl font-bold text-gray-900 flex items-center gap-2'>
          {categoryName}
          <span className='text-gray-500 text-2xl'>
            ({categoryProducts.length})
          </span>
        </h1>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {categoryProducts.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}

        {categoryProducts.length === 0 && (
          <div className='col-span-full text-center py-12'>
            <p className='text-gray-500 text-lg'>
              No products found in this category
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
