'use client'

/**
 * Achievement Celebration
 * 
 * Celebrates user milestones and achievements:
 * - First reading
 * - Streak milestones (7, 14, 30, 60, 90 days)
 * - Consistency achievements
 * - Health improvements
 */

import { useEffect, useState } from 'react'
import { Trophy, Star, Zap, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import Confetti from 'react-confetti'

interface Achievement {
  id: string
  type: 'streak' | 'first_reading' | 'consistency' | 'improvement'
  title: string
  description: string
  icon: typeof Trophy
  color: string
}

interface AchievementCelebrationProps {
  achievement: Achievement | null
  onDismiss: () => void
}

export function AchievementCelebration({ achievement, onDismiss }: AchievementCelebrationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (achievement) {
      setIsVisible(true)
      setShowConfetti(true)
      
      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => {
        handleDismiss()
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [achievement])

  const handleDismiss = () => {
    setIsVisible(false)
    setShowConfetti(false)
    setTimeout(() => {
      onDismiss()
    }, 300)
  }

  if (!achievement) return null

  const Icon = achievement.icon

  return (
    <>
      {/* Confetti */}
      {showConfetti && (
        <Confetti
          width={typeof window !== 'undefined' ? window.innerWidth : 300}
          height={typeof window !== 'undefined' ? window.innerHeight : 200}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
        />
      )}

      {/* Achievement Card */}
      <div
        className={cn(
          'fixed inset-x-4 top-20 z-50 mx-auto max-w-md transition-all duration-500',
          isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        )}
        role="alert"
        aria-live="assertive"
      >
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-400 via-orange-500 to-pink-500 p-1 shadow-2xl">
          {/* Animated Border */}
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 animate-spin-slow opacity-75" />

          {/* Content */}
          <div className="relative rounded-3xl bg-white dark:bg-gray-900 p-8">
            {/* Icon */}
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-xl animate-bounce">
              <Icon className="h-10 w-10 text-white" />
            </div>

            {/* Title */}
            <h2 className="mb-2 text-center text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              🎉 {achievement.title}
            </h2>

            {/* Description */}
            <p className="text-center text-muted-foreground">
              {achievement.description}
            </p>

            {/* Dismiss Button */}
            <button
              onClick={handleDismiss}
              className="mt-6 w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-3 font-semibold text-white shadow-lg hover:from-amber-600 hover:to-orange-600 transition-all"
            >
              Awesome! 🌟
            </button>
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {isVisible && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity"
          onClick={handleDismiss}
        />
      )}
    </>
  )
}

// Achievement generator helper
export function generateAchievement(
  type: 'streak' | 'first_reading' | 'consistency' | 'improvement',
  value?: number
): Achievement | null {
  switch (type) {
    case 'first_reading':
      return {
        id: 'first_reading',
        type: 'first_reading',
        title: 'First Step Taken!',
        description: 'You logged your first reading! Every journey begins with a single step.',
        icon: Star,
        color: 'from-blue-500 to-cyan-500',
      }
    
    case 'streak':
      if (!value) return null
      const streakMilestones = [7, 14, 30, 60, 90, 180, 365]
      if (!streakMilestones.includes(value)) return null
      
      return {
        id: `streak_${value}`,
        type: 'streak',
        title: `${value} Day Streak! 🔥`,
        description: `Incredible! You've logged consistently for ${value} days. Your dedication is inspiring!`,
        icon: Zap,
        color: 'from-orange-500 to-red-500',
      }
    
    case 'consistency':
      return {
        id: 'consistency',
        type: 'consistency',
        title: 'Consistency Champion!',
        description: "You've been logging regularly! Consistency is the key to better health.",
        icon: Trophy,
        color: 'from-green-500 to-emerald-500',
      }
    
    case 'improvement':
      return {
        id: 'improvement',
        type: 'improvement',
        title: 'Health Improvement!',
        description: 'Your blood pressure is trending in the right direction! Keep up the great work!',
        icon: TrendingDown,
        color: 'from-green-500 to-teal-500',
      }
    
    default:
      return null
  }
}

