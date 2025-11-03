import { TrendingUp, TrendingDown, Minus, AlertCircle, Info, Calendar, Activity } from 'lucide-react'
import { classifyBloodPressure, getBPClassificationLabel } from '@/types'
import type { BloodPressureReading } from '@/types'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface BPTrendInsightsProps {
  data: BloodPressureReading[]
}

export function BPTrendInsights({ data }: BPTrendInsightsProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-muted-foreground" />
            Trend Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Add more readings to see detailed trend analysis and insights.
          </p>
        </CardContent>
      </Card>
    )
  }

  // Calculate averages
  const avgSystolic = Math.round(
    data.reduce((sum, r) => sum + r.systolic, 0) / data.length
  )
  const avgDiastolic = Math.round(
    data.reduce((sum, r) => sum + r.diastolic, 0) / data.length
  )
  const avgPulse = Math.round(
    data.reduce((sum, r) => sum + r.pulse, 0) / data.length
  )

  // Find min/max
  const systolicValues = data.map(r => r.systolic)
  const diastolicValues = data.map(r => r.diastolic)
  const minSystolic = Math.min(...systolicValues)
  const maxSystolic = Math.max(...systolicValues)
  const minDiastolic = Math.min(...diastolicValues)
  const maxDiastolic = Math.max(...diastolicValues)

  // Calculate trend (last 7 days vs previous 7 days)
  const sortedData = [...data].sort((a, b) => 
    new Date(a.measured_at).getTime() - new Date(b.measured_at).getTime()
  )
  const last7Days = sortedData.slice(-7)
  const previous7Days = sortedData.slice(-14, -7)
  
  let trend: 'improving' | 'worsening' | 'stable' = 'stable'
  let trendChange = 0
  
  if (last7Days.length > 0 && previous7Days.length > 0) {
    const recentAvg =
      last7Days.reduce((sum, r) => sum + r.systolic, 0) / last7Days.length
    const previousAvg =
      previous7Days.reduce((sum, r) => sum + r.systolic, 0) / previous7Days.length
    
    trendChange = Math.round(recentAvg - previousAvg)
    
    if (trendChange > 5) trend = 'worsening'
    else if (trendChange < -5) trend = 'improving'
    else trend = 'stable'
  }

  // Calculate variability (standard deviation)
  const systolicStdDev = Math.sqrt(
    systolicValues.reduce((sum, val) => sum + Math.pow(val - avgSystolic, 2), 0) / data.length
  )
  const isVariable = systolicStdDev > 10

  // Latest reading classification
  const latest = data[data.length - 1]
  const latestClassification = classifyBloodPressure(latest.systolic, latest.diastolic)
  const classificationLabel = getBPClassificationLabel(latestClassification)

  const getTrendIcon = () => {
    switch (trend) {
      case 'improving':
        return <TrendingDown className="h-4 w-4 text-green-600" />
      case 'worsening':
        return <TrendingUp className="h-4 w-4 text-red-600" />
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getTrendText = () => {
    switch (trend) {
      case 'improving':
        return `Improving by ${Math.abs(trendChange)} points`
      case 'worsening':
        return `Increased by ${trendChange} points`
      default:
        return 'Relatively stable'
    }
  }

  const getTrendColor = () => {
    switch (trend) {
      case 'improving':
        return 'text-green-600 dark:text-green-500'
      case 'worsening':
        return 'text-red-600 dark:text-red-500'
      default:
        return 'text-muted-foreground'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Trend Analysis & Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Trend */}
        <div className="rounded-lg border p-4 bg-muted/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Trend</span>
            {getTrendIcon()}
          </div>
          <p className={cn('text-sm font-semibold', getTrendColor())}>
            {getTrendText()}
          </p>
          {data.length >= 14 && (
            <p className="text-xs text-muted-foreground mt-1">
              Comparing last 7 days to previous 7 days
            </p>
          )}
        </div>

        {/* Key Statistics Grid */}
        <div className="grid gap-3 sm:grid-cols-2">
          {/* Average Values */}
          <div className="rounded-lg border p-3">
            <div className="flex items-center gap-2 mb-1">
              <Info className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Average (30 days)</span>
            </div>
            <p className="text-lg font-bold">
              {avgSystolic}/{avgDiastolic}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Pulse: {avgPulse} bpm
            </p>
          </div>

          {/* Range */}
          <div className="rounded-lg border p-3">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Range</span>
            </div>
            <p className="text-sm font-semibold">
              {minSystolic}/{minDiastolic} - {maxSystolic}/{maxDiastolic}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Systolic spread: {maxSystolic - minSystolic} points
            </p>
          </div>
        </div>

        {/* Latest Reading Status */}
        <div className="rounded-lg border p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Latest Reading</span>
            </div>
            <span className={cn(
              'text-xs font-semibold px-2 py-1 rounded',
              latestClassification === 'normal' && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
              latestClassification === 'elevated' && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
              latestClassification === 'high_stage_1' && 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
              latestClassification === 'high_stage_2' && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
              latestClassification === 'hypertensive_crisis' && 'bg-red-200 text-red-800 dark:bg-red-900/50 dark:text-red-200'
            )}>
              {classificationLabel}
            </span>
          </div>
          <p className="text-lg font-bold">
            {latest.systolic}/{latest.diastolic}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {format(new Date(latest.measured_at), 'MMM d, yyyy')}
          </p>
        </div>

        {/* Variability Warning */}
        {isVariable && (
          <div className="rounded-lg border border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-950/20 p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-yellow-900 dark:text-yellow-100">
                  High Variability Detected
                </p>
                <p className="text-xs text-yellow-800 dark:text-yellow-200 mt-1">
                  Your readings show significant variation. Try measuring at consistent times for more reliable data.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Recommendations */}
        <div className="rounded-lg border border-blue-500/50 bg-blue-50/50 dark:bg-blue-950/20 p-3">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="flex-1 space-y-1">
              <p className="text-xs font-semibold text-blue-900 dark:text-blue-100">
                Quick Tips
              </p>
              <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-0.5 list-disc list-inside">
                <li>Measure at the same time each day for consistency</li>
                <li>Rest for 5 minutes before taking your reading</li>
                {trend === 'worsening' && (
                  <li>Consider consulting with your healthcare provider</li>
                )}
                {trend === 'improving' && (
                  <li>Keep up the good work maintaining your health routine</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

