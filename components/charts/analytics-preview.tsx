import Link from 'next/link'
import { subDays } from 'date-fns'
import { ArrowRight, BarChart3, TrendingDown, TrendingUp, Sparkles, Info, Lightbulb } from 'lucide-react'
import {
  GlassCard,
  GlassCardContent,
  GlassCardDescription,
  GlassCardHeader,
  GlassCardTitle,
} from '@/components/ui/glass-card'
import { GradientButton } from '@/components/ui/gradient-button'
import { getCorrelationInsights } from '@/app/actions/analytics'
import { cn } from '@/lib/utils'

export async function AnalyticsPreview() {
  // Fetch insights for the last 30 days
  const endDate = new Date().toISOString()
  const startDate = subDays(new Date(), 30).toISOString()

  const insightsResult = await getCorrelationInsights(startDate, endDate)

  if (!insightsResult.success || !insightsResult.data) {
    return null
  }

  const insights = insightsResult.data

  // Show only the top 2 insights
  const topInsights = insights.slice(0, 2)

  if (topInsights.length === 0) {
    return (
      <GlassCard>
        <GlassCardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gradient-to-br from-orange-500 to-pink-500 p-2">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <GlassCardTitle>Health Analytics</GlassCardTitle>
                <GlassCardDescription>Discover patterns in your data</GlassCardDescription>
              </div>
            </div>
          </div>
        </GlassCardHeader>
        <GlassCardContent>
          <div className="space-y-4">
            <div className="rounded-lg border border-blue-200/50 bg-blue-50/50 dark:border-blue-800/50 dark:bg-blue-950/20 p-3">
              <div className="flex items-start gap-2">
                <Info className="mt-0.5 h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-1">
                    What are Health Insights?
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                    Health Insights analyze correlations between your blood pressure readings and lifestyle factors (diet, exercise, medications). 
                    They help identify patterns that may be affecting your cardiovascular health. Visit the Analytics page for detailed charts and recommendations.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center py-4 text-center">
              <Sparkles className="mb-3 h-12 w-12 text-muted-foreground opacity-50" />
              <p className="mb-2 text-sm font-medium">Keep Logging Your Health Data</p>
              <p className="mb-4 text-xs text-muted-foreground">
                Log at least 7-10 readings along with diet and exercise entries to see meaningful correlations
              </p>
              <Link href="/analytics">
                <GradientButton variant="primary" size="sm">
                  View Analytics
                  <ArrowRight className="ml-2 h-4 w-4" />
                </GradientButton>
              </Link>
            </div>
          </div>
        </GlassCardContent>
      </GlassCard>
    )
  }

  return (
    <GlassCard className="hover-lift" hover>
      <GlassCardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gradient-to-br from-orange-500 to-pink-500 p-2">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div>
              <GlassCardTitle>Health Insights</GlassCardTitle>
              <GlassCardDescription>
                {insights.length} pattern{insights.length !== 1 ? 's' : ''} discovered
              </GlassCardDescription>
            </div>
          </div>
          <Link href="/analytics">
            <GradientButton variant="primary" size="sm">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </GradientButton>
          </Link>
        </div>
      </GlassCardHeader>
      <GlassCardContent className="space-y-4">
        {/* Explanation Section */}
        <div className="rounded-lg border border-blue-200/50 bg-blue-50/50 dark:border-blue-800/50 dark:bg-blue-950/20 p-3">
          <div className="flex items-start gap-2">
            <Lightbulb className="mt-0.5 h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-1">
                Understanding Your Insights
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                <strong>Positive insights</strong> (green) show beneficial patterns. <strong>Negative insights</strong> (red) indicate areas that may need attention. 
                Click "View All" to explore detailed analytics, charts, and personalized recommendations.
              </p>
            </div>
          </div>
        </div>

        {/* Insights List */}
        <div className="space-y-3">
          {topInsights.map((insight, index) => (
            <InsightPreviewCard key={index} insight={insight} />
          ))}
        </div>

        {insights.length > 2 && (
          <div className="pt-2 text-center">
            <Link
              href="/analytics"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              + {insights.length - 2} more insight{insights.length - 2 !== 1 ? 's' : ''} available
            </Link>
          </div>
        )}
      </GlassCardContent>
    </GlassCard>
  )
}

interface InsightPreviewCardProps {
  insight: {
    type: 'positive' | 'negative' | 'neutral'
    title: string
    description: string
    confidence: 'high' | 'medium' | 'low'
    metric?: number
  }
}

function InsightPreviewCard({ insight }: InsightPreviewCardProps) {
  const getColorClasses = () => {
    switch (insight.type) {
      case 'positive':
        return {
          border: 'border-l-green-500',
          icon: 'text-green-600 dark:text-green-400',
          bg: 'bg-green-500/10',
          badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        }
      case 'negative':
        return {
          border: 'border-l-red-500',
          icon: 'text-red-600 dark:text-red-400',
          bg: 'bg-red-500/10',
          badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        }
      case 'neutral':
        return {
          border: 'border-l-blue-500',
          icon: 'text-blue-600 dark:text-blue-400',
          bg: 'bg-blue-500/10',
          badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        }
    }
  }

  const getTrendIcon = () => {
    if (insight.type === 'positive') {
      return <TrendingDown className="h-4 w-4" />
    } else if (insight.type === 'negative') {
      return <TrendingUp className="h-4 w-4" />
    }
    return null
  }

  const getConfidenceBadge = () => {
    const confidenceLabels = {
      high: 'High Confidence',
      medium: 'Medium Confidence',
      low: 'Low Confidence',
    }
    return (
      <span className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        insight.confidence === 'high' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
        insight.confidence === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
        'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
      )}>
        {confidenceLabels[insight.confidence]}
      </span>
    )
  }

  const getActionGuidance = () => {
    if (insight.type === 'positive') {
      return (
        <p className="text-xs text-muted-foreground mt-2 flex items-start gap-1.5">
          <span className="mt-0.5">💡</span>
          <span>This is a positive pattern. Consider maintaining or increasing this activity to continue benefiting your health.</span>
        </p>
      )
    } else if (insight.type === 'negative') {
      return (
        <p className="text-xs text-muted-foreground mt-2 flex items-start gap-1.5">
          <span className="mt-0.5">⚠️</span>
          <span>This pattern may need attention. Visit the Analytics page for detailed recommendations and action steps.</span>
        </p>
      )
    }
    return (
      <p className="text-xs text-muted-foreground mt-2 flex items-start gap-1.5">
        <span className="mt-0.5">📊</span>
        <span>Monitor this pattern over time. More data will help clarify its impact on your health.</span>
      </p>
    )
  }

  const colors = getColorClasses()

  return (
    <div
      className={cn(
        'rounded-lg border-l-4 p-4 transition-all hover:shadow-md',
        colors.border,
        colors.bg
      )}
    >
      <div className="space-y-2">
        <div className="flex items-start gap-2">
          <div className={cn('mt-0.5', colors.icon)}>{getTrendIcon()}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <p className="text-sm font-semibold">{insight.title}</p>
              {getConfidenceBadge()}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {insight.description}
            </p>
            {insight.metric !== undefined && (
              <div className="mt-2">
                <p className="text-xs font-medium opacity-80">
                  {insight.type === 'positive' || insight.type === 'negative'
                    ? `Correlation strength: ${Math.abs(insight.metric).toFixed(0)}%`
                    : `Metric: ${insight.metric.toFixed(0)}%`}
                </p>
              </div>
            )}
            {getActionGuidance()}
          </div>
        </div>
      </div>
    </div>
  )
}







