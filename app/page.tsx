'use client'

import { useEffect } from 'react'
import useCollectionViewStore from '@/stores/collectionViewStore'

export default function Home() {
  const { products, isLoadingProducts, getProducts, refreshProducts } =
    useCollectionViewStore()

  useEffect(() => {
    if (!products) {
      getProducts()
    }
  }, [getProducts, products])

  return (
    <div className='min-h-screen p-8'>
      <div className='max-w-7xl mx-auto'>
        <div className='flex justify-between items-center mb-6'>
          <h1 className='text-2xl font-bold'>Products</h1>
          <button
            onClick={refreshProducts}
            className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors'
            disabled={isLoadingProducts}>
            {isLoadingProducts ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        <div className='overflow-x-auto'>
          <table className='min-w-full bg-white border border-gray-200'>
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
              {products?.map((product) => (
                <tr key={product._id} className='text-black'>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    {product.name}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    {product.country}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    {product.category.join(', ')}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <a
                      href={product.website}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-blue-500 hover:text-blue-700'>
                      Visit
                    </a>
                  </td>
                </tr>
              ))}
              {products?.length === 0 && !isLoadingProducts && (
                <tr>
                  <td
                    colSpan={4}
                    className='px-6 py-4 text-center text-gray-500'>
                    No products found
                  </td>
                </tr>
              )}
              {isLoadingProducts && (
                <tr>
                  <td
                    colSpan={4}
                    className='px-6 py-4 text-center text-gray-500'>
                    Loading products...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
