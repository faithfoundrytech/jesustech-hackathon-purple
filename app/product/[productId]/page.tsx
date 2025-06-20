'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, ThumbsUp, ThumbsDown, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProductCard } from '@/components/product-card'
import useCollectionViewStore from '@/stores/collectionViewStore'
import DiraHeader from '@/components/dira-header'
import { toast } from 'sonner'

interface Product {
  _id: string
  name: string
  country: string
  category: string[]
  description: string
  website: string
  logo?: string
  feedback?: {
    analytics: {
      upVote: number
      downVote: number
      inUse: number
    }
    userFeedback?: {
      upVoted: boolean
      downVoted: boolean
      used: boolean
    }
  } | null
}

export default function ProductPage({
  params,
}: {
  params: { productId: string }
}) {
  const router = useRouter()
  const {
    products,
    selectedProduct,
    setSelectedProduct,
    getProducts,
    isLoadingSelectedProduct,
  } = useCollectionViewStore()
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false)

  useEffect(() => {
    if (!products) {
      getProducts()
    }
  }, [getProducts, products])

  useEffect(() => {
    // Set the selected product using the productId from params
    setSelectedProduct(params.productId)
  }, [params.productId, setSelectedProduct])

  useEffect(() => {
    if (products && products.length > 0 && selectedProduct) {
      // Find related products (up to 3) that share at least one category
      const related = products
        .filter((p) => p._id !== params.productId)
        .filter((p) =>
          p.category.some((cat) => selectedProduct.category.includes(cat))
        )
        .slice(0, 3)
      setRelatedProducts(related)
    }
  }, [products, selectedProduct, params.productId])

  const submitFeedback = async (
    type: 'upvote' | 'downvote' | 'used',
    added: boolean
  ) => {
    try {
      setIsSubmittingFeedback(true)

      const response = await fetch('/api/products/submit-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: params.productId,
          type,
          added,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit feedback')
      }

      // Refresh the product data to get updated feedback
      await setSelectedProduct(params.productId)

      toast.success('Feedback submitted successfully!')
    } catch (error) {
      console.error('Error submitting feedback:', error)
      toast.error('Failed to submit feedback', {
        description:
          error instanceof Error ? error.message : 'Please try again later',
      })
    } finally {
      setIsSubmittingFeedback(false)
    }
  }

  const handleUpvote = () => {
    const currentState =
      selectedProduct?.feedback?.userFeedback?.upVoted || false
    submitFeedback('upvote', !currentState)
  }

  const handleDownvote = () => {
    const currentState =
      selectedProduct?.feedback?.userFeedback?.downVoted || false
    submitFeedback('downvote', !currentState)
  }

  const handleUseProduct = () => {
    const currentState = selectedProduct?.feedback?.userFeedback?.used || false
    submitFeedback('used', !currentState)
  }

  if (isLoadingSelectedProduct || !selectedProduct) {
    return (
      <div className='min-h-screen'>
        <DiraHeader />
        <div className='h-16' />
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          <div className='flex items-center justify-center h-96'>
            <p className='text-gray-500'>Loading product details...</p>
          </div>
        </div>
      </div>
    )
  }

  const feedback = selectedProduct.feedback
  const analytics = feedback?.analytics
  const userFeedback = feedback?.userFeedback

  return (
    <div className='min-h-screen'>
      <DiraHeader />
      <div className='h-16' />

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
                src={selectedProduct.logo || '/diravinelogo.png'}
                alt={`${selectedProduct.name} logo`}
                fill
                className='object-contain'
              />
            </div>

            {/* Company Info */}
            <div className='flex-1'>
              <div className='flex items-center justify-between'>
                <div>
                  <h1 className='text-3xl font-bold text-gray-900'>
                    {selectedProduct.name}
                  </h1>
                  <p className='text-gray-500 mt-1'>
                    {selectedProduct.country}
                  </p>
                </div>
                <Button asChild>
                  <a
                    href={selectedProduct.website}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='bg-primary text-white hover:bg-primary/90'>
                    Visit Website
                  </a>
                </Button>
              </div>

              {/* Category Tags */}
              <div className='flex flex-wrap gap-2 mt-4'>
                {selectedProduct.category.map((cat) => (
                  <Badge key={cat} variant='default'>
                    {cat}
                  </Badge>
                ))}
              </div>

              {/* Interaction Buttons */}
              <div className='flex items-center gap-4 mt-4'>
                <Button
                  variant={userFeedback?.upVoted ? 'default' : 'outline'}
                  size='sm'
                  onClick={handleUpvote}
                  disabled={isSubmittingFeedback}
                  className='flex items-center gap-2'>
                  <ThumbsUp className='w-4 h-4' />
                  <span>{analytics?.upVote || 0}</span>
                </Button>
                <Button
                  variant={userFeedback?.downVoted ? 'default' : 'outline'}
                  size='sm'
                  onClick={handleDownvote}
                  disabled={isSubmittingFeedback}
                  className='flex items-center gap-2'>
                  <ThumbsDown className='w-4 h-4' />
                  <span>{analytics?.downVote || 0}</span>
                </Button>
                <Button
                  variant={userFeedback?.used ? 'default' : 'outline'}
                  size='sm'
                  onClick={handleUseProduct}
                  disabled={isSubmittingFeedback}
                  className='flex items-center gap-2'>
                  <CheckCircle className='w-4 h-4' />
                  <span>
                    {userFeedback?.used ? 'Using' : 'I use this'} (
                    {analytics?.inUse || 0})
                  </span>
                </Button>
              </div>

              {/* Description */}
              <div className='mt-6'>
                <h2 className='text-xl font-semibold text-gray-900 mb-2'>
                  About
                </h2>
                <p className='text-gray-600 whitespace-pre-line'>
                  {selectedProduct.description}
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
                <ProductCard
                  key={relatedProduct._id}
                  product={relatedProduct}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
