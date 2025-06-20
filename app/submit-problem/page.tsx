'use client'

import { useState, KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'

interface ProblemFormData {
  name: string
  email: string
  country: string
  ministry?: string
  categories: string[]
  description: string
  type: 'problem' | 'job'
}

export default function SubmitProblem() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentCategory, setCurrentCategory] = useState('')
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')
  const [formData, setFormData] = useState<ProblemFormData>({
    name: '',
    email: '',
    country: '',
    ministry: '',
    categories: [],
    description: '',
    type: 'problem',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage('')
    setMessageType('')

    try {
      const response = await fetch('/api/submit/opportunity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          country: formData.country,
          ministry: formData.ministry,
          categories: formData.categories,
          description: formData.description,
          type: formData.type,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(
          `${
            formData.type === 'problem' ? 'Problem' : 'Job'
          } submitted successfully! It will be reviewed before being published.`
        )
        setMessageType('success')
        // Reset form
        setFormData({
          name: '',
          email: '',
          country: '',
          ministry: '',
          categories: [],
          description: '',
          type: 'problem',
        })
      } else {
        setMessage(data.error || `Failed to submit ${formData.type}`)
        setMessageType('error')
      }
    } catch (error) {
      console.error('Error submitting:', error)
      setMessage(`Failed to submit ${formData.type}. Please try again.`)
      setMessageType('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddCategory = () => {
    if (
      currentCategory.trim() &&
      !formData.categories.includes(currentCategory.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        categories: [...prev.categories, currentCategory.trim()],
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
      categories: prev.categories.filter((cat) => cat !== categoryToRemove),
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

      <h1 className='text-3xl font-bold mb-8'>Submit an Opportunity </h1>

      {message && (
        <div
          className={`mb-6 p-4 rounded ${
            messageType === 'success'
              ? 'bg-green-100 text-green-700 border border-green-300'
              : 'bg-red-100 text-red-700 border border-red-300'
          }`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className='space-y-6'>
        <div>
          <label className='block text-sm font-medium mb-2'>Type</label>
          <select
            name='type'
            value={formData.type}
            onChange={handleChange}
            required
            className='w-full p-2 border rounded'>
            <option value='problem'>Problem</option>
            <option value='job'>Job Opportunity</option>
          </select>
        </div>

        <div>
          <label className='block text-sm font-medium mb-2'>Your Name</label>
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
          <label className='block text-sm font-medium mb-2'>Email</label>
          <input
            type='email'
            name='email'
            value={formData.email}
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
          <label className='block text-sm font-medium mb-2'>
            Ministry (optional)
          </label>
          <input
            type='text'
            name='ministry'
            value={formData.ministry}
            onChange={handleChange}
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
            {formData.categories.map((category) => (
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
          <label className='block text-sm font-medium mb-2'>
            {formData.type === 'problem'
              ? 'Problem Description'
              : 'Job Description'}
          </label>
          <textarea
            name='description'
            value={formData.description}
            onChange={handleChange}
            required
            rows={6}
            className='w-full p-2 border rounded'
            placeholder={
              formData.type === 'problem'
                ? 'Describe the problem you need solved in detail...'
                : 'Describe the job opportunity, requirements, and application process...'
            }
          />
        </div>

        <button
          type='submit'
          disabled={isSubmitting}
          className='w-full bg-primary text-white py-2 px-4 rounded hover:bg-primary/90 disabled:opacity-50'>
          {isSubmitting
            ? 'Submitting...'
            : `Submit ${
                formData.type === 'problem' ? 'Problem' : 'Job Opportunity'
              }`}
        </button>
      </form>
    </div>
  )
}
