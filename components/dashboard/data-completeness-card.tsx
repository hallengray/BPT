import { Suspense } from 'react'
import Link from 'next/link'
import { subDays } from 'date-fns'
import { TrendingUp, Activity, Utensils, Heart, Pill, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { calculateDataQualityScore, getDataCompleteness } from '@/lib/data-quality-checker'
import {
  GlassCard,
  GlassCardContent,
  GlassCardDescription,
  GlassCardHeader,
  GlassCardTitle,
} from '@/components/ui/glass-card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

async function DataCompletenessContent() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const days = 21
  const startDate = subDays(new Date(), days).toISOString()
  const endDate = new Date().toISOString()

  // Fetch all health data
  const [bpResult, dietResult, exerciseResult, dosesResult] = await Promise.all([
    supabase
      .from('blood_pressure_readings')
      .select('*')
      .eq('user_id', user.id)
      .gte('measured_at', startDate)
      .lte('measured_at', endDate),
    supabase
      .from('diet_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('logged_at', startDate)
      .lte('logged_at', endDate),
    supabase
      .from('exercise_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('logged_at', startDate)
      .lte('logged_at', endDate),
    supabase
      .from('medication_doses')
      .select('*')
      .eq('user_id', user.id)
      .gte('scheduled_time', startDate)
      .lte('scheduled_time', endDate),
  ])

  const healthData = {
    bloodPressure: bpResult.data || [],
    diet: dietResult.data || [],
    exercise: exerciseResult.data || [],
    medications: [],
    medicationDoses: dosesResult.data || [],
  }

  const qualityScore = calculateDataQualityScore(healthData, days)
  const completeness = getDataCompleteness(healthData, days)

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400'
    if (score >= 50) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { label: 'Excellent', variant: 'default' as const, class: 'bg-green-600' }
    if (score >= 50) return { label: 'Good', variant: 'secondary' as const, class: 'bg-yellow-600' }
    return { label: 'Needs Work', variant: 'destructive' as const, class: '' }
  }

  const badge = getScoreBadge(qualityScore.overall)

  const metrics = [
    {
      icon: Heart,
      label: 'BP Logging',
      value: `${completeness.bpDays}/${days} days`,
      score: qualityScore.breakdown.bpLogging,
      href: '/log-bp',
    },
    {
      icon: Activity,
      label: 'Exercise',
      value: `${completeness.exerciseDays}/${days} days`,
      score: qualityScore.breakdown.exerciseLogging,
      href: '/log-diet-exercise?tab=exercise',
    },
    {
      icon: Utensils,
      label: 'Diet',
      value: `${completeness.dietDays}/${days} days`,
      score: qualityScore.breakdown.dietLogging,
      href: '/log-diet-exercise?tab=diet',
    },
    {
      icon: Pill,
      label: 'Medications',
      value: `${qualityScore.breakdown.medicationAdherence}%`,
      score: qualityScore.breakdown.medicationAdherence,
      href: '/medications',
    },
  ]

  return (
    <GlassCard>
      <GlassCardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gradient-to-br from-orange-500 to-pink-500 p-2.5 shadow-lg">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <GlassCardTitle>Data Completeness</GlassCardTitle>
              <GlassCardDescription>Last {days} days</GlassCardDescription>
            </div>
          </div>
          <Badge variant={badge.variant} className={badge.class}>
            {badge.label}
          </Badge>
        </div>
      </GlassCardHeader>
      <GlassCardContent className="space-y-4">
        {/* Overall Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Score</span>
            <span className={cn('text-2xl font-bold', getScoreColor(qualityScore.overall))}>
              {qualityScore.overall}%
            </span>
          </div>
          <Progress value={qualityScore.overall} className="h-2" />
        </div>

        {/* Individual Metrics */}
        <div className="grid gap-3 sm:grid-cols-2">
          {metrics.map((metric) => {
            const Icon = metric.icon
            return (
              <Link
                key={metric.label}
                href={metric.href}
                className="group block rounded-lg border p-3 transition-all hover:border-primary hover:shadow-md"
                aria-label={`${metric.label}: ${metric.value}, ${metric.score}% complete. Click to log more.`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <span className="text-sm font-medium">{metric.label}</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{metric.value}</span>
                  <span className={cn('text-sm font-semibold', getScoreColor(metric.score))}>
                    {metric.score}%
                  </span>
                </div>
                <Progress value={metric.score} className="mt-1.5 h-1" aria-label={`${metric.label} progress`} />
              </Link>
            )
          })}
        </div>

        {/* Motivational Message */}
        {qualityScore.overall < 70 && (
          <div 
            className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950"
            role="status"
            aria-live="polite"
          >
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <strong>Tip:</strong> Consistent logging helps identify patterns and improve insights.
              Try to log your BP, meals, and exercise daily!
            </p>
          </div>
        )}

        {qualityScore.overall >= 80 && (
          <div 
            className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950"
            role="status"
            aria-live="polite"
          >
            <p className="text-sm text-green-900 dark:text-green-100">
              <strong>Great job!</strong> You're tracking consistently. Keep it up to get the most
              accurate insights.
            </p>
          </div>
        )}
      </GlassCardContent>
    </GlassCard>
  )
}

function DataCompletenessLoading() {
  return (
    <GlassCard>
      <GlassCardHeader>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </GlassCardHeader>
      <GlassCardContent className="space-y-4">
        <div role="status" aria-label="Loading data completeness">
          <span className="sr-only">Loading data completeness information...</span>
          <Skeleton className="h-20 w-full" />
          <div className="grid gap-3 sm:grid-cols-2 mt-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </GlassCardContent>
    </GlassCard>
  )
}

export function DataCompletenessCard() {
  return (
    <Suspense fallback={<DataCompletenessLoading />}>
      <DataCompletenessContent />
    </Suspense>
  )
}

