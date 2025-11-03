import { z } from 'zod'

export const medicationFormSchema = z.object({
  medicationName: z
    .string()
    .min(1, 'Medication name is required')
    .max(200, 'Medication name must be less than 200 characters'),
  dosage: z
    .string()
    .min(1, 'Dosage is required')
    .max(100, 'Dosage must be less than 100 characters')
    .regex(/^[\d\s\w.,-]+$/, 'Invalid dosage format'),
  frequency: z.enum(
    ['once_daily', 'twice_daily', 'three_times_daily', 'as_needed', 'weekly', 'other'],
    { errorMap: () => ({ message: 'Please select a valid frequency' }) }
  ),
  timeOfDay: z
    .array(z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format'))
    .min(1, 'At least one time is required')
    .max(4, 'Maximum 4 times per day'),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
})

export const doseTrackingSchema = z.object({
  medicationLogId: z.string().uuid(),
  wasTaken: z.boolean(),
  takenAt: z.string().datetime().optional(),
  notes: z.string().max(200, 'Notes must be less than 200 characters').optional(),
})

export type MedicationFormData = z.infer<typeof medicationFormSchema>
export type DoseTrackingData = z.infer<typeof doseTrackingSchema>



