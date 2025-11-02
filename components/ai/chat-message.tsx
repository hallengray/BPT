'use client'

/**
 * Chat Message Component
 * 
 * Displays individual chat messages with role-based styling
 * Uses glass UI design for a modern, premium look
 */

import { format } from 'date-fns'
import { Bot, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ChatMessage as ChatMessageType } from '@/types'

interface ChatMessageProps {
  message: ChatMessageType
  isStreaming?: boolean
}

export function ChatMessage({ message, isStreaming = false }: ChatMessageProps) {
  const isUser = message.role === 'user'

  if (message.role === 'system') {
    return null // Don't display system messages
  }

  return (
    <div
      className={cn(
        'flex gap-3 animate-fade-in',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          isUser
            ? 'gradient-primary'
            : 'glass-card'
        )}
        aria-label={isUser ? 'User avatar' : 'AI assistant avatar'}
      >
        {isUser ? (
          <User className="h-4 w-4 text-white" />
        ) : (
          <Bot className="h-4 w-4 text-primary" />
        )}
      </div>

      {/* Message Content */}
      <div
        className={cn(
          'flex max-w-[80%] flex-col gap-1',
          isUser ? 'items-end' : 'items-start'
        )}
      >
        <div
          className={cn(
            'rounded-2xl px-4 py-3 text-sm',
            isUser
              ? 'gradient-primary text-white'
              : 'glass-card'
          )}
        >
          <p className="whitespace-pre-wrap break-words">
            {message.content}
            {isStreaming && (
              <span className="ml-1 inline-block h-4 w-1 animate-pulse bg-current" />
            )}
          </p>
        </div>

        {/* Timestamp */}
        {message.timestamp && !isStreaming && (
          <span className="px-2 text-xs text-muted-foreground">
            {format(new Date(message.timestamp), 'h:mm a')}
          </span>
        )}
      </div>
    </div>
  )
}

