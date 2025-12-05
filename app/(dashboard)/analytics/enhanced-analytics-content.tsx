'use client'

import { useState, useCallback, useMemo, useTransition } from 'react'
import { subDays, differenceInDays } from 'date-fns'
import type { DateRange } from 'react-day-picker'
import { AlertCircle, RefreshCw } from 'lucide-react'

import {
  GlassCard,
  GlassCardContent,
  GlassCardDescription,
  GlassCardHeader,
  GlassCardTitle,
} from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ShimmerSkeleton } from '@/components/ui/shimmer-skeleton'
import {
  DateRangeSelector,
  DATE_RANGE_PRESETS,
} from '@/components/analytics/date-range-selector'
import { PeriodComparison } from '@/components/analytics/period-comparison'
import { EnhancedInsights } from '@/components/analytics/enhanced-insights'
import { AnalyticsSummary } from '@/components/charts/analytics-summary'
import { CorrelationInsights } from '@/components/charts/correlation-insights'
import { HealthTimeline } from '@/components/charts/health-timeline'
import type { CorrelationInsight, TimelineEvent, BloodPressureReading } from '@/types'

interface AnalyticsSummaryData {
  avgSystolic: number
  avgDiastolic: number
  totalExerciseMinutes: number
  totalMeals: number
  medicationAdherence: number
  dataPoints: number
}

interface EnhancedAnalyticsContentProps {
  /** Initial summary data */
  initialSummary: AnalyticsSummaryData
  /** Initial insights */
  initialInsights: CorrelationInsight[]
  /** Initial timeline events */
  initialTimeline: TimelineEvent[]
  /** Initial blood pressure readings */
  initialReadings: BloodPressureReading[]
  /** Server action to fetch data for a date range */
  fetchDataAction: (
    startDate: string,
    endDate: string
  ) => Promise<{
    summary: AnalyticsSummaryData
    insights: CorrelationInsight[]
    timeline: TimelineEvent[]
    readings: BloodPressureReading[]
  }>
}

