'use server'

import { createClient } from '@/lib/supabase/server'
import type { UnifiedHealthData } from '@/types'

/**
 * Fetch unified health data for analytics and widgets
 * Returns last 30 days of data
 */
export async function getUnifiedHealthData(): Promise<{
  success: boolean
  data?: UnifiedHealthData
  error?: string
}> {
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

  // Calculate date range (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const cutoffDate = thirtyDaysAgo.toISOString()

  try {
    // Fetch all data in parallel
    const [bpResult, dietResult, exerciseResult, medicationsResult, dosesResult] =
      await Promise.all([
        supabase
          .from('blood_pressure_readings')
          .select('*')
          .eq('user_id', user.id)
          .gte('measured_at', cutoffDate)
          .order('measured_at', { ascending: false }),
        supabase
          .from('diet_logs')
          .select('*')
          .eq('user_id', user.id)
          .gte('logged_at', cutoffDate)
          .order('logged_at', { ascending: false }),
        supabase
          .from('exercise_logs')
          .select('*')
          .eq('user_id', user.id)
          .gte('logged_at', cutoffDate)
          .order('logged_at', { ascending: false }),
        supabase
          .from('medication_logs')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true),
        supabase
          .from('medication_doses')
          .select('*')
          .eq('user_id', user.id)
          .gte('scheduled_time', cutoffDate)
          .order('scheduled_time', { ascending: false }),
      ])

    return {
      success: true,
      data: {
        bloodPressure: bpResult.data || [],
        diet: dietResult.data || [],
        exercise: exerciseResult.data || [],
        medications: medicationsResult.data || [],
        medicationDoses: dosesResult.data || [],
      },
    }
  } catch (error) {
    console.error('Error fetching unified health data:', error)
    return {
      success: false,
      error: 'Failed to fetch health data',
    }
  }
}

