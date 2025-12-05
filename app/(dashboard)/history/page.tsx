import { Suspense } from 'react'
import { History, Download, Filter } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import {
  GlassCard,
  GlassCardContent,
} from '@/components/ui/glass-card'
import { ShimmerSkeleton } from '@/components/ui/shimmer-skeleton'
import { HistoryContent } from './history-content'
import type { Database } from '@/types/database.types'

export const metadata = {
  title: 'BP History',
  description: 'View and analyze your complete blood pressure history with advanced filtering and export options',
}

type BloodPressureReading = Database['public']['Tables']['blood_pressure_readings']['Row']

async function HistoryData() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <GlassCard>
        <GlassCardContent className="flex min-h-[400px] items-center justify-center">
          <p className="text-muted-foreground">Please sign in to view your history</p>
        </GlassCardContent>
      </GlassCard>
    )
  }

  // Fetch all readings for the user (paginated server-side)
  const { data: readings, error, count } = await supabase
    .from('blood_pressure_readings')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('measured_at', { ascending: false })
    .limit(100) as { data: BloodPressureReading[] | null; error: any; count: number | null }

  if (error) {
    return (
      <GlassCard>
        <GlassCardContent className="flex min-h-[400px] items-center justify-center">
          <p className="text-red-500">Error loading history: {error.message}</p>
        </GlassCardContent>
      </GlassCard>
    )
  }

  // Get date range for the data
  const { data: dateRange } = await supabase
    .from('blood_pressure_readings')
    .select('measured_at')
    .eq('user_id', user.id)
    .order('measured_at', { ascending: true })
    .limit(1)
    .single() as { data: { measured_at: string } | null; error: any }

  const firstReadingDate = dateRange?.measured_at || null

  return (
    <HistoryContent
      initialReadings={readings || []}
      totalCount={count || 0}
      firstReadingDate={firstReadingDate}
    />
  )
}

export default function HistoryPage() {
  return (
    <div className="container mx-auto space-y-6 px-4 py-8 pb-24 md:pb-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 p-3 shadow-lg">
            <History className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Blood Pressure History</h1>
            <p className="text-muted-foreground">
              Complete record of all your blood pressure readings with filtering and export
            </p>
          </div>
        </div>
      </div>

      {/* Features Info */}
      <div className="grid gap-4 md:grid-cols-3">
        <GlassCard className="hover-lift" hover>
          <GlassCardContent className="flex items-center gap-3 p-4">
            <div className="rounded-lg bg-blue-500/20 p-2">
              <Filter className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="font-semibold">Advanced Filtering</p>
              <p className="text-xs text-muted-foreground">Filter by date, classification, or range</p>
            </div>
          </GlassCardContent>
        </GlassCard>
        <GlassCard className="hover-lift" hover>
          <GlassCardContent className="flex items-center gap-3 p-4">
            <div className="rounded-lg bg-green-500/20 p-2">
              <Download className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="font-semibold">Export Data</p>
              <p className="text-xs text-muted-foreground">Download as CSV for your records</p>
            </div>
          </GlassCardContent>
        </GlassCard>
        <GlassCard className="hover-lift" hover>
          <GlassCardContent className="flex items-center gap-3 p-4">
            <div className="rounded-lg bg-purple-500/20 p-2">
              <History className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="font-semibold">All-Time Access</p>
              <p className="text-xs text-muted-foreground">View your complete health journey</p>
            </div>
          </GlassCardContent>
        </GlassCard>
      </div>

      {/* History Content */}
      <Suspense fallback={<HistoryLoadingSkeleton />}>
        <HistoryData />
      </Suspense>
    </div>
  )
}

function HistoryLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Filters Skeleton */}
      <GlassCard>
        <GlassCardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <ShimmerSkeleton className="h-10 w-48" />
            <ShimmerSkeleton className="h-10 w-32" />
            <ShimmerSkeleton className="h-10 w-32" />
          </div>
        </GlassCardContent>
      </GlassCard>

      {/* Table Skeleton */}
      <GlassCard>
        <GlassCardContent className="space-y-4 p-6">
          <ShimmerSkeleton className="h-6 w-48" />
          <ShimmerSkeleton className="h-4 w-64" />
          <div className="space-y-2">
            {[...Array(10)].map((_, i) => (
              <ShimmerSkeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </GlassCardContent>
      </GlassCard>
    </div>
  )
}

