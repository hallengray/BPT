'use client'

import { useActionState, useState, useEffect } from 'react'
import { useFormStatus } from 'react-dom'
import { createMedication } from '@/app/actions/medication-logs'
import { GradientButton } from '@/components/ui/gradient-button'
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
import { AlertCircle, CheckCircle2, Plus, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <GradientButton
      type="submit"
      variant="primary"
      size="lg"
      className="w-full"
      disabled={pending}
    >
      {pending ? 'Adding Medication...' : 'Add Medication'}
    </GradientButton>
  )
}

interface MedicationFormProps {
  onSuccess?: () => void
}

export function MedicationForm({ onSuccess }: MedicationFormProps) {
  const [state, formAction] = useActionState(createMedication, { success: false })
  const [frequency, setFrequency] = useState<string>('once_daily')
  const [timeSlots, setTimeSlots] = useState<string[]>(['08:00'])

  // Show success toast and reset form
  useEffect(() => {
    if (state?.success) {
      toast.success('Medication added successfully!')
      // Reset time slots
      setTimeSlots(['08:00'])
      setFrequency('once_daily')
      onSuccess?.()
    }
  }, [state?.success, onSuccess])

  const addTimeSlot = () => {
    if (timeSlots.length < 4) {
      setTimeSlots([...timeSlots, '12:00'])
    }
  }

  const removeTimeSlot = (index: number) => {
    if (timeSlots.length > 1) {
      setTimeSlots(timeSlots.filter((_, i) => i !== index))
    }
  }

  const updateTimeSlot = (index: number, value: string) => {
    const newSlots = [...timeSlots]
    newSlots[index] = value
    setTimeSlots(newSlots)
  }

  // Get current date for default start date
  const now = new Date()
  const defaultDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  return (
    <form action={formAction} className="space-y-6">
      {/* Hidden input for time slots */}
      <input type="hidden" name="timeOfDay" value={JSON.stringify(timeSlots)} />

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
            Medication added successfully!
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="medicationName">Medication Name</Label>
        <Input
          id="medicationName"
          name="medicationName"
          type="text"
          placeholder="e.g., Lisinopril"
          required
          aria-required="true"
          maxLength={200}
          aria-describedby="medication-help"
        />
        <p id="medication-help" className="text-xs text-muted-foreground">
          Enter the name of your medication
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dosage">Dosage</Label>
        <Input
          id="dosage"
          name="dosage"
          type="text"
          placeholder="e.g., 10 mg"
          required
          aria-required="true"
          maxLength={100}
          aria-describedby="dosage-help"
        />
        <p id="dosage-help" className="text-xs text-muted-foreground">
          Include strength and unit (e.g., 10 mg, 5 ml)
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="frequency">Frequency</Label>
        <Select
          name="frequency"
          value={frequency}
          onValueChange={setFrequency}
          required
        >
          <SelectTrigger id="frequency" aria-required="true">
            <SelectValue placeholder="Select frequency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="once_daily">Once Daily</SelectItem>
            <SelectItem value="twice_daily">Twice Daily</SelectItem>
            <SelectItem value="three_times_daily">Three Times Daily</SelectItem>
            <SelectItem value="as_needed">As Needed</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Time of Day</Label>
          {timeSlots.length < 4 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addTimeSlot}
              className="h-8"
            >
              <Plus className="mr-1 h-4 w-4" />
              Add Time
            </Button>
          )}
        </div>
        <div className="space-y-2">
          {timeSlots.map((time, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                type="time"
                value={time}
                onChange={(e) => updateTimeSlot(index, e.target.value)}
                required
                aria-required="true"
                aria-label={`Time slot ${index + 1}`}
                className="flex-1"
              />
              {timeSlots.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeTimeSlot(index)}
                  aria-label={`Remove time slot ${index + 1}`}
                  className="h-10 w-10"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Set when you need to take this medication (up to 4 times per day)
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            name="startDate"
            type="datetime-local"
            defaultValue={defaultDate}
            required
            aria-required="true"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">End Date (Optional)</Label>
          <Input
            id="endDate"
            name="endDate"
            type="datetime-local"
            aria-describedby="end-date-help"
          />
          <p id="end-date-help" className="text-xs text-muted-foreground">
            Leave empty for ongoing medication
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Any special instructions or notes..."
          rows={3}
          maxLength={500}
          aria-describedby="notes-help"
        />
        <p id="notes-help" className="text-xs text-muted-foreground">
          Maximum 500 characters
        </p>
      </div>

      <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-950">
        <h3 className="mb-2 font-semibold text-purple-900 dark:text-purple-100">
          Medication Reminder
        </h3>
        <ul className="space-y-1 text-sm text-purple-800 dark:text-purple-200">
          <li>• Take medications at the same time each day</li>
          <li>• Never skip doses without consulting your doctor</li>
          <li>• Store medications as directed on the label</li>
          <li>• Track your adherence for better health outcomes</li>
        </ul>
      </div>

      <SubmitButton />
    </form>
  )
}


