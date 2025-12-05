'use client'

import { useMemo, memo } from 'react'
import {
  TrendingDown,
  TrendingUp,
  Activity,
  Heart,
  Brain,
  Zap,
  Target,
  AlertTriangle,
  CheckCircle,
  Info,
  Sparkles,
  BarChart3,
} from 'lucide-react'

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
  linearRegression,
  confidenceInterval,
  detectOutliers,
  // movingAverage, // Kept for future use
  type DescriptiveStatistics,
  type LinearRegressionResult,
  type ConfidenceInterval,
} from '@/lib/statistics'
import type { BloodPressureReading, CorrelationInsight } from '@/types'

interface EnhancedInsightsProps {
  /** Blood pressure readings for analysis */
  readings: BloodPressureReading[]
  /** Correlation insights from analytics engine */
  correlationInsights: CorrelationInsight[]
  /** Additional CSS classes */
  className?: string
}

/**
 * Enhanced Health Insights Component
 * 
 * Provides advanced statistical analysis and actionable insights
 * based on blood pressure data with confidence intervals.
 */
export const EnhancedInsights = memo(function EnhancedInsights({
  readings,
  correlationInsights,
  className,
}: EnhancedInsightsProps) {
  // Extract systolic and diastolic values
  const systolicValues = useMemo(() => readings.map((r) => r.systolic), [readings])
  const diastolicValues = useMemo(() => readings.map((r) => r.diastolic), [readings])
  const pulseValues = useMemo(() => readings.map((r) => r.pulse), [readings])

  // Calculate comprehensive statistics
  const systolicStats = useMemo(
    () => calculateDescriptiveStatistics(systolicValues),
    [systolicValues]
  )
  const diastolicStats = useMemo(
    () => calculateDescriptiveStatistics(diastolicValues),
    [diastolicValues]
  )
  const pulseStats = useMemo(
    () => calculateDescriptiveStatistics(pulseValues),
    [pulseValues]
  )

  // Calculate confidence intervals
  const systolicCI = useMemo(
    () => confidenceInterval(systolicValues, 0.95),
    [systolicValues]
  )
  const diastolicCI = useMemo(
    () => confidenceInterval(diastolicValues, 0.95),
    [diastolicValues]
  )

  // Perform trend analysis using linear regression
  const trendAnalysis = useMemo(() => {
    if (readings.length < 5) return null

    // Convert dates to numeric values (days from first reading)
    const sortedReadings = [...readings].sort(
      (a, b) => new Date(a.measured_at).getTime() - new Date(b.measured_at).getTime()
    )
    const firstDate = new Date(sortedReadings[0].measured_at).getTime()
    const x = sortedReadings.map(
      (r) => (new Date(r.measured_at).getTime() - firstDate) / (1000 * 60 * 60 * 24)
    )
    const y = sortedReadings.map((r) => r.systolic)

    return linearRegression(x, y)
  }, [readings])

  // Detect outliers
  const outlierAnalysis = useMemo(() => {
    if (readings.length < 4) return null
    return {
      systolic: detectOutliers(systolicValues),
      diastolic: detectOutliers(diastolicValues),
    }
  }, [systolicValues, diastolicValues, readings.length])

  // Calculate moving averages for trend visualization (currently unused but kept for future features)
  // const movingAverages = useMemo(() => {
  //   if (readings.length < 7) return null
  //   return {
  //     systolic7Day: movingAverage(systolicValues, 7),
  //     diastolic7Day: movingAverage(diastolicValues, 7),
  //   }
  // }, [systolicValues, diastolicValues, readings.length])

  // Calculate health score based on multiple factors
  const healthScore = useMemo(() => {
    if (readings.length < 3) return null

    let score = 100

    // Penalize based on average BP classification
    if (systolicStats.mean >= 180 || diastolicStats.mean >= 120) {
      score -= 50 // Hypertensive crisis
    } else if (systolicStats.mean >= 140 || diastolicStats.mean >= 90) {
      score -= 35 // Stage 2 hypertension
    } else if (systolicStats.mean >= 130 || diastolicStats.mean >= 80) {
      score -= 20 // Stage 1 hypertension
    } else if (systolicStats.mean >= 120) {
      score -= 10 // Elevated
    }

    // Penalize for high variability (coefficient of variation > 10%)
    if (systolicStats.coefficientOfVariation > 15) {
      score -= 15
    } else if (systolicStats.coefficientOfVariation > 10) {
      score -= 8
    }

    // Reward for improving trend
    if (trendAnalysis && trendAnalysis.slope < -0.5 && trendAnalysis.pValue < 0.05) {
      score += 10
    }
    // Penalize for worsening trend
    if (trendAnalysis && trendAnalysis.slope > 0.5 && trendAnalysis.pValue < 0.05) {
      score -= 10
    }

    // Reward for consistent readings (low outliers)
    if (outlierAnalysis && outlierAnalysis.systolic.outliers.length === 0) {
      score += 5
    }

    return Math.max(0, Math.min(100, Math.round(score)))
  }, [readings.length, systolicStats, diastolicStats, trendAnalysis, outlierAnalysis])

  if (readings.length < 3) {
    return (
      <GlassCard className={className}>
        <GlassCardContent className="flex min-h-[200px] items-center justify-center">
          <div className="text-center text-muted-foreground">
            <Info className="mx-auto mb-2 h-12 w-12 opacity-50" />
            <p className="font-medium">Need More Data</p>
            <p className="text-sm">Log at least 3 readings for enhanced insights</p>
          </div>
        </GlassCardContent>
      </GlassCard>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Health Score Card */}
      {healthScore !== null && (
        <HealthScoreCard
          score={healthScore}
          systolicStats={systolicStats}
          diastolicStats={diastolicStats}
          trendAnalysis={trendAnalysis}
        />
      )}

      {/* Statistical Summary */}
      <GlassCard>
        <GlassCardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 p-2">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div>
              <GlassCardTitle>Statistical Summary</GlassCardTitle>
              <GlassCardDescription>
                Comprehensive analysis with confidence intervals
              </GlassCardDescription>
            </div>
          </div>
        </GlassCardHeader>
        <GlassCardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <StatisticCard
              label="Systolic"
              stats={systolicStats}
              ci={systolicCI}
              unit="mmHg"
              icon={<Heart className="h-5 w-5" />}
              colorClass="text-red-500"
            />
            <StatisticCard
              label="Diastolic"
              stats={diastolicStats}
              ci={diastolicCI}
              unit="mmHg"
              icon={<Activity className="h-5 w-5" />}
              colorClass="text-blue-500"
            />
            <StatisticCard
              label="Pulse"
              stats={pulseStats}
              ci={confidenceInterval(pulseValues, 0.95)}
              unit="bpm"
              icon={<Zap className="h-5 w-5" />}
              colorClass="text-orange-500"
            />
          </div>
        </GlassCardContent>
      </GlassCard>

      {/* Trend Analysis */}
      {trendAnalysis && readings.length >= 5 && (
        <TrendAnalysisCard analysis={trendAnalysis} readingCount={readings.length} />
      )}

      {/* Variability Analysis */}
      <VariabilityCard
        systolicStats={systolicStats}
        diastolicStats={diastolicStats}
        outlierAnalysis={outlierAnalysis}
      />

      {/* AI-Powered Insights */}
      {correlationInsights.length > 0 && (
        <GlassCard>
          <GlassCardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 p-2">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <GlassCardTitle>AI-Powered Insights</GlassCardTitle>
                <GlassCardDescription>
                  Personalized recommendations based on your data patterns
                </GlassCardDescription>
              </div>
            </div>
          </GlassCardHeader>
          <GlassCardContent className="space-y-4">
            {correlationInsights.slice(0, 5).map((insight, index) => (
              <InsightCard key={index} insight={insight} />
            ))}
          </GlassCardContent>
        </GlassCard>
      )}
    </div>
  )
})

