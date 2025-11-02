'use server'

/**
 * AI Assistant Server Actions
 * 
 * This module provides server-side AI functionality including:
 * - Chat conversations with streaming support
 * - Health data summaries (daily, weekly, monthly)
 * - Health Q&A with personalized context
 * - Personalized health advice based on user data
 */

import { createClient } from '@/lib/supabase/server'
import {
  createChatCompletion,
  createStreamingChatCompletion,
  CLAUDE_MODEL,
  HEALTH_ASSISTANT_SYSTEM_PROMPT,
  type ChatMessage,
} from '@/lib/openrouter/client'
import {
  chatMessageSchema,
  summaryRequestSchema,
  healthQuestionSchema,
  adviceRequestSchema,
} from '@/lib/validations/ai-assistant'
import { format, subDays, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'

type ActionResponse<T = null> = {
  success: boolean
  data?: T
  error?: string
}

/**
 * Fetches user's health data for AI context
 */
async function getUserHealthData(userId: string, days: number = 30) {
  const supabase = await createClient()
  const startDate = subDays(new Date(), days).toISOString()

  // Fetch all health data in parallel
  const [bpResult, dietResult, exerciseResult] = await Promise.all([
    supabase
      .from('blood_pressure_readings')
      .select('*')
      .eq('user_id', userId)
      .gte('measured_at', startDate)
      .order('measured_at', { ascending: false }),
    supabase
      .from('diet_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('logged_at', startDate)
      .order('logged_at', { ascending: false }),
    supabase
      .from('exercise_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('logged_at', startDate)
      .order('logged_at', { ascending: false }),
  ])

  return {
    bloodPressure: bpResult.data || [],
    diet: dietResult.data || [],
    exercise: exerciseResult.data || [],
  }
}

/**
 * Formats health data into a readable context for the AI
 */
function formatHealthDataForAI(healthData: Awaited<ReturnType<typeof getUserHealthData>>): string {
  const { bloodPressure, diet, exercise } = healthData

  let context = 'User Health Data Summary:\n\n'

  // Blood Pressure Summary
  if (bloodPressure.length > 0) {
    const avgSystolic = Math.round(
      bloodPressure.reduce((sum, r) => sum + (r as any).systolic, 0) / bloodPressure.length
    )
    const avgDiastolic = Math.round(
      bloodPressure.reduce((sum, r) => sum + (r as any).diastolic, 0) / bloodPressure.length
    )
    const avgPulse = Math.round(
      bloodPressure.reduce((sum, r) => sum + (r as any).pulse, 0) / bloodPressure.length
    )

    const latest = bloodPressure[0] as any
    context += `Blood Pressure (${bloodPressure.length} readings):\n`
    context += `- Average: ${avgSystolic}/${avgDiastolic} mmHg\n`
    context += `- Average Pulse: ${avgPulse} bpm\n`
    context += `- Latest: ${latest.systolic}/${latest.diastolic} mmHg (${format(new Date(latest.measured_at), 'MMM d, yyyy')})\n\n`
  } else {
    context += 'Blood Pressure: No readings recorded\n\n'
  }

  // Diet Summary
  if (diet.length > 0) {
    context += `Diet Logs (${diet.length} entries):\n`
    const mealTypes = diet.reduce((acc, d) => {
      const mealType = (d as any).meal_type
      acc[mealType] = (acc[mealType] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    Object.entries(mealTypes).forEach(([type, count]) => {
      context += `- ${type}: ${count} entries\n`
    })
    context += '\n'
  } else {
    context += 'Diet: No logs recorded\n\n'
  }

  // Exercise Summary
  if (exercise.length > 0) {
    const totalDuration = exercise.reduce((sum, e) => sum + ((e as any).duration_minutes || 0), 0)
    context += `Exercise Logs (${exercise.length} sessions):\n`
    context += `- Total Duration: ${totalDuration} minutes\n`
    const intensities = exercise.reduce((acc, e) => {
      const intensity = (e as any).intensity
      acc[intensity] = (acc[intensity] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    Object.entries(intensities).forEach(([intensity, count]) => {
      context += `- ${intensity} intensity: ${count} sessions\n`
    })
    context += '\n'
  } else {
    context += 'Exercise: No logs recorded\n\n'
  }

  return context
}

/**
 * Chat with AI Assistant
 * Non-streaming version for simple requests
 */
export async function chatWithAI(
  _prevState: ActionResponse<{ message: string }> | null,
  formData: FormData
): Promise<ActionResponse<{ message: string }>> {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      success: false,
      error: 'You must be logged in to use the AI assistant',
    }
  }

  // Validate input
  const validatedFields = chatMessageSchema.safeParse({
    message: formData.get('message'),
    conversationHistory: formData.get('conversationHistory')
      ? JSON.parse(formData.get('conversationHistory') as string)
      : [],
  })

  if (!validatedFields.success) {
    return {
      success: false,
      error: validatedFields.error.errors[0].message,
    }
  }

  const { message, conversationHistory } = validatedFields.data

  try {
    // Get user health data for context
    const healthData = await getUserHealthData(user.id, 30)
    const healthContext = formatHealthDataForAI(healthData)

    // Build messages array
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `${HEALTH_ASSISTANT_SYSTEM_PROMPT}\n\n${healthContext}`,
      },
      ...conversationHistory,
      {
        role: 'user',
        content: message,
      },
    ]

    // Call OpenRouter API
    const response = await createChatCompletion({
      model: CLAUDE_MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 1000,
    })

    const assistantMessage = response.choices[0]?.message?.content

    if (!assistantMessage) {
      throw new Error('No response from AI')
    }

    return {
      success: true,
      data: {
        message: assistantMessage,
      },
    }
  } catch (error) {
    console.error('AI chat error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get AI response',
    }
  }
}

/**
 * Generate health summary for a specific period
 */
export async function generateHealthSummary(
  period: 'daily' | 'weekly' | 'monthly',
  date?: string
): Promise<ActionResponse<{ summary: string; period: string; date: string }>> {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      success: false,
      error: 'You must be logged in',
    }
  }

  // Validate input
  const validatedFields = summaryRequestSchema.safeParse({
    period,
    date,
  })

  if (!validatedFields.success) {
    return {
      success: false,
      error: validatedFields.error.errors[0].message,
    }
  }

  try {
    const targetDate = date ? new Date(date) : new Date()
    let startDate: Date
    let endDate: Date
    let periodLabel: string

    // Determine date range based on period
    switch (period) {
      case 'daily':
        startDate = startOfDay(targetDate)
        endDate = endOfDay(targetDate)
        periodLabel = format(targetDate, 'MMMM d, yyyy')
        break
      case 'weekly':
        startDate = startOfWeek(targetDate, { weekStartsOn: 1 })
        endDate = endOfWeek(targetDate, { weekStartsOn: 1 })
        periodLabel = `Week of ${format(startDate, 'MMM d, yyyy')}`
        break
      case 'monthly':
        startDate = startOfMonth(targetDate)
        endDate = endOfMonth(targetDate)
        periodLabel = format(targetDate, 'MMMM yyyy')
        break
    }

    // Fetch health data for the period
    const [bpResult, dietResult, exerciseResult] = await Promise.all([
      supabase
        .from('blood_pressure_readings')
        .select('*')
        .eq('user_id', user.id)
        .gte('measured_at', startDate.toISOString())
        .lte('measured_at', endDate.toISOString())
        .order('measured_at', { ascending: false }),
      supabase
        .from('diet_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('logged_at', startDate.toISOString())
        .lte('logged_at', endDate.toISOString())
        .order('logged_at', { ascending: false }),
      supabase
        .from('exercise_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('logged_at', startDate.toISOString())
        .lte('logged_at', endDate.toISOString())
        .order('logged_at', { ascending: false }),
    ])

    const healthData = {
      bloodPressure: bpResult.data || [],
      diet: dietResult.data || [],
      exercise: exerciseResult.data || [],
    }

    const healthContext = formatHealthDataForAI(healthData)

    // Generate summary using AI
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: HEALTH_ASSISTANT_SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: `Please provide a comprehensive ${period} health summary for ${periodLabel}. Analyze the following data and provide insights, trends, and recommendations:\n\n${healthContext}\n\nInclude:\n1. Key metrics and trends\n2. Notable patterns or concerns\n3. Positive achievements\n4. Actionable recommendations\n5. Areas for improvement`,
      },
    ]

    const response = await createChatCompletion({
      model: CLAUDE_MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 1500,
    })

    const summary = response.choices[0]?.message?.content

    if (!summary) {
      throw new Error('No summary generated')
    }

    return {
      success: true,
      data: {
        summary,
        period,
        date: periodLabel,
      },
    }
  } catch (error) {
    console.error('Summary generation error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate summary',
    }
  }
}

/**
 * Answer health-related questions with optional user data context
 */
export async function askHealthQuestion(
  question: string,
  includeUserData: boolean = true
): Promise<ActionResponse<{ answer: string }>> {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      success: false,
      error: 'You must be logged in',
    }
  }

  // Validate input
  const validatedFields = healthQuestionSchema.safeParse({
    question,
    includeUserData,
  })

  if (!validatedFields.success) {
    return {
      success: false,
      error: validatedFields.error.errors[0].message,
    }
  }

  try {
    let systemPrompt = HEALTH_ASSISTANT_SYSTEM_PROMPT

    // Add user data context if requested
    if (includeUserData) {
      const healthData = await getUserHealthData(user.id, 30)
      const healthContext = formatHealthDataForAI(healthData)
      systemPrompt += `\n\n${healthContext}`
    }

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: question,
      },
    ]

    const response = await createChatCompletion({
      model: CLAUDE_MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 1000,
    })

    const answer = response.choices[0]?.message?.content

    if (!answer) {
      throw new Error('No answer generated')
    }

    return {
      success: true,
      data: {
        answer,
      },
    }
  } catch (error) {
    console.error('Health question error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to answer question',
    }
  }
}

