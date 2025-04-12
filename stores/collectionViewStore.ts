import { create } from 'zustand'
import { toast } from 'sonner'
import { logger } from '@/utils/logger'

interface Product {
  _id: string
  name: string
  country: string
  category: string[]
  description: string
  website: string
  createdAt: Date
  updatedAt: Date
}

interface CollectionViewState {
  products: Product[] | null
  selectedProduct: Product | null
  isLoadingProducts: boolean
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
  setSelectedProduct: (product: Product | null) => void
  refreshProducts: () => Promise<void>
}

const useCollectionViewStore = create<CollectionViewState>((set, get) => ({
  products: null,
  selectedProduct: null,
  isLoadingProducts: false,
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

  setSelectedProduct: (product: Product | null) => {
    set({ selectedProduct: product })
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
}))

export default useCollectionViewStore
