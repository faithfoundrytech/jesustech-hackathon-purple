'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import useCollectionViewStore from '@/stores/collectionViewStore'
import { ArrowRight } from 'lucide-react'

export function ProductCategories() {
  const { products } = useCollectionViewStore()
  const [categories, setCategories] = useState<
    { name: string; count: number }[]
  >([])

  useEffect(() => {
    if (products && products.length > 0) {
      const categoryMap = new Map<string, number>()

      // Count products for each category
      products.forEach((product) => {
        product.category.forEach((cat) => {
          categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1)
        })
      })

      // Convert map to array and sort by count (descending)
      const sortedCategories = Array.from(categoryMap)
        .map(([name, count]) => ({
          name,
          count,
        }))
        .sort((a, b) => b.count - a.count)

      setCategories(sortedCategories)
    }
  }, [products])

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
      <h2 className='text-3xl font-bold text-gray-900 mb-8'>Categories</h2>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {categories.map((category) => (
          <Link
            key={category.name}
            href={`/products/${encodeURIComponent(
              category.name.toLowerCase()
            )}`}
            className='group'>
            <div className='flex items-center justify-between bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-all duration-200'>
              <div>
                <h3 className='text-xl font-semibold text-gray-900 group-hover:text-primary'>
                  {category.name}
                </h3>
                <p className='text-gray-600 mt-1'>
                  {category.count}{' '}
                  {category.count === 1 ? 'company' : 'companies'}
                </p>
              </div>
              <ArrowRight className='w-5 h-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all duration-200' />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
