'use client'

import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from '@/components/ui/prompt-input'
import { Button } from '@/components/ui/button'
import { ArrowUp, Square, X } from 'lucide-react'
import { useRef, useState, useEffect } from 'react'
import React from 'react'
import Markdown from 'react-markdown'

interface Message {
  id: string
  content: string
  senderType: 'user' | 'ai'
  createdAt: Date
}

interface ProductChatProps {
  chatType?: 'product' | 'opportunity'
}

export function ProductChat({ chatType = 'product' }: ProductChatProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [chatId, setChatId] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Create new chat when component opens
  useEffect(() => {
    if (isOpen && !chatId) {
      createNewChat()
      // Add welcome message
      setMessages([
        {
          id: crypto.randomUUID(),
          content:
            "Hi, I'm Dira your search assistant here to help you find the right tool, community or opportunity to serve God better! Let me know what you are looking for.",
          senderType: 'ai',
          createdAt: new Date(),
        },
      ])
    }
  }, [isOpen])

  const createNewChat = async () => {
    try {
      const newSessionId = crypto.randomUUID()
      setSessionId(newSessionId)

      const response = await fetch('/api/chat/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: newSessionId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create chat')
      }

      const data = await response.json()
      setChatId(data.data.chat._id)
    } catch (error) {
      console.error('Error creating chat:', error)
    }
  }

  const handleSubmit = async () => {
    if (!input.trim() || !chatId || !sessionId) return

    setIsLoading(true)
    const userMessage = {
      id: crypto.randomUUID(),
      content: input,
      senderType: 'user' as const,
      createdAt: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController()

    try {
      const response = await fetch('/api/chat/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId,
          sessionId,
          message: input,
        }),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.error || `Failed to send message: ${response.status}`
        )
      }

      // Handle streaming response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let aiMessage = {
        id: crypto.randomUUID(),
        content: '',
        senderType: 'ai' as const,
        createdAt: new Date(),
      }

      setMessages((prev) => [...prev, aiMessage])

      while (true) {
        const { done, value } = await reader!.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              aiMessage.content += data.content
              setMessages((prev) => [...prev])
            } catch (e) {
              console.error('Error parsing chunk:', e)
            }
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Request aborted')
      } else {
        console.error('Error sending message:', error)
        // Add error message to chat
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            content: `Error: ${
              error instanceof Error ? error.message : 'Failed to send message'
            }`,
            senderType: 'ai',
            createdAt: new Date(),
          },
        ])
      }
    } finally {
      setIsLoading(false)
      abortControllerRef.current = null
    }
  }

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      setIsLoading(false)
    }
  }

  return (
    <div className='fixed bottom-4 right-4 z-50'>
      {!isOpen ? (
        <Button
          onClick={() => setIsOpen(true)}
          className='bg-white text-primary border-primary border-2 rounded-full px-4 py-2 hover:bg-primary/10 flex items-center gap-2'>
          <img src='/diravinelogo.png' alt='Dira Logo' className='w-6 h-6' />
          Chat with Dira!
        </Button>
      ) : (
        <div className='bg-background border rounded-lg shadow-lg w-[600px] p-4'>
          <div className='flex justify-between items-center mb-4'>
            <h3 className='font-semibold'>Dira AI Chat</h3>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => setIsOpen(false)}>
              <X className='h-4 w-4' />
            </Button>
          </div>

          <div className='h-[400px] overflow-y-auto mb-4 space-y-4'>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.senderType === 'user'
                    ? 'justify-end'
                    : 'justify-start'
                }`}>
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.senderType === 'user'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100'
                  }`}>
                  <Markdown>{message.content}</Markdown>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <PromptInput
            value={input}
            onValueChange={setInput}
            isLoading={isLoading}
            onSubmit={handleSubmit}
            className='w-full'>
            <PromptInputTextarea placeholder='Ask me anything about our products...' />

            <PromptInputActions className='flex items-center justify-between gap-2 pt-2'>
              <PromptInputAction
                tooltip={isLoading ? 'Stop generation' : 'Send message'}>
                <Button
                  variant='default'
                  size='icon'
                  className='h-8 w-8 rounded-full'
                  onClick={isLoading ? handleStop : handleSubmit}>
                  {isLoading ? (
                    <Square className='size-5 fill-current' />
                  ) : (
                    <ArrowUp className='size-5' />
                  )}
                </Button>
              </PromptInputAction>
            </PromptInputActions>
          </PromptInput>
        </div>
      )}
    </div>
  )
}
