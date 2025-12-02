'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Activity, Utensils, Pill } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ContextualPromptDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  missingContext: {
    hasExercise: boolean
    hasDiet: boolean
    hasMedication: boolean
  }
}

export function ContextualPromptDialog({
  open,
  onOpenChange,
  missingContext,
}: ContextualPromptDialogProps) {
  const [dismissed, setDismissed] = useState(false)

  const handleDismiss = () => {
    setDismissed(true)
    onOpenChange(false)
  }

  const prompts = []

  if (!missingContext.hasExercise) {
    prompts.push({
      icon: Activity,
      title: 'Log Exercise',
      description: 'Did you exercise today? Track it to see how it affects your BP.',
      href: '/log-diet-exercise?tab=exercise',
      color: 'from-blue-500 to-cyan-500',
    })
  }

  if (!missingContext.hasDiet) {
    prompts.push({
      icon: Utensils,
      title: 'Log Meals',
      description: 'Track your meals to identify dietary patterns.',
      href: '/log-diet-exercise?tab=diet',
      color: 'from-green-500 to-emerald-500',
    })
  }

  if (!missingContext.hasMedication) {
    prompts.push({
      icon: Pill,
      title: 'Check Medications',
      description: 'Have you taken your medications today?',
      href: '/medications',
      color: 'from-purple-500 to-pink-500',
    })
  }

  if (prompts.length === 0) {
    return null
  }

  return (
    <Dialog open={open && !dismissed} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" aria-describedby="dialog-description">
        <DialogHeader>
          <DialogTitle>Complete Your Health Log</DialogTitle>
          <DialogDescription id="dialog-description">
            Adding context to your BP reading helps identify patterns and improve insights.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {prompts.map((prompt) => {
            const Icon = prompt.icon
            return (
              <Link
                key={prompt.href}
                href={prompt.href}
                onClick={() => onOpenChange(false)}
                className="block"
              >
                <div
                  className={cn(
                    'flex items-center gap-4 rounded-lg border p-4 transition-all hover:border-primary hover:shadow-md',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                  )}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onOpenChange(false)
                    }
                  }}
                >
                  <div
                    className={cn(
                      'flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br shadow-lg',
                      prompt.color
                    )}
                    aria-hidden="true"
                  >
                    <Icon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{prompt.title}</h4>
                    <p className="text-sm text-muted-foreground">{prompt.description}</p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        <div className="flex justify-between gap-2 pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-muted-foreground"
            aria-label="Dismiss and remind me later"
          >
            Remind me later
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onOpenChange(false)}
            aria-label="Close dialog"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

