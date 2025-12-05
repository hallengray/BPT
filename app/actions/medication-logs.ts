'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { medicationFormSchema, doseTrackingSchema } from '@/lib/validations/medication-logs'
import { generateScheduledDoses } from '@/lib/medication-scheduler'
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

  // Insert medication log
  // Note: Using type assertion due to Supabase type inference limitations
  // Data is validated by Zod schema above
  const { data, error } = await supabase
    .from('medication_logs')
    .insert({
      user_id: user.id,
      medication_name: medicationName,
      dosage,
      frequency,
      time_of_day: timeOfDay,
      notes: notes ?? null,
      start_date: startDate,
      end_date: endDate ?? null,
      is_active: true,
    } as any)
    .select()
    .single()

  if (error || !data) {
    console.error('Medication creation error:', error)
    return {
      success: false,
      error: 'Failed to add medication. Please try again.',
    }
  }

  const medicationData = data as MedicationLog

  // Generate scheduled doses for the next 30 days
  try {
    const scheduledDoses = generateScheduledDoses(
      medicationData.id,
      user.id,
      frequency,
      timeOfDay,
      new Date(startDate),
      endDate ? new Date(endDate) : null,
      30 // Generate 30 days worth of doses
    )

    // Insert all scheduled doses into the database
    if (scheduledDoses.length > 0) {
      const { error: dosesError } = await supabase
        .from('medication_doses')
        .insert(scheduledDoses as any)

      if (dosesError) {
        console.error('Dose generation error:', dosesError)
        // Don't fail the whole operation, just log the error
        // The medication was created successfully
      }
    }
  } catch (doseError) {
    console.error('Dose generation error:', doseError)
    // Continue - medication was created successfully
  }

  revalidatePath('/medications')
  revalidatePath('/dashboard')
  revalidatePath('/quick-log')

  return {
    success: true,
    data: medicationData,
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

  // Update medication log following Supabase best practices
  // Note: Using type assertion due to Supabase type inference limitations
  // Data is validated by the function parameter type above
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
    doseId: formData.get('doseId'),
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

  const { doseId, wasTaken, takenAt, notes } = validatedFields.data

  // UPDATE the existing scheduled dose record (not INSERT)
  // Following Supabase best practices for type-safe updates
  // Note: Using type assertion due to Supabase type inference limitations
  const { data, error } = await supabase
    .from('medication_doses')
    .update({
      was_taken: wasTaken,
      taken_at: wasTaken ? (takenAt ?? new Date().toISOString()) : null,
      notes: notes ?? null,
    } as never)
    .eq('id', doseId)
    .eq('user_id', user.id)
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
  revalidatePath('/quick-log')

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

/**
 * Get pending doses for today
 * IMPORTANT: This function is required by multiple components - DO NOT DELETE
 * Used by: pending-doses-widget.tsx, medication-doses-client.tsx, medication-doses-server.tsx
 */
export async function getTodaysPendingDoses(): Promise<
  ActionResponse<Array<MedicationDose & { medication_name: string; dosage: string }>>
> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      success: false,
      error: 'Not authenticated',
      data: [],
    }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  try {
    const { data: doses, error } = await supabase
      .from('medication_doses')
      .select(`
        *,
        medication_logs!inner(medication_name, dosage, is_active)
      `)
      .eq('user_id', user.id)
      .gte('scheduled_time', today.toISOString())
      .lt('scheduled_time', tomorrow.toISOString())
      .eq('medication_logs.is_active', true)
      .order('scheduled_time', { ascending: true })

    if (error) {
      console.error('Get pending doses error:', error)
      return {
        success: false,
        error: 'Failed to fetch pending doses',
        data: [],
      }
    }

    // Transform the data to include medication details
    const transformedDoses = (doses || []).map((dose: MedicationDose & { medication_logs: { medication_name: string; dosage: string; is_active: boolean } }) => ({
      ...dose,
      medication_name: dose.medication_logs.medication_name,
      dosage: dose.medication_logs.dosage,
    }))

    return {
      success: true,
      data: transformedDoses,
    }
  } catch (error) {
    console.error('Get pending doses error:', error)
    return {
      success: false,
      error: 'Failed to fetch pending doses',
      data: [],
    }
  }
}

export async function deleteMedicationDose(id: string): Promise<ActionResponse> {
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

  const { error } = await supabase
    .from('medication_doses')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return {
      success: false,
      error: 'Failed to delete medication dose',
    }
  }

  revalidatePath('/medications')
  revalidatePath('/dashboard')
  revalidatePath('/quick-log')
  return { success: true }
}