/**
 * Generate personalized health advice based on user data
 */
export async function getPersonalizedAdvice(
  focus: 'blood_pressure' | 'diet' | 'exercise' | 'medication' | 'overall',
  daysToAnalyze: number = 30
): Promise<ActionResponse<{ advice: string; focus: string }>> {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      success: false,
      error: 'You must be logged in',
    }
  }

  // Validate input
  const validatedFields = adviceRequestSchema.safeParse({
    focus,
    daysToAnalyze,
  })

  if (!validatedFields.success) {
    return {
      success: false,
      error: validatedFields.error.errors[0].message,
    }
  }

  try {
    // Get user health data
    const healthData = await getUserHealthData(user.id, daysToAnalyze)
    const healthContext = formatHealthDataForAI(healthData)

    const focusLabels = {
      blood_pressure: 'blood pressure management',
      diet: 'dietary habits',
      exercise: 'exercise routine',
      medication: 'medication adherence',
      overall: 'overall health and wellness',
    }

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `${HEALTH_ASSISTANT_SYSTEM_PROMPT}\n\n${healthContext}`,
      },
      {
        role: 'user',
        content: `Based on my health data from the past ${daysToAnalyze} days, please provide personalized advice focused on ${focusLabels[focus]}. Include:\n\n1. Current status assessment\n2. Specific, actionable recommendations\n3. Potential concerns or red flags\n4. Positive patterns to maintain\n5. Short-term and long-term goals\n\nBe specific and practical in your recommendations.`,
      },
    ]

    const response = await createChatCompletion({
      model: CLAUDE_MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 1500,
    })

    const advice = response.choices[0]?.message?.content

    if (!advice) {
      throw new Error('No advice generated')
    }

    return {
      success: true,
      data: {
        advice,
        focus: focusLabels[focus],
      },
    }
  } catch (error) {
    console.error('Personalized advice error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate advice',
    }
  }
}

