'use client'

import { useState, useEffect } from 'react'
import { getTodaysPendingDoses } from '@/app/actions/medication-logs'
import { DoseQuickLog } from '@/components/medication/dose-quick-log'
import { TakeAllButton } from './take-all-button'
import { Pill, Loader2 } from 'lucide-react'

interface MedicationDosesClientProps {
  onSuccess: () => void
}

type DoseWithMedication = {
  id: string
  medication_log_id: string
  medication_name: string
  dosage: string
  scheduled_time: string
  was_taken: boolean | null
  taken_at: string | null
  notes: string | null
  user_id: string
  created_at: string | null
}

export function MedicationDosesClient({ onSuccess }: MedicationDosesClientProps) {
  const [doses, setDoses] = useState<DoseWithMedication[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDoses() {
      try {
        setIsLoading(true)
        setError(null)
        const result = await getTodaysPendingDoses()
        
        if (result.success && result.data) {
          setDoses(result.data)
        } else {
          setError(result.error || 'Failed to load doses')
        }
      } catch (err) {
        console.error('Error fetching doses:', err)
        setError('Failed to load medication doses')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDoses()
  }, [])

  // Refresh doses after successful action
  const handleSuccess = async () => {
    const result = await getTodaysPendingDoses()
    if (result.success && result.data) {
      setDoses(result.data)
    }
    onSuccess()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Loading doses...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center dark:border-red-800 dark:bg-red-950">
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      </div>
    )
  }

  if (doses.length === 0) {
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

  const pendingCount = doses.filter((d) => !d.was_taken).length

  return (
    <div className="space-y-4">
      {/* Batch "Take All" Button */}
      {pendingCount > 0 && (
        <TakeAllButton 
          doses={doses.filter((d) => !d.was_taken)} 
          onSuccess={handleSuccess}
        />
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

