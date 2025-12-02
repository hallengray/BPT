'use client'

import { useState, useEffect } from 'react'
import { SmartReminders } from './smart-reminders'
import { generateSmartReminders, type Reminder } from '@/lib/reminder-generator'
import type { UnifiedHealthData } from '@/types'

interface SmartRemindersWidgetProps {
  healthData: UnifiedHealthData
  userId: string
}

export function SmartRemindersWidget({ healthData, userId }: SmartRemindersWidgetProps) {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    // Generate reminders based on health data
    const allReminders = generateSmartReminders(healthData)
    
    // Filter out dismissed reminders
    const activeReminders = allReminders.filter(
      (reminder) => !dismissedIds.has(reminder.id)
    )
    
    setReminders(activeReminders)
  }, [healthData, userId, dismissedIds])

  const handleDismiss = (id: string) => {
    setDismissedIds((prev) => new Set(prev).add(id))
    
    // Store dismissed reminders in localStorage (expires after 24 hours)
    const dismissed = JSON.parse(localStorage.getItem('dismissedReminders') || '{}')
    dismissed[id] = Date.now()
    localStorage.setItem('dismissedReminders', JSON.stringify(dismissed))
  }

  // Load dismissed reminders from localStorage on mount
  useEffect(() => {
    const dismissed = JSON.parse(localStorage.getItem('dismissedReminders') || '{}')
    const now = Date.now()
    const twentyFourHours = 24 * 60 * 60 * 1000
    
    // Filter out expired dismissals
    const activeDismissals = Object.entries(dismissed)
      .filter(([_, timestamp]) => now - (timestamp as number) < twentyFourHours)
      .map(([id]) => id)
    
    setDismissedIds(new Set(activeDismissals))
    
    // Clean up expired dismissals
    const cleanedDismissed = Object.fromEntries(
      Object.entries(dismissed).filter(
        ([_, timestamp]) => now - (timestamp as number) < twentyFourHours
      )
    )
    localStorage.setItem('dismissedReminders', JSON.stringify(cleanedDismissed))
  }, [])

  return <SmartReminders reminders={reminders} onDismiss={handleDismiss} />
}

