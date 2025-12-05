'use client'

import { useMemo, memo } from 'react'
import {
  ArrowDown,
  ArrowUp,
  Minus,
  TrendingUp,
  Activity,
  AlertTriangle,
  CheckCircle,
  Info,
  BarChart3,
} from 'lucide-react'
import { format } from 'date-fns'
import type { DateRange } from 'react-day-picker'

import { cn } from '@/lib/utils'
import {
  GlassCard,
  GlassCardContent,
  GlassCardDescription,
  GlassCardHeader,
  GlassCardTitle,
} from '@/components/ui/glass-card'
import { Progress } from '@/components/ui/progress'
import {
  calculateDescriptiveStatistics,
  comparePeriods,
  confidenceInterval,
  type DescriptiveStatistics,
  type PeriodComparisonResult,
} from '@/lib/statistics'
import type { BloodPressureReading } from '@/types'

interface PeriodComparisonProps {
  /** Current period date range */
  currentPeriod: DateRange
  /** Previous period date range */
  previousPeriod: DateRange
  /** Current period BP readings */
  currentReadings: BloodPressureReading[]
  /** Previous period BP readings */
  previousReadings: BloodPressureReading[]
  /** Additional CSS classes */
  className?: string
}

/**
 * Period Comparison Component
 * 
 * Provides rigorous statistical comparison between two time periods.
 * Implements proper hypothesis testing and effect size calculations.
 */
export const PeriodComparison = memo(function PeriodComparison({
  currentPeriod,
  previousPeriod,
  currentReadings,
  previousReadings,
  className,
}: PeriodComparisonProps) {
  // Extract systolic values for comparison
  const currentSystolic = useMemo(
    () => currentReadings.map((r) => r.systolic),
    [currentReadings]
  )
  const previousSystolic = useMemo(
    () => previousReadings.map((r) => r.systolic),
    [previousReadings]
  )

  // Extract diastolic values for comparison
  const currentDiastolic = useMemo(
    () => currentReadings.map((r) => r.diastolic),
    [currentReadings]
  )
  const previousDiastolic = useMemo(
    () => previousReadings.map((r) => r.diastolic),
    [previousReadings]
  )

  // Calculate comprehensive statistics
  const systolicComparison = useMemo(
    () => comparePeriods(previousSystolic, currentSystolic),
    [previousSystolic, currentSystolic]
  )
  const diastolicComparison = useMemo(
    () => comparePeriods(previousDiastolic, currentDiastolic),
    [previousDiastolic, currentDiastolic]
  )

  // Calculate confidence intervals for current period
  const systolicCI = useMemo(
    () => confidenceInterval(currentSystolic, 0.95),
    [currentSystolic]
  )
  const diastolicCI = useMemo(
    () => confidenceInterval(currentDiastolic, 0.95),
    [currentDiastolic]
  )

  // Determine if we have enough data for meaningful analysis
  const hasEnoughData = currentReadings.length >= 5 && previousReadings.length >= 5
  const hasMinimalData = currentReadings.length >= 2 && previousReadings.length >= 2

  if (!hasMinimalData) {
    return (
      <GlassCard className={className}>
        <GlassCardContent className="flex min-h-[200px] items-center justify-center">
          <div className="text-center text-muted-foreground">
            <Info className="mx-auto mb-2 h-12 w-12 opacity-50" />
            <p className="font-medium">Insufficient Data for Comparison</p>
            <p className="text-sm">
              Need at least 2 readings in each period for comparison
            </p>
          </div>
        </GlassCardContent>
      </GlassCard>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Period Summary Header */}
      <div className="grid gap-4 md:grid-cols-2">
        <PeriodSummaryCard
          title="Previous Period"
          dateRange={previousPeriod}
          systolicStats={systolicComparison.period1}
          diastolicStats={calculateDescriptiveStatistics(previousDiastolic)}
          readingCount={previousReadings.length}
          variant="muted"
        />
        <PeriodSummaryCard
          title="Current Period"
          dateRange={currentPeriod}
          systolicStats={systolicComparison.period2}
          diastolicStats={calculateDescriptiveStatistics(currentDiastolic)}
          readingCount={currentReadings.length}
          variant="primary"
          systolicCI={systolicCI}
          diastolicCI={diastolicCI}
        />
      </div>

      {/* Statistical Comparison */}
      <GlassCard>
        <GlassCardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 p-2">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div>
              <GlassCardTitle>Statistical Comparison</GlassCardTitle>
              <GlassCardDescription>
                Rigorous analysis of changes between periods
              </GlassCardDescription>
            </div>
          </div>
        </GlassCardHeader>
        <GlassCardContent className="space-y-6">
          {/* Systolic Comparison */}
          <ComparisonMetric
            label="Systolic Blood Pressure"
            comparison={systolicComparison}
            unit="mmHg"
            improvementDirection="decrease"
          />

          {/* Diastolic Comparison */}
          <ComparisonMetric
            label="Diastolic Blood Pressure"
            comparison={diastolicComparison}
            unit="mmHg"
            improvementDirection="decrease"
          />

          {/* Statistical Confidence Warning */}
          {!hasEnoughData && (
            <div className="flex items-start gap-3 rounded-lg bg-amber-500/10 p-4 text-amber-700 dark:text-amber-300">
              <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium">Limited Statistical Power</p>
                <p className="mt-1 text-amber-600 dark:text-amber-400">
                  With fewer than 5 readings per period, statistical conclusions should be
                  interpreted with caution. Continue logging to improve analysis reliability.
                </p>
              </div>
            </div>
          )}
        </GlassCardContent>
      </GlassCard>

      {/* Interpretation Guide */}
      <GlassCard>
        <GlassCardHeader>
          <GlassCardTitle>Understanding Your Results</GlassCardTitle>
        </GlassCardHeader>
        <GlassCardContent className="space-y-4 text-sm text-muted-foreground">
          <div className="grid gap-4 md:grid-cols-2">
            <InterpretationItem
              icon={<Activity className="h-4 w-4" />}
              title="Effect Size"
              description="Measures the practical significance of the change. Small (<0.5), Medium (0.5-0.8), Large (>0.8)"
            />
            <InterpretationItem
              icon={<TrendingUp className="h-4 w-4" />}
              title="Statistical Significance"
              description="P-value < 0.05 indicates the change is unlikely due to random variation"
            />
            <InterpretationItem
              icon={<BarChart3 className="h-4 w-4" />}
              title="Confidence Interval"
              description="95% CI shows the range where the true average likely falls"
            />
            <InterpretationItem
              icon={<Info className="h-4 w-4" />}
              title="Percent Change"
              description="Relative change from previous period, useful for tracking progress"
            />
          </div>
          <div className="rounded-lg bg-blue-500/10 p-4 text-blue-700 dark:text-blue-300">
            <p className="text-xs">
              <strong>Note:</strong> These statistics are for informational purposes only.
              Always consult your healthcare provider for medical advice.
            </p>
          </div>
        </GlassCardContent>
      </GlassCard>
    </div>
  )
})

