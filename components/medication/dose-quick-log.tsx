'use client'

import { useOptimistic, useTransition, useCallback, memo } from 'react'
import { format } from 'date-fns'
import { Check, X, Clock, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  GlassCard,
  GlassCardContent,
  GlassCardDescription,
  GlassCardHeader,
  GlassCardTitle,
} from '@/components/ui/glass-card'
import { cn } from '@/lib/utils'
import { recordDose, deleteMedicationDose } from '@/app/actions/medication-logs'
import { toast } from 'sonner'
import { DeleteConfirmationDialog } from '@/components/ui/delete-confirmation-dialog'
import { useRouter } from 'next/navigation'

interface DoseWithMedication {
  id: string
  medication_log_id: string
  scheduled_time: string
  was_taken: boolean | null
  taken_at: string | null
  medication_name: string
  dosage: string
}

interface DoseQuickLogProps {
  doses: DoseWithMedication[]
  className?: string
}

type OptimisticDose = DoseWithMedication & { optimisticStatus?: 'taking' | 'skipping' }

export function DoseQuickLog({ doses, className }: DoseQuickLogProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [optimisticDoses, setOptimisticDoses] = useOptimistic<OptimisticDose[], {
    id: string
    action: 'take' | 'skip'
  }>(doses, (state, { id, action }) => {
    return state.map((dose) =>
      dose.id === id
        ? {
            ...dose,
            optimisticStatus: action === 'take' ? 'taking' : 'skipping',
            was_taken: action === 'take',
          }
        : dose
    )
  })

  const handleDoseAction = useCallback((dose: DoseWithMedication, wasTaken: boolean) => {
    startTransition(async () => {
      // Update optimistic state inside transition for instant UI feedback
      setOptimisticDoses({ id: dose.id, action: wasTaken ? 'take' : 'skip' })

      const formData = new FormData()
      formData.append('doseId', dose.id)
      formData.append('wasTaken', wasTaken.toString())
      formData.append('takenAt', new Date().toISOString())

      const result = await recordDose(null, formData)

      if (result.success) {
        toast.success(wasTaken ? 'Dose marked as taken' : 'Dose skipped')
      } else {
        toast.error(result.error || 'Failed to record dose')
      }
    })
  }, [setOptimisticDoses])

  const handleDeleteDose = useCallback(async (id: string): Promise<void> => {
    const result = await deleteMedicationDose(id)
    if (result.success) {
      toast.success('Dose record deleted')
      router.refresh()
    } else {
      toast.error(result.error || 'Failed to delete dose')
    }
  }, [router])

  const now = new Date()
  const pendingDoses = optimisticDoses.filter((d) => !d.was_taken && !d.optimisticStatus)
  const overdueDoses = pendingDoses.filter(
    (d) => new Date(d.scheduled_time) < now
  )
  const upcomingDoses = pendingDoses.filter(
    (d) => new Date(d.scheduled_time) >= now
  )
  const completedDoses = optimisticDoses.filter((d) => d.was_taken || d.optimisticStatus === 'taking')

  if (doses.length === 0) {
    return (
      <GlassCard className={className}>
        <GlassCardContent className="flex min-h-[150px] items-center justify-center p-6">
          <div className="text-center text-muted-foreground" role="status">
            <Clock className="mx-auto mb-2 h-8 w-8 opacity-50" aria-hidden="true" />
            <p className="text-sm">No medications scheduled for today</p>
          </div>
        </GlassCardContent>
      </GlassCard>
    )
  }

  return (
    <GlassCard className={className}>
      <GlassCardHeader>
        <div className="flex items-center justify-between">
          <div>
            <GlassCardTitle>Today&apos;s Medications</GlassCardTitle>
            <GlassCardDescription>
              {completedDoses.length} of {doses.length} doses taken
            </GlassCardDescription>
          </div>
          {overdueDoses.length > 0 && (
            <Badge variant="destructive" className="gap-1" role="status" aria-live="polite">
              <AlertCircle className="h-3 w-3" aria-hidden="true" />
              {overdueDoses.length} overdue
            </Badge>
          )}
        </div>
      </GlassCardHeader>
      <GlassCardContent className="space-y-3">
        {/* Overdue Doses */}
        {overdueDoses.map((dose) => (
          <DoseItem
            key={dose.id}
            dose={dose}
            status="overdue"
            onTake={() => handleDoseAction(dose, true)}
            onSkip={() => handleDoseAction(dose, false)}
            isPending={isPending}
          />
        ))}

        {/* Upcoming Doses */}
        {upcomingDoses.map((dose) => (
          <DoseItem
            key={dose.id}
            dose={dose}
            status="upcoming"
            onTake={() => handleDoseAction(dose, true)}
            onSkip={() => handleDoseAction(dose, false)}
            isPending={isPending}
          />
        ))}

        {/* Completed Doses */}
        {completedDoses.map((dose) => (
          <DoseItem
            key={dose.id}
            dose={dose}
            status="completed"
            isPending={isPending}
            onDelete={async () => await handleDeleteDose(dose.id)}
          />
        ))}

        {pendingDoses.length === 0 && completedDoses.length > 0 && (
          <div 
            className="rounded-lg border border-green-200 bg-green-50 p-4 text-center dark:border-green-800 dark:bg-green-950"
            role="status"
            aria-live="polite"
          >
            <Check className="mx-auto mb-2 h-8 w-8 text-green-600 dark:text-green-400" aria-hidden="true" />
            <p className="text-sm font-medium text-green-900 dark:text-green-100">
              All medications taken for today!
            </p>
            <p className="text-xs text-green-700 dark:text-green-300">
              Great job staying on track
            </p>
          </div>
        )}
      </GlassCardContent>
    </GlassCard>
  )
}

