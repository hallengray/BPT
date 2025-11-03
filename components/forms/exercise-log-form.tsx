'use client'

import { useActionState, useEffect, useRef } from 'react'
import { useFormStatus } from 'react-dom'
import { createExerciseLog } from '@/app/actions/exercise-logs'
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
import { intensityLevels } from '@/lib/validations/exercise-logs'

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Saving...' : 'Save Exercise Log'}
    </Button>
  )
}

export function ExerciseLogForm() {
  const formRef = useRef<HTMLFormElement>(null)
  const [state, formAction] = useActionState(createExerciseLog, {
    success: false,
  })

  useEffect(() => {
    if (state?.success) {
      toast.success('Exercise log saved successfully!')
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
            Exercise log saved successfully!
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
          aria-label="Date and time of exercise"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="activityType">Activity</Label>
        <Input
          id="activityType"
          name="activityType"
          type="text"
          placeholder="e.g., Running, Walking, Cycling"
          required
          maxLength={100}
          aria-label="Activity type"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="durationMinutes">Duration (minutes)</Label>
          <Input
            id="durationMinutes"
            name="durationMinutes"
            type="number"
            placeholder="30"
            min="1"
            max="600"
            required
            aria-label="Duration in minutes"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="intensity">Intensity (Optional)</Label>
          <Select name="intensity">
            <SelectTrigger id="intensity" aria-label="Select intensity level">
              <SelectValue placeholder="Select intensity" />
            </SelectTrigger>
            <SelectContent>
              {intensityLevels.map((level) => (
                <SelectItem key={level} value={level}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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

      <div className="rounded-lg border border-purple-200 bg-purple-50 p-3 dark:border-purple-800 dark:bg-purple-950">
        <h4 className="mb-1 text-sm font-semibold text-purple-900 dark:text-purple-100">
          Exercise Benefits
        </h4>
        <ul className="space-y-1 text-xs text-purple-800 dark:text-purple-200">
          <li>• Aim for 150 minutes of moderate activity per week</li>
          <li>• Regular exercise can lower BP by 5-8 mmHg</li>
          <li>• Consistency is more important than intensity</li>
        </ul>
      </div>

      <SubmitButton />
    </form>
  )
}


