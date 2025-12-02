import type { BloodPressureReading } from '@/types'
import { differenceInDays, startOfDay, parseISO } from 'date-fns'

export interface StreakData {
  currentStreak: number
  longestStreak: number
  lastLogDate: Date | null
  nextMilestone: number
  daysUntilMilestone: number
  milestoneProgress: number // percentage
}

export interface MilestoneBadge {
  emoji: string
  title: string
  description: string
  color: string
}

const MILESTONES = [3, 7, 14, 21, 30, 60, 90, 180, 365]

/**
 * Calculate streak data with milestone tracking
 * Enhanced version of calculateLoggingStreak from data-quality-checker
 */
export function calculateStreak(readings: BloodPressureReading[]): StreakData {
  if (readings.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastLogDate: null,
      nextMilestone: MILESTONES[0],
      daysUntilMilestone: MILESTONES[0],
      milestoneProgress: 0,
    }
  }

  // Sort readings by date (newest first)
  const sortedReadings = [...readings].sort(
    (a, b) => parseISO(b.measured_at).getTime() - parseISO(a.measured_at).getTime()
  )

  // Get unique days with readings
  const uniqueDays = Array.from(
    new Set(sortedReadings.map((r) => startOfDay(parseISO(r.measured_at)).toISOString()))
  ).map((dateStr) => parseISO(dateStr))

  // Calculate current streak
  let currentStreak = 0
  const today = startOfDay(new Date())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  // Check if there's a reading today or yesterday (1 day grace period)
  const hasRecentReading =
    uniqueDays[0].getTime() === today.getTime() ||
    uniqueDays[0].getTime() === yesterday.getTime()

  if (hasRecentReading) {
    currentStreak = 1
    let checkDate = new Date(uniqueDays[0])
    checkDate.setDate(checkDate.getDate() - 1)

    for (let i = 1; i < uniqueDays.length; i++) {
      if (uniqueDays[i].getTime() === checkDate.getTime()) {
        currentStreak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        break
      }
    }
  }

  // Calculate longest streak
  let longestStreak = 0
  let tempStreak = 1

  for (let i = 0; i < uniqueDays.length - 1; i++) {
    const dayDiff = differenceInDays(uniqueDays[i], uniqueDays[i + 1])

    if (dayDiff === 1) {
      tempStreak++
      longestStreak = Math.max(longestStreak, tempStreak)
    } else {
      tempStreak = 1
    }
  }

  longestStreak = Math.max(longestStreak, tempStreak, currentStreak)

  // Calculate milestone progress
  const nextMilestone = MILESTONES.find((m) => m > currentStreak) || MILESTONES[MILESTONES.length - 1]
  const daysUntilMilestone = nextMilestone - currentStreak
  
  // Find previous milestone for progress calculation
  const previousMilestone = [...MILESTONES].reverse().find((m) => m <= currentStreak) || 0
  const milestoneProgress =
    previousMilestone === nextMilestone
      ? 100
      : ((currentStreak - previousMilestone) / (nextMilestone - previousMilestone)) * 100

  return {
    currentStreak,
    longestStreak,
    lastLogDate: parseISO(sortedReadings[0].measured_at),
    nextMilestone,
    daysUntilMilestone,
    milestoneProgress: Math.round(milestoneProgress),
  }
}

/**
 * Get milestone badge based on current streak
 */
export function getMilestoneBadge(streak: number): MilestoneBadge {
  if (streak >= 365) {
    return {
      emoji: '👑',
      title: 'Legend',
      description: '1 Year Streak!',
      color: 'yellow',
    }
  }
  if (streak >= 180) {
    return {
      emoji: '💎',
      title: 'Diamond',
      description: '6 Month Streak!',
      color: 'cyan',
    }
  }
  if (streak >= 90) {
    return {
      emoji: '🏆',
      title: 'Champion',
      description: '90 Day Streak!',
      color: 'purple',
    }
  }
  if (streak >= 60) {
    return {
      emoji: '🌟',
      title: 'Superstar',
      description: '60 Day Streak!',
      color: 'indigo',
    }
  }
  if (streak >= 30) {
    return {
      emoji: '⭐',
      title: 'Star',
      description: '30 Day Streak!',
      color: 'yellow',
    }
  }
  if (streak >= 21) {
    return {
      emoji: '🔥',
      title: 'Hot Streak',
      description: '3 Week Streak!',
      color: 'orange',
    }
  }
  if (streak >= 14) {
    return {
      emoji: '💪',
      title: 'Strong',
      description: '2 Week Streak!',
      color: 'blue',
    }
  }
  if (streak >= 7) {
    return {
      emoji: '🎯',
      title: 'Consistent',
      description: '1 Week Streak!',
      color: 'green',
    }
  }
  if (streak >= 3) {
    return {
      emoji: '🌱',
      title: 'Growing',
      description: '3 Day Streak!',
      color: 'lime',
    }
  }
  return {
    emoji: '🆕',
    title: 'Getting Started',
    description: 'Keep it up!',
    color: 'gray',
  }
}

/**
 * Get motivational message based on days until milestone
 */
export function getMotivationalMessage(daysUntilMilestone: number): string {
  if (daysUntilMilestone === 0) {
    return '🎉 Milestone reached! Amazing work!'
  }
  if (daysUntilMilestone === 1) {
    return '🎉 One more day to your next milestone!'
  }
  if (daysUntilMilestone <= 3) {
    return "🔥 You're so close! Keep going!"
  }
  if (daysUntilMilestone <= 7) {
    return '💪 Great progress! Stay consistent!'
  }
  return '🌟 Stay consistent to reach your next goal!'
}

