'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Check, Loader2 } from 'lucide-react'
import { recordDose } from '@/app/actions/medication-logs'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface TakeAllButtonProps {
  doses: Array<{
    id: string
    medication_log_id: string
    medication_name: string
    scheduled_time: string
  }>
  onSuccess?: () => void
}

export function TakeAllButton({ doses, onSuccess }: TakeAllButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleTakeAll = async () => {
    setIsLoading(true)
    
    try {
      // Record all doses in parallel
      const results = await Promise.all(
        doses.map(async (dose) => {
          const formData = new FormData()
          formData.append('medicationLogId', dose.medication_log_id)
          formData.append('wasTaken', 'true')
          formData.append('takenAt', new Date().toISOString())
          
          return recordDose(null, formData)
        })
      )

      // Check if all succeeded
      const allSucceeded = results.every((r) => r.success)
      
      if (allSucceeded) {
        toast.success(`All ${doses.length} medications recorded!`)
        if (onSuccess) onSuccess()
        router.refresh()
      } else {
        const failedCount = results.filter((r) => !r.success).length
        toast.error(`Failed to record ${failedCount} medication(s)`)
      }
    } catch (error) {
      console.error('Error recording doses:', error)
      toast.error('Failed to record medications')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      className="w-full"
      size="lg"
      onClick={handleTakeAll}
      disabled={isLoading}
      aria-label={`Take all ${doses.length} pending medications`}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Recording...
        </>
      ) : (
        <>
          <Check className="mr-2 h-5 w-5" />
          Take All Medications ({doses.length})
        </>
      )}
    </Button>
  )
}
