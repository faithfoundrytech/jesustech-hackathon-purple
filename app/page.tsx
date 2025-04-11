'use client'

import { useEffect, useState } from 'react'
import useCollectionViewStore from '@/stores/collectionViewStore'

export default function Home() {
  const { products, isLoadingProducts, getProducts, refreshProducts } = useCollectionViewStore()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategories, setSelectedCategories] = useState([])
  const [availableCategories, setAvailableCategories] = useState([])
  
  useEffect(() => {
    if (!products) {
      getProducts()
    }
  }, [getProducts, products])
  
  // Extract unique categories when products are loaded
  useEffect(() => {
    if (products && products.length > 0) {
      const categories = new Set()
      products.forEach(product => {
        product.category.forEach(cat => categories.add(cat))
      })
      setAvailableCategories(Array.from(categories).sort())
    }
  }, [products])
  
  const handleCategoryToggle = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(cat => cat !== category))
    } else {
      setSelectedCategories([...selectedCategories, category])
    }
  }
  
  const handleClearFilters = () => {
    setSearchTerm('')
    setSelectedCategories([])
  }
  
  // Filter products based on search term and selected categories
  const filteredProducts = products?.filter(product => {
    const matchesSearch = searchTerm === '' || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.some(cat => cat.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategories = selectedCategories.length === 0 || 
      product.category.some(cat => selectedCategories.includes(cat))
    
    return matchesSearch && matchesCategories
  })

  return (
    <div className='min-h-screen p-8'>
      <div className='max-w-7xl mx-auto'>
        <div className='mb-6'>
          <h1 className='text-3xl font-bold mb-6'>Products</h1>
          
          {/* Search and Filter Section */}
          <div className='bg-white p-6 rounded-lg shadow-md mb-6'>
            <div className='flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 mb-4'>
              {/* Search Input */}
              <div className='flex-grow'>
                <label htmlFor='search' className='block text-sm font-medium text-gray-700 mb-1'>
                  Search Products
                </label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <svg className='h-5 w-5 text-gray-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                    </svg>
                  </div>
                  <input
                    type='text'
                    id='search'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder='Search by name, country, or category...'
                    className='pl-10 pr-4 py-2 border border-gray-300 focus:ring-blue-500 focus:border-blue-500 block w-full rounded-md text-sm'
                  />
                </div>
              </div>
              
              {/* Refresh Button */}
              <div className='flex-shrink-0'>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Actions
                </label>
                <button
                  onClick={refreshProducts}
                  className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors w-full'
                  disabled={isLoadingProducts}
                >
                  {isLoadingProducts ? 'Loading...' : 'Refresh Products'}
                </button>
              </div>
            </div>
            
            {/* Category Filters */}
            <div>
              <div className='flex items-center justify-between mb-2'>
                <label className='block text-sm font-medium text-gray-700'>
                  Filter by Category
                </label>
                {selectedCategories.length > 0 && (
                  <button 
                    onClick={handleClearFilters}
                    className='text-sm text-blue-500 hover:text-blue-700'
                  >
                    Clear all filters
                  </button>
                )}
              </div>
              <div className='flex flex-wrap gap-2'>
                {availableCategories.map(category => (
                  <button
                    key={category}
                    onClick={() => handleCategoryToggle(category)}
                    className={`text-xs px-3 py-1 rounded-full ${
                      selectedCategories.includes(category)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    } transition-colors`}
                  >
                    {category}
                  </button>
                ))}
                {availableCategories.length === 0 && !isLoadingProducts && (
                  <span className='text-sm text-gray-500'>No categories available</span>
                )}
              </div>
            </div>
          </div>
          
          {/* Results Summary */}
          <div className='flex justify-between items-center mb-4'>
            <div className='text-sm text-gray-500'>
              {filteredProducts ? 
                `Showing ${filteredProducts.length} ${filteredProducts.length === 1 ? 'product' : 'products'}` : 
                'Loading products...'
              }
            </div>
          </div>
          
          {/* Products Table */}
          <div className='bg-white rounded-lg shadow-md overflow-hidden'>
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead>
                  <tr className='bg-gray-50'>
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
                <tbody className='divide-y divide-gray-200'>
                  {filteredProducts?.map((product) => (
                    <tr key={product._id} className='hover:bg-gray-50'>
                      <td className='px-6 py-4 whitespace-nowrap font-medium'>
                        {product.name}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        {product.country}
                      </td>
                      <td className='px-6 py-4'>
                        <div className='flex flex-wrap gap-1'>
                          {product.category.map(cat => (
                            <span 
                              key={`${product._id}-${cat}`}
                              className='inline-block px-2 py-0.5 text-xs bg-gray-100 text-gray-800 rounded'
                            >
                              {cat}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <a
                          href={product.website}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-blue-500 hover:text-blue-700 inline-flex items-center'
                        >
                          Visit
                          <svg className='w-4 h-4 ml-1' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14' />
                          </svg>
                        </a>
                      </td>
                    </tr>
                  ))}
                  
                  {/* No results state */}
                  {filteredProducts?.length === 0 && !isLoadingProducts && (
                    <tr>
                      <td colSpan={4} className='px-6 py-12 text-center text-gray-500'>
                        <div className='flex flex-col items-center'>
                          <svg className='w-12 h-12 text-gray-300 mb-3' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1} d='M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                          </svg>
                          <p className='text-lg font-medium'>No products found</p>
                          <p className='text-sm'>Try adjusting your search or filter criteria</p>
                        </div>
                      </td>
                    </tr>
                  )}
                  
                  {/* Loading state */}
                  {isLoadingProducts && (
                    <tr>
                      <td colSpan={4} className='px-6 py-12 text-center text-gray-500'>
                        <div className='flex flex-col items-center'>
                          <svg className='w-8 h-8 text-blue-500 animate-spin mb-3' fill='none' viewBox='0 0 24 24'>
                            <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                            <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
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
      </div>
    </div>
  )
}