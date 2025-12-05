import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { StreakBadge } from './streak-badge'
import { calculateStreak } from '@/lib/streak-calculator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  GlassCard,
  GlassCardContent,
  GlassCardHeader,
  GlassCardTitle,
} from '@/components/ui/glass-card'
import type { BloodPressureReading } from '@/types'

async function StreakContent() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch all BP readings for streak calculation
  const { data: readings } = (await supabase
    .from('blood_pressure_readings')
    .select('*')
    .eq('user_id', user.id)
    .order('measured_at', { ascending: false })) as { data: BloodPressureReading[] | null }

  if (!readings || readings.length === 0) {
    return (
      <GlassCard>
        <GlassCardHeader>
          <GlassCardTitle>Logging Streak</GlassCardTitle>
        </GlassCardHeader>
        <GlassCardContent className="flex min-h-[200px] items-center justify-center">
          <div className="text-center text-muted-foreground">
            <p className="text-sm">Start logging to build your streak!</p>
          </div>
        </GlassCardContent>
      </GlassCard>
    )
  }

  const streakData = calculateStreak(readings)

  return (
    <StreakBadge
      currentStreak={streakData.currentStreak}
      longestStreak={streakData.longestStreak}
      nextMilestone={streakData.nextMilestone}
      daysUntilMilestone={streakData.daysUntilMilestone}
      milestoneProgress={streakData.milestoneProgress}
    />
  )
}

function StreakLoading() {
  return (
    <GlassCard>
      <GlassCardHeader>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
      </GlassCardHeader>
      <GlassCardContent className="space-y-4">
        <div className="text-center">
          <Skeleton className="mx-auto mb-2 h-16 w-16 rounded-full" />
          <Skeleton className="mx-auto h-10 w-20" />
          <Skeleton className="mx-auto mt-2 h-4 w-24" />
        </div>
        <Skeleton className="h-2 w-full" />
      </GlassCardContent>
    </GlassCard>
  )
}

export function StreakWidget() {
  return (
    <Suspense fallback={<StreakLoading />}>
      <StreakContent />
    </Suspense>
  )
}



