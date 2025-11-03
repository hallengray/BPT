import Link from 'next/link'
import { subDays } from 'date-fns'
import { ArrowRight, BarChart3, TrendingDown, TrendingUp, Sparkles } from 'lucide-react'
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
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Sparkles className="mb-3 h-12 w-12 text-muted-foreground opacity-50" />
            <p className="mb-2 text-sm font-medium">Keep Logging Your Health Data</p>
            <p className="mb-4 text-xs text-muted-foreground">
              We need more data to generate meaningful insights
            </p>
            <Link href="/analytics">
              <GradientButton variant="primary" size="sm">
                View Analytics
                <ArrowRight className="ml-2 h-4 w-4" />
              </GradientButton>
            </Link>
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
      <GlassCardContent className="space-y-3">
        {topInsights.map((insight, index) => (
          <InsightPreviewCard key={index} insight={insight} />
        ))}
        {insights.length > 2 && (
          <div className="pt-2 text-center">
            <Link
              href="/analytics"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              + {insights.length - 2} more insight{insights.length - 2 !== 1 ? 's' : ''}
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
        }
      case 'negative':
        return {
          border: 'border-l-red-500',
          icon: 'text-red-600 dark:text-red-400',
          bg: 'bg-red-500/10',
        }
      case 'neutral':
        return {
          border: 'border-l-blue-500',
          icon: 'text-blue-600 dark:text-blue-400',
          bg: 'bg-blue-500/10',
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

  const colors = getColorClasses()

  return (
    <div
      className={cn(
        'rounded-lg border-l-4 p-3 transition-all',
        colors.border,
        colors.bg
      )}
    >
      <div className="flex items-start gap-2">
        <div className={cn('mt-0.5', colors.icon)}>{getTrendIcon()}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{insight.title}</p>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
            {insight.description}
          </p>
          {insight.metric !== undefined && (
            <p className="text-xs font-medium mt-1 opacity-70">
              {insight.type === 'positive' || insight.type === 'negative'
                ? `${Math.abs(insight.metric).toFixed(0)}% correlation`
                : `${insight.metric.toFixed(0)}%`}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}


