'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface ProductCardProps {
  product: {
    _id: string
    name: string
    country: string
    category: string[]
    description: string
    website: string
    logo?: string
  }
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <div className='bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200'>
      <div className='flex items-start gap-4'>
        <div className='relative w-16 h-16 flex-shrink-0'>
          <Image
            src={product.logo || '/diravinelogo.png'}
            alt={`${product.name} logo`}
            fill
            className='object-contain'
          />
        </div>
        <div className='flex-1'>
          <div className='flex items-center gap-2'>
            <h3 className='text-lg font-semibold text-gray-900'>
              {product.name}
            </h3>
            <span className='text-sm text-gray-500'>({product.country})</span>
          </div>
          <div className='flex flex-wrap gap-2 mt-2'>
            {product.category.map((cat) => (
              <Badge key={cat} variant='default'>
                {cat}
              </Badge>
            ))}
          </div>
          <p className='mt-3 text-gray-600 line-clamp-3'>
            {product.description}
          </p>
          <div className='flex gap-4 mt-4'>
            <Button
              variant='link'
              className='text-primary hover:text-primary/80'
              asChild>
              <Link href={`/product/${product._id}`}>View Product</Link>
            </Button>
            <Button
              variant='link'
              className='text-primary hover:text-primary/80'
              asChild>
              <a
                href={product.website}
                target='_blank'
                rel='noopener noreferrer'>
                Visit Website
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
