'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Mail,
  MapPin,
  Building,
  Calendar,
  House,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import DiraHeader from '@/components/dira-header'
import useCollectionViewStore from '@/stores/collectionViewStore'
import { toast } from 'sonner'

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

export default function OpportunityPage({
  params,
}: {
  params: { opportunityId: string }
}) {
  const router = useRouter()
  const {
    opportunities,
    selectedOpportunity,
    setSelectedOpportunity,
    getOpportunities,
    isLoadingSelectedOpportunity,
  } = useCollectionViewStore()
  const [relatedOpportunities, setRelatedOpportunities] = useState<
    Opportunity[]
  >([])

  useEffect(() => {
    if (!opportunities) {
      getOpportunities()
    }
  }, [getOpportunities, opportunities])

  useEffect(() => {
    // Set the selected opportunity using the opportunityId from params
    setSelectedOpportunity(params.opportunityId)
  }, [])

  useEffect(() => {
    if (opportunities && opportunities.length > 0 && selectedOpportunity) {
      // Find related opportunities (up to 3) that share at least one category or same type
      const related = opportunities
        .filter((o) => o._id !== params.opportunityId)
        .filter(
          (o) =>
            o.categories.some((cat) =>
              selectedOpportunity.categories.includes(cat)
            ) || o.type === selectedOpportunity.type
        )
        .slice(0, 3)
      setRelatedOpportunities(related)
    }
  }, [opportunities, selectedOpportunity, params.opportunityId])

  const handleEmailContact = () => {
    if (selectedOpportunity?.email) {
      const subject = encodeURIComponent(`Re: ${selectedOpportunity.name}`)
      const body = encodeURIComponent(
        `Hello,\n\nI'm interested in the opportunity "${selectedOpportunity.name}" that you posted.\n\nBest regards`
      )
      window.open(
        `mailto:${selectedOpportunity.email}?subject=${subject}&body=${body}`,
        '_blank'
      )
      toast.success('Email client opened!')
    }
  }

  const handleOpportunityClick = (opportunityId: string) => {
    router.push(`/opportunity/${opportunityId}`)
  }

  if (isLoadingSelectedOpportunity || !selectedOpportunity) {
    return (
      <div className='min-h-screen bg-background'>
        <DiraHeader />
        <div className='h-16' />

        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          <div className='flex items-center justify-center h-96'>
            <p className='text-muted-foreground'>
              Loading opportunity details...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-background'>
      <DiraHeader />
      <div className='h-16' />

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Back Button */}
        <Button
          variant='ghost'
          className='mb-6 hover:bg-transparent p-0 flex items-center text-muted-foreground hover:text-primary'
          onClick={() => router.back()}>
          <ArrowLeft className='w-5 h-5 mr-2' />
          Back
        </Button>

        {/* Opportunity Details */}
        <div className='bg-card rounded-lg shadow-md p-6 border border-border'>
          <div className='flex items-start gap-6'>
            {/* Opportunity Info */}
            <div className='flex-1'>
              <div className='flex items-center justify-between mb-4'>
                <div>
                  <h1 className='text-3xl font-bold text-foreground'>
                    {selectedOpportunity.name}
                  </h1>
                  <div className='flex items-center gap-4 text-sm text-muted-foreground mt-2'>
                    <div className='flex items-center gap-1'>
                      <MapPin className='w-4 h-4' />
                      <span>{selectedOpportunity.country}</span>
                    </div>
                    {selectedOpportunity.ministry && (
                      <div className='flex items-center gap-1'>
                        <House className='w-4 h-4' />
                        <span>{selectedOpportunity.ministry}</span>
                      </div>
                    )}
                    <div className='flex items-center gap-1'>
                      <Calendar className='w-4 h-4' />
                      <span>
                        {new Date(
                          selectedOpportunity.createdAt
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className='flex items-center gap-4'>
                  {selectedOpportunity.sponsored && (
                    <Badge
                      variant='default'
                      className='bg-primary text-primary-foreground'>
                      Featured
                    </Badge>
                  )}
                  <Badge
                    variant={
                      selectedOpportunity.type === 'problem'
                        ? 'destructive'
                        : 'default'
                    }
                    className={
                      selectedOpportunity.type === 'problem'
                        ? 'bg-destructive/30 text-destructive-foreground'
                        : 'bg-green-100/50 text-destructive-foreground'
                    }>
                    {selectedOpportunity.type === 'problem' ? 'Problem' : 'Job'}
                  </Badge>
                  <Button
                    onClick={handleEmailContact}
                    className='bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2'>
                    <Mail className='w-5 h-5' />
                    Contact Poster
                  </Button>
                </div>
              </div>

              {/* Category Tags */}
              <div className='flex flex-wrap gap-2 mt-4'>
                {selectedOpportunity.categories.map((cat) => (
                  <Badge key={cat} variant='secondary'>
                    {cat}
                  </Badge>
                ))}
              </div>

              {/* Description */}
              <div className='mt-6'>
                <h2 className='text-xl font-semibold text-foreground mb-2'>
                  Description
                </h2>
                <p className='text-muted-foreground whitespace-pre-line'>
                  {selectedOpportunity.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Related Opportunities */}
        {relatedOpportunities.length > 0 && (
          <div className='mt-12'>
            <h2 className='text-2xl font-bold text-foreground mb-6'>
              Related Opportunities
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {relatedOpportunities.map((relatedOpportunity) => (
                <div
                  key={relatedOpportunity._id}
                  onClick={() => handleOpportunityClick(relatedOpportunity._id)}
                  className='bg-card rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow border border-border'>
                  <div className='flex items-start justify-between mb-4'>
                    <div className='flex-1'>
                      <h3 className='text-lg font-semibold text-foreground mb-2'>
                        {relatedOpportunity.name}
                      </h3>
                      <div className='flex items-center gap-4 text-sm text-muted-foreground mb-2'>
                        <div className='flex items-center gap-1'>
                          <MapPin className='w-4 h-4' />
                          <span>{relatedOpportunity.country}</span>
                        </div>
                        {relatedOpportunity.ministry && (
                          <div className='flex items-center gap-1'>
                            <House className='w-4 h-4' />
                            <span>{relatedOpportunity.ministry}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      {relatedOpportunity.sponsored && (
                        <Badge
                          variant='default'
                          className='bg-primary text-primary-foreground'>
                          Featured
                        </Badge>
                      )}
                      <Badge
                        variant={
                          relatedOpportunity.type === 'problem'
                            ? 'destructive'
                            : 'default'
                        }
                        className={
                          relatedOpportunity.type === 'problem'
                            ? 'bg-destructive/30 text-destructive-foreground'
                            : 'bg-green-100/50 text-destructive-foreground'
                        }>
                        {relatedOpportunity.type === 'problem'
                          ? 'Problem'
                          : 'Job'}
                      </Badge>
                    </div>
                  </div>
                  <div className='flex flex-wrap gap-2 mb-3'>
                    {relatedOpportunity.categories.map((category) => (
                      <Badge
                        key={category}
                        variant='secondary'
                        className='text-xs'>
                        {category}
                      </Badge>
                    ))}
                  </div>
                  <p
                    className='text-muted-foreground text-sm overflow-hidden'
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                    }}>
                    {relatedOpportunity.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
