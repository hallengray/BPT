'use client'

import { useState, useTransition } from 'react'
import { format } from 'date-fns'
import {
  GlassCard,
  GlassCardContent,
  GlassCardFooter,
  GlassCardHeader,
  GlassCardTitle,
} from '@/components/ui/glass-card'
import { GradientButton } from '@/components/ui/gradient-button'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Pill, Clock, CheckCircle, Edit, StopCircle, MoreVertical } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { recordDose, deactivateMedication } from '@/app/actions/medication-logs'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { Database } from '@/types/database.types'

type MedicationLog = Database['public']['Tables']['medication_logs']['Row']

interface MedicationCardProps {
  medication: MedicationLog
  adherenceRate?: number
  nextDoseTime?: string
  onEdit?: (medication: MedicationLog) => void
}

const frequencyLabels: Record<string, string> = {
  once_daily: 'Once Daily',
  twice_daily: 'Twice Daily',
  three_times_daily: 'Three Times Daily',
  as_needed: 'As Needed',
  weekly: 'Weekly',
  other: 'Other',
}

export function MedicationCard({
  medication,
  adherenceRate = 0,
  nextDoseTime,
  onEdit,
}: MedicationCardProps) {
  const [isPending, startTransition] = useTransition()
  const [isRecording, setIsRecording] = useState(false)

  const handleMarkAsTaken = () => {
    setIsRecording(true)
    startTransition(async () => {
      const formData = new FormData()
      formData.append('medicationLogId', medication.id)
      formData.append('wasTaken', 'true')
      formData.append('takenAt', new Date().toISOString())

      const result = await recordDose(null, formData)

      if (result.success) {
        toast.success('Dose recorded successfully!')
      } else {
        toast.error(result.error || 'Failed to record dose')
      }
      setIsRecording(false)
    })
  }

  const handleDeactivate = () => {
    startTransition(async () => {
      const result = await deactivateMedication(medication.id)

      if (result.success) {
        toast.success('Medication stopped successfully')
      } else {
        toast.error(result.error || 'Failed to stop medication')
      }
    })
  }

  // Determine adherence color
  const getAdherenceColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600 dark:text-green-400'
    if (rate >= 60) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getAdherenceBadgeVariant = (rate: number) => {
    if (rate >= 80) return 'default'
    if (rate >= 60) return 'secondary'
    return 'destructive'
  }

  return (
    <GlassCard hover className="relative">
      <GlassCardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-purple-100 p-2 dark:bg-purple-900">
              <Pill className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <GlassCardTitle className="text-xl">
                {medication.medication_name}
              </GlassCardTitle>
              <p className="mt-1 text-sm text-muted-foreground">{medication.dosage}</p>
              <Badge variant="outline" className="mt-2">
                {frequencyLabels[medication.frequency] || medication.frequency}
              </Badge>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                aria-label="Medication options"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(medication)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={handleDeactivate}
                disabled={isPending}
                className="text-red-600"
              >
                <StopCircle className="mr-2 h-4 w-4" />
                Stop Medication
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </GlassCardHeader>

      <GlassCardContent className="space-y-4">
        {/* Time Schedule */}
        {medication.time_of_day && medication.time_of_day.length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Times:</span>
            <div className="flex flex-wrap gap-1">
              {medication.time_of_day.map((time, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {time}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Next Dose */}
        {nextDoseTime && (
          <div className="rounded-md bg-blue-50 p-3 dark:bg-blue-950">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Next dose: {nextDoseTime}
            </p>
          </div>
        )}

        {/* Adherence Rate */}
        <div className="flex items-center justify-between rounded-md border p-3">
          <div className="flex items-center gap-2">
            <CheckCircle className={cn('h-5 w-5', getAdherenceColor(adherenceRate))} />
            <span className="text-sm font-medium">Adherence Rate</span>
          </div>
          <Badge variant={getAdherenceBadgeVariant(adherenceRate)} className="text-sm">
            {adherenceRate}%
          </Badge>
        </div>

        {/* Notes */}
        {medication.notes && (
          <div className="rounded-md bg-muted/50 p-3">
            <p className="text-sm text-muted-foreground">{medication.notes}</p>
          </div>
        )}

        {/* Start Date */}
        <div className="text-xs text-muted-foreground">
          Started: {format(new Date(medication.start_date), 'MMM d, yyyy')}
          {medication.end_date && (
            <> • Ends: {format(new Date(medication.end_date), 'MMM d, yyyy')}</>
          )}
        </div>
      </GlassCardContent>

      <GlassCardFooter>
        <GradientButton
          variant="success"
          size="sm"
          className="w-full"
          onClick={handleMarkAsTaken}
          disabled={isRecording || isPending}
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          {isRecording ? 'Recording...' : 'Mark as Taken'}
        </GradientButton>
      </GlassCardFooter>
    </GlassCard>
  )
}