interface DoseItemProps {
  dose: OptimisticDose
  status: 'overdue' | 'upcoming' | 'completed'
  onTake?: () => void
  onSkip?: () => void
  onDelete?: () => Promise<void>
  isPending?: boolean
}

const DoseItem = memo(function DoseItem({ dose, status, onTake, onSkip, onDelete, isPending }: DoseItemProps) {
  const scheduledTime = new Date(dose.scheduled_time)
  const isOptimistic = !!dose.optimisticStatus

  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-lg border p-3 transition-all',
        status === 'overdue' && 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950',
        status === 'upcoming' && 'border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950',
        status === 'completed' && 'border-green-200 bg-green-50 opacity-60 dark:border-green-900 dark:bg-green-950',
        isOptimistic && 'opacity-50'
      )}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="font-medium text-sm">{dose.medication_name}</p>
          {status === 'overdue' && (
            <Badge variant="destructive" className="h-5 text-xs" role="status">
              Overdue
            </Badge>
          )}
          {status === 'completed' && (
            <Badge variant="default" className="h-5 bg-green-600 text-xs" role="status">
              Taken
            </Badge>
          )}
        </div>
        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
          <span>{dose.dosage}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" aria-hidden="true" />
            {format(scheduledTime, 'h:mm a')}
          </span>
        </div>
      </div>

      {status !== 'completed' ? (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="default"
            onClick={onTake}
            disabled={isPending || isOptimistic}
            className="h-8 gap-1 bg-green-600 hover:bg-green-700"
            aria-label={`Mark ${dose.medication_name} as taken`}
          >
            <Check className="h-4 w-4" aria-hidden="true" />
            Take
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onSkip}
            disabled={isPending || isOptimistic}
            className="h-8 gap-1"
            aria-label={`Skip ${dose.medication_name}`}
          >
            <X className="h-4 w-4" aria-hidden="true" />
            Skip
          </Button>
        </div>
      ) : onDelete ? (
        <DeleteConfirmationDialog
          itemType="Dose Record"
          itemDescription={`Delete dose record for ${dose.medication_name} (${dose.dosage}) taken at ${format(scheduledTime, 'h:mm a')}?`}
          onConfirm={onDelete}
        />
      ) : null}
    </div>
  )
}, (prevProps, nextProps) => {
  // Custom comparison: only re-render if dose status or pending state changes
  return (
    prevProps.dose.id === nextProps.dose.id &&
    prevProps.dose.was_taken === nextProps.dose.was_taken &&
    prevProps.dose.optimisticStatus === nextProps.dose.optimisticStatus &&
    prevProps.isPending === nextProps.isPending &&
    prevProps.status === nextProps.status
  )
})