interface PeriodSummaryCardProps {
  title: string
  dateRange: DateRange
  systolicStats: DescriptiveStatistics
  diastolicStats: DescriptiveStatistics
  readingCount: number
  variant: 'primary' | 'muted'
  systolicCI?: { lower: number; upper: number }
  diastolicCI?: { lower: number; upper: number }
}

function PeriodSummaryCard({
  title,
  dateRange,
  systolicStats,
  diastolicStats,
  readingCount,
  variant,
  systolicCI,
  diastolicCI,
}: PeriodSummaryCardProps) {
  const isPrimary = variant === 'primary'

  return (
    <GlassCard className={cn(isPrimary && 'border-primary/50 bg-primary/5')}>
      <GlassCardContent className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className={cn('text-sm font-semibold', isPrimary && 'text-primary')}>
            {title}
          </h3>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {readingCount} readings
          </span>
        </div>

        {dateRange.from && dateRange.to && (
          <p className="mb-4 text-xs text-muted-foreground">
            {format(dateRange.from, 'MMM d')} - {format(dateRange.to, 'MMM d, yyyy')}
          </p>
        )}

        <div className="space-y-3">
          {/* Systolic */}
          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-muted-foreground">Systolic</span>
              <div className="text-right">
                <span className="text-lg font-bold">
                  {systolicStats.mean.toFixed(0)}
                </span>
                <span className="ml-1 text-xs text-muted-foreground">
                  ±{systolicStats.standardDeviation.toFixed(1)}
                </span>
              </div>
            </div>
            {systolicCI && (
              <p className="text-right text-xs text-muted-foreground">
                95% CI: [{systolicCI.lower.toFixed(0)}, {systolicCI.upper.toFixed(0)}]
              </p>
            )}
          </div>

          {/* Diastolic */}
          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-muted-foreground">Diastolic</span>
              <div className="text-right">
                <span className="text-lg font-bold">
                  {diastolicStats.mean.toFixed(0)}
                </span>
                <span className="ml-1 text-xs text-muted-foreground">
                  ±{diastolicStats.standardDeviation.toFixed(1)}
                </span>
              </div>
            </div>
            {diastolicCI && (
              <p className="text-right text-xs text-muted-foreground">
                95% CI: [{diastolicCI.lower.toFixed(0)}, {diastolicCI.upper.toFixed(0)}]
              </p>
            )}
          </div>

          {/* Range */}
          <div className="flex items-baseline justify-between border-t pt-2">
            <span className="text-xs text-muted-foreground">Range</span>
            <span className="text-xs">
              {systolicStats.min.toFixed(0)}/{diastolicStats.min.toFixed(0)} -{' '}
              {systolicStats.max.toFixed(0)}/{diastolicStats.max.toFixed(0)}
            </span>
          </div>
        </div>
      </GlassCardContent>
    </GlassCard>
  )
}

