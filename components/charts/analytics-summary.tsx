'use client'

import { Heart, Activity, Utensils, Pill, TrendingDown, TrendingUp } from 'lucide-react'
import { GlassCard, GlassCardContent } from '@/components/ui/glass-card'
import { StatCounter } from '@/components/ui/stat-counter'
import { cn } from '@/lib/utils'

interface AnalyticsSummaryProps {
  avgSystolic: number
  avgDiastolic: number
  totalExerciseMinutes: number
  totalMeals: number
  medicationAdherence: number
  dataPoints: number
  className?: string
}

export function AnalyticsSummary({
  avgSystolic,
  avgDiastolic,
  totalExerciseMinutes,
  totalMeals,
  medicationAdherence,
  dataPoints,
  className,
}: AnalyticsSummaryProps) {
  const getBPStatus = (systolic: number, diastolic: number) => {
    if (systolic >= 140 || diastolic >= 90) {
      return { status: 'High', color: 'text-red-600 dark:text-red-400', trend: 'up' }
    } else if (systolic >= 130 || diastolic >= 80) {
      return { status: 'Elevated', color: 'text-orange-600 dark:text-orange-400', trend: 'up' }
    } else if (systolic >= 120) {
      return { status: 'Normal-High', color: 'text-yellow-600 dark:text-yellow-400', trend: 'neutral' }
    }
    return { status: 'Normal', color: 'text-green-600 dark:text-green-400', trend: 'down' }
  }

  const getAdherenceStatus = (adherence: number) => {
    if (adherence >= 90) {
      return { status: 'Excellent', color: 'text-green-600 dark:text-green-400' }
    } else if (adherence >= 80) {
      return { status: 'Good', color: 'text-blue-600 dark:text-blue-400' }
    } else if (adherence >= 70) {
      return { status: 'Fair', color: 'text-yellow-600 dark:text-yellow-400' }
    }
    return { status: 'Needs Improvement', color: 'text-red-600 dark:text-red-400' }
  }

  const bpStatus = getBPStatus(avgSystolic, avgDiastolic)
  const adherenceStatus = getAdherenceStatus(medicationAdherence)

  return (
    <div className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-4', className)}>
      {/* Average Blood Pressure */}
      <GlassCard className="hover-lift" hover>
        <GlassCardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-red-500/20 p-3">
                <Heart className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Blood Pressure</p>
                <div className="flex items-baseline gap-2">
                  <StatCounter
                    value={avgSystolic}
                    className="text-2xl font-bold"
                    duration={1000}
                  />
                  <span className="text-lg font-semibold text-muted-foreground">/</span>
                  <StatCounter
                    value={avgDiastolic}
                    className="text-2xl font-bold"
                    duration={1000}
                  />
                </div>
                <p className={cn('text-xs font-medium', bpStatus.color)}>{bpStatus.status}</p>
              </div>
            </div>
            {bpStatus.trend === 'up' && (
              <TrendingUp className="h-5 w-5 text-red-500" aria-label="Trending up" />
            )}
            {bpStatus.trend === 'down' && (
              <TrendingDown className="h-5 w-5 text-green-500" aria-label="Trending down" />
            )}
          </div>
        </GlassCardContent>
      </GlassCard>

      {/* Total Exercise */}
      <GlassCard className="hover-lift" hover>
        <GlassCardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/20 p-3">
              <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Exercise</p>
              <div className="flex items-baseline gap-1">
                <StatCounter
                  value={totalExerciseMinutes}
                  className="text-2xl font-bold"
                  duration={1000}
                />
                <span className="text-sm text-muted-foreground">min</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {Math.round(totalExerciseMinutes / 7)} min/day avg
              </p>
            </div>
          </div>
        </GlassCardContent>
      </GlassCard>

      {/* Total Meals Logged */}
      <GlassCard className="hover-lift" hover>
        <GlassCardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-500/20 p-3">
              <Utensils className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Meals Logged</p>
              <StatCounter
                value={totalMeals}
                className="text-2xl font-bold"
                duration={1000}
              />
              <p className="text-xs text-muted-foreground">
                {(totalMeals / 7).toFixed(1)} meals/day
              </p>
            </div>
          </div>
        </GlassCardContent>
      </GlassCard>

      {/* Medication Adherence */}
      <GlassCard className="hover-lift" hover>
        <GlassCardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-500/20 p-3">
              <Pill className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Med Adherence</p>
              <div className="flex items-baseline gap-1">
                <StatCounter
                  value={medicationAdherence}
                  className="text-2xl font-bold"
                  duration={1000}
                />
                <span className="text-lg font-semibold">%</span>
              </div>
              <p className={cn('text-xs font-medium', adherenceStatus.color)}>
                {adherenceStatus.status}
              </p>
            </div>
          </div>
        </GlassCardContent>
      </GlassCard>

      {/* Total Data Points */}
      <GlassCard className="hover-lift md:col-span-2 lg:col-span-4" hover>
        <GlassCardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Health Data Points
              </p>
              <StatCounter
                value={dataPoints}
                className="text-3xl font-bold"
                duration={1500}
              />
              <p className="text-xs text-muted-foreground">
                Comprehensive tracking for better insights
              </p>
            </div>
            <div className="hidden md:flex gap-4 text-sm">
              <div className="text-center">
                <div className="h-2 w-16 rounded-full bg-gradient-to-r from-red-500 to-pink-500" />
                <p className="mt-1 text-xs text-muted-foreground">BP</p>
              </div>
              <div className="text-center">
                <div className="h-2 w-16 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500" />
                <p className="mt-1 text-xs text-muted-foreground">Exercise</p>
              </div>
              <div className="text-center">
                <div className="h-2 w-16 rounded-full bg-gradient-to-r from-green-500 to-emerald-500" />
                <p className="mt-1 text-xs text-muted-foreground">Diet</p>
              </div>
              <div className="text-center">
                <div className="h-2 w-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
                <p className="mt-1 text-xs text-muted-foreground">Meds</p>
              </div>
            </div>
          </div>
        </GlassCardContent>
      </GlassCard>
    </div>
  )
}