export function EnhancedAnalyticsContent({
  initialSummary,
  initialInsights,
  initialTimeline,
  initialReadings,
  fetchDataAction,
}: EnhancedAnalyticsContentProps) {
  const [isPending, startTransition] = useTransition()

  // Date range state
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const preset = DATE_RANGE_PRESETS.find((p) => p.id === 'last30')
    return preset?.getRange()
  })
  const [selectedPreset, setSelectedPreset] = useState<string | undefined>('last30')

  // Comparison state
  const [comparisonEnabled, setComparisonEnabled] = useState(false)
  const [comparisonRange, setComparisonRange] = useState<DateRange | undefined>()

  // Data state
  const [summary, setSummary] = useState<AnalyticsSummaryData>(initialSummary)
  const [insights, setInsights] = useState<CorrelationInsight[]>(initialInsights)
  const [timeline, setTimeline] = useState<TimelineEvent[]>(initialTimeline)
  const [readings, setReadings] = useState<BloodPressureReading[]>(initialReadings)
  const [error, setError] = useState<string | null>(null)

  // Comparison data state
  const [comparisonReadings, setComparisonReadings] = useState<BloodPressureReading[]>([])

  // Calculate suggested comparison range
  const suggestedComparisonRange = useMemo((): DateRange | undefined => {
    if (!dateRange?.from || !dateRange?.to) return undefined

    const days = differenceInDays(dateRange.to, dateRange.from)
    const comparisonEnd = subDays(dateRange.from, 1)
    const comparisonStart = subDays(comparisonEnd, days)

    return {
      from: comparisonStart,
      to: comparisonEnd,
    }
  }, [dateRange])

  // Handle date range change
  const handleDateRangeChange = useCallback(
    async (newRange: DateRange | undefined) => {
      setDateRange(newRange)
      setError(null)

      if (!newRange?.from || !newRange?.to) return

      startTransition(async () => {
        try {
          const data = await fetchDataAction(
            newRange.from!.toISOString(),
            newRange.to!.toISOString()
          )
          setSummary(data.summary)
          setInsights(data.insights)
          setTimeline(data.timeline)
          setReadings(data.readings)

          // Update comparison range if enabled
          if (comparisonEnabled) {
            const days = differenceInDays(newRange.to!, newRange.from!)
            const newCompEnd = subDays(newRange.from!, 1)
            const newCompStart = subDays(newCompEnd, days)
            setComparisonRange({ from: newCompStart, to: newCompEnd })

            // Fetch comparison data
            const compData = await fetchDataAction(
              newCompStart.toISOString(),
              newCompEnd.toISOString()
            )
            setComparisonReadings(compData.readings)
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to fetch data')
        }
      })
    },
    [fetchDataAction, comparisonEnabled]
  )

  // Handle comparison toggle
  const handleComparisonToggle = useCallback(
    async (enabled: boolean) => {
      setComparisonEnabled(enabled)

      if (enabled && dateRange?.from && dateRange?.to && suggestedComparisonRange) {
        setComparisonRange(suggestedComparisonRange)

        startTransition(async () => {
          try {
            const compData = await fetchDataAction(
              suggestedComparisonRange.from!.toISOString(),
              suggestedComparisonRange.to!.toISOString()
            )
            setComparisonReadings(compData.readings)
          } catch (err) {
            console.error('Failed to fetch comparison data:', err)
          }
        })
      } else {
        setComparisonRange(undefined)
        setComparisonReadings([])
      }
    },
    [dateRange, suggestedComparisonRange, fetchDataAction]
  )

  // Handle refresh
  const handleRefresh = useCallback(() => {
    if (dateRange?.from && dateRange?.to) {
      handleDateRangeChange(dateRange)
    }
  }, [dateRange, handleDateRangeChange])

  // Error state
  if (error) {
    return (
      <GlassCard>
        <GlassCardContent className="flex min-h-[400px] items-center justify-center">
          <div className="text-center text-muted-foreground">
            <AlertCircle className="mx-auto mb-2 h-12 w-12 text-red-500" />
            <p className="font-semibold">Failed to load analytics</p>
            <p className="text-sm">{error}</p>
            <Button onClick={handleRefresh} className="mt-4" variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        </GlassCardContent>
      </GlassCard>
    )
  }

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <GlassCard>
        <GlassCardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <DateRangeSelector
                value={dateRange}
                onChange={handleDateRangeChange}
                selectedPreset={selectedPreset}
                onPresetChange={setSelectedPreset}
                showComparisonToggle
                comparisonEnabled={comparisonEnabled}
                onComparisonToggle={handleComparisonToggle}
                comparisonRange={comparisonRange}
                onComparisonRangeChange={setComparisonRange}
                maxDate={new Date()}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isPending}
              className="shrink-0"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isPending ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </GlassCardContent>
      </GlassCard>

      {/* Loading State */}
      {isPending && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <ShimmerSkeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
          <ShimmerSkeleton className="h-[400px] rounded-xl" />
        </div>
      )}

      {/* Content */}
      {!isPending && (
        <>
          {/* Summary Statistics */}
          <section aria-labelledby="summary-heading">
            <h2 id="summary-heading" className="sr-only">
              Summary Statistics
            </h2>
            <AnalyticsSummary
              avgSystolic={summary.avgSystolic}
              avgDiastolic={summary.avgDiastolic}
              totalExerciseMinutes={summary.totalExerciseMinutes}
              totalMeals={summary.totalMeals}
              medicationAdherence={summary.medicationAdherence}
              dataPoints={summary.dataPoints}
              readings={readings}
            />
          </section>

          {/* Period Comparison (if enabled) */}
          {comparisonEnabled && comparisonRange?.from && comparisonRange?.to && dateRange?.from && dateRange?.to && (
            <section aria-labelledby="comparison-heading">
              <h2 id="comparison-heading" className="sr-only">
                Period Comparison
              </h2>
              <PeriodComparison
                currentPeriod={dateRange}
                previousPeriod={comparisonRange}
                currentReadings={readings}
                previousReadings={comparisonReadings}
              />
            </section>
          )}

          {/* Tabs for different views */}
          <Tabs defaultValue="insights" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:w-[500px]">
              <TabsTrigger value="insights">Insights</TabsTrigger>
              <TabsTrigger value="advanced">Advanced Stats</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
            </TabsList>

            {/* Insights Tab */}
            <TabsContent value="insights" className="space-y-6">
              <GlassCard>
                <GlassCardHeader>
                  <GlassCardTitle>Correlation Insights</GlassCardTitle>
                  <GlassCardDescription>
                    Discover how your lifestyle affects your blood pressure
                  </GlassCardDescription>
                </GlassCardHeader>
                <GlassCardContent>
                  <CorrelationInsights insights={insights} />
                </GlassCardContent>
              </GlassCard>

              {/* Educational Content */}
              <GlassCard>
                <GlassCardHeader>
                  <GlassCardTitle>Understanding Your Data</GlassCardTitle>
                </GlassCardHeader>
                <GlassCardContent className="space-y-4 text-sm text-muted-foreground">
                  <div>
                    <h4 className="mb-2 font-semibold text-foreground">How Correlations Work</h4>
                    <p>
                      Our analytics engine examines patterns in your blood pressure, exercise,
                      diet, and medication data to identify meaningful relationships. A strong
                      correlation suggests a consistent pattern, while a weak correlation may
                      indicate other factors at play.
                    </p>
                  </div>
                  <div>
                    <h4 className="mb-2 font-semibold text-foreground">Confidence Levels</h4>
                    <ul className="list-inside list-disc space-y-1">
                      <li>
                        <strong>High:</strong> Based on substantial data with clear patterns
                      </li>
                      <li>
                        <strong>Medium:</strong> Emerging patterns that need more data
                      </li>
                      <li>
                        <strong>Low:</strong> Preliminary observations requiring verification
                      </li>
                    </ul>
                  </div>
                  <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-4">
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      <strong>Important:</strong> These insights are for informational purposes
                      only and should not replace medical advice. Always consult your healthcare
                      provider before making changes to your treatment plan.
                    </p>
                  </div>
                </GlassCardContent>
              </GlassCard>
            </TabsContent>

            {/* Advanced Statistics Tab */}
            <TabsContent value="advanced" className="space-y-6">
              <EnhancedInsights readings={readings} correlationInsights={insights} />
            </TabsContent>

            {/* Timeline Tab */}
            <TabsContent value="timeline" className="space-y-6">
              <GlassCard>
                <GlassCardHeader>
                  <GlassCardTitle>Health Timeline</GlassCardTitle>
                  <GlassCardDescription>
                    Visualize all your health events in chronological order
                  </GlassCardDescription>
                </GlassCardHeader>
                <GlassCardContent>
                  <HealthTimeline events={timeline} />
                </GlassCardContent>
              </GlassCard>

              {/* Timeline Stats */}
              <div className="grid gap-4 md:grid-cols-3">
                <GlassCard>
                  <GlassCardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Total Events</p>
                    <p className="text-2xl font-bold">{timeline.length}</p>
                  </GlassCardContent>
                </GlassCard>
                <GlassCard>
                  <GlassCardContent className="p-4">
                    <p className="text-sm text-muted-foreground">BP Readings</p>
                    <p className="text-2xl font-bold">
                      {timeline.filter((e) => e.type === 'bp').length}
                    </p>
                  </GlassCardContent>
                </GlassCard>
                <GlassCard>
                  <GlassCardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Activities</p>
                    <p className="text-2xl font-bold">
                      {timeline.filter((e) => e.type === 'exercise' || e.type === 'diet').length}
                    </p>
                  </GlassCardContent>
                </GlassCard>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}

