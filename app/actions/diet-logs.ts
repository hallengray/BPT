'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { dietLogFormSchema } from '@/lib/validations/diet-logs'
import type { DietLog } from '@/types'

type ActionResponse<T = null> = {
  success: boolean
  data?: T
  error?: string
}

export async function createDietLog(
  _prevState: ActionResponse<DietLog> | { success: boolean },
  formData: FormData
): Promise<ActionResponse<DietLog>> {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      success: false,
      error: 'You must be logged in to create a diet log',
    }
  }

  // Validate input
  const validatedFields = dietLogFormSchema.safeParse({
    mealType: formData.get('mealType'),
    description: formData.get('description'),
    notes: formData.get('notes') || undefined,
    loggedAt: formData.get('loggedAt'),
  })

  if (!validatedFields.success) {
    return {
      success: false,
      error: validatedFields.error.errors[0].message,
    }
  }

  const { mealType, description, notes, loggedAt } = validatedFields.data

  // Insert diet log
  const { data, error } = await supabase
    .from('diet_logs')
    .insert({
      user_id: user.id,
      meal_type: mealType,
      description,
      notes: notes || null,
      logged_at: loggedAt,
    } as never)
    .select()
    .single()

  if (error) {
    console.error('Diet log creation error:', error)
    return {
      success: false,
      error: 'Failed to create diet log. Please try again.',
    }
  }

  revalidatePath('/quick-log')
  revalidatePath('/dashboard')

  return {
    success: true,
    data,
  }
}

export async function getDietLogs(limit: number = 10) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated', data: [] }
  }

  const { data, error } = await supabase
    .from('diet_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('logged_at', { ascending: false })
    .limit(limit)

  if (error) {
    return { success: false, error: error.message, data: [] }
  }

  return { success: true, data: data || [] }
}

export async function deleteDietLog(id: string): Promise<ActionResponse> {
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
    .from('diet_logs')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return {
      success: false,
      error: 'Failed to delete diet log',
    }
  }

  revalidatePath('/quick-log')
  revalidatePath('/dashboard')
  return { success: true }
}

