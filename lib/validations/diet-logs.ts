import { z } from 'zod'

export const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack', 'other'] as const

export const dietLogSchema = z.object({
  mealType: z.enum(mealTypes, {
    message: 'Please select a meal type',
  }),
  description: z
    .string()
    .min(3, 'Description must be at least 3 characters')
    .max(500, 'Description must be less than 500 characters'),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
  loggedAt: z.string().datetime(),
})

export const dietLogFormSchema = z.object({
  mealType: z.string().min(1, 'Meal type is required'),
  description: z.string().min(3, 'Description must be at least 3 characters'),
  notes: z.string().max(500).optional(),
  loggedAt: z.string().min(1, 'Date and time are required'),
  sodiumLevel: z.enum(['low', 'medium', 'high', 'unknown']).optional(),
  sodiumMg: z
    .string()
    .optional()
    .refine(
      (val) => !val || (!isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 10000),
      {
        message: 'Sodium must be between 0 and 10000 mg',
      }
    ),
})

export type DietLogInput = z.infer<typeof dietLogSchema>
export type DietLogFormInput = z.infer<typeof dietLogFormSchema>







