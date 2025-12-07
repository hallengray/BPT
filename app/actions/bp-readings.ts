'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { bpReadingFormSchema, isHighBP, getHighBPSuggestions } from '@/lib/validations/bp-readings'
import type { BloodPressureReading } from '@/types'
import type { Database } from '@/types/database.types'

type DBBloodPressureReading = Database['public']['Tables']['blood_pressure_readings']['Row']

type ActionResponse<T = null> = {
  success: boolean
  data?: T
  error?: string
}

export async function createBPReading(
  _prevState: ActionResponse<BloodPressureReading> | null,
  formData: FormData
): Promise<ActionResponse<BloodPressureReading>> {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      success: false,
      error: 'You must be logged in to create a reading',
    }
  }

  // Validate input
  const rawData = {
    systolic: formData.get('systolic'),
    diastolic: formData.get('diastolic'),
    pulse: formData.get('pulse'),
    notes: formData.get('notes') || undefined,
    measuredAt: formData.get('measuredAt'),
  }

  const validatedFields = bpReadingFormSchema.safeParse(rawData)

  if (!validatedFields.success) {
    const error = validatedFields.error.issues[0]
    
    // If it's a high BP notes requirement error, provide helpful suggestions
    if (error.path.includes('notes')) {
      const systolicValue = Number(rawData.systolic)
      const diastolicValue = Number(rawData.diastolic)
      
      if (isHighBP(systolicValue, diastolicValue)) {
        const suggestions = getHighBPSuggestions()
        return {
          success: false,
          error: `${error.message}\n\nConsider noting:\n• ${suggestions.slice(0, 3).join('\n• ')}`,
        }
      }
    }
    
    return {
      success: false,
      error: error.message,
    }
  }

  const { systolic, diastolic, pulse, notes, measuredAt } = validatedFields.data

  // Insert reading
  const insertData = {
    user_id: user.id,
    systolic: parseInt(systolic),
    diastolic: parseInt(diastolic),
    pulse: parseInt(pulse),
    notes: notes || null,
    measured_at: measuredAt,
  }
  
  // Type assertion needed due to Supabase type inference issue
  const result = await supabase
    .from('blood_pressure_readings')
    .insert(insertData as any)
    .select()
    .single()
  
  const { data, error } = result as { data: DBBloodPressureReading | null; error: any }

  if (error || !data) {
    return {
      success: false,
      error: 'Failed to create reading. Please try again.',
    }
  }

  revalidatePath('/dashboard')
  revalidatePath('/quick-log')
  return {
    success: true,
    data: data as unknown as BloodPressureReading,
  }
}

export async function getBPReadings(limit: number = 30) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated', data: [] }
  }

  const { data, error } = (await supabase
    .from('blood_pressure_readings')
    .select('*')
    .eq('user_id', user.id)
    .order('measured_at', { ascending: false })
    .limit(limit)) as { data: DBBloodPressureReading[] | null; error: any }

  if (error) {
    return { success: false, error: error.message, data: [] }
  }

  return { success: true, data: data || [] }
}

export async function deleteBPReading(id: string): Promise<ActionResponse> {
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
    .from('blood_pressure_readings')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return {
      success: false,
      error: 'Failed to delete reading',
    }
  }

  revalidatePath('/dashboard')
  revalidatePath('/quick-log')
  return { success: true }
}

