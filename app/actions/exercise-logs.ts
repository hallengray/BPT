'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { exerciseLogFormSchema } from '@/lib/validations/exercise-logs'
import type { ExerciseLog } from '@/types'

type ActionResponse<T = null> = {
  success: boolean
  data?: T
  error?: string
}

export async function createExerciseLog(
  _prevState: ActionResponse<ExerciseLog> | { success: boolean },
  formData: FormData
): Promise<ActionResponse<ExerciseLog>> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      success: false,
      error: 'You must be logged in to create an exercise log',
    }
  }

  const validatedFields = exerciseLogFormSchema.safeParse({
    activityType: formData.get('activityType'),
    durationMinutes: formData.get('durationMinutes'),
    intensity: formData.get('intensity') || undefined,
    notes: formData.get('notes') || undefined,
    loggedAt: formData.get('loggedAt'),
  })

  if (!validatedFields.success) {
    return {
      success: false,
      error: validatedFields.error.errors[0].message,
    }
  }

  const { activityType, durationMinutes, intensity, notes, loggedAt } =
    validatedFields.data

  const { data, error } = await supabase
    .from('exercise_logs')
    .insert({
      user_id: user.id,
      activity_type: activityType,
      duration_minutes: parseInt(durationMinutes),
      intensity: intensity || null,
      notes: notes || null,
      logged_at: loggedAt,
    } as never)
    .select()
    .single()

  if (error) {
    console.error('Exercise log creation error:', error)
    return {
      success: false,
      error: 'Failed to create exercise log. Please try again.',
    }
  }

  revalidatePath('/log-diet-exercise')
  revalidatePath('/dashboard')

  return {
    success: true,
    data,
  }
}

export async function getExerciseLogs(limit: number = 10) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated', data: [] }
  }

  const { data, error } = await supabase
    .from('exercise_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('logged_at', { ascending: false })
    .limit(limit)

  if (error) {
    return { success: false, error: error.message, data: [] }
  }

  return { success: true, data: data || [] }
}

export async function deleteExerciseLog(id: string): Promise<ActionResponse> {
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
    .from('exercise_logs')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return {
      success: false,
      error: 'Failed to delete exercise log',
    }
  }

  revalidatePath('/log-diet-exercise')
  return { success: true }
}

