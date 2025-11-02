'use client'

import { AlertCircle } from 'lucide-react'
import {
  GlassCard,
  GlassCardContent,
  GlassCardDescription,
  GlassCardHeader,
  GlassCardTitle,
} from '@/components/ui/glass-card'
import { AnalyticsSummary } from '@/components/charts/analytics-summary'
import { CorrelationInsights } from '@/components/charts/correlation-insights'
import { HealthTimeline } from '@/components/charts/health-timeline'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { CorrelationInsight, TimelineEvent } from '@/types'

interface AnalyticsSummaryData {
  avgSystolic: number
  avgDiastolic: number
  totalExerciseMinutes: number
  totalMeals: number
  medicationAdherence: number
  dataPoints: number
}

interface AnalyticsContentProps {
  summaryResult: {
    success: boolean
    data?: AnalyticsSummaryData
    error?: string
  }
  insightsResult: {
    success: boolean
    data?: CorrelationInsight[]
    error?: string
  }
  timelineResult: {
    success: boolean
    data?: TimelineEvent[]
    error?: string
  }
}

export function AnalyticsContent({
  summaryResult,
  insightsResult,
  timelineResult,
}: AnalyticsContentProps) {
  // Handle errors
  if (!summaryResult.success || !insightsResult.success || !timelineResult.success) {
    return (
      <GlassCard>
        <GlassCardContent className="flex min-h-[400px] items-center justify-center">
          <div className="text-center text-muted-foreground">
            <AlertCircle className="mx-auto mb-2 h-12 w-12 text-red-500" />
            <p className="font-semibold">Failed to load analytics</p>
            <p className="text-sm">
              {summaryResult.error || insightsResult.error || timelineResult.error}
            </p>
          </div>
        </GlassCardContent>
      </GlassCard>
    )
  }

  const summary = summaryResult.data!
  const insights = insightsResult.data!
  const timeline = timelineResult.data!

  return (
    <div className="space-y-6">
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
        />
      </section>

      {/* Tabs for different views */}
      <Tabs defaultValue="insights" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        {/* Correlation Insights Tab */}
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
                <h4 className="font-semibold text-foreground mb-2">
                  How Correlations Work
                </h4>
                <p>
                  Our analytics engine examines patterns in your blood pressure, exercise,
                  diet, and medication data to identify meaningful relationships. A strong
                  correlation suggests a consistent pattern, while a weak correlation may
                  indicate other factors at play.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">
                  Confidence Levels
                </h4>
                <ul className="list-disc list-inside space-y-1">
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
              <div className="rounded-lg bg-amber-500/10 p-4 border border-amber-500/20">
                <p className="text-amber-700 dark:text-amber-300 text-xs">
                  <strong>Important:</strong> These insights are for informational purposes
                  only and should not replace medical advice. Always consult your healthcare
                  provider before making changes to your treatment plan.
                </p>
              </div>
            </GlassCardContent>
          </GlassCard>
        </TabsContent>

        {/* Health Timeline Tab */}
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
    </div>
  )
}

