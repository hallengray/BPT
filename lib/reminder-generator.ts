import type { UnifiedHealthData } from '@/types'
import { differenceInDays, startOfDay } from 'date-fns'
import { Activity, Utensils, Heart, Pill } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface Reminder {
  id: string
  type: 'exercise' | 'diet' | 'bp' | 'medication'
  priority: 'high' | 'medium' | 'low'
  title: string
  message: string
  action: {
    label: string
    href: string
  }
  icon: LucideIcon
}

/**
 * Generate smart reminders based on user's health data
 * Returns prioritized reminders (max 2 shown at once)
 */
export function generateSmartReminders(
  healthData: UnifiedHealthData
): Reminder[] {
  const reminders: Reminder[] = []
  const now = new Date()
  const today = startOfDay(now)

  // 1. Medication Reminder (HIGHEST PRIORITY)
  // If pending doses exist
  const pendingDoses = healthData.medicationDoses.filter((d) => {
    const scheduledTime = new Date(d.scheduled_time)
    return !d.was_taken && scheduledTime < now
  })

  if (pendingDoses.length > 0) {
    reminders.push({
      id: 'medication-pending',
      type: 'medication',
      priority: 'high',
      title: `${pendingDoses.length} Medication${pendingDoses.length > 1 ? 's' : ''} Due`,
      message: 'Take your medications to maintain consistent BP control.',
      action: { label: 'View Medications', href: '/medications' },
      icon: Pill,
    })
  }

  // 2. BP Logging Reminder (HIGH PRIORITY)
  // If no BP reading today
  const todayBP = healthData.bloodPressure.filter((bp) => {
    const bpDate = startOfDay(new Date(bp.measured_at))
    return bpDate.getTime() === today.getTime()
  })

  if (todayBP.length === 0) {
    reminders.push({
      id: 'bp-today',
      type: 'bp',
      priority: 'high',
      title: 'Log Your Blood Pressure',
      message: 'Daily readings help track your progress and identify patterns.',
      action: { label: 'Log BP', href: '/log-bp' },
      icon: Heart,
    })
  }

  // 3. Exercise Reminder (MEDIUM PRIORITY)
  // If no exercise logged in 3+ days
  const lastExercise = healthData.exercise[0]
  const daysSinceExercise = lastExercise
    ? differenceInDays(now, new Date(lastExercise.logged_at))
    : Infinity

  if (daysSinceExercise >= 3) {
    reminders.push({
      id: 'exercise-gap',
      type: 'exercise',
      priority: 'medium',
      title: 'Time to Move!',
      message: "You haven't logged exercise in 3 days. Even light activity helps!",
      action: { label: 'Log Exercise', href: '/log-diet-exercise?tab=exercise' },
      icon: Activity,
    })
  }

  // 4. Diet Context Reminder (LOW PRIORITY)
  // If BP readings exist but no diet logs today
  if (todayBP.length > 0) {
    const todayDiet = healthData.diet.filter((d) => {
      const dietDate = startOfDay(new Date(d.logged_at))
      return dietDate.getTime() === today.getTime()
    })

    if (todayDiet.length === 0) {
      reminders.push({
        id: 'diet-context',
        type: 'diet',
        priority: 'low',
        title: 'Add Meal Context',
        message: 'Your BP readings need context. Log your meals to improve insights.',
        action: { label: 'Log Meals', href: '/log-diet-exercise?tab=diet' },
        icon: Utensils,
      })
    }
  }

  // Sort by priority and type
  return sortReminders(reminders)
}

/**
 * Sort reminders by priority and type
 * Priority order: high > medium > low
 * Within same priority: medication > bp > exercise > diet
 */
function sortReminders(reminders: Reminder[]): Reminder[] {
  const priorityWeight = { high: 3, medium: 2, low: 1 }
  const typeWeight = { medication: 4, bp: 3, exercise: 2, diet: 1 }

  return reminders.sort((a, b) => {
    // First sort by priority
    const priorityDiff = priorityWeight[b.priority] - priorityWeight[a.priority]
    if (priorityDiff !== 0) return priorityDiff

    // Then sort by type
    return typeWeight[b.type] - typeWeight[a.type]
  })
}

