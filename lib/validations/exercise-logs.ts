import { z } from 'zod'

export const intensityLevels = ['low', 'moderate', 'high'] as const

export const exerciseLogSchema = z.object({
  activityType: z
    .string()
    .min(2, 'Activity type must be at least 2 characters')
    .max(100, 'Activity type must be less than 100 characters'),
  durationMinutes: z
    .number()
    .int()
    .min(1, 'Duration must be at least 1 minute')
    .max(600, 'Duration must be less than 600 minutes'),
  intensity: z.enum(intensityLevels).optional(),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
  loggedAt: z.string().datetime(),
})

export const exerciseLogFormSchema = z.object({
  activityType: z.string().min(2, 'Activity type is required'),
  durationMinutes: z.string().min(1, 'Duration is required'),
  intensity: z.string().optional(),
  notes: z.string().max(500).optional(),
  loggedAt: z.string().min(1, 'Date and time are required'),
})

export type ExerciseLogInput = z.infer<typeof exerciseLogSchema>
export type ExerciseLogFormInput = z.infer<typeof exerciseLogFormSchema>