interface HealthScoreCardProps {
  score: number
  systolicStats: DescriptiveStatistics
  diastolicStats: DescriptiveStatistics
  trendAnalysis: LinearRegressionResult | null
}

function HealthScoreCard({
  score,
  systolicStats,
  diastolicStats,
  trendAnalysis,
}: HealthScoreCardProps) {
  const getScoreColor = () => {
    if (score >= 80) return 'text-green-500'
    if (score >= 60) return 'text-yellow-500'
    if (score >= 40) return 'text-orange-500'
    return 'text-red-500'
  }

  const getScoreLabel = () => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Fair'
    return 'Needs Attention'
  }

  // Helper function for progress color (currently unused but kept for future features)
  // const getProgressColor = () => {
  //   if (score >= 80) return 'bg-green-500'
  //   if (score >= 60) return 'bg-yellow-500'
  //   if (score >= 40) return 'bg-orange-500'
  //   return 'bg-red-500'
  // }

  return (
    <GlassCard className="overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div
                className={cn(
                  'flex h-20 w-20 items-center justify-center rounded-full border-4',
                  score >= 80
                    ? 'border-green-500/50'
                    : score >= 60
                    ? 'border-yellow-500/50'
                    : score >= 40
                    ? 'border-orange-500/50'
                    : 'border-red-500/50'
                )}
              >
                <span className={cn('text-3xl font-bold', getScoreColor())}>{score}</span>
              </div>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-background px-2 py-0.5 text-xs font-medium shadow">
                {getScoreLabel()}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Blood Pressure Health Score</h3>
              <p className="text-sm text-muted-foreground">
                Based on average levels, variability, and trends
              </p>
            </div>
          </div>

          <div className="hidden md:block space-y-2 text-right">
            <div className="flex items-center justify-end gap-2">
              <span className="text-sm text-muted-foreground">Avg BP:</span>
              <span className="font-semibold">
                {systolicStats.mean.toFixed(0)}/{diastolicStats.mean.toFixed(0)}
              </span>
            </div>
            {trendAnalysis && (
              <div className="flex items-center justify-end gap-2">
                <span className="text-sm text-muted-foreground">Trend:</span>
                <span
                  className={cn(
                    'flex items-center gap-1 font-semibold',
                    trendAnalysis.slope < -0.3
                      ? 'text-green-500'
                      : trendAnalysis.slope > 0.3
                      ? 'text-red-500'
                      : 'text-muted-foreground'
                  )}
                >
                  {trendAnalysis.slope < -0.3 ? (
                    <TrendingDown className="h-4 w-4" />
                  ) : trendAnalysis.slope > 0.3 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : null}
                  {trendAnalysis.slope < -0.3
                    ? 'Improving'
                    : trendAnalysis.slope > 0.3
                    ? 'Rising'
                    : 'Stable'}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4">
          <Progress value={score} className="h-2" />
        </div>
      </div>
    </GlassCard>
  )
}

interface StatisticCardProps {
  label: string
  stats: DescriptiveStatistics
  ci: ConfidenceInterval
  unit: string
  icon: React.ReactNode
  colorClass: string
}

function StatisticCard({ label, stats, ci, unit, icon, colorClass }: StatisticCardProps) {
  return (
    <div className="rounded-lg border bg-muted/20 p-4">
      <div className="mb-3 flex items-center gap-2">
        <div className={colorClass}>{icon}</div>
        <span className="font-semibold">{label}</span>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Mean</span>
          <span className="font-semibold">
            {stats.mean.toFixed(1)} {unit}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">95% CI</span>
          <span className="font-mono text-xs">
            [{ci.lower.toFixed(1)}, {ci.upper.toFixed(1)}]
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Std Dev</span>
          <span>±{stats.standardDeviation.toFixed(1)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Range</span>
          <span>
            {stats.min.toFixed(0)} - {stats.max.toFixed(0)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Median</span>
          <span>{stats.median.toFixed(1)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">IQR</span>
          <span>
            {stats.q1.toFixed(0)} - {stats.q3.toFixed(0)}
          </span>
        </div>
      </div>
    </div>
  )
}

interface TrendAnalysisCardProps {
  analysis: LinearRegressionResult
  readingCount: number
}

function TrendAnalysisCard({ analysis, readingCount }: TrendAnalysisCardProps) {
  const weeklyChange = analysis.slope * 7
  const monthlyChange = analysis.slope * 30
  const isSignificant = analysis.pValue < 0.05
  const isImproving = analysis.slope < 0

  return (
    <GlassCard>
      <GlassCardHeader>
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'rounded-lg p-2',
              isImproving
                ? 'bg-gradient-to-br from-green-500 to-emerald-500'
                : analysis.slope > 0.3
                ? 'bg-gradient-to-br from-red-500 to-orange-500'
                : 'bg-gradient-to-br from-blue-500 to-cyan-500'
            )}
          >
            {isImproving ? (
              <TrendingDown className="h-5 w-5 text-white" />
            ) : analysis.slope > 0.3 ? (
              <TrendingUp className="h-5 w-5 text-white" />
            ) : (
              <Target className="h-5 w-5 text-white" />
            )}
          </div>
          <div>
            <GlassCardTitle>Trend Analysis</GlassCardTitle>
            <GlassCardDescription>
              Linear regression based on {readingCount} readings
            </GlassCardDescription>
          </div>
        </div>
      </GlassCardHeader>
      <GlassCardContent>
        <div className="grid gap-4 md:grid-cols-4">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Weekly Change</span>
            <p
              className={cn(
                'text-lg font-bold',
                weeklyChange < -1
                  ? 'text-green-500'
                  : weeklyChange > 1
                  ? 'text-red-500'
                  : 'text-muted-foreground'
              )}
            >
              {weeklyChange > 0 ? '+' : ''}
              {weeklyChange.toFixed(1)} mmHg
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Monthly Projection</span>
            <p
              className={cn(
                'text-lg font-bold',
                monthlyChange < -3
                  ? 'text-green-500'
                  : monthlyChange > 3
                  ? 'text-red-500'
                  : 'text-muted-foreground'
              )}
            >
              {monthlyChange > 0 ? '+' : ''}
              {monthlyChange.toFixed(1)} mmHg
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">R² (Fit Quality)</span>
            <p className="text-lg font-bold">{(analysis.rSquared * 100).toFixed(1)}%</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Statistical Significance</span>
            <div className="flex items-center gap-2">
              {isSignificant ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <Info className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-sm font-semibold">
                p = {analysis.pValue < 0.001 ? '<0.001' : analysis.pValue.toFixed(3)}
              </span>
            </div>
          </div>
        </div>

        <div
          className={cn(
            'mt-4 rounded-lg p-3 text-sm',
            isSignificant && isImproving
              ? 'bg-green-500/10 text-green-700 dark:text-green-300'
              : isSignificant && !isImproving
              ? 'bg-red-500/10 text-red-700 dark:text-red-300'
              : 'bg-muted/50 text-muted-foreground'
          )}
        >
          {isSignificant ? (
            isImproving ? (
              <p>
                <strong>Your blood pressure is significantly improving!</strong> The downward trend
                of {Math.abs(weeklyChange).toFixed(1)} mmHg per week is statistically significant.
                Keep up your current lifestyle choices.
              </p>
            ) : (
              <p>
                <strong>Your blood pressure shows an upward trend.</strong> Consider reviewing your
                diet, exercise, and medication adherence. Consult your healthcare provider if this
                continues.
              </p>
            )
          ) : (
            <p>
              <strong>Your blood pressure is relatively stable.</strong> No statistically
              significant trend detected. Continue monitoring and maintaining healthy habits.
            </p>
          )}
        </div>
      </GlassCardContent>
    </GlassCard>
  )
}

interface VariabilityCardProps {
  systolicStats: DescriptiveStatistics
  diastolicStats: DescriptiveStatistics
  outlierAnalysis: {
    systolic: ReturnType<typeof detectOutliers>
    diastolic: ReturnType<typeof detectOutliers>
  } | null
}

function VariabilityCard({
  systolicStats,
  diastolicStats,
  outlierAnalysis,
}: VariabilityCardProps) {
  const highVariability = systolicStats.coefficientOfVariation > 10
  const hasOutliers =
    outlierAnalysis &&
    (outlierAnalysis.systolic.outliers.length > 0 ||
      outlierAnalysis.diastolic.outliers.length > 0)

  return (
    <GlassCard>
      <GlassCardHeader>
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 p-2">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div>
            <GlassCardTitle>Variability Analysis</GlassCardTitle>
            <GlassCardDescription>
              Understanding your BP fluctuations
            </GlassCardDescription>
          </div>
        </div>
      </GlassCardHeader>
      <GlassCardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Coefficient of Variation</h4>
            <div className="flex items-center gap-4">
              <div>
                <span className="text-xs text-muted-foreground">Systolic</span>
                <p
                  className={cn(
                    'text-lg font-bold',
                    systolicStats.coefficientOfVariation > 15
                      ? 'text-red-500'
                      : systolicStats.coefficientOfVariation > 10
                      ? 'text-yellow-500'
                      : 'text-green-500'
                  )}
                >
                  {systolicStats.coefficientOfVariation.toFixed(1)}%
                </p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Diastolic</span>
                <p
                  className={cn(
                    'text-lg font-bold',
                    diastolicStats.coefficientOfVariation > 15
                      ? 'text-red-500'
                      : diastolicStats.coefficientOfVariation > 10
                      ? 'text-yellow-500'
                      : 'text-green-500'
                  )}
                >
                  {diastolicStats.coefficientOfVariation.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          {outlierAnalysis && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Outlier Detection</h4>
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-xs text-muted-foreground">Systolic Outliers</span>
                  <p className="text-lg font-bold">
                    {outlierAnalysis.systolic.outliers.length}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Diastolic Outliers</span>
                  <p className="text-lg font-bold">
                    {outlierAnalysis.diastolic.outliers.length}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div
          className={cn(
            'rounded-lg p-3 text-sm',
            highVariability || hasOutliers
              ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
              : 'bg-green-500/10 text-green-700 dark:text-green-300'
          )}
        >
          {highVariability ? (
            <p>
              <AlertTriangle className="mr-2 inline h-4 w-4" />
              <strong>High BP variability detected.</strong> Variability above 10% may indicate
              inconsistent measurement conditions or underlying factors. Try measuring at the same
              time daily, after resting for 5 minutes.
            </p>
          ) : hasOutliers ? (
            <p>
              <Info className="mr-2 inline h-4 w-4" />
              <strong>Some unusual readings detected.</strong> These outliers may be due to
              measurement errors, stress, or other temporary factors. Review these readings with
              your healthcare provider.
            </p>
          ) : (
            <p>
              <CheckCircle className="mr-2 inline h-4 w-4" />
              <strong>Good consistency!</strong> Your BP readings show low variability, indicating
              stable measurements and good measurement technique.
            </p>
          )}
        </div>
      </GlassCardContent>
    </GlassCard>
  )
}

interface InsightCardProps {
  insight: CorrelationInsight
}

function InsightCard({ insight }: InsightCardProps) {
  const getIcon = () => {
    switch (insight.type) {
      case 'positive':
        return <CheckCircle className="h-5 w-5" />
      case 'negative':
        return <AlertTriangle className="h-5 w-5" />
      default:
        return <Info className="h-5 w-5" />
    }
  }

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
      default:
        return {
          border: 'border-l-blue-500',
          icon: 'text-blue-600 dark:text-blue-400',
          bg: 'bg-blue-500/10',
        }
    }
  }

  const colors = getColorClasses()

  return (
    <div className={cn('rounded-lg border-l-4 p-4', colors.border, colors.bg)}>
      <div className="flex items-start gap-3">
        <div className={colors.icon}>{getIcon()}</div>
        <div className="flex-1">
          <h4 className="font-semibold">{insight.title}</h4>
          <p className="mt-1 text-sm text-muted-foreground">{insight.description}</p>
          <div className="mt-2 flex items-center gap-2">
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-xs font-medium',
                insight.confidence === 'high'
                  ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                  : insight.confidence === 'medium'
                  ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                  : 'bg-slate-500/20 text-slate-700 dark:text-slate-300'
              )}
            >
              {insight.confidence} confidence
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

