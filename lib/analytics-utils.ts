import type { BloodPressureReading, DietLog, ExerciseLog, MedicationDose, CorrelationInsight } from '@/types'

/**
 * Calculate correlation between exercise and blood pressure
 * Returns correlation coefficient and insights
 */
export function calculateExerciseBPCorrelation(
  bloodPressure: BloodPressureReading[],
  exercise: ExerciseLog[]
): {
  correlation: number
  insight: CorrelationInsight | null
} {
  if (bloodPressure.length < 5 || exercise.length < 3) {
    return { correlation: 0, insight: null }
  }

  // Group BP readings by day
  const bpByDay = new Map<string, { systolic: number; diastolic: number; count: number }>()
  bloodPressure.forEach((bp) => {
    const day = new Date(bp.measured_at).toISOString().split('T')[0]
    const existing = bpByDay.get(day) || { systolic: 0, diastolic: 0, count: 0 }
    bpByDay.set(day, {
      systolic: existing.systolic + bp.systolic,
      diastolic: existing.diastolic + bp.diastolic,
      count: existing.count + 1,
    })
  })

  // Calculate average BP per day
  const avgBPByDay = new Map<string, number>()
  bpByDay.forEach((value, day) => {
    const avgSystolic = value.systolic / value.count
    const avgDiastolic = value.diastolic / value.count
    // Mean arterial pressure approximation
    const map = avgDiastolic + (avgSystolic - avgDiastolic) / 3
    avgBPByDay.set(day, map)
  })

  // Group exercise by day (total minutes)
  const exerciseByDay = new Map<string, number>()
  exercise.forEach((ex) => {
    const day = new Date(ex.logged_at).toISOString().split('T')[0]
    const existing = exerciseByDay.get(day) || 0
    exerciseByDay.set(day, existing + ex.duration_minutes)
  })

  // Find common days
  const commonDays = Array.from(avgBPByDay.keys()).filter((day) => exerciseByDay.has(day))

  if (commonDays.length < 3) {
    return { correlation: 0, insight: null }
  }

  // Calculate correlation
  const bpValues = commonDays.map((day) => avgBPByDay.get(day)!)
  const exerciseValues = commonDays.map((day) => exerciseByDay.get(day)!)

  const correlation = calculatePearsonCorrelation(bpValues, exerciseValues)

  // Generate insight
  let insight: CorrelationInsight | null = null
  if (Math.abs(correlation) > 0.3) {
    const avgExercise = exerciseValues.reduce((a, b) => a + b, 0) / exerciseValues.length

    if (correlation < -0.3) {
      insight = {
        type: 'positive',
        title: 'Exercise Reduces Blood Pressure',
        description: `Your data shows exercise is associated with lower blood pressure. On days with ${Math.round(avgExercise)} minutes of exercise, your BP tends to be lower.`,
        confidence: Math.abs(correlation) > 0.6 ? 'high' : 'medium',
        metric: Math.abs(correlation),
      }
    } else if (correlation > 0.3) {
      insight = {
        type: 'neutral',
        title: 'Exercise Timing May Matter',
        description:
          'Your BP readings after exercise show temporary elevation, which is normal. Consider measuring BP before exercise or several hours after.',
        confidence: 'medium',
        metric: correlation,
      }
    }
  }

  return { correlation, insight }
}

/**
 * Calculate correlation between diet patterns and blood pressure
 */
export function calculateDietBPCorrelation(
  bloodPressure: BloodPressureReading[],
  diet: DietLog[]
): {
  correlation: number
  insight: CorrelationInsight | null
} {
  if (bloodPressure.length < 5 || diet.length < 5) {
    return { correlation: 0, insight: null }
  }

  // Group BP readings by day
  const bpByDay = new Map<string, { systolic: number; diastolic: number; count: number }>()
  bloodPressure.forEach((bp) => {
    const day = new Date(bp.measured_at).toISOString().split('T')[0]
    const existing = bpByDay.get(day) || { systolic: 0, diastolic: 0, count: 0 }
    bpByDay.set(day, {
      systolic: existing.systolic + bp.systolic,
      diastolic: existing.diastolic + bp.diastolic,
      count: existing.count + 1,
    })
  })

  // Calculate average systolic BP per day
  const avgSystolicByDay = new Map<string, number>()
  bpByDay.forEach((value, day) => {
    avgSystolicByDay.set(day, value.systolic / value.count)
  })

  // Count meals per day
  const mealsPerDay = new Map<string, number>()
  diet.forEach((d) => {
    const day = new Date(d.logged_at).toISOString().split('T')[0]
    mealsPerDay.set(day, (mealsPerDay.get(day) || 0) + 1)
  })

  // Find common days
  const commonDays = Array.from(avgSystolicByDay.keys()).filter((day) => mealsPerDay.has(day))

  if (commonDays.length < 3) {
    return { correlation: 0, insight: null }
  }

  // Calculate correlation
  const bpValues = commonDays.map((day) => avgSystolicByDay.get(day)!)
  const mealCounts = commonDays.map((day) => mealsPerDay.get(day)!)

  const correlation = calculatePearsonCorrelation(bpValues, mealCounts)

  // Generate insight
  let insight: CorrelationInsight | null = null
  const avgMeals = mealCounts.reduce((a, b) => a + b, 0) / mealCounts.length

  if (Math.abs(correlation) > 0.25) {
    if (correlation > 0.25) {
      insight = {
        type: 'neutral',
        title: 'Diet Logging Patterns Detected',
        description: `You log an average of ${avgMeals.toFixed(1)} meals per day. Consistent tracking helps identify patterns. Consider noting sodium content in your meals.`,
        confidence: 'medium',
        metric: correlation,
      }
    }
  }

  return { correlation, insight }
}

