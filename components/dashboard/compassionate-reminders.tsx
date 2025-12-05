'use client'

/**
 * Compassionate Reminders
 * 
 * Emotionally intelligent reminder system with:
 * - Warm, supportive messaging
 * - Personalized encouragement
 * - Gentle nudges (not pushy)
 * - Celebration of small wins
 */

import { useState } from 'react'
import Link from 'next/link'
import { Heart, Pill, Utensils, Dumbbell, X, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GradientButton } from '@/components/ui/gradient-button'
import { cn } from '@/lib/utils'

interface Reminder {
  id: string
  type: 'medication' | 'bp' | 'diet' | 'exercise'
  title: string
  message: string
  action: {
    label: string
    href: string
  }
  priority: 'high' | 'medium' | 'low'
}

interface CompassionateRemindersProps {
  reminders: Reminder[]
  onDismiss: (id: string) => void
}

export function CompassionateReminders({ reminders, onDismiss }: CompassionateRemindersProps) {
  // Show max 2 reminders at once
  const visibleReminders = reminders.slice(0, 2)

  if (visibleReminders.length === 0) {
    return null
  }

  return (
    <div className="space-y-4" role="region" aria-label="Health reminders">
      {visibleReminders.map((reminder) => (
        <ReminderCard
          key={reminder.id}
          reminder={reminder}
          onDismiss={() => onDismiss(reminder.id)}
        />
      ))}
    </div>
  )
}

interface ReminderCardProps {
  reminder: Reminder
  onDismiss: () => void
}

function ReminderCard({ reminder, onDismiss }: ReminderCardProps) {
  const [isDismissed, setIsDismissed] = useState(false)

  const handleDismiss = () => {
    setIsDismissed(true)
    setTimeout(() => {
      onDismiss()
    }, 300)
  }

  // Enhanced color schemes with more personality
  const colorScheme = {
    medication: {
      gradient: 'from-purple-500 via-fuchsia-500 to-pink-500',
      bgGradient: 'from-purple-50 via-fuchsia-50 to-pink-50 dark:from-purple-950/30 dark:via-fuchsia-950/30 dark:to-pink-950/30',
      border: 'border-purple-200/50 dark:border-purple-800/50',
      icon: Pill,
      iconColor: 'text-white',
      buttonGradient: 'from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700',
    },
    bp: {
      gradient: 'from-red-500 via-rose-500 to-pink-500',
      bgGradient: 'from-red-50 via-rose-50 to-pink-50 dark:from-red-950/30 dark:via-rose-950/30 dark:to-pink-950/30',
      border: 'border-red-200/50 dark:border-red-800/50',
      icon: Heart,
      iconColor: 'text-white',
      buttonGradient: 'from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700',
    },
    exercise: {
      gradient: 'from-blue-500 via-cyan-500 to-teal-500',
      bgGradient: 'from-blue-50 via-cyan-50 to-teal-50 dark:from-blue-950/30 dark:via-cyan-950/30 dark:to-teal-950/30',
      border: 'border-blue-200/50 dark:border-blue-800/50',
      icon: Dumbbell,
      iconColor: 'text-white',
      buttonGradient: 'from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700',
    },
    diet: {
      gradient: 'from-green-500 via-emerald-500 to-teal-500',
      bgGradient: 'from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/30 dark:via-emerald-950/30 dark:to-teal-950/30',
      border: 'border-green-200/50 dark:border-green-800/50',
      icon: Utensils,
      iconColor: 'text-white',
      buttonGradient: 'from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700',
    },
  }

  const colors = colorScheme[reminder.type]
  const Icon = colors.icon

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border backdrop-blur-xl transition-all duration-300',
        'bg-gradient-to-br',
        colors.bgGradient,
        colors.border,
        'shadow-lg hover:shadow-xl',
        isDismissed && 'opacity-0 scale-95'
      )}
      role="alert"
      aria-live="polite"
    >
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      
      {/* Shimmer Effect */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* Content */}
      <div className="relative z-10 p-6">
        <div className="flex items-start gap-4">
          {/* Icon with Gradient */}
          <div className="flex-shrink-0">
            <div
              className={cn(
                'relative rounded-2xl p-3 shadow-xl bg-gradient-to-br',
                colors.gradient
              )}
            >
              {/* Glow Effect */}
              <div className="absolute inset-0 rounded-2xl bg-white/20 blur-xl" />
              <Icon className={cn('relative h-6 w-6', colors.iconColor)} />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 space-y-3">
            {/* Title with Sparkle */}
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
              <h3 className="font-bold text-lg">
                {reminder.title}
              </h3>
            </div>

            {/* Message */}
            <p className="text-sm leading-relaxed text-muted-foreground">
              {reminder.message}
            </p>

            {/* Action Button */}
            <GradientButton
              asChild
              size="sm"
              className={cn('bg-gradient-to-r shadow-lg', colors.buttonGradient)}
            >
              <Link href={reminder.action.href}>
                {reminder.action.label}
              </Link>
            </GradientButton>
          </div>

          {/* Dismiss Button */}
          <Button
            variant="ghost"
            size="icon"
            className="flex-shrink-0 h-8 w-8 rounded-full hover:bg-black/5 dark:hover:bg-white/5"
            onClick={handleDismiss}
            aria-label={`Dismiss ${reminder.title}`}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Bottom Accent */}
      <div
        className={cn(
          'absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r',
          colors.gradient
        )}
      />
    </div>
  )
}

