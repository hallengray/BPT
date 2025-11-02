import { Suspense } from 'react'
import { subDays } from 'date-fns'
import { BarChart3, Calendar } from 'lucide-react'
import {
  GlassCard,
  GlassCardContent,
  GlassCardDescription,
  GlassCardHeader,
  GlassCardTitle,
} from '@/components/ui/glass-card'
import { ShimmerSkeleton } from '@/components/ui/shimmer-skeleton'
import { AnalyticsContent } from './analytics-content'
import {
  getAnalyticsSummary,
  getCorrelationInsights,
  getHealthTimeline,
} from '@/app/actions/analytics'

export const metadata = {
  title: 'Analytics | Blood Pressure Tracker',
  description: 'View correlations between your blood pressure, diet, exercise, and medications',
}

async function AnalyticsData() {
  const days = 30
  const endDate = new Date().toISOString()
  const startDate = subDays(new Date(), days).toISOString()

  // Fetch all data in parallel
  const [summaryResult, insightsResult, timelineResult] = await Promise.all([
    getAnalyticsSummary(startDate, endDate),
    getCorrelationInsights(startDate, endDate),
    getHealthTimeline(startDate, endDate),
  ])

  return (
    <AnalyticsContent
      summaryResult={summaryResult}
      insightsResult={insightsResult}
      timelineResult={timelineResult}
    />
  )
}

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-gradient-to-br from-orange-500 to-pink-500 p-3 shadow-lg">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Health Analytics</h1>
            <p className="text-muted-foreground">
              Discover patterns and correlations in your health data
            </p>
          </div>
        </div>
      </div>

      {/* Date Range Info */}
      <GlassCard>
        <GlassCardContent className="flex items-center gap-2 p-4">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Showing data from the last 30 days. More data provides better insights.
          </p>
        </GlassCardContent>
      </GlassCard>

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
      {/* Summary Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <GlassCard key={i}>
            <GlassCardContent className="p-6">
              <ShimmerSkeleton className="h-20 w-full" />
            </GlassCardContent>
          </GlassCard>
        ))}
      </div>

      {/* Insights Skeleton */}
      <GlassCard>
        <GlassCardHeader>
          <GlassCardTitle>Correlation Insights</GlassCardTitle>
          <GlassCardDescription>Loading insights...</GlassCardDescription>
        </GlassCardHeader>
        <GlassCardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <ShimmerSkeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </GlassCardContent>
      </GlassCard>

      {/* Timeline Skeleton */}
      <GlassCard>
        <GlassCardHeader>
          <GlassCardTitle>Health Timeline</GlassCardTitle>
          <GlassCardDescription>Loading timeline...</GlassCardDescription>
        </GlassCardHeader>
        <GlassCardContent>
          <ShimmerSkeleton className="h-[400px] w-full" />
        </GlassCardContent>
      </GlassCard>
    </div>
  )
}

