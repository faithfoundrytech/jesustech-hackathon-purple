'use client'

import { useEffect } from 'react'
import useCollectionViewStore from '@/stores/collectionViewStore'
import { ProductChat } from '@/components/productChat'
import { ProductSearch } from '@/components/product-search'
import DiraHeader from '@/components/dira-header'

export default function Home() {
  const { products, getProducts } = useCollectionViewStore()

  useEffect(() => {
    if (!products) {
      getProducts()
    }
  }, [getProducts, products])

  return (
    <div className='min-h-screen'>
      <DiraHeader />
      <div className='h-16' />

      <div className='relative'>
        <ProductSearch />
        <div className='fixed bottom-4 right-4 z-50'>
          <ProductChat />
        </div>
      </div>
    </div>
  )
}
