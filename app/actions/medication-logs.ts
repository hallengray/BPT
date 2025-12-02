'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { medicationFormSchema, doseTrackingSchema } from '@/lib/validations/medication-logs'
import { generateScheduledDoses, shouldRegenerateDoses } from '@/lib/medication-scheduler'
import type { Database } from '@/types/database.types'
import type { MedicationFrequency } from '@/types'

type MedicationLog = Database['public']['Tables']['medication_logs']['Row']
type MedicationDose = Database['public']['Tables']['medication_doses']['Row']

type ActionResponse<T = null> = {
  success: boolean
  data?: T
  error?: string
  dosesGenerated?: number
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

  const startDateObj = new Date(startDate)
  if (Number.isNaN(startDateObj.getTime())) {
    return {
      success: false,
      error: 'Invalid start date',
    }
  }

  const validatedStartDate = startDateObj.toISOString()

  let validatedEndDate: string | null = null
  if (endDate) {
    const endDateObj = new Date(endDate)
    if (Number.isNaN(endDateObj.getTime())) {
      return {
        success: false,
        error: 'Invalid end date',
      }
    }
    validatedEndDate = endDateObj.toISOString()
  }

  const { data, error } = await supabase
    .from('medication_logs')
    .insert({
      user_id: user.id,
      medication_name: medicationName,
      dosage,
      frequency,
      time_of_day: timeOfDay,
      notes: notes || null,
      start_date: validatedStartDate,
      end_date: validatedEndDate,
      is_active: true,
    } as never)
    .select()
    .single() as { data: MedicationLog | null; error: Error | null }

  if (error || !data) {
    console.error('Medication creation error:', error)
    return {
      success: false,
      error: 'Failed to add medication. Please try again.',
    }
  }

  // Generate scheduled doses for the medication
  let dosesGenerated = 0
  try {
    const doses = generateScheduledDoses(
      data.id,
      user.id,
      frequency as MedicationFrequency,
      timeOfDay,
      startDateObj,
      validatedEndDate ? new Date(validatedEndDate) : null,
      30 // Generate 30 days of doses
    )

    if (doses.length > 0) {
      const { error: dosesError } = await supabase
        .from('medication_doses')
        .insert(doses as never[])

      if (dosesError) {
        console.error('Dose generation error:', dosesError)
        // Don't fail the entire operation if dose generation fails
        // The medication is still created, just without scheduled doses
      } else {
        dosesGenerated = doses.length
      }
    }
  } catch (doseError) {
    console.error('Dose generation error:', doseError)
    // Continue - medication is created even if dose generation fails
  }

  revalidatePath('/medications')
  revalidatePath('/dashboard')
  revalidatePath('/quick-log')

  return {
    success: true,
    data: data as MedicationLog,
    dosesGenerated,
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

/**
 * Regenerate upcoming doses for a medication
 * Useful when medication schedule is updated or doses are running low
 */
export async function regenerateUpcomingDoses(
  medicationId: string,
  days: number = 30
): Promise<ActionResponse<{ dosesGenerated: number }>> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      success: false,
      error: 'Not authenticated',
    }
  }

  try {
    // Get the medication details
    const { data: medication, error: medError } = (await supabase
      .from('medication_logs')
      .select('*')
      .eq('id', medicationId)
      .eq('user_id', user.id)
      .single()) as { data: MedicationLog | null; error: Error | null }

    if (medError || !medication) {
      return {
        success: false,
        error: 'Medication not found',
      }
    }

    // Check if medication is active
    if (!medication.is_active) {
      return {
        success: false,
        error: 'Cannot generate doses for inactive medication',
      }
    }

    // Get existing future doses
    const now = new Date()
    const { data: existingDoses } = await supabase
      .from('medication_doses')
      .select('scheduled_time')
      .eq('medication_log_id', medicationId)
      .gte('scheduled_time', now.toISOString())
      .order('scheduled_time', { ascending: false })

    // Check if regeneration is needed
    if (!shouldRegenerateDoses(existingDoses || [], 7)) {
      return {
        success: true,
        data: { dosesGenerated: 0 },
      }
    }

    // Generate new doses
    const doses = generateScheduledDoses(
      medicationId,
      user.id,
      medication.frequency as MedicationFrequency,
      medication.time_of_day || [],
      now,
      medication.end_date ? new Date(medication.end_date) : null,
      days
    )

    if (doses.length === 0) {
      return {
        success: true,
        data: { dosesGenerated: 0 },
      }
    }

    // Insert new doses
    const { error: insertError } = await supabase
      .from('medication_doses')
      .insert(doses as never[])

    if (insertError) {
      console.error('Dose insertion error:', insertError)
      return {
        success: false,
        error: 'Failed to generate doses',
      }
    }

    revalidatePath('/medications')
    revalidatePath('/dashboard')

    return {
      success: true,
      data: { dosesGenerated: doses.length },
    }
  } catch (error) {
    console.error('Regenerate doses error:', error)
    return {
      success: false,
      error: 'Failed to regenerate doses',
    }
  }
}

/**
 * Get pending doses for today
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

