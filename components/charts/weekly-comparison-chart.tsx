'use client'

import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from '@/components/ui/glass-card'
import { cn } from '@/lib/utils'
import type { BloodPressureReading, ExerciseLog, DietLog } from '@/types'
import { calculateWeekOverWeekComparison } from '@/lib/analytics-utils'

interface WeeklyComparisonChartProps {
  readings: BloodPressureReading[]
  exercise: ExerciseLog[]
  diet: DietLog[]
  className?: string
}

export function WeeklyComparisonChart({
  readings,
  exercise,
  diet,
  className,
}: WeeklyComparisonChartProps) {
  const comparison = calculateWeekOverWeekComparison(readings, exercise, diet)

  // Prepare data for chart
  const chartData = [
    {
      metric: 'Systolic BP',
      'This Week': comparison.thisWeek.avgSystolic,
      'Last Week': comparison.lastWeek.avgSystolic,
      unit: 'mmHg',
    },
    {
      metric: 'Diastolic BP',
      'This Week': comparison.thisWeek.avgDiastolic,
      'Last Week': comparison.lastWeek.avgDiastolic,
      unit: 'mmHg',
    },
    {
      metric: 'Exercise',
      'This Week': comparison.thisWeek.exerciseMinutes,
      'Last Week': comparison.lastWeek.exerciseMinutes,
      unit: 'min',
    },
    {
      metric: 'Meals',
      'This Week': comparison.thisWeek.mealCount,
      'Last Week': comparison.lastWeek.mealCount,
      unit: 'count',
    },
    {
      metric: 'BP Readings',
      'This Week': comparison.thisWeek.readingCount,
      'Last Week': comparison.lastWeek.readingCount,
      unit: 'count',
    },
  ]

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4" />
    if (change < 0) return <TrendingDown className="h-4 w-4" />
    return <Minus className="h-4 w-4" />
  }

  const getChangeColor = (metric: string, change: number) => {
    // For BP, lower is better
    if (metric.includes('BP')) {
      if (change < 0) return 'text-green-600 dark:text-green-400'
      if (change > 0) return 'text-red-600 dark:text-red-400'
    }
    // For exercise, meals, readings, higher is better
    else {
      if (change > 0) return 'text-green-600 dark:text-green-400'
      if (change < 0) return 'text-red-600 dark:text-red-400'
    }
    return 'text-muted-foreground'
  }

  const getPercentageChange = (thisWeek: number, lastWeek: number) => {
    if (lastWeek === 0) return thisWeek > 0 ? 100 : 0
    return ((thisWeek - lastWeek) / lastWeek) * 100
  }

  return (
    <GlassCard className={className}>
      <GlassCardHeader>
        <GlassCardTitle>Week-over-Week Comparison</GlassCardTitle>
        <p className="text-sm text-muted-foreground">
          Compare your health metrics from this week to last week
        </p>
      </GlassCardHeader>
      <GlassCardContent>
        {/* Chart */}
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" opacity={0.3} />
              <XAxis
                dataKey="metric"
                className="text-xs"
                tick={{ fill: 'currentColor' }}
                tickLine={{ stroke: 'currentColor' }}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: 'currentColor' }}
                tickLine={{ stroke: 'currentColor' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                formatter={(value: number, name: string, props: any) => [
                  `${value} ${props.payload.unit}`,
                  name,
                ]}
              />
              <Legend
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="rect"
              />
              <Bar
                dataKey="Last Week"
                fill="hsl(var(--muted-foreground))"
                radius={[4, 4, 0, 0]}
                opacity={0.6}
              />
              <Bar
                dataKey="This Week"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Change Indicators */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {/* Systolic BP Change */}
          <div className="rounded-lg border bg-card/50 p-3">
            <p className="text-xs font-medium text-muted-foreground">Systolic BP</p>
            <div className="mt-1 flex items-center gap-2">
              <span
                className={cn(
                  'flex items-center gap-1 text-sm font-semibold',
                  getChangeColor('BP', comparison.changes.systolic)
                )}
              >
                {getChangeIcon(comparison.changes.systolic)}
                {comparison.changes.systolic > 0 ? '+' : ''}
                {comparison.changes.systolic} mmHg
              </span>
              <span className="text-xs text-muted-foreground">
                ({getPercentageChange(comparison.thisWeek.avgSystolic, comparison.lastWeek.avgSystolic).toFixed(1)}%)
              </span>
            </div>
          </div>

          {/* Diastolic BP Change */}
          <div className="rounded-lg border bg-card/50 p-3">
            <p className="text-xs font-medium text-muted-foreground">Diastolic BP</p>
            <div className="mt-1 flex items-center gap-2">
              <span
                className={cn(
                  'flex items-center gap-1 text-sm font-semibold',
                  getChangeColor('BP', comparison.changes.diastolic)
                )}
              >
                {getChangeIcon(comparison.changes.diastolic)}
                {comparison.changes.diastolic > 0 ? '+' : ''}
                {comparison.changes.diastolic} mmHg
              </span>
              <span className="text-xs text-muted-foreground">
                ({getPercentageChange(comparison.thisWeek.avgDiastolic, comparison.lastWeek.avgDiastolic).toFixed(1)}%)
              </span>
            </div>
          </div>

          {/* Exercise Change */}
          <div className="rounded-lg border bg-card/50 p-3">
            <p className="text-xs font-medium text-muted-foreground">Exercise</p>
            <div className="mt-1 flex items-center gap-2">
              <span
                className={cn(
                  'flex items-center gap-1 text-sm font-semibold',
                  getChangeColor('Exercise', comparison.changes.exercise)
                )}
              >
                {getChangeIcon(comparison.changes.exercise)}
                {comparison.changes.exercise > 0 ? '+' : ''}
                {comparison.changes.exercise} min
              </span>
              <span className="text-xs text-muted-foreground">
                ({getPercentageChange(comparison.thisWeek.exerciseMinutes, comparison.lastWeek.exerciseMinutes).toFixed(1)}%)
              </span>
            </div>
          </div>

          {/* Meals Change */}
          <div className="rounded-lg border bg-card/50 p-3">
            <p className="text-xs font-medium text-muted-foreground">Meals Logged</p>
            <div className="mt-1 flex items-center gap-2">
              <span
                className={cn(
                  'flex items-center gap-1 text-sm font-semibold',
                  getChangeColor('Meals', comparison.changes.meals)
                )}
              >
                {getChangeIcon(comparison.changes.meals)}
                {comparison.changes.meals > 0 ? '+' : ''}
                {comparison.changes.meals}
              </span>
              <span className="text-xs text-muted-foreground">
                ({getPercentageChange(comparison.thisWeek.mealCount, comparison.lastWeek.mealCount).toFixed(1)}%)
              </span>
            </div>
          </div>

          {/* Readings Change */}
          <div className="rounded-lg border bg-card/50 p-3">
            <p className="text-xs font-medium text-muted-foreground">BP Readings</p>
            <div className="mt-1 flex items-center gap-2">
              <span
                className={cn(
                  'flex items-center gap-1 text-sm font-semibold',
                  getChangeColor('Readings', comparison.changes.readings)
                )}
              >
                {getChangeIcon(comparison.changes.readings)}
                {comparison.changes.readings > 0 ? '+' : ''}
                {comparison.changes.readings}
              </span>
              <span className="text-xs text-muted-foreground">
                ({getPercentageChange(comparison.thisWeek.readingCount, comparison.lastWeek.readingCount).toFixed(1)}%)
              </span>
            </div>
          </div>

          {/* Pulse Change */}
          <div className="rounded-lg border bg-card/50 p-3">
            <p className="text-xs font-medium text-muted-foreground">Avg Pulse</p>
            <div className="mt-1 flex items-center gap-2">
              <span
                className={cn(
                  'flex items-center gap-1 text-sm font-semibold',
                  getChangeColor('Pulse', comparison.changes.pulse)
                )}
              >
                {getChangeIcon(comparison.changes.pulse)}
                {comparison.changes.pulse > 0 ? '+' : ''}
                {comparison.changes.pulse} bpm
              </span>
              <span className="text-xs text-muted-foreground">
                ({getPercentageChange(comparison.thisWeek.avgPulse, comparison.lastWeek.avgPulse).toFixed(1)}%)
              </span>
            </div>
          </div>
        </div>
      </GlassCardContent>
    </GlassCard>
  )
}