/**
 * Streaming chat endpoint
 * Returns a ReadableStream for real-time AI responses
 */
export async function streamChatWithAI(
  message: string,
  conversationHistory: ChatMessage[] = []
): Promise<ActionResponse<ReadableStream<Uint8Array>>> {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      success: false,
      error: 'You must be logged in',
    }
  }

  // Validate input
  const validatedFields = chatMessageSchema.safeParse({
    message,
    conversationHistory,
  })

  if (!validatedFields.success) {
    return {
      success: false,
      error: validatedFields.error.errors[0].message,
    }
  }

  try {
    // Get user health data for context
    const healthData = await getUserHealthData(user.id, 30)
    const healthContext = formatHealthDataForAI(healthData)

    // Build messages array
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `${HEALTH_ASSISTANT_SYSTEM_PROMPT}\n\n${healthContext}`,
      },
      ...conversationHistory,
      {
        role: 'user',
        content: message,
      },
    ]

    // Create a ReadableStream for streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const generator = createStreamingChatCompletion({
            model: CLAUDE_MODEL,
            messages,
            temperature: 0.7,
            max_tokens: 1000,
          })

          for await (const chunk of generator) {
            controller.enqueue(new TextEncoder().encode(chunk))
          }

          controller.close()
        } catch (error) {
          controller.error(error)
        }
      },
    })

    return {
      success: true,
      data: stream,
    }
  } catch (error) {
    console.error('Streaming chat error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to stream response',
    }
  }
}

