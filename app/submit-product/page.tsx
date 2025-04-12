'use client'

import { useState, KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'

interface ProductFormData {
  name: string
  country: string
  category: string[]
  description: string
  website: string
  logo?: string
  submitterName: string
  submitterEmail: string
}

export default function SubmitProduct() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentCategory, setCurrentCategory] = useState('')
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    country: '',
    category: [],
    description: '',
    website: '',
    logo: '',
    submitterName: '',
    submitterEmail: '',
  })

  // TODO: Implement form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      // TODO: Add API call to submit product
      console.log('Submitting product:', formData)
      // TODO: Add success handling
    } catch (error) {
      // TODO: Add error handling
      console.error('Error submitting product:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddCategory = () => {
    if (
      currentCategory.trim() &&
      !formData.category.includes(currentCategory.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        category: [...prev.category, currentCategory.trim()],
      }))
      setCurrentCategory('')
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddCategory()
    }
  }

  const removeCategory = (categoryToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      category: prev.category.filter((cat) => cat !== categoryToRemove),
    }))
  }

  return (
    <div className='max-w-2xl mx-auto p-6'>
      <button
        onClick={() => router.back()}
        className='mb-6 flex items-center text-primary hover:text-primary/80'>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='h-5 w-5 mr-2'
          viewBox='0 0 20 20'
          fill='currentColor'>
          <path
            fillRule='evenodd'
            d='M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z'
            clipRule='evenodd'
          />
        </svg>
        Back
      </button>

      <h1 className='text-3xl font-bold mb-8'>Submit a Product</h1>
      <form onSubmit={handleSubmit} className='space-y-6'>
        <div>
          <label className='block text-sm font-medium mb-2'>Product Name</label>
          <input
            type='text'
            name='name'
            value={formData.name}
            onChange={handleChange}
            required
            className='w-full p-2 border rounded'
          />
        </div>

        <div>
          <label className='block text-sm font-medium mb-2'>Country</label>
          <input
            type='text'
            name='country'
            value={formData.country}
            onChange={handleChange}
            required
            className='w-full p-2 border rounded'
          />
        </div>

        <div>
          <label className='block text-sm font-medium mb-2'>Categories</label>
          <div className='flex gap-2 mb-2'>
            <input
              type='text'
              value={currentCategory}
              onChange={(e) => setCurrentCategory(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder='Type and press Enter or click Add'
              className='flex-1 p-2 border rounded'
            />
            <button
              type='button'
              onClick={handleAddCategory}
              className='px-4 py-2 bg-primary text-white rounded hover:bg-primary/90'>
              Add
            </button>
          </div>
          <div className='flex flex-wrap gap-2'>
            {formData.category.map((category) => (
              <div
                key={category}
                className='flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full'>
                <span>{category}</span>
                <button
                  type='button'
                  onClick={() => removeCategory(category)}
                  className='text-gray-500 hover:text-gray-700'>
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className='block text-sm font-medium mb-2'>Description</label>
          <textarea
            name='description'
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
            className='w-full p-2 border rounded'
          />
        </div>

        <div>
          <label className='block text-sm font-medium mb-2'>Website URL</label>
          <input
            type='url'
            name='website'
            value={formData.website}
            onChange={handleChange}
            required
            className='w-full p-2 border rounded'
          />
        </div>

        <div>
          <label className='block text-sm font-medium mb-2'>
            Logo URL (optional)
          </label>
          <input
            type='url'
            name='logo'
            value={formData.logo}
            onChange={handleChange}
            className='w-full p-2 border rounded'
          />
        </div>

        <div>
          <label className='block text-sm font-medium mb-2'>Your Name</label>
          <input
            type='text'
            name='submitterName'
            value={formData.submitterName}
            onChange={handleChange}
            required
            className='w-full p-2 border rounded'
          />
        </div>

        <div>
          <label className='block text-sm font-medium mb-2'>Your Email</label>
          <input
            type='email'
            name='submitterEmail'
            value={formData.submitterEmail}
            onChange={handleChange}
            required
            className='w-full p-2 border rounded'
          />
        </div>

        <button
          type='submit'
          disabled={isSubmitting}
          className='w-full bg-primary text-white py-2 px-4 rounded hover:bg-primary/90 disabled:opacity-50'>
          {isSubmitting ? 'Submitting...' : 'Submit Product'}
        </button>
      </form>
    </div>
  )
}
