'use client'

import { useActionState, useEffect, useRef } from 'react'
import { useFormStatus } from 'react-dom'
import { createDietLog } from '@/app/actions/diet-logs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { mealTypes } from '@/lib/validations/diet-logs'

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Saving...' : 'Save Diet Log'}
    </Button>
  )
}

export function DietLogForm() {
  const formRef = useRef<HTMLFormElement>(null)
  const [state, formAction] = useActionState(createDietLog, { success: false })

  useEffect(() => {
    if (state?.success) {
      toast.success('Diet log saved successfully!')
      formRef.current?.reset()
    }
  }, [state?.success])

  const now = new Date()
  const defaultDateTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
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
            Diet log saved successfully!
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="loggedAt">Date & Time</Label>
        <Input
          id="loggedAt"
          name="loggedAt"
          type="datetime-local"
          defaultValue={defaultDateTime}
          required
          aria-label="Date and time of meal"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="mealType">Meal Type</Label>
        <Select name="mealType" required>
          <SelectTrigger id="mealType" aria-label="Select meal type">
            <SelectValue placeholder="Select meal type" />
          </SelectTrigger>
          <SelectContent>
            {mealTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="e.g., Grilled chicken salad with olive oil"
          rows={3}
          required
          maxLength={500}
          aria-label="Meal description"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Any additional notes..."
          rows={2}
          maxLength={500}
          aria-label="Additional notes"
        />
      </div>

      <div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950">
        <h4 className="mb-1 text-sm font-semibold text-green-900 dark:text-green-100">
          Diet Tips for Blood Pressure
        </h4>
        <ul className="space-y-1 text-xs text-green-800 dark:text-green-200">
          <li>• Reduce sodium intake (less than 2,300 mg/day)</li>
          <li>• Eat more fruits and vegetables</li>
          <li>• Choose whole grains over refined grains</li>
        </ul>
      </div>

      <SubmitButton />
    </form>
  )
}



