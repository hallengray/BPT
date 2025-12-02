import { z } from 'zod'

export const bpReadingSchema = z.object({
  systolic: z
    .number()
    .int()
    .min(70, 'Systolic must be at least 70')
    .max(250, 'Systolic must be at most 250'),
  diastolic: z
    .number()
    .int()
    .min(40, 'Diastolic must be at least 40')
    .max(150, 'Diastolic must be at most 150'),
  pulse: z
    .number()
    .int()
    .min(30, 'Pulse must be at least 30')
    .max(220, 'Pulse must be at most 220'),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
  measuredAt: z.string().datetime(),
})

export const bpReadingFormSchema = z
  .object({
    systolic: z.string().min(1, 'Systolic is required'),
    diastolic: z.string().min(1, 'Diastolic is required'),
    pulse: z.string().min(1, 'Pulse is required'),
    notes: z.string().max(500).optional(),
    measuredAt: z.string().min(1, 'Date and time are required'),
  })
  .refine(
    (data) => {
      const systolic = Number(data.systolic)
      const diastolic = Number(data.diastolic)
      const isHighBP = systolic >= 140 || diastolic >= 90
      const hasNotes = data.notes && data.notes.trim().length >= 10

      // If BP is high, notes are required
      return !isHighBP || hasNotes
    },
    {
      message:
        'High blood pressure detected (≥140/90). Please add notes (at least 10 characters) about possible causes: recent exercise, stress, medication timing, diet, etc.',
      path: ['notes'],
    }
  )

export type BPReadingInput = z.infer<typeof bpReadingSchema>
export type BPReadingFormInput = z.infer<typeof bpReadingFormSchema>

/**
 * Check if BP reading is elevated (warning level)
 */
export function isElevatedBP(systolic: number, diastolic: number): boolean {
  return systolic >= 130 || diastolic >= 85
}

/**
 * Check if BP reading is high (requires notes)
 */
export function isHighBP(systolic: number, diastolic: number): boolean {
  return systolic >= 140 || diastolic >= 90
}

/**
 * Get BP reading severity level
 */
export function getBPSeverity(
  systolic: number,
  diastolic: number
): 'normal' | 'elevated' | 'high' | 'very-high' {
  if (systolic >= 180 || diastolic >= 120) {
    return 'very-high'
  }
  if (systolic >= 140 || diastolic >= 90) {
    return 'high'
  }
  if (systolic >= 130 || diastolic >= 85) {
    return 'elevated'
  }
  return 'normal'
}

/**
 * Get helpful context suggestions for high BP
 */
export function getHighBPSuggestions(): string[] {
  return [
    'Did you just exercise or engage in physical activity?',
    'Are you feeling stressed or anxious?',
    'Have you taken your blood pressure medication today?',
    'Did you consume caffeine or alcohol recently?',
    'Have you eaten any high-sodium foods?',
    'Are you experiencing any pain or discomfort?',
    'Did you get enough sleep last night?',
  ]
}







