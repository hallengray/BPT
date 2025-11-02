'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { medicationFormSchema, doseTrackingSchema } from '@/lib/validations/medication-logs'
import type { Database } from '@/types/database.types'

type MedicationLog = Database['public']['Tables']['medication_logs']['Row']
type MedicationDose = Database['public']['Tables']['medication_doses']['Row']

type ActionResponse<T = null> = {
  success: boolean
  data?: T
  error?: string
}

export async function createMedication(
  _prevState: ActionResponse<MedicationLog> | null,
  formData: FormData
): Promise<ActionResponse<MedicationLog>> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      success: false,
      error: 'You must be logged in to add a medication',
    }
  }

  const validatedFields = medicationFormSchema.safeParse({
    medicationName: formData.get('medicationName'),
    dosage: formData.get('dosage'),
    frequency: formData.get('frequency'),
    timeOfDay: JSON.parse(formData.get('timeOfDay') as string),
    notes: formData.get('notes') || undefined,
    startDate: formData.get('startDate'),
    endDate: formData.get('endDate') || undefined,
  })

  if (!validatedFields.success) {
    return {
      success: false,
      error: validatedFields.error.errors[0].message,
    }
  }

  const { medicationName, dosage, frequency, timeOfDay, notes, startDate, endDate } =
    validatedFields.data

  const { data, error } = await supabase
    .from('medication_logs')
    .insert({
      user_id: user.id,
      medication_name: medicationName,
      dosage,
      frequency,
      time_of_day: timeOfDay,
      notes: notes || null,
      start_date: startDate,
      end_date: endDate || null,
      is_active: true,
    } as never)
    .select()
    .single()

  if (error) {
    console.error('Medication creation error:', error)
    return {
      success: false,
      error: 'Failed to add medication. Please try again.',
    }
  }

  revalidatePath('/medications')
  revalidatePath('/dashboard')

  return {
    success: true,
    data,
  }
}

export async function getMedications(activeOnly: boolean = true) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated', data: [] }
  }

  let query = supabase
    .from('medication_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (activeOnly) {
    query = query.eq('is_active', true)
  }

  const { data, error } = await query

  if (error) {
    return { success: false, error: error.message, data: [] }
  }

  return { success: true, data: data || [] }
}

export async function updateMedication(
  id: string,
  updates: Database['public']['Tables']['medication_logs']['Update']
): Promise<ActionResponse<MedicationLog>> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      success: false,
      error: 'You must be logged in',
    }
  }

  const { data, error } = await supabase
    .from('medication_logs')
    .update(updates as never)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return {
      success: false,
      error: 'Failed to update medication',
    }
  }

  revalidatePath('/medications')
  revalidatePath('/dashboard')

  return {
    success: true,
    data,
  }
}

export async function deactivateMedication(id: string): Promise<ActionResponse<MedicationLog>> {
  return updateMedication(id, { is_active: false })
}

export async function recordDose(
  _prevState: ActionResponse<MedicationDose> | null,
  formData: FormData
): Promise<ActionResponse<MedicationDose>> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      success: false,
      error: 'You must be logged in',
    }
  }

  const validatedFields = doseTrackingSchema.safeParse({
    medicationLogId: formData.get('medicationLogId'),
    wasTaken: formData.get('wasTaken') === 'true',
    takenAt: formData.get('takenAt') || new Date().toISOString(),
    notes: formData.get('notes') || undefined,
  })

  if (!validatedFields.success) {
    return {
      success: false,
      error: validatedFields.error.errors[0].message,
    }
  }

  const { medicationLogId, wasTaken, takenAt, notes } = validatedFields.data

  const { data, error } = await supabase
    .from('medication_doses')
    .insert({
      medication_log_id: medicationLogId,
      user_id: user.id,
      scheduled_time: takenAt || new Date().toISOString(),
      taken_at: wasTaken ? (takenAt || new Date().toISOString()) : null,
      was_taken: wasTaken,
      notes: notes || null,
    } as never)
    .select()
    .single()

  if (error) {
    console.error('Dose tracking error:', error)
    return {
      success: false,
      error: 'Failed to record dose. Please try again.',
    }
  }

  revalidatePath('/medications')
  revalidatePath('/dashboard')

  return {
    success: true,
    data,
  }
}

export async function getMedicationHistory(medicationId: string, days: number = 30) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated', data: [] }
  }

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data, error } = await supabase
    .from('medication_doses')
    .select('*')
    .eq('user_id', user.id)
    .eq('medication_log_id', medicationId)
    .gte('scheduled_time', startDate.toISOString())
    .order('scheduled_time', { ascending: false })

  if (error) {
    return { success: false, error: error.message, data: [] }
  }

  return { success: true, data: data || [] }
}

export async function getAdherenceStats(medicationId: string, days: number = 30) {
  const history = await getMedicationHistory(medicationId, days)

  if (!history.success || !history.data) {
    return { success: false, adherenceRate: 0, totalDoses: 0, takenDoses: 0 }
  }

  const totalDoses = history.data.length
  const takenDoses = history.data.filter((dose: MedicationDose) => dose.was_taken).length
  const adherenceRate = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 0

  return {
    success: true,
    adherenceRate,
    totalDoses,
    takenDoses,
    missedDoses: totalDoses - takenDoses,
  }
}