/**
 * Calculate correlation between medication adherence and blood pressure
 */
export function calculateMedicationBPCorrelation(
  bloodPressure: BloodPressureReading[],
  medicationDoses: MedicationDose[]
): {
  correlation: number
  insight: CorrelationInsight | null
} {
  if (bloodPressure.length < 5 || medicationDoses.length < 5) {
    return { correlation: 0, insight: null }
  }

  // Group BP readings by day
  const bpByDay = new Map<string, { systolic: number; diastolic: number; count: number }>()
  bloodPressure.forEach((bp) => {
    const day = new Date(bp.measured_at).toISOString().split('T')[0]
    const existing = bpByDay.get(day) || { systolic: 0, diastolic: 0, count: 0 }
    bpByDay.set(day, {
      systolic: existing.systolic + bp.systolic,
      diastolic: existing.diastolic + bp.diastolic,
      count: existing.count + 1,
    })
  })

  // Calculate average systolic BP per day
  const avgSystolicByDay = new Map<string, number>()
  bpByDay.forEach((value, day) => {
    avgSystolicByDay.set(day, value.systolic / value.count)
  })

  // Calculate medication adherence per day (percentage of doses taken)
  const adherenceByDay = new Map<string, { taken: number; total: number }>()
  medicationDoses.forEach((dose) => {
    const day = new Date(dose.scheduled_time).toISOString().split('T')[0]
    const existing = adherenceByDay.get(day) || { taken: 0, total: 0 }
    adherenceByDay.set(day, {
      taken: existing.taken + (dose.was_taken ? 1 : 0),
      total: existing.total + 1,
    })
  })

  // Calculate adherence percentage per day
  const adherencePercentByDay = new Map<string, number>()
  adherenceByDay.forEach((value, day) => {
    adherencePercentByDay.set(day, (value.taken / value.total) * 100)
  })

  // Find common days
  const commonDays = Array.from(avgSystolicByDay.keys()).filter((day) =>
    adherencePercentByDay.has(day)
  )

  if (commonDays.length < 3) {
    return { correlation: 0, insight: null }
  }

  // Calculate correlation
  const bpValues = commonDays.map((day) => avgSystolicByDay.get(day)!)
  const adherenceValues = commonDays.map((day) => adherencePercentByDay.get(day)!)

  const correlation = calculatePearsonCorrelation(bpValues, adherenceValues)

  // Generate insight
  let insight: CorrelationInsight | null = null
  const avgAdherence = adherenceValues.reduce((a, b) => a + b, 0) / adherenceValues.length
  const totalDoses = Array.from(adherenceByDay.values()).reduce((sum, v) => sum + v.total, 0)
  const takenDoses = Array.from(adherenceByDay.values()).reduce((sum, v) => sum + v.taken, 0)

  if (Math.abs(correlation) > 0.3) {
    if (correlation < -0.3) {
      insight = {
        type: 'positive',
        title: 'Medication Adherence Helps',
        description: `Your data shows ${avgAdherence.toFixed(0)}% medication adherence is associated with better blood pressure control. Keep up the great work!`,
        confidence: Math.abs(correlation) > 0.6 ? 'high' : 'medium',
        metric: avgAdherence,
      }
    } else if (correlation > 0.3) {
      insight = {
        type: 'neutral',
        title: 'Medication Effectiveness',
        description: `You've taken ${takenDoses} of ${totalDoses} doses. If your BP isn't improving as expected, consult your doctor about dosage or timing adjustments.`,
        confidence: 'medium',
        metric: avgAdherence,
      }
    }
  } else if (avgAdherence < 80) {
    insight = {
      type: 'negative',
      title: 'Improve Medication Adherence',
      description: `Your adherence rate is ${avgAdherence.toFixed(0)}%. Consistent medication use is crucial for blood pressure control. Set reminders to help.`,
      confidence: 'high',
      metric: avgAdherence,
    }
  }

  return { correlation, insight }
}

/**
 * Helper function to calculate Pearson correlation coefficient
 */
export function calculatePearsonCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) {
    return 0
  }

  const n = x.length
  const sumX = x.reduce((a, b) => a + b, 0)
  const sumY = y.reduce((a, b) => a + b, 0)
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0)
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0)
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0)

  const numerator = n * sumXY - sumX * sumY
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY))

  if (denominator === 0) {
    return 0
  }

  return numerator / denominator
}

