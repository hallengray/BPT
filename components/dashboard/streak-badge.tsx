'use client'

import { Flame, Trophy } from 'lucide-react'
import {
  GlassCard,
  GlassCardContent,
  GlassCardHeader,
  GlassCardTitle,
} from '@/components/ui/glass-card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { getMilestoneBadge, getMotivationalMessage } from '@/lib/streak-calculator'

interface StreakBadgeProps {
  currentStreak: number
  longestStreak: number
  nextMilestone: number
  daysUntilMilestone: number
  milestoneProgress: number
}

export function StreakBadge({
  currentStreak,
  longestStreak,
  nextMilestone,
  daysUntilMilestone,
  milestoneProgress,
}: StreakBadgeProps) {
  const badge = getMilestoneBadge(currentStreak)
  const motivationalMessage = getMotivationalMessage(daysUntilMilestone)

  // Color gradient based on badge color
  const colorGradients: Record<string, string> = {
    yellow: 'from-yellow-500 to-amber-600',
    cyan: 'from-cyan-500 to-blue-600',
    purple: 'from-purple-500 to-pink-600',
    indigo: 'from-indigo-500 to-purple-600',
    orange: 'from-orange-500 to-red-600',
    blue: 'from-blue-500 to-cyan-600',
    green: 'from-green-500 to-emerald-600',
    lime: 'from-lime-500 to-green-600',
    gray: 'from-gray-500 to-gray-600',
  }

  const gradient = colorGradients[badge.color] || colorGradients.gray

  return (
    <GlassCard className="overflow-hidden">
      <GlassCardHeader>
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'rounded-lg p-2.5 shadow-lg bg-gradient-to-br',
              gradient
            )}
            aria-hidden="true"
          >
            <Flame className="h-5 w-5 text-white" />
          </div>
          <div>
            <GlassCardTitle>Logging Streak</GlassCardTitle>
            <p className="text-sm text-muted-foreground">
              Keep the momentum going!
            </p>
          </div>
        </div>
      </GlassCardHeader>
      <GlassCardContent className="space-y-4">
        {/* Current Streak Display */}
        <div className="text-center">
          <div className="mb-2 text-6xl" role="img" aria-label={badge.title}>
            {badge.emoji}
          </div>
          <div className="text-4xl font-bold" aria-label={`${currentStreak} day streak`}>
            {currentStreak}
          </div>
          <div className="text-sm text-muted-foreground">
            Day{currentStreak !== 1 ? 's' : ''} Streak
          </div>
          <Badge
            className={cn(
              'mt-2 bg-gradient-to-r',
              gradient,
              'border-0 text-white'
            )}
          >
            {badge.title}
          </Badge>
        </div>

        {/* Progress to Next Milestone */}
        {daysUntilMilestone > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Next milestone: {nextMilestone} days
              </span>
              <span className="font-semibold">
                {daysUntilMilestone} day{daysUntilMilestone !== 1 ? 's' : ''} to go
              </span>
            </div>
            <Progress
              value={milestoneProgress}
              className="h-2"
              aria-label={`${milestoneProgress}% progress to next milestone`}
            />
          </div>
        )}

        {/* Longest Streak */}
        {longestStreak > currentStreak && (
          <div
            className="flex items-center justify-between rounded-lg border bg-muted/50 p-3"
            role="region"
            aria-label="Personal best streak"
          >
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-600 dark:text-yellow-500" aria-hidden="true" />
              <span className="text-sm font-medium">Personal Best</span>
            </div>
            <span className="font-semibold">{longestStreak} days</span>
          </div>
        )}

        {/* Motivational Message */}
        <div
          className="rounded-lg bg-muted p-3 text-center text-sm"
          role="status"
          aria-live="polite"
        >
          {motivationalMessage}
        </div>
      </GlassCardContent>
    </GlassCard>
  )
}

