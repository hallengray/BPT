'use client'

import { memo } from 'react'
import { TrendingDown, TrendingUp, Minus, AlertCircle, CheckCircle, Info, Sparkles } from 'lucide-react'
import type { CorrelationInsight } from '@/types'
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from '@/components/ui/glass-card'
import { cn } from '@/lib/utils'

interface CorrelationInsightsProps {
  insights: CorrelationInsight[]
  className?: string
}

export function CorrelationInsights({ insights, className }: CorrelationInsightsProps) {
  if (!insights || insights.length === 0) {
    return (
      <GlassCard className={className}>
        <GlassCardContent className="flex min-h-[200px] items-center justify-center">
          <div className="text-center text-muted-foreground">
            <Info className="mx-auto mb-2 h-12 w-12 opacity-50" />
            <p>Not enough data for insights</p>
            <p className="text-sm">Keep logging to discover patterns</p>
          </div>
        </GlassCardContent>
      </GlassCard>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {insights.map((insight, index) => (
        <InsightCard key={index} insight={insight} />
      ))}
    </div>
  )
}

interface InsightCardProps {
  insight: CorrelationInsight
}

const InsightCard = memo(function InsightCard({ insight }: InsightCardProps) {
  // Check if this is a predictive insight based on title
  const isPredictive = insight.title.toLowerCase().includes('prediction')
  
  const getIcon = () => {
    if (isPredictive) {
      return <Sparkles className="h-5 w-5" />
    }
    
    switch (insight.type) {
      case 'positive':
        return <CheckCircle className="h-5 w-5" />
      case 'negative':
        return <AlertCircle className="h-5 w-5" />
      case 'neutral':
        return <Info className="h-5 w-5" />
    }
  }

  const getTrendIcon = () => {
    if (!insight.metric) return null
    if (insight.type === 'positive') {
      return <TrendingDown className="h-4 w-4" />
    } else if (insight.type === 'negative') {
      return <TrendingUp className="h-4 w-4" />
    }
    return <Minus className="h-4 w-4" />
  }

  const getColorClasses = () => {
    if (isPredictive) {
      return {
        border: 'border-l-purple-500',
        icon: 'text-purple-600 dark:text-purple-400',
        bg: 'bg-purple-500/10',
        badge: 'bg-purple-500/20 text-purple-700 dark:text-purple-300',
      }
    }
    
    switch (insight.type) {
      case 'positive':
        return {
          border: 'border-l-green-500',
          icon: 'text-green-600 dark:text-green-400',
          bg: 'bg-green-500/10',
          badge: 'bg-green-500/20 text-green-700 dark:text-green-300',
        }
      case 'negative':
        return {
          border: 'border-l-red-500',
          icon: 'text-red-600 dark:text-red-400',
          bg: 'bg-red-500/10',
          badge: 'bg-red-500/20 text-red-700 dark:text-red-300',
        }
      case 'neutral':
        return {
          border: 'border-l-blue-500',
          icon: 'text-blue-600 dark:text-blue-400',
          bg: 'bg-blue-500/10',
          badge: 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
        }
    }
  }

  const getConfidenceBadge = () => {
    const colors = {
      high: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300',
      medium: 'bg-amber-500/20 text-amber-700 dark:text-amber-300',
      low: 'bg-slate-500/20 text-slate-700 dark:text-slate-300',
    }

    return (
      <span
        className={cn(
          'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
          colors[insight.confidence]
        )}
      >
        {insight.confidence} confidence
      </span>
    )
  }

  const colors = getColorClasses()

  return (
    <GlassCard
      className={cn('border-l-4 transition-all hover-lift', colors.border)}
      hover
    >
      <GlassCardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={cn('rounded-lg p-2', colors.bg)}>
              <div className={colors.icon}>{getIcon()}</div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <GlassCardTitle className="text-lg">{insight.title}</GlassCardTitle>
                {isPredictive && (
                  <span className="inline-flex items-center rounded-full bg-purple-500/20 px-2 py-0.5 text-xs font-medium text-purple-700 dark:text-purple-300">
                    Prediction
                  </span>
                )}
              </div>
              {insight.metric !== undefined && (
                <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                  {getTrendIcon()}
                  <span>
                    {isPredictive
                      ? `${Math.abs(insight.metric).toFixed(1)} mmHg impact`
                      : insight.type === 'positive' || insight.type === 'negative'
                      ? `${Math.abs(insight.metric).toFixed(0)}% correlation`
                      : `${insight.metric.toFixed(0)}%`}
                  </span>
                </div>
              )}
            </div>
          </div>
          {getConfidenceBadge()}
        </div>
      </GlassCardHeader>
      <GlassCardContent>
        <p className="text-sm text-muted-foreground leading-relaxed">{insight.description}</p>
      </GlassCardContent>
    </GlassCard>
  )
}, (prevProps, nextProps) => {
  // Custom comparison: only re-render if insight content changes
  return (
    prevProps.insight.title === nextProps.insight.title &&
    prevProps.insight.description === nextProps.insight.description &&
    prevProps.insight.metric === nextProps.insight.metric &&
    prevProps.insight.confidence === nextProps.insight.confidence
  )
})







