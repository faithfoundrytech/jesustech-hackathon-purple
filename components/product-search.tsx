'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover'
import { Filter } from 'lucide-react'
import { cn } from '@/lib/utils'
import useCollectionViewStore from '@/stores/collectionViewStore'

export function ProductSearch() {
  const router = useRouter()
  const { products, isLoadingProducts, getProducts } = useCollectionViewStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [availableCategories, setAvailableCategories] = useState<string[]>([])

  // Extract unique categories when products are loaded
  useEffect(() => {
    if (products && products.length > 0) {
      const categories = new Set<string>()
      products.forEach((product) => {
        product.category.forEach((cat) => categories.add(cat))
      })
      setAvailableCategories(Array.from(categories).sort())
    }
  }, [products])

  // Filter products based on search term and selected categories
  const filteredProducts = products?.filter((product) => {
    const matchesSearch =
      searchTerm === '' ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.some((cat) =>
        cat.toLowerCase().includes(searchTerm.toLowerCase())
      )

    const matchesCategories =
      selectedCategories.length === 0 ||
      product.category.some((cat) => selectedCategories.includes(cat))

    return matchesSearch && matchesCategories
  })

  const handleSearch = () => {
    if (searchTerm.trim()) {
      setShowResults(true)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleCategoryToggle = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(
        selectedCategories.filter((cat) => cat !== category)
      )
    } else {
      setSelectedCategories([...selectedCategories, category])
    }
  }

  const handleClearFilters = () => {
    setSelectedCategories([])
  }

  return (
    <div className='w-full'>
      {/* Hero Section with Search */}
      <div className='w-full bg-bg2 py-16 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-7xl mx-auto text-center'>
          <h1 className='text-4xl font-bold text-primary mb-4'>
            DiraVine Directory
          </h1>
          <p className='text-lg text-gray-600 mb-8 max-w-2xl mx-auto'>
            The marketplace for innovative technology solutions serving the
            Christian community in Africa
          </p>

          {/* Search Bar */}
          <div className='max-w-3xl mx-auto'>
            <div className='flex gap-2'>
              <div className='flex-1 relative'>
                <input
                  type='text'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder='Search for Jesus Tech products...'
                  className='w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
                />
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    className='border-gray-300 hover:bg-white/50'>
                    <Filter className='h-5 w-5' />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-80'>
                  <div className='space-y-4'>
                    <div className='flex items-center justify-between'>
                      <h4 className='font-medium'>Filters</h4>
                      {selectedCategories.length > 0 && (
                        <button
                          onClick={handleClearFilters}
                          className='text-sm text-primary hover:text-primary/80'>
                          Clear all
                        </button>
                      )}
                    </div>
                    <div className='space-y-2'>
                      <h5 className='text-sm font-medium'>Categories</h5>
                      <div className='flex flex-wrap gap-2'>
                        {availableCategories.map((category) => (
                          <button
                            key={category}
                            onClick={() => handleCategoryToggle(category)}
                            className={cn(
                              'text-xs px-3 py-1 rounded-full transition-colors',
                              selectedCategories.includes(category)
                                ? 'bg-primary text-white'
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            )}>
                            {category}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              <Button
                onClick={handleSearch}
                className='bg-primary text-white px-6'>
                Search
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex justify-center gap-4 mt-8'>
            <Button
              onClick={() => router.push('/#categories')}
              className='bg-primary text-white px-8'>
              Browse Categories
            </Button>
            <Button
              onClick={() => router.push('/submit-product')}
              variant='outline'
              className='border-primary text-primary hover:bg-primary hover:text-white'>
              Submit Your Product
            </Button>
          </div>
        </div>
      </div>

      {/* Search Results */}
      {(showResults || selectedCategories.length > 0) && (
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          <div className='bg-white rounded-lg shadow-md overflow-hidden'>
            <div className='px-4 py-5 sm:px-6 border-b border-gray-200'>
              <h3 className='text-lg leading-6 font-medium text-gray-900'>
                Search Results
              </h3>
              <p className='mt-1 text-sm text-gray-500'>
                Found {filteredProducts?.length || 0} products matching your
                criteria
              </p>
            </div>

            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Name
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Country
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Categories
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Website
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {filteredProducts?.map((product) => (
                    <tr key={product._id} className='hover:bg-gray-50'>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                        {product.name}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        {product.country}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        <div className='flex flex-wrap gap-1'>
                          {product.category.map((cat) => (
                            <span
                              key={`${product._id}-${cat}`}
                              className='inline-block px-2 py-0.5 text-xs bg-gray-100 text-gray-800 rounded'>
                              {cat}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        <a
                          href={product.website}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-primary hover:text-primary/80 inline-flex items-center'>
                          Visit
                          <svg
                            className='w-4 h-4 ml-1'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'>
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14'
                            />
                          </svg>
                        </a>
                      </td>
                    </tr>
                  ))}

                  {/* No results state */}
                  {(!filteredProducts || filteredProducts.length === 0) && (
                    <tr>
                      <td
                        colSpan={4}
                        className='px-6 py-12 text-center text-gray-500'>
                        <div className='flex flex-col items-center'>
                          <svg
                            className='w-12 h-12 text-gray-300 mb-3'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'>
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={1}
                              d='M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                            />
                          </svg>
                          <p className='text-lg font-medium'>
                            No products found
                          </p>
                          <p className='text-sm'>
                            Try adjusting your search criteria
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}

                  {/* Loading state */}
                  {isLoadingProducts && (
                    <tr>
                      <td
                        colSpan={4}
                        className='px-6 py-12 text-center text-gray-500'>
                        <div className='flex flex-col items-center'>
                          <svg
                            className='w-8 h-8 text-primary animate-spin mb-3'
                            fill='none'
                            viewBox='0 0 24 24'>
                            <circle
                              className='opacity-25'
                              cx='12'
                              cy='12'
                              r='10'
                              stroke='currentColor'
                              strokeWidth='4'
                            />
                            <path
                              className='opacity-75'
                              fill='currentColor'
                              d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                            />
                          </svg>
                          <p>Loading products...</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
