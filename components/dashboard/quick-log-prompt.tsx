'use client'

/**
 * Quick Log Prompt Component
 * 
 * Sticky banner that encourages users to log their health data
 * Shows when no recent logs exist, dismissible for 24 hours
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PenSquare, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GradientButton } from '@/components/ui/gradient-button'
import { cn } from '@/lib/utils'

interface QuickLogPromptProps {
  hasRecentLogs?: boolean
}

const STORAGE_KEY = 'quick-log-prompt-dismissed'
const DISMISS_DURATION = 8 * 60 * 60 * 1000 // 8 hours (for 3x daily logging)

export function QuickLogPrompt({ hasRecentLogs = false }: QuickLogPromptProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return

    // Check if already dismissed recently
    const dismissedAt = localStorage.getItem(STORAGE_KEY)
    if (dismissedAt) {
      const dismissedTime = parseInt(dismissedAt, 10)
      const now = Date.now()
      
      if (now - dismissedTime < DISMISS_DURATION) {
        // Still within dismiss period
        return
      } else {
        // Dismiss period expired, clear storage
        localStorage.removeItem(STORAGE_KEY)
      }
    }

    // Show prompt if no recent logs and not dismissed
    if (!hasRecentLogs) {
      // Delay to allow page load animation
      setTimeout(() => {
        setIsVisible(true)
        setTimeout(() => setIsAnimating(true), 50)
      }, 500)
    }
  }, [hasRecentLogs])

  const handleDismiss = () => {
    setIsAnimating(false)
    setTimeout(() => {
      setIsVisible(false)
      localStorage.setItem(STORAGE_KEY, Date.now().toString())
    }, 300)
  }

  if (!isVisible) {
    return null
  }

  return (
    <div
      className={cn(
        'sticky top-[64px] z-40 mx-4 mb-6 overflow-hidden rounded-2xl shadow-xl transition-all duration-300 ease-out',
        isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      )}
      role="region"
      aria-label="Quick log reminder"
    >
      <div className="relative bg-gradient-to-r from-amber-500 via-amber-600 to-sky-600 dark:from-amber-700 dark:via-amber-800 dark:to-sky-700 p-4 md:p-6">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]" />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm shadow-lg">
              <PenSquare className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">
                Ready to Log Your Health Data?
              </h3>
              <p className="text-sm text-white/90">
                Track your BP, diet, exercise, or medications in one place
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <GradientButton
              asChild
              variant="secondary"
              size="lg"
              className="bg-white hover:bg-white/90 text-amber-700 shadow-lg"
            >
              <Link href="/quick-log">
                <PenSquare className="h-5 w-5 mr-2" />
                Open Quick Log
              </Link>
            </GradientButton>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleDismiss}
              className="h-10 w-10 rounded-xl hover:bg-white/20 text-white"
              aria-label="Dismiss for 8 hours"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

