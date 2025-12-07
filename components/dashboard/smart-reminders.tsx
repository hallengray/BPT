'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { Reminder } from '@/lib/reminder-generator'

interface SmartRemindersProps {
  reminders: Reminder[]
  onDismiss: (id: string) => void
}

export function SmartReminders({ reminders, onDismiss }: SmartRemindersProps) {
  // Display max 2 reminders at once (highest priority)
  const visibleReminders = reminders.slice(0, 2)

  if (visibleReminders.length === 0) {
    return null
  }

  return (
    <div className="space-y-3" role="region" aria-label="Smart reminders">
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

  // Color scheme based on type
  const colorScheme = {
    medication: {
      bg: 'bg-purple-50 dark:bg-purple-950/30',
      border: 'border-purple-200 dark:border-purple-800',
      iconBg: 'bg-gradient-to-br from-purple-500 to-pink-500',
      text: 'text-purple-900 dark:text-purple-100',
      button: 'bg-purple-600 hover:bg-purple-700',
    },
    bp: {
      bg: 'bg-red-50 dark:bg-red-950/30',
      border: 'border-red-200 dark:border-red-800',
      iconBg: 'bg-gradient-to-br from-red-500 to-pink-500',
      text: 'text-red-900 dark:text-red-100',
      button: 'bg-red-600 hover:bg-red-700',
    },
    exercise: {
      bg: 'bg-blue-50 dark:bg-blue-950/30',
      border: 'border-blue-200 dark:border-blue-800',
      iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-500',
      text: 'text-blue-900 dark:text-blue-100',
      button: 'bg-blue-600 hover:bg-blue-700',
    },
    diet: {
      bg: 'bg-green-50 dark:bg-green-950/30',
      border: 'border-green-200 dark:border-green-800',
      iconBg: 'bg-gradient-to-br from-green-500 to-emerald-500',
      text: 'text-green-900 dark:text-green-100',
      button: 'bg-green-600 hover:bg-green-700',
    },
  }

  const colors = colorScheme[reminder.type]
  const Icon = reminder.icon

  return (
    <Alert
      className={cn(
        'relative transition-all duration-300',
        colors.bg,
        colors.border,
        isDismissed && 'opacity-0 scale-95'
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={cn(
            'flex-shrink-0 rounded-lg p-2 shadow-sm',
            colors.iconBg
          )}
          aria-hidden="true"
        >
          <Icon className="h-5 w-5 text-white" />
        </div>

        {/* Content */}
        <div className="flex-1 space-y-2">
          <div className="pr-8">
            <h3 className={cn('font-semibold text-sm', colors.text)}>
              {reminder.title}
            </h3>
            <AlertDescription className="mt-1 text-sm">
              {reminder.message}
            </AlertDescription>
          </div>

          {/* Action Button */}
          <Link href={reminder.action.href}>
            <Button
              size="sm"
              className={cn('h-8 text-xs', colors.button)}
              aria-label={reminder.action.label}
            >
              {reminder.action.label}
            </Button>
          </Link>
        </div>

        {/* Dismiss Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 h-6 w-6 rounded-full opacity-70 hover:opacity-100"
          onClick={handleDismiss}
          aria-label={`Dismiss ${reminder.title}`}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Alert>
  )
}




