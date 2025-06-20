import { create } from 'zustand'
import { toast } from 'sonner'
import { logger } from '@/utils/logger'

interface ProductFeedback {
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
}

interface Product {
  _id: string
  name: string
  country: string
  category: string[]
  description: string
  website: string
  logo?: string
  createdAt: Date
  updatedAt: Date
  feedback?: ProductFeedback | null
}

interface Opportunity {
  _id: string
  name: string
  email: string
  country: string
  ministry?: string
  categories: string[]
  description: string
  type: 'problem' | 'job'
  sponsored?: boolean
  active?: boolean
  createdAt: Date
  updatedAt: Date
}

interface CollectionViewState {
  products: Product[] | null
  selectedProduct: Product | null
  isLoadingProducts: boolean
  isLoadingSelectedProduct: boolean
  opportunities: Opportunity[] | null
  selectedOpportunity: Opportunity | null
  isLoadingOpportunities: boolean
  isLoadingSelectedOpportunity: boolean
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  } | null
  filters: {
    countries: string[]
    categories: string[]
  } | null
  getProducts: (
    page?: number,
    limit?: number,
    search?: string,
    country?: string,
    category?: string
  ) => Promise<void>
  setSelectedProduct: (product: Product | string | null) => Promise<void>
  refreshProducts: () => Promise<void>
  getOpportunities: (
    page?: number,
    limit?: number,
    search?: string,
    country?: string,
    category?: string,
    type?: 'problem' | 'job'
  ) => Promise<void>
  setSelectedOpportunity: (
    opportunity: Opportunity | string | null
  ) => Promise<void>
  refreshOpportunities: () => Promise<void>
}

