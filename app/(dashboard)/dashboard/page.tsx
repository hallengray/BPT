import { Suspense } from 'react'
import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { BPTrendChart } from '@/components/charts/bp-trend-chart'
import { StatCard } from '@/components/charts/stat-card'
import { AnalyticsPreview } from '@/components/charts/analytics-preview'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ShimmerSkeleton } from '@/components/ui/shimmer-skeleton'
import { Activity, Heart, TrendingUp } from 'lucide-react'
import { classifyBloodPressure, getBPClassificationLabel } from '@/types'
import type { Database } from '@/types/database.types'

type BloodPressureReading = Database['public']['Tables']['blood_pressure_readings']['Row']

export const metadata: Metadata = {
  title: 'Dashboard | BP Tracker',
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
      <div className="col-span-full">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Heart className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">No readings yet</h3>
            <p className="text-center text-muted-foreground">
              Start tracking your blood pressure by logging your first reading
            </p>
          </CardContent>
        </Card>
      </div>
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

  return (
    <>
      <StatCard
        title="Latest Reading"
        value={`${latest.systolic}/${latest.diastolic}`}
        subtitle={classificationLabel}
        icon={Heart}
        trend={trend}
      />
      <StatCard
        title="Average (30 days)"
        value={`${avgSystolic}/${avgDiastolic}`}
        subtitle={`Pulse: ${avgPulse} bpm`}
        icon={Activity}
      />
      <StatCard
        title="Total Readings"
        value={readings.length.toString()}
        subtitle="Last 30 days"
        icon={TrendingUp}
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

function StatsLoading() {
  return (
    <>
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-32" />
            <Skeleton className="mt-2 h-4 w-20" />
          </CardContent>
        </Card>
      ))}
    </>
  )
}

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Track your blood pressure and monitor your health trends
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <Suspense fallback={<StatsLoading />}>
          <DashboardStats />
        </Suspense>
      </div>

      {/* Analytics Preview */}
      <div className="mb-8">
        <Suspense fallback={<ShimmerSkeleton className="h-[200px] w-full rounded-lg" />}>
          <AnalyticsPreview />
        </Suspense>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Blood Pressure Trends</CardTitle>
          <CardDescription>Your readings over the past 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
            <BPChart />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}

