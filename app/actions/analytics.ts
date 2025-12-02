'use server'

import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database.types'
import {
  calculateExerciseBPCorrelation,
  calculateDietBPCorrelation,
  calculateMedicationBPCorrelation,
  calculateRestDayImpact,
  calculateBPTrend,
  generatePredictiveInsights,
} from '@/lib/analytics-utils'

type BloodPressureReading = Database['public']['Tables']['blood_pressure_readings']['Row']
type DietLog = Database['public']['Tables']['diet_logs']['Row']
type ExerciseLog = Database['public']['Tables']['exercise_logs']['Row']
type MedicationLog = Database['public']['Tables']['medication_logs']['Row']
type MedicationDose = Database['public']['Tables']['medication_doses']['Row']

export interface UnifiedHealthData {
  bloodPressure: BloodPressureReading[]
  diet: DietLog[]
  exercise: ExerciseLog[]
  medications: MedicationLog[]
  medicationDoses: MedicationDose[]
}

export interface TimelineEvent {
  id: string
  type: 'bp' | 'diet' | 'exercise' | 'medication'
  timestamp: string
  data: BloodPressureReading | DietLog | ExerciseLog | MedicationDose
}

export interface CorrelationInsight {
  type: 'positive' | 'negative' | 'neutral'
  title: string
  description: string
  confidence: 'high' | 'medium' | 'low'
  metric?: number
}

export interface AnalyticsResponse<T = null> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Fetch all health data for a user within a date range
 * Uses parallel fetching for optimal performance
 */
export async function getUnifiedHealthData(
  startDate: string,
  endDate: string
): Promise<AnalyticsResponse<UnifiedHealthData>> {
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
    // Fetch all data in parallel for optimal performance
    const [bpResult, dietResult, exerciseResult, medicationsResult, dosesResult] =
      await Promise.all([
        // Blood Pressure Readings
        supabase
          .from('blood_pressure_readings')
          .select('*')
          .eq('user_id', user.id)
          .gte('measured_at', startDate)
          .lte('measured_at', endDate)
          .order('measured_at', { ascending: true }),

        // Diet Logs
        supabase
          .from('diet_logs')
          .select('*')
          .eq('user_id', user.id)
          .gte('logged_at', startDate)
          .lte('logged_at', endDate)
          .order('logged_at', { ascending: true }),

        // Exercise Logs
        supabase
          .from('exercise_logs')
          .select('*')
          .eq('user_id', user.id)
          .gte('logged_at', startDate)
          .lte('logged_at', endDate)
          .order('logged_at', { ascending: true }),

        // Active Medications
        supabase
          .from('medication_logs')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false }),

        // Medication Doses
        supabase
          .from('medication_doses')
          .select('*')
          .eq('user_id', user.id)
          .gte('scheduled_time', startDate)
          .lte('scheduled_time', endDate)
          .order('scheduled_time', { ascending: true }),
      ])

    // Check for errors
    if (bpResult.error) throw new Error(`BP fetch failed: ${bpResult.error.message}`)
    if (dietResult.error) throw new Error(`Diet fetch failed: ${dietResult.error.message}`)
    if (exerciseResult.error)
      throw new Error(`Exercise fetch failed: ${exerciseResult.error.message}`)
    if (medicationsResult.error)
      throw new Error(`Medications fetch failed: ${medicationsResult.error.message}`)
    if (dosesResult.error) throw new Error(`Doses fetch failed: ${dosesResult.error.message}`)

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
    console.error('Unified health data fetch error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch health data',
    }
  }
}

/**
 * Create a unified timeline of all health events
 * Sorted chronologically for visualization
 */
export async function getHealthTimeline(
  startDate: string,
  endDate: string
): Promise<AnalyticsResponse<TimelineEvent[]>> {
  const healthDataResponse = await getUnifiedHealthData(startDate, endDate)

  if (!healthDataResponse.success || !healthDataResponse.data) {
    return {
      success: false,
      error: healthDataResponse.error || 'Failed to fetch timeline data',
    }
  }

  const { bloodPressure, diet, exercise, medicationDoses } = healthDataResponse.data

  const timeline: TimelineEvent[] = [
    ...bloodPressure.map((bp) => ({
      id: bp.id,
      type: 'bp' as const,
      timestamp: bp.measured_at,
      data: bp,
    })),
    ...diet.map((d) => ({
      id: d.id,
      type: 'diet' as const,
      timestamp: d.logged_at,
      data: d,
    })),
    ...exercise.map((e) => ({
      id: e.id,
      type: 'exercise' as const,
      timestamp: e.logged_at,
      data: e,
    })),
    ...medicationDoses.map((m) => ({
      id: m.id,
      type: 'medication' as const,
      timestamp: m.scheduled_time,
      data: m,
    })),
  ]

  // Sort by timestamp
  timeline.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

  return {
    success: true,
    data: timeline,
  }
}

/**
 * Get comprehensive correlation insights
 */
