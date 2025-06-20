'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Mail, MapPin, Building } from 'lucide-react'
import { useRouter } from 'next/navigation'
import useCollectionViewStore from '@/stores/collectionViewStore'

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
  createdAt: Date
}

interface OpportunityCardProps {
  opportunity: Opportunity
}

function OpportunityCard({ opportunity }: OpportunityCardProps) {
  const router = useRouter()

  const handleClick = () => {
    router.push(`/opportunity/${opportunity._id}`)
  }

  const handleEmailClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    window.open(`mailto:${opportunity.email}`, '_blank')
  }

  return (
    <div
      onClick={handleClick}
      className='bg-card rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow border border-border'>
      <div className='flex items-start justify-between mb-4'>
        <div className='flex-1'>
          <h3 className='text-lg font-semibold text-foreground mb-2'>
            {opportunity.name}
          </h3>
          <div className='flex items-center gap-4 text-sm text-muted-foreground mb-2'>
            <div className='flex items-center gap-1'>
              <MapPin className='w-4 h-4' />
              <span>{opportunity.country}</span>
            </div>
            {opportunity.ministry && (
              <div className='flex items-center gap-1'>
                <Building className='w-4 h-4' />
                <span>{opportunity.ministry}</span>
              </div>
            )}
          </div>
          <div className='flex flex-wrap gap-2 mb-3'>
            {opportunity.categories.map((category) => (
              <Badge key={category} variant='secondary' className='text-xs'>
                {category}
              </Badge>
            ))}
          </div>
        </div>
        <div className='flex items-center gap-2'>
          {opportunity.sponsored && (
            <Badge
              variant='default'
              className='bg-primary text-primary-foreground'>
              Featured
            </Badge>
          )}
          <Badge
            variant={opportunity.type === 'problem' ? 'destructive' : 'default'}
            className={
              opportunity.type === 'problem'
                ? 'bg-destructive/30 text-destructive-foreground'
                : 'bg-green-100/50 text-destructive-foreground'
            }>
            {opportunity.type === 'problem' ? 'Problem' : 'Job'}
          </Badge>
        </div>
      </div>
      <p
        className='text-muted-foreground text-sm mb-4 overflow-hidden'
        style={{
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
        }}>
        {opportunity.description}
      </p>
      <div className='flex items-end justify-between'>
        <span className='text-xs text-muted-foreground'>
          {new Date(opportunity.createdAt).toLocaleDateString()}
        </span>
        <Button
          size='sm'
          variant='outline'
          onClick={handleEmailClick}
          className='flex items-center gap-1'>
          <Mail className='w-4 h-4' />
          Contact
        </Button>
      </div>
    </div>
  )
}

export function OpportunityList() {
  const [activeTab, setActiveTab] = useState<'all' | 'problem' | 'job'>('all')
  const [featuredOpportunities, setFeaturedOpportunities] = useState<
    Opportunity[]
  >([])
  const { opportunities, getOpportunities, isLoadingOpportunities } =
    useCollectionViewStore()

  useEffect(() => {
    if (!opportunities) {
      getOpportunities()
    }
  }, [getOpportunities, opportunities])

  useEffect(() => {
    // Fetch featured opportunities
    const fetchFeaturedOpportunities = async () => {
      try {
        const response = await fetch(
          '/api/opportunities/list?featured=true&limit=3'
        )
        const data = await response.json()
        if (data.success) {
          setFeaturedOpportunities(data.data.opportunities)
        }
      } catch (error) {
        console.error('Error fetching featured opportunities:', error)
      }
    }

    fetchFeaturedOpportunities()
  }, [])

  const filteredOpportunities =
    opportunities?.filter((opportunity) => {
      if (activeTab === 'all') return true
      return opportunity.type === activeTab
    }) || []

  if (isLoadingOpportunities) {
    return (
      <div className='flex items-center justify-center py-12'>
        <p className='text-muted-foreground'>Loading opportunities...</p>
      </div>
    )
  }

  return (
    <div className='space-y-8'>
      {/* Featured Opportunities */}
      {featuredOpportunities.length > 0 && (
        <div>
          <h2 className='text-2xl font-bold text-foreground mb-6'>
            Featured Opportunities
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8'>
            {featuredOpportunities.map((opportunity) => (
              <OpportunityCard
                key={opportunity._id}
                opportunity={opportunity}
              />
            ))}
          </div>
        </div>
      )}

      {/* All Opportunities */}
      <div>
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-2xl font-bold text-foreground'>
            All Opportunities
          </h2>

          {/* Tabs */}
          <div className='flex bg-muted rounded-lg p-1'>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'all'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}>
              All
            </button>
            <button
              onClick={() => setActiveTab('problem')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'problem'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}>
              Problems
            </button>
            <button
              onClick={() => setActiveTab('job')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'job'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}>
              Jobs
            </button>
          </div>
        </div>

        {/* Opportunities Grid */}
        {filteredOpportunities.length > 0 ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {filteredOpportunities.map((opportunity) => (
              <OpportunityCard
                key={opportunity._id}
                opportunity={opportunity}
              />
            ))}
          </div>
        ) : (
          <div className='text-center py-12'>
            <p className='text-muted-foreground'>
              No {activeTab === 'all' ? '' : activeTab} opportunities found.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