const useCollectionViewStore = create<CollectionViewState>((set, get) => ({
  products: null,
  selectedProduct: null,
  isLoadingProducts: false,
  isLoadingSelectedProduct: false,
  opportunities: null,
  selectedOpportunity: null,
  isLoadingOpportunities: false,
  isLoadingSelectedOpportunity: false,
  pagination: null,
  filters: null,

  getProducts: async (
    page = 1,
    limit = 10,
    search = '',
    country = '',
    category = ''
  ) => {
    try {
      set({ isLoadingProducts: true })

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })

      if (search) queryParams.append('search', search)
      if (country) queryParams.append('country', country)
      if (category) queryParams.append('category', category)

      const response = await fetch(
        `/api/products/list?${queryParams.toString()}`
      )
      const data = await response.json()

      if (data.success) {
        set({
          products: data.data.products,
          pagination: data.data.pagination,
          filters: data.data.filters,
        })
        logger.debug('collectionViewStore', 'Products fetched successfully', {
          count: data.data.products.length,
          pagination: data.data.pagination,
        })
      } else {
        throw new Error(data.error || 'Failed to fetch products')
      }
    } catch (error) {
      logger.error('collectionViewStore', 'Error fetching products', error)
      toast.error('Failed to load products', {
        description: 'Please try again later',
        duration: 3000,
      })
    } finally {
      set({ isLoadingProducts: false })
    }
  },

  setSelectedProduct: async (product: Product | string | null) => {
    try {
      // If null, just clear the selected product
      if (product === null) {
        set({ selectedProduct: null })
        return
      }

      // If it's already a complete product object, set it directly
      if (typeof product === 'object') {
        set({ selectedProduct: product })
        return
      }

      // If it's a string (product ID), fetch the complete product details
      if (typeof product === 'string') {
        set({ isLoadingSelectedProduct: true })

        // Fetch product details
        const productResponse = await fetch(
          `/api/products/get?productId=${product}`
        )
        const productData = await productResponse.json()

        if (!productResponse.ok) {
          throw new Error(productData.error || 'Failed to fetch product')
        }

        // Fetch product feedback
        let feedback: ProductFeedback | null = null
        try {
          const feedbackResponse = await fetch(
            `/api/products/get-feeback?productId=${product}`
          )
          const feedbackData = await feedbackResponse.json()

          if (feedbackResponse.ok) {
            feedback = feedbackData
          } else {
            logger.warn('collectionViewStore', 'Failed to fetch feedback', {
              productId: product,
              error: feedbackData.error,
            })
          }
        } catch (feedbackError) {
          logger.warn('collectionViewStore', 'Error fetching feedback', {
            productId: product,
            error: feedbackError,
          })
        }

        // Combine product details with feedback
        const productWithFeedback: Product = {
          ...productData.product,
          feedback,
        }

        set({ selectedProduct: productWithFeedback })
        logger.debug(
          'collectionViewStore',
          'Product fetched and set successfully',
          {
            productId: product,
            hasFeedback: feedback !== null,
          }
        )
      }
    } catch (error) {
      logger.error(
        'collectionViewStore',
        'Error setting selected product',
        error
      )
      toast.error('Failed to load product details', {
        description: 'Please try again later',
        duration: 3000,
      })
      set({ selectedProduct: null })
    } finally {
      set({ isLoadingSelectedProduct: false })
    }
  },

  refreshProducts: async () => {
    const { pagination } = get()
    if (pagination) {
      await get().getProducts(pagination.page, pagination.limit)
    } else {
      await get().getProducts()
    }
    logger.info('collectionViewStore', 'Products data refreshed')
  },

  getOpportunities: async (
    page = 1,
    limit = 10,
    search = '',
    country = '',
    category = '',
    type?: 'problem' | 'job'
  ) => {
    try {
      set({ isLoadingOpportunities: true })

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })

      if (search) queryParams.append('search', search)
      if (country) queryParams.append('country', country)
      if (category) queryParams.append('category', category)
      if (type) queryParams.append('type', type)

      const response = await fetch(
        `/api/opportunities/list?${queryParams.toString()}`
      )
      const data = await response.json()

      if (data.success) {
        set({
          opportunities: data.data.opportunities,
          pagination: data.data.pagination,
          filters: data.data.filters,
        })
        logger.debug(
          'collectionViewStore',
          'Opportunities fetched successfully',
          {
            count: data.data.opportunities.length,
            pagination: data.data.pagination,
          }
        )
      } else {
        throw new Error(data.error || 'Failed to fetch opportunities')
      }
    } catch (error) {
      logger.error('collectionViewStore', 'Error fetching opportunities', error)
      toast.error('Failed to load opportunities', {
        description: 'Please try again later',
        duration: 3000,
      })
    } finally {
      set({ isLoadingOpportunities: false })
    }
  },

  setSelectedOpportunity: async (opportunity: Opportunity | string | null) => {
    try {
      // If null, just clear the selected opportunity
      if (opportunity === null) {
        set({ selectedOpportunity: null })
        return
      }

      // If it's already a complete opportunity object, set it directly
      if (typeof opportunity === 'object') {
        set({ selectedOpportunity: opportunity })
        return
      }

      // If it's a string (opportunity ID), fetch the complete opportunity details
      if (typeof opportunity === 'string') {
        set({ isLoadingSelectedOpportunity: true })

        const response = await fetch(
          `/api/opportunities/get?opportunityId=${opportunity}`
        )
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch opportunity')
        }

        set({ selectedOpportunity: data.opportunity })
        logger.debug(
          'collectionViewStore',
          'Opportunity fetched and set successfully',
          {
            opportunityId: opportunity,
          }
        )
      }
    } catch (error) {
      logger.error(
        'collectionViewStore',
        'Error setting selected opportunity',
        error
      )
      toast.error('Failed to load opportunity details', {
        description: 'Please try again later',
        duration: 3000,
      })
      set({ selectedOpportunity: null })
    } finally {
      set({ isLoadingSelectedOpportunity: false })
    }
  },

  refreshOpportunities: async () => {
    const { pagination } = get()
    if (pagination) {
      await get().getOpportunities(pagination.page, pagination.limit)
    } else {
      await get().getOpportunities()
    }
    logger.info('collectionViewStore', 'Opportunities data refreshed')
  },
}))

export default useCollectionViewStore
