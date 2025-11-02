'use client'

/**
 * Chat Interface Component
 * 
 * Main chat interface with message history and streaming support
 * Integrates with AI Server Actions for real-time conversations
 */

import { useState, useRef, useEffect } from 'react'
import { ChatMessage } from './chat-message'
import { ChatInput } from './chat-input'
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from '@/components/ui/glass-card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Sparkles } from 'lucide-react'
import { chatWithAI } from '@/app/actions/ai-assistant'
import type { ChatMessage as ChatMessageType } from '@/types'

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessageType[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (content: string) => {
    setError(null)
    setIsLoading(true)

    // Add user message immediately
    const userMessage: ChatMessageType = {
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])

    try {
      // Prepare conversation history (exclude system messages)
      const conversationHistory = messages
        .filter((m) => m.role !== 'system')
        .map(({ role, content }) => ({ role, content }))

      // Create FormData for server action
      const formData = new FormData()
      formData.append('message', content)
      formData.append('conversationHistory', JSON.stringify(conversationHistory))

      // Call server action
      const result = await chatWithAI(null, formData)

      if (result.success && result.data) {
        // Add assistant response
        const assistantMessage: ChatMessageType = {
          role: 'assistant',
          content: result.data.message,
          timestamp: new Date().toISOString(),
        }

        setMessages((prev) => [...prev, assistantMessage])
      } else {
        setError(result.error || 'Failed to get response from AI assistant')
      }
    } catch (err) {
      console.error('Chat error:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <GlassCard className="flex h-[600px] flex-col">
      <GlassCardHeader>
        <GlassCardTitle className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          AI Health Assistant
        </GlassCardTitle>
      </GlassCardHeader>

      <GlassCardContent className="flex flex-1 flex-col gap-4 overflow-hidden">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="animate-fade-in">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Messages Container */}
        <div
          ref={messagesContainerRef}
          className="flex-1 space-y-4 overflow-y-auto px-2 py-4"
          role="log"
          aria-label="Chat messages"
          aria-live="polite"
        >
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <div className="rounded-full bg-primary/10 p-6">
                <Sparkles className="h-12 w-12 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">
                  Welcome to Your AI Health Assistant
                </h3>
                <p className="text-sm text-muted-foreground">
                  Ask me anything about your blood pressure, diet, exercise, or general health.
                  <br />
                  I&apos;m here to help you understand your health data and provide personalized insights.
                </p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message, index) => (
                <ChatMessage key={index} message={message} />
              ))}
              {isLoading && (
                <ChatMessage
                  message={{
                    role: 'assistant',
                    content: 'Thinking...',
                  }}
                  isStreaming
                />
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Chat Input */}
        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={isLoading}
        />
      </GlassCardContent>
    </GlassCard>
  )
}