interface ComparisonMetricProps {
  label: string
  comparison: PeriodComparisonResult
  unit: string
  improvementDirection: 'increase' | 'decrease'
}

function ComparisonMetric({
  label,
  comparison,
  unit,
  improvementDirection,
}: ComparisonMetricProps) {
  const { meanDifference, percentChange, effectSize, effectSizeInterpretation, tTest, differenceCI } =
    comparison

  // Determine if change is an improvement
  const isImprovement =
    improvementDirection === 'decrease' ? meanDifference < 0 : meanDifference > 0
  const isSignificant = tTest.significant

  // Get appropriate icon and color
  const getChangeIcon = () => {
    if (Math.abs(meanDifference) < 1) {
      return <Minus className="h-5 w-5 text-muted-foreground" />
    }
    if (isImprovement) {
      return <ArrowDown className="h-5 w-5 text-green-500" />
    }
    return <ArrowUp className="h-5 w-5 text-red-500" />
  }

  const getChangeColor = () => {
    if (Math.abs(meanDifference) < 1) return 'text-muted-foreground'
    return isImprovement ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
  }

  // Helper function for effect size color (currently unused but kept for future features)
  // const getEffectSizeColor = () => {
  //   switch (effectSizeInterpretation) {
  //     case 'large':
  //       return 'bg-purple-500'
  //     case 'medium':
  //       return 'bg-blue-500'
  //     case 'small':
  //       return 'bg-cyan-500'
  //     default:
  //       return 'bg-gray-400'
  //   }
  // }

  const effectSizePercent = Math.min(Math.abs(effectSize) * 50, 100)

  return (
    <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">{label}</h4>
        <div className="flex items-center gap-2">
          {getChangeIcon()}
          <span className={cn('text-lg font-bold', getChangeColor())}>
            {meanDifference > 0 ? '+' : ''}
            {meanDifference.toFixed(1)} {unit}
          </span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {/* Percent Change */}
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Percent Change</span>
          <p className={cn('text-sm font-semibold', getChangeColor())}>
            {percentChange > 0 ? '+' : ''}
            {percentChange.toFixed(1)}%
          </p>
        </div>

        {/* Effect Size */}
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Effect Size (Cohen&apos;s d)</span>
          <div className="flex items-center gap-2">
            <Progress value={effectSizePercent} className="h-2 w-16" />
            <span className="text-sm font-semibold capitalize">
              {effectSizeInterpretation}
            </span>
          </div>
        </div>

        {/* Statistical Significance */}
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">P-value</span>
          <div className="flex items-center gap-2">
            {isSignificant ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <Info className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="text-sm font-semibold">
              {tTest.pValue < 0.001 ? '<0.001' : tTest.pValue.toFixed(3)}
            </span>
          </div>
        </div>

        {/* 95% CI for Difference */}
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">95% CI for Difference</span>
          <p className="text-sm font-semibold">
            [{differenceCI.lower.toFixed(1)}, {differenceCI.upper.toFixed(1)}]
          </p>
        </div>
      </div>

      {/* Interpretation */}
      <div
        className={cn(
          'rounded-lg p-3 text-sm',
          isImprovement && isSignificant
            ? 'bg-green-500/10 text-green-700 dark:text-green-300'
            : !isImprovement && isSignificant
            ? 'bg-red-500/10 text-red-700 dark:text-red-300'
            : 'bg-muted/50 text-muted-foreground'
        )}
      >
        {isSignificant ? (
          <p>
            {isImprovement ? (
              <>
                <strong>Statistically significant improvement.</strong> Your {label.toLowerCase()}{' '}
                decreased by {Math.abs(meanDifference).toFixed(1)} {unit} on average, with a{' '}
                {effectSizeInterpretation} effect size.
              </>
            ) : (
              <>
                <strong>Statistically significant increase.</strong> Your {label.toLowerCase()}{' '}
                increased by {Math.abs(meanDifference).toFixed(1)} {unit} on average. Consider
                reviewing your lifestyle factors.
              </>
            )}
          </p>
        ) : (
          <p>
            <strong>No statistically significant change detected.</strong> The observed difference
            of {Math.abs(meanDifference).toFixed(1)} {unit} could be due to normal variation.
            Continue monitoring for trends.
          </p>
        )}
      </div>
    </div>
  )
}

interface InterpretationItemProps {
  icon: React.ReactNode
  title: string
  description: string
}

function InterpretationItem({ icon, title, description }: InterpretationItemProps) {
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 text-primary">{icon}</div>
      <div>
        <p className="font-medium text-foreground">{title}</p>
        <p className="text-xs">{description}</p>
      </div>
    </div>
  )
}

