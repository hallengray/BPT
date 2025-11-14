'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { createBPReading } from '@/app/actions/bp-readings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { useEffect } from 'react'

function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <Button type="submit" className="w-full" size="lg" disabled={pending}>
      {pending ? 'Saving...' : 'Save Reading'}
    </Button>
  )
}

interface BPReadingFormProps {
  onSuccess?: () => void
}

export function BPReadingForm({ onSuccess }: BPReadingFormProps = {}) {
  const [state, formAction] = useActionState(createBPReading, { success: false })

  // Show success toast
  useEffect(() => {
    if (state?.success) {
      toast.success('Blood pressure reading saved successfully!')
      onSuccess?.()
    }
  }, [state?.success, onSuccess])

  // Get current date/time for default value
  const now = new Date()
  const defaultDateTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {state?.success && (
        <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-600">
            Reading saved successfully!
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="measuredAt">Date & Time</Label>
        <Input
          id="measuredAt"
          name="measuredAt"
          type="datetime-local"
          defaultValue={defaultDateTime}
          required
          aria-required="true"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="systolic">Systolic (mmHg)</Label>
          <Input
            id="systolic"
            name="systolic"
            type="number"
            placeholder="120"
            min="70"
            max="250"
            required
            aria-required="true"
            aria-describedby="systolic-help"
          />
          <p id="systolic-help" className="text-xs text-muted-foreground">Top number</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="diastolic">Diastolic (mmHg)</Label>
          <Input
            id="diastolic"
            name="diastolic"
            type="number"
            placeholder="80"
            min="40"
            max="150"
            required
            aria-required="true"
            aria-describedby="diastolic-help"
          />
          <p id="diastolic-help" className="text-xs text-muted-foreground">Bottom number</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="pulse">Pulse (bpm)</Label>
          <Input
            id="pulse"
            name="pulse"
            type="number"
            placeholder="70"
            min="30"
            max="220"
            required
            aria-required="true"
            aria-describedby="pulse-help"
          />
          <p id="pulse-help" className="text-xs text-muted-foreground">Heart rate</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Any additional notes about this reading..."
          rows={3}
          maxLength={500}
          aria-describedby="notes-help"
        />
        <p id="notes-help" className="text-xs text-muted-foreground">Maximum 500 characters</p>
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
        <h3 className="mb-2 font-semibold text-blue-900 dark:text-blue-100">
          Blood Pressure Guidelines
        </h3>
        <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
          <li>• Normal: Less than 120/80 mmHg</li>
          <li>• Elevated: 120-129/less than 80 mmHg</li>
          <li>• High (Stage 1): 130-139/80-89 mmHg</li>
          <li>• High (Stage 2): 140+/90+ mmHg</li>
        </ul>
      </div>

      <SubmitButton />
    </form>
  )
}

