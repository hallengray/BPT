import { getTodaysPendingDoses } from '@/app/actions/medication-logs'
import { DoseQuickLog } from '@/components/medication/dose-quick-log'
import { Pill } from 'lucide-react'
import { TakeAllButton } from './take-all-button'

// Server Component to fetch and display today's doses
export async function MedicationDosesServer() {
  const result = await getTodaysPendingDoses()

  if (!result.success || !result.data || result.data.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center">
        <Pill className="mx-auto mb-2 h-8 w-8 text-muted-foreground opacity-50" />
        <p className="text-sm text-muted-foreground">
          No medications scheduled for today
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Add a medication below to get started
        </p>
      </div>
    )
  }

  const doses = result.data
  const pendingCount = doses.filter((d) => !d.was_taken).length

  return (
    <div className="space-y-4">
      {/* Batch "Take All" Button */}
      {pendingCount > 0 && (
        <TakeAllButton doses={doses.filter((d) => !d.was_taken)} />
      )}

      {/* Individual Dose Cards */}
      <DoseQuickLog doses={doses} />

      {/* Success Message */}
      {pendingCount === 0 && doses.length > 0 && (
        <div className="rounded-lg bg-green-500/10 p-4 text-center text-sm text-green-600 dark:text-green-400">
          ✅ All medications taken for today!
        </div>
      )}
    </div>
  )
}

