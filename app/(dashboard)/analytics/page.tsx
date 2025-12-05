import { Suspense } from 'react'
import { subDays } from 'date-fns'
import { BarChart3 } from 'lucide-react'
import {
  GlassCard,
  GlassCardContent,
} from '@/components/ui/glass-card'
import { ShimmerSkeleton } from '@/components/ui/shimmer-skeleton'
import { EnhancedAnalyticsContent } from './enhanced-analytics-content'
import {
  getAnalyticsSummary,
  getCorrelationInsights,
  getHealthTimeline,
  getUnifiedHealthData,
} from '@/app/actions/analytics'

export const metadata = {
  title: 'Analytics',
  description: 'Advanced health analytics with statistical analysis, period comparison, and actionable insights',
}

/**
 * Server action to fetch all analytics data for a date range
 * This is called by the client component when the date range changes
 */
async function fetchAnalyticsData(startDate: string, endDate: string) {
  'use server'
  
  const [summaryResult, insightsResult, timelineResult, healthDataResult] = await Promise.all([
    getAnalyticsSummary(startDate, endDate),
    getCorrelationInsights(startDate, endDate),
    getHealthTimeline(startDate, endDate),
    getUnifiedHealthData(startDate, endDate),
  ])

  if (!summaryResult.success || !summaryResult.data) {
    throw new Error(summaryResult.error || 'Failed to fetch summary')
  }
  if (!insightsResult.success || !insightsResult.data) {
    throw new Error(insightsResult.error || 'Failed to fetch insights')
  }
  if (!timelineResult.success || !timelineResult.data) {
    throw new Error(timelineResult.error || 'Failed to fetch timeline')
  }
  if (!healthDataResult.success || !healthDataResult.data) {
    throw new Error(healthDataResult.error || 'Failed to fetch health data')
  }

  return {
    summary: summaryResult.data,
    insights: insightsResult.data,
    timeline: timelineResult.data,
    readings: healthDataResult.data.bloodPressure,
  }
}

async function AnalyticsData() {
  const days = 30
  const endDate = new Date().toISOString()
  const startDate = subDays(new Date(), days).toISOString()

  // Fetch initial data
  const initialData = await fetchAnalyticsData(startDate, endDate)

  return (
    <EnhancedAnalyticsContent
      initialSummary={initialData.summary}
      initialInsights={initialData.insights}
      initialTimeline={initialData.timeline}
      initialReadings={initialData.readings}
      fetchDataAction={fetchAnalyticsData}
    />
  )
}

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto space-y-6 px-4 py-8 pb-24 md:pb-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 p-3 shadow-lg">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Health Analytics</h1>
            <p className="text-muted-foreground">
              Advanced statistical analysis with confidence intervals and period comparison
            </p>
          </div>
        </div>
      </div>

      {/* Analytics Content */}
      <Suspense fallback={<AnalyticsLoadingSkeleton />}>
        <AnalyticsData />
      </Suspense>
    </div>
  )
}

function AnalyticsLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Date Range Selector Skeleton */}
      <GlassCard>
        <GlassCardContent className="p-4">
          <ShimmerSkeleton className="h-10 w-full max-w-md" />
        </GlassCardContent>
      </GlassCard>

      {/* Summary Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <GlassCard key={i}>
            <GlassCardContent className="p-6">
              <ShimmerSkeleton className="h-24 w-full" />
            </GlassCardContent>
          </GlassCard>
        ))}
      </div>

      {/* Insights Skeleton */}
      <GlassCard>
        <GlassCardContent className="space-y-4 p-6">
          <ShimmerSkeleton className="h-6 w-48" />
          <ShimmerSkeleton className="h-4 w-64" />
          <div className="space-y-4 pt-4">
            {[...Array(3)].map((_, i) => (
              <ShimmerSkeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </GlassCardContent>
      </GlassCard>

      {/* Timeline Skeleton */}
      <GlassCard>
        <GlassCardContent className="p-6">
          <ShimmerSkeleton className="h-[400px] w-full" />
        </GlassCardContent>
      </GlassCard>
    </div>
  )
}
