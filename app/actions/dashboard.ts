'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * Check if user has logged any health data in the last 8 hours
 * Standard is 3x daily logging (every ~8 hours)
 */
export async function hasRecentLogs(): Promise<boolean> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return false
  }

  const eightHoursAgo = new Date()
  eightHoursAgo.setHours(eightHoursAgo.getHours() - 8)
  const cutoffTime = eightHoursAgo.toISOString()

  // Check for recent BP readings, diet logs, exercise logs, or medication doses
  const [bpResult, dietResult, exerciseResult, medResult] = await Promise.all([
    supabase
      .from('blood_pressure_readings')
      .select('id')
      .eq('user_id', user.id)
      .gte('measured_at', cutoffTime)
      .limit(1),
    supabase
      .from('diet_logs')
      .select('id')
      .eq('user_id', user.id)
      .gte('logged_at', cutoffTime)
      .limit(1),
    supabase
      .from('exercise_logs')
      .select('id')
      .eq('user_id', user.id)
      .gte('logged_at', cutoffTime)
      .limit(1),
    supabase
      .from('medication_doses')
      .select('id')
      .eq('user_id', user.id)
      .gte('scheduled_time', cutoffTime)
      .limit(1),
  ])

  // Return true if any recent logs exist
  return !!(
    (bpResult.data && bpResult.data.length > 0) ||
    (dietResult.data && dietResult.data.length > 0) ||
    (exerciseResult.data && exerciseResult.data.length > 0) ||
    (medResult.data && medResult.data.length > 0)
  )
}

