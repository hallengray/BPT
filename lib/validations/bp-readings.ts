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

export const bpReadingFormSchema = z.object({
  systolic: z.string().min(1, 'Systolic is required'),
  diastolic: z.string().min(1, 'Diastolic is required'),
  pulse: z.string().min(1, 'Pulse is required'),
  notes: z.string().max(500).optional(),
  measuredAt: z.string().min(1, 'Date and time are required'),
})

export type BPReadingInput = z.infer<typeof bpReadingSchema>
export type BPReadingFormInput = z.infer<typeof bpReadingFormSchema>

