'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover'
import { OpportunityList } from '@/components/opportunity-list'
import DiraHeader from '@/components/dira-header'
import { ProductChat } from '@/components/productChat'
import useCollectionViewStore from '@/stores/collectionViewStore'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export default function OpportunitiesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const { getOpportunities, filters } = useCollectionViewStore()

  const handleSearch = async () => {
    await getOpportunities(
      1,
      10,
      searchTerm,
      selectedCountries.length > 0 ? selectedCountries.join(',') : '',
      selectedCategories.length > 0 ? selectedCategories.join(',') : ''
    )
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleCountryToggle = (country: string) => {
    if (selectedCountries.includes(country)) {
      setSelectedCountries(selectedCountries.filter((c) => c !== country))
    } else {
      setSelectedCountries([...selectedCountries, country])
    }
  }

  const handleCategoryToggle = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category))
    } else {
      setSelectedCategories([...selectedCategories, category])
    }
  }

  const handleClearFilters = () => {
    setSelectedCountries([])
    setSelectedCategories([])
  }

  // Auto-search when filters change
  useEffect(() => {
    if (selectedCountries.length > 0 || selectedCategories.length > 0) {
      getOpportunities(
        1,
        10,
        searchTerm,
        selectedCountries.length > 0 ? selectedCountries.join(',') : '',
        selectedCategories.length > 0 ? selectedCategories.join(',') : ''
      )
    }
  }, [selectedCountries, selectedCategories, searchTerm, getOpportunities])

  return (
    <div className='min-h-screen bg-background'>
      <DiraHeader />
      <div className='h-16' />

      {/* Hero Section */}
      <div className='bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
          <div className='text-center'>
            <h1 className='text-4xl font-bold text-foreground mb-4'>
              Kingdom Opportunities
            </h1>
            <p className='text-xl text-muted-foreground mb-8'>
              Discover problems to solve and jobs to pursue in God&apos;s
              kingdom
            </p>

            {/* Search Bar */}
            <div className='max-w-3xl mx-auto mb-6'>
              <div className='flex gap-2 items-center'>
                <div className='flex-1 relative'>
                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5' />
                  <input
                    type='text'
                    placeholder='Search opportunities, ministries, or locations...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className='w-full pl-10 pr-4 py-3 border border-border bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
                  />
                </div>
                <Button
                  onClick={handleSearch}
                  className='px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/90'>
                  Search
                </Button>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      className='border-border hover:bg-background/50'>
                      <Filter className='h-5 w-5' />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-80'>
                    <div className='space-y-4'>
                      <div className='flex items-center justify-between'>
                        <h4 className='font-medium'>Filters</h4>
                        {(selectedCountries.length > 0 ||
                          selectedCategories.length > 0) && (
                          <button
                            onClick={handleClearFilters}
                            className='text-sm text-primary hover:text-primary/80'>
                            Clear all
                          </button>
                        )}
                      </div>

                      {/* Countries Filter */}
                      {filters?.countries && filters.countries.length > 0 && (
                        <div className='space-y-2'>
                          <h5 className='text-sm font-medium'>Countries</h5>
                          <div className='flex flex-wrap gap-2'>
                            {filters.countries.map((country) => (
                              <button
                                key={country}
                                onClick={() => handleCountryToggle(country)}
                                className={cn(
                                  'text-xs px-3 py-1 rounded-full transition-colors',
                                  selectedCountries.includes(country)
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                )}>
                                {country}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Categories Filter */}
                      {filters?.categories && filters.categories.length > 0 && (
                        <div className='space-y-2'>
                          <h5 className='text-sm font-medium'>Categories</h5>
                          <div className='flex flex-wrap gap-2'>
                            {filters.categories.map((category) => (
                              <button
                                key={category}
                                onClick={() => handleCategoryToggle(category)}
                                className={cn(
                                  'text-xs px-3 py-1 rounded-full transition-colors',
                                  selectedCategories.includes(category)
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                )}>
                                {category}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Submit Opportunity Button */}
            <div className='flex justify-center mb-8'>
              <Link href='/submit-problem'>
                <Button
                  onClick={() => {}}
                  className='bg-secondary text-secondary-foreground hover:bg-secondary/90 flex items-center gap-2'>
                  <Plus className='w-5 h-5' />
                  Submit Opportunity
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Opportunities List */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <OpportunityList />
      </div>

      {/* Floating Chat */}
      <div className='fixed bottom-4 right-4 z-50'>
        <ProductChat />
      </div>
    </div>
  )
}