export async function getCorrelationInsights(
  startDate: string,
  endDate: string
): Promise<AnalyticsResponse<CorrelationInsight[]>> {
  const healthDataResponse = await getUnifiedHealthData(startDate, endDate)

  if (!healthDataResponse.success || !healthDataResponse.data) {
    return {
      success: false,
      error: healthDataResponse.error || 'Failed to fetch health data',
    }
  }

  const { bloodPressure, diet, exercise, medicationDoses } = healthDataResponse.data

  const insights: CorrelationInsight[] = []

  // Exercise correlation
  const exerciseCorr = calculateExerciseBPCorrelation(bloodPressure, exercise)
  if (exerciseCorr.insight) {
    insights.push(exerciseCorr.insight)
  }

  // Rest day impact analysis
  const restDayImpact = calculateRestDayImpact(bloodPressure, exercise)
  if (restDayImpact) {
    insights.push(restDayImpact)
  }

  // Diet correlation
  const dietCorr = calculateDietBPCorrelation(bloodPressure, diet)
  if (dietCorr.insight) {
    insights.push(dietCorr.insight)
  }

  // Medication correlation
  const medicationCorr = calculateMedicationBPCorrelation(bloodPressure, medicationDoses)
  if (medicationCorr.insight) {
    insights.push(medicationCorr.insight)
  }

  // Add trend analysis insight
  if (bloodPressure.length >= 5) {
    const trend = calculateBPTrend(bloodPressure)
    if (trend.direction !== 'stable') {
      insights.push({
        type: trend.direction === 'improving' ? 'positive' : 'negative',
        title: `BP Trend: ${trend.direction.charAt(0).toUpperCase() + trend.direction.slice(1)}`,
        description: `Your BP is ${trend.direction} by ${Math.abs(trend.weeklyChange).toFixed(1)} mmHg per week. At this rate, your BP could change by ${Math.abs(trend.projectedChange30Days).toFixed(0)} mmHg in 30 days.`,
        confidence: trend.confidence,
        metric: trend.weeklyChange,
      })
    }
  }

  // Generate predictive insights
  const predictiveInsights = generatePredictiveInsights(healthDataResponse.data)
  insights.push(...predictiveInsights)

  // Add general insights based on data availability
  if (bloodPressure.length === 0) {
    insights.push({
      type: 'neutral',
      title: 'Start Tracking Blood Pressure',
      description:
        'Regular BP monitoring is essential. Try to measure at the same time each day for consistent data.',
      confidence: 'high',
    })
  }

  if (exercise.length === 0) {
    insights.push({
      type: 'neutral',
      title: 'Add Exercise Tracking',
      description:
        'Regular physical activity can help lower blood pressure. Start logging your exercise to see the impact.',
      confidence: 'high',
    })
  }

  // Sort insights by importance: negative > positive > neutral
  // Within same type, sort by confidence: high > medium > low
  const typeOrder = { negative: 0, positive: 1, neutral: 2 }
  const confidenceOrder = { high: 0, medium: 1, low: 2 }
  
  insights.sort((a, b) => {
    const typeCompare = typeOrder[a.type] - typeOrder[b.type]
    if (typeCompare !== 0) return typeCompare
    return confidenceOrder[a.confidence] - confidenceOrder[b.confidence]
  })

  return {
    success: true,
    data: insights,
  }
}

/**
 * Get summary statistics for analytics dashboard
 */
export async function getAnalyticsSummary(
  startDate: string,
  endDate: string
): Promise<
  AnalyticsResponse<{
    avgSystolic: number
    avgDiastolic: number
    totalExerciseMinutes: number
    totalMeals: number
    medicationAdherence: number
    dataPoints: number
  }>
> {
  const healthDataResponse = await getUnifiedHealthData(startDate, endDate)

  if (!healthDataResponse.success || !healthDataResponse.data) {
    return {
      success: false,
      error: healthDataResponse.error || 'Failed to fetch health data',
    }
  }

  const { bloodPressure, diet, exercise, medicationDoses } = healthDataResponse.data

  // Calculate averages
  const avgSystolic =
    bloodPressure.length > 0
      ? bloodPressure.reduce((sum, bp) => sum + bp.systolic, 0) / bloodPressure.length
      : 0

  const avgDiastolic =
    bloodPressure.length > 0
      ? bloodPressure.reduce((sum, bp) => sum + bp.diastolic, 0) / bloodPressure.length
      : 0

  const totalExerciseMinutes = exercise.reduce((sum, ex) => sum + ex.duration_minutes, 0)

  const totalMeals = diet.length

  const takenDoses = medicationDoses.filter((d) => d.was_taken).length
  const medicationAdherence =
    medicationDoses.length > 0 ? (takenDoses / medicationDoses.length) * 100 : 0

  const dataPoints =
    bloodPressure.length + diet.length + exercise.length + medicationDoses.length

  return {
    success: true,
    data: {
      avgSystolic: Math.round(avgSystolic),
      avgDiastolic: Math.round(avgDiastolic),
      totalExerciseMinutes,
      totalMeals,
      medicationAdherence: Math.round(medicationAdherence),
      dataPoints,
    },
  }
}
