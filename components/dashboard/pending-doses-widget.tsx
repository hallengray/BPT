import { Suspense } from 'react'
import Link from 'next/link'
import { Pill, ArrowRight, CheckCircle2 } from 'lucide-react'
import { getTodaysPendingDoses } from '@/app/actions/medication-logs'
import { DoseQuickLog } from '@/components/medication/dose-quick-log'
import {
  GlassCard,
  GlassCardContent,
  GlassCardDescription,
  GlassCardHeader,
  GlassCardTitle,
} from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

async function PendingDosesContent() {
  const result = await getTodaysPendingDoses()

  if (!result.success || !result.data) {
    return null
  }

  const doses = result.data
  const pendingCount = doses.filter((d) => !d.was_taken).length
  const completedCount = doses.filter((d) => d.was_taken).length

  if (doses.length === 0) {
    return null // Don't show widget if no medications
  }

  return (
    <GlassCard>
      <GlassCardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 p-2.5 shadow-lg">
              <Pill className="h-5 w-5 text-white" />
            </div>
            <div>
              <GlassCardTitle>Today's Medications</GlassCardTitle>
              <GlassCardDescription>
                {completedCount} of {doses.length} taken
                {pendingCount > 0 && ` • ${pendingCount} pending`}
              </GlassCardDescription>
            </div>
          </div>
          <Link href="/medications">
            <Button variant="ghost" size="sm" className="gap-1" aria-label="View all medications">
              View All
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </Link>
        </div>
      </GlassCardHeader>
      <GlassCardContent>
        {pendingCount === 0 ? (
          <div 
            className="flex items-center justify-center rounded-lg border border-green-200 bg-green-50 p-6 dark:border-green-800 dark:bg-green-950"
            role="status"
            aria-live="polite"
          >
            <div className="text-center">
              <CheckCircle2 className="mx-auto mb-2 h-10 w-10 text-green-600 dark:text-green-400" aria-hidden="true" />
              <p className="font-medium text-green-900 dark:text-green-100">
                All medications taken!
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">
                Great job staying on track today
              </p>
            </div>
          </div>
        ) : (
          <DoseQuickLog doses={doses} />
        )}
      </GlassCardContent>
    </GlassCard>
  )
}

function PendingDosesLoading() {
  return (
    <GlassCard>
      <GlassCardHeader>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </GlassCardHeader>
      <GlassCardContent>
        <div className="space-y-3" role="status" aria-label="Loading medications">
          <span className="sr-only">Loading today's medications...</span>
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
      </GlassCardContent>
    </GlassCard>
  )
}

export function PendingDosesWidget() {
  return (
    <Suspense fallback={<PendingDosesLoading />}>
      <PendingDosesContent />
    </Suspense>
  )
}

