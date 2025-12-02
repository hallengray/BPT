'use server'

import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database.types'

type BloodPressureReading = Database['public']['Tables']['blood_pressure_readings']['Row']
type DietLog = Database['public']['Tables']['diet_logs']['Row']
type ExerciseLog = Database['public']['Tables']['exercise_logs']['Row']
type MedicationLog = Database['public']['Tables']['medication_logs']['Row']

export interface RecentLogs {
  bloodPressure: BloodPressureReading[]
  diet: DietLog[]
  exercise: ExerciseLog[]
  medications: MedicationLog[]
}

export async function getRecentLogs(): Promise<{
  success: boolean
  data?: RecentLogs
  error?: string
}> {
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
    // Fetch last 5 logs for each category in parallel
    const [bpResult, dietResult, exerciseResult, medicationsResult] = await Promise.all([
      // Blood Pressure
      supabase
        .from('blood_pressure_readings')
        .select('*')
        .eq('user_id', user.id)
        .order('measured_at', { ascending: false })
        .limit(5),

      // Diet
      supabase
        .from('diet_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('logged_at', { ascending: false })
        .limit(5),

      // Exercise
      supabase
        .from('exercise_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('logged_at', { ascending: false })
        .limit(5),

      // Medications (active only)
      supabase
        .from('medication_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(5),
    ])

    // Check for errors
    if (bpResult.error) throw new Error(`BP fetch failed: ${bpResult.error.message}`)
    if (dietResult.error) throw new Error(`Diet fetch failed: ${dietResult.error.message}`)
    if (exerciseResult.error)
      throw new Error(`Exercise fetch failed: ${exerciseResult.error.message}`)
    if (medicationsResult.error)
      throw new Error(`Medications fetch failed: ${medicationsResult.error.message}`)

    return {
      success: true,
      data: {
        bloodPressure: bpResult.data || [],
        diet: dietResult.data || [],
        exercise: exerciseResult.data || [],
        medications: medicationsResult.data || [],
      },
    }
  } catch (error) {
    console.error('Recent logs fetch error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch recent logs',
    }
  }
}


