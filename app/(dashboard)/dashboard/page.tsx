import { Suspense } from 'react'
import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { BPTrendChart } from '@/components/charts/bp-trend-chart'
import { EnhancedStatCard } from '@/components/dashboard/enhanced-stat-card'
import { AnalyticsPreview } from '@/components/charts/analytics-preview'
import { HealthHeroSection } from '@/components/dashboard/health-hero-section'
import { PendingDosesWidget } from '@/components/dashboard/pending-doses-widget'
import { SmartRemindersServer } from '@/components/dashboard/smart-reminders-server'
import { StreakWidget } from '@/components/dashboard/streak-widget'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ShimmerSkeleton } from '@/components/ui/shimmer-skeleton'
import { TrendingUp, Heart } from 'lucide-react'
import { classifyBloodPressure, getBPClassificationLabel } from '@/types'
import type { Database } from '@/types/database.types'

type BloodPressureReading = Database['public']['Tables']['blood_pressure_readings']['Row']

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Track your blood pressure and monitor your health trends',
}

async function DashboardStats() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch recent readings (last 30 days)
  const { data: readings } = await supabase
    .from('blood_pressure_readings')
    .select('*')
    .eq('user_id', user.id)
    .order('measured_at', { ascending: false })
    .limit(30) as { data: BloodPressureReading[] | null; error: any }

  if (!readings || readings.length === 0) {
    return (
      <>
        <Card className="sm:col-span-2 lg:col-span-3">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Heart className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">No readings yet</h3>
            <p className="text-center text-muted-foreground">
              Start tracking your blood pressure by logging your first reading
            </p>
          </CardContent>
        </Card>
      </>
    )
  }

  // Calculate statistics
  const latest = readings[0]
  const avgSystolic = Math.round(
    readings.reduce((sum, r) => sum + r.systolic, 0) / readings.length
  )
  const avgDiastolic = Math.round(
    readings.reduce((sum, r) => sum + r.diastolic, 0) / readings.length
  )
  const avgPulse = Math.round(
    readings.reduce((sum, r) => sum + r.pulse, 0) / readings.length
  )

  const classification = classifyBloodPressure(latest.systolic, latest.diastolic)
  const classificationLabel = getBPClassificationLabel(classification)

  // Calculate trend (compare last 7 days vs previous 7 days)
  const last7Days = readings.slice(0, 7)
  const previous7Days = readings.slice(7, 14)
  
  let trend: 'up' | 'down' | 'stable' = 'stable'
  if (last7Days.length > 0 && previous7Days.length > 0) {
    const recentAvg =
      last7Days.reduce((sum, r) => sum + r.systolic, 0) / last7Days.length
    const previousAvg =
      previous7Days.reduce((sum, r) => sum + r.systolic, 0) / previous7Days.length
    
    if (recentAvg > previousAvg + 5) trend = 'up'
    else if (recentAvg < previousAvg - 5) trend = 'down'
  }

  // Determine variant based on classification
  const getVariant = (classification: string): 'success' | 'warning' | 'danger' | 'default' => {
    if (classification.includes('Normal')) return 'success'
    if (classification.includes('Elevated') || classification.includes('Stage 1')) return 'warning'
    if (classification.includes('Stage 2') || classification.includes('Crisis')) return 'danger'
    return 'default'
  }

  return (
    <>
      <EnhancedStatCard
        title="Latest Reading"
        value={`${latest.systolic}/${latest.diastolic}`}
        subtitle={classificationLabel}
        iconName="heart"
        trend={trend}
        variant={getVariant(classificationLabel)}
      />
      <EnhancedStatCard
        title="Average (30 days)"
        value={`${avgSystolic}/${avgDiastolic}`}
        subtitle={`Pulse: ${avgPulse} bpm`}
        iconName="activity"
        variant="info"
      />
      <EnhancedStatCard
        title="Total Readings"
        value={readings.length.toString()}
        subtitle="Last 30 days"
        iconName="trending-up"
        variant="default"
      />
    </>
  )
}

async function BPChart() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: readings } = await supabase
    .from('blood_pressure_readings')
    .select('*')
    .eq('user_id', user.id)
    .order('measured_at', { ascending: true })
    .limit(30) as { data: BloodPressureReading[] | null; error: any }

  return <BPTrendChart data={readings || []} />
}

async function BPTrendAnalysis() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: readings } = await supabase
    .from('blood_pressure_readings')
    .select('*')
    .eq('user_id', user.id)
    .order('measured_at', { ascending: true })
    .limit(30) as { data: BloodPressureReading[] | null; error: any }

  if (!readings || readings.length === 0) return null

  const { BPTrendInsights } = await import('@/components/charts/bp-trend-insights')
  return <BPTrendInsights data={readings} />
}

function StatsLoading() {
  return (
    <>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="relative overflow-hidden rounded-2xl border border-muted/50 bg-white/50 dark:bg-gray-900/50 p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-10 rounded-xl" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      ))}
    </>
  )
}

async function HeroSection() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch user's latest data for hero section
  const { data: readings } = await supabase
    .from('blood_pressure_readings')
    .select('*')
    .eq('user_id', user.id)
    .order('measured_at', { ascending: false })
    .limit(30) as { data: BloodPressureReading[] | null; error: any }

  // Calculate health score (simplified)
  let healthScore = 50
  if (readings && readings.length > 0) {
    const latest = readings[0]
    const classification = classifyBloodPressure(latest.systolic, latest.diastolic)
    
    // Score based on classification and consistency
    if (classification === 'normal') {
      healthScore = 85
    } else if (classification === 'elevated') {
      healthScore = 70
    } else if (classification === 'high_stage_1') {
      healthScore = 55
    } else if (classification === 'high_stage_2') {
      healthScore = 40
    } else if (classification === 'hypertensive_crisis') {
      healthScore = 30
    }

    // Bonus for consistency (having recent readings)
    if (readings.length >= 7) healthScore += 10
    if (readings.length >= 14) healthScore += 5
    
    healthScore = Math.min(100, healthScore)
  }

  // Calculate streak
  let streak = 0
  if (readings && readings.length > 0) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    for (let i = 0; i < readings.length; i++) {
      const readingDate = new Date(readings[i].measured_at)
      readingDate.setHours(0, 0, 0, 0)
      
      const daysDiff = Math.floor((today.getTime() - readingDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysDiff === i) {
        streak++
      } else {
        break
      }
    }
  }

  const latest = readings?.[0]
  const lastReading = latest
    ? {
        systolic: latest.systolic,
        diastolic: latest.diastolic,
        classification: getBPClassificationLabel(classifyBloodPressure(latest.systolic, latest.diastolic)),
      }
    : undefined

  // Get user's first name from email
  const userName = user.email?.split('@')[0] || undefined

  return (
    <HealthHeroSection
      userName={userName}
      healthScore={healthScore}
      streak={streak}
      lastReading={lastReading}
    />
  )
}

export default async function DashboardPage() {
  return (
    <div className="container mx-auto space-y-8 px-4 py-8 pb-24 md:pb-8">
      {/* Hero Section */}
      <Suspense fallback={<ShimmerSkeleton className="h-[300px] w-full rounded-3xl" />}>
        <HeroSection />
      </Suspense>

      {/* Smart Reminders */}
      <SmartRemindersServer />

      {/* Pending Medications */}
      <PendingDosesWidget />

      {/* Statistics Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Suspense fallback={<StatsLoading />}>
          <DashboardStats />
        </Suspense>
        <div className="sm:col-span-2 lg:col-span-1">
          <StreakWidget />
        </div>
      </div>

      {/* Analytics Preview */}
      <div>
        <Suspense fallback={<ShimmerSkeleton className="h-[200px] w-full rounded-2xl" />}>
          <AnalyticsPreview />
        </Suspense>
      </div>

      {/* Chart */}
      <Card className="overflow-hidden rounded-2xl border-muted/50 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 p-2.5 shadow-lg">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle>Blood Pressure Trends</CardTitle>
              <CardDescription>Your readings over the past 30 days</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="w-full overflow-visible" style={{ minHeight: '400px' }}>
            <Suspense fallback={<Skeleton className="h-[400px] w-full rounded-xl" />}>
              <BPChart />
            </Suspense>
          </div>
        </CardContent>
      </Card>

      {/* Trend Analysis & Insights */}
      <Suspense fallback={<Skeleton className="h-[300px] w-full rounded-2xl" />}>
        <BPTrendAnalysis />
      </Suspense>
    </div>
  )
}

