import type { BloodPressureReading, DietLog, ExerciseLog, MedicationDose, CorrelationInsight, UnifiedHealthData } from '@/types'

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

  // Group BP readings by day with time tracking
  const bpByDay = new Map<string, { systolic: number; diastolic: number; count: number; readings: BloodPressureReading[] }>()
  bloodPressure.forEach((bp) => {
    const day = new Date(bp.measured_at).toISOString().split('T')[0]
    const existing = bpByDay.get(day) || { systolic: 0, diastolic: 0, count: 0, readings: [] }
    bpByDay.set(day, {
      systolic: existing.systolic + bp.systolic,
      diastolic: existing.diastolic + bp.diastolic,
      count: existing.count + 1,
      readings: [...existing.readings, bp],
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

  // Group exercise by day with time tracking
  const exerciseByDay = new Map<string, { minutes: number; sessions: ExerciseLog[] }>()
  exercise.forEach((ex) => {
    const day = new Date(ex.logged_at).toISOString().split('T')[0]
    const existing = exerciseByDay.get(day) || { minutes: 0, sessions: [] }
    exerciseByDay.set(day, {
      minutes: existing.minutes + ex.duration_minutes,
      sessions: [...existing.sessions, ex],
    })
  })

  // Find common days
  const commonDays = Array.from(avgBPByDay.keys()).filter((day) => exerciseByDay.has(day))

  if (commonDays.length < 3) {
    return { correlation: 0, insight: null }
  }

  // Calculate correlation
  const bpValues = commonDays.map((day) => avgBPByDay.get(day)!)
  const exerciseValues = commonDays.map((day) => exerciseByDay.get(day)!.minutes)

  const correlation = calculatePearsonCorrelation(bpValues, exerciseValues)

  // ENHANCEMENT 1: Rest Day Analysis
  const daysWithExercise = Array.from(exerciseByDay.keys())
  const allDays = Array.from(bpByDay.keys())
  const restDays = allDays.filter((day) => !daysWithExercise.includes(day))
  
  let restDayDiff = 0
  if (restDays.length >= 2 && daysWithExercise.length >= 2) {
    const restDayBP = restDays.map((day) => avgBPByDay.get(day)!).filter(Boolean)
    const exerciseDayBP = daysWithExercise.map((day) => avgBPByDay.get(day)!).filter(Boolean)
    
    if (restDayBP.length > 0 && exerciseDayBP.length > 0) {
      const avgRestDayBP = restDayBP.reduce((a, b) => a + b, 0) / restDayBP.length
      const avgExerciseDayBP = exerciseDayBP.reduce((a, b) => a + b, 0) / exerciseDayBP.length
      restDayDiff = avgRestDayBP - avgExerciseDayBP
    }
  }

  // ENHANCEMENT 2: Before/After Exercise Analysis
  let afterExerciseElevation = 0
  let afterExerciseCount = 0
  
  exerciseByDay.forEach((exData, day) => {
    const dayBP = bpByDay.get(day)
    if (dayBP) {
      exData.sessions.forEach((ex) => {
        const exTime = new Date(ex.logged_at).getTime()
        // Find BP readings within 4 hours after exercise
        const afterReadings = dayBP.readings.filter((bp) => {
          const bpTime = new Date(bp.measured_at).getTime()
          const hoursDiff = (bpTime - exTime) / (1000 * 60 * 60)
          return hoursDiff > 0 && hoursDiff <= 4
        })
        
        if (afterReadings.length > 0) {
          afterExerciseCount += afterReadings.length
          afterReadings.forEach((bp) => {
            const avgDayBP = dayBP.systolic / dayBP.count
            afterExerciseElevation += bp.systolic - avgDayBP
          })
        }
      })
    }
  })

  const avgAfterExerciseElevation = afterExerciseCount > 0 
    ? afterExerciseElevation / afterExerciseCount 
    : 0

  // ENHANCEMENT 3: Optimal Exercise Timing
  const timingAnalysis = new Map<string, { count: number; totalBPDiff: number }>()
  exerciseByDay.forEach((exData, day) => {
    const dayBP = bpByDay.get(day)
    if (dayBP) {
      const avgDayBP = (dayBP.systolic / dayBP.count)
      
      exData.sessions.forEach((ex) => {
        const hour = new Date(ex.logged_at).getHours()
        let timeOfDay = 'morning'
        if (hour >= 12 && hour < 17) timeOfDay = 'afternoon'
        else if (hour >= 17) timeOfDay = 'evening'
        
        const existing = timingAnalysis.get(timeOfDay) || { count: 0, totalBPDiff: 0 }
        timingAnalysis.set(timeOfDay, {
          count: existing.count + 1,
          totalBPDiff: existing.totalBPDiff + avgDayBP,
        })
      })
    }
  })

  let bestTiming = ''
  let bestTimingBP = Infinity
  timingAnalysis.forEach((data, time) => {
    const avgBP = data.totalBPDiff / data.count
    if (data.count >= 2 && avgBP < bestTimingBP) {
      bestTimingBP = avgBP
      bestTiming = time
    }
  })

  // Generate enhanced insight
  let insight: CorrelationInsight | null = null
  const avgExercise = exerciseValues.reduce((a, b) => a + b, 0) / exerciseValues.length

  if (restDayDiff > 5) {
    insight = {
      type: 'positive',
      title: 'Exercise Significantly Lowers Blood Pressure',
      description: `Your BP is typically ${Math.round(restDayDiff)} points higher on rest days compared to exercise days. Try to stay active even on rest days with light activity like walking.`,
      confidence: 'high',
      metric: restDayDiff,
    }
  } else if (Math.abs(correlation) > 0.3) {
    if (correlation < -0.3) {
      const timingNote = bestTiming ? ` ${bestTiming.charAt(0).toUpperCase() + bestTiming.slice(1)} exercise appears most effective for you.` : ''
      insight = {
        type: 'positive',
        title: 'Exercise Reduces Blood Pressure',
        description: `Your data shows exercise is associated with lower blood pressure. On days with ${Math.round(avgExercise)} minutes of exercise, your BP tends to be lower.${timingNote}`,
        confidence: Math.abs(correlation) > 0.6 ? 'high' : 'medium',
        metric: Math.abs(correlation) * 100,
      }
    } else if (correlation > 0.3 && avgAfterExerciseElevation > 3) {
      insight = {
        type: 'neutral',
        title: 'Exercise Timing May Matter',
        description: `Your BP readings show a temporary elevation of ${Math.round(avgAfterExerciseElevation)} mmHg within 4 hours after exercise, which is normal. Consider measuring BP before exercise or several hours after for more accurate baseline readings.`,
        confidence: 'medium',
        metric: avgAfterExerciseElevation,
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

  // ENHANCEMENT 1: Meal Type Analysis
  const mealTypeAnalysis = new Map<string, { count: number; totalBP: number }>()
  const mealsPerDay = new Map<string, DietLog[]>()
  
  diet.forEach((d) => {
    const day = new Date(d.logged_at).toISOString().split('T')[0]
    const existing = mealsPerDay.get(day) || []
    mealsPerDay.set(day, [...existing, d])
    
    // Analyze meal type impact
    if (d.meal_type) {
      const dayBP = avgSystolicByDay.get(day)
      if (dayBP) {
        const existing = mealTypeAnalysis.get(d.meal_type) || { count: 0, totalBP: 0 }
        mealTypeAnalysis.set(d.meal_type, {
          count: existing.count + 1,
          totalBP: existing.totalBP + dayBP,
        })
      }
    }
  })

  // ENHANCEMENT 2: Sodium Level Correlation
  // Note: sodium_level field not yet implemented in database schema
  const nextDayBPAfterHighSodium: number[] = []
  const nextDayBPAfterLowSodium: number[] = []
  
  // TODO: Uncomment when sodium_level is added to diet_logs table
  // const sortedDays = Array.from(mealsPerDay.keys()).sort()
  // sortedDays.forEach((day, index) => {
  //   const meals = mealsPerDay.get(day)!
  //   const highSodiumMeals = meals.filter((m) => m.sodium_level === 'high')
  //   const lowSodiumMeals = meals.filter((m) => m.sodium_level === 'low')
  //   
  //   // Check next day BP
  //   if (index < sortedDays.length - 1) {
  //     const nextDay = sortedDays[index + 1]
  //     const nextDayBP = avgSystolicByDay.get(nextDay)
  //     
  //     if (nextDayBP) {
  //       if (highSodiumMeals.length > 0) {
  //         nextDayBPAfterHighSodium.push(nextDayBP)
  //       }
  //       if (lowSodiumMeals.length > 0 && highSodiumMeals.length === 0) {
  //         nextDayBPAfterLowSodium.push(nextDayBP)
  //       }
  //     }
  //   }
  // })

  const avgBPAfterHighSodium = nextDayBPAfterHighSodium.length > 0
    ? nextDayBPAfterHighSodium.reduce((a, b) => a + b, 0) / nextDayBPAfterHighSodium.length
    : 0
  const avgBPAfterLowSodium = nextDayBPAfterLowSodium.length > 0
    ? nextDayBPAfterLowSodium.reduce((a, b) => a + b, 0) / nextDayBPAfterLowSodium.length
    : 0
  const sodiumDiff = avgBPAfterHighSodium - avgBPAfterLowSodium

  // ENHANCEMENT 3: Meal Timing Effects
  const morningMealBP: number[] = []
  const eveningMealBP: number[] = []
  
  mealsPerDay.forEach((meals, day) => {
    const dayBP = avgSystolicByDay.get(day)
    if (dayBP) {
      meals.forEach((meal) => {
        const hour = new Date(meal.logged_at).getHours()
        if (hour >= 5 && hour < 12) {
          morningMealBP.push(dayBP)
        } else if (hour >= 18) {
          eveningMealBP.push(dayBP)
        }
      })
    }
  })

  const avgMorningBP = morningMealBP.length > 0
    ? morningMealBP.reduce((a, b) => a + b, 0) / morningMealBP.length
    : 0
  const avgEveningBP = eveningMealBP.length > 0
    ? eveningMealBP.reduce((a, b) => a + b, 0) / eveningMealBP.length
    : 0

  // Find common days
  const commonDays = Array.from(avgSystolicByDay.keys()).filter((day) => mealsPerDay.has(day))

  if (commonDays.length < 3) {
    return { correlation: 0, insight: null }
  }

  // Calculate correlation
  const bpValues = commonDays.map((day) => avgSystolicByDay.get(day)!)
  const mealCounts = commonDays.map((day) => mealsPerDay.get(day)!.length)

  const correlation = calculatePearsonCorrelation(bpValues, mealCounts)

  // Generate enhanced insight
  let insight: CorrelationInsight | null = null
  const avgMeals = mealCounts.reduce((a, b) => a + b, 0) / mealCounts.length

  // Prioritize sodium insight
  if (sodiumDiff > 5 && nextDayBPAfterHighSodium.length >= 2 && nextDayBPAfterLowSodium.length >= 2) {
    insight = {
      type: 'negative',
      title: 'High-Sodium Meals Increase Blood Pressure',
      description: `Your BP is typically ${Math.round(sodiumDiff)} mmHg higher the day after high-sodium meals. Try to reduce sodium intake, especially in evening meals.`,
      confidence: sodiumDiff > 10 ? 'high' : 'medium',
      metric: sodiumDiff,
    }
  } else if (avgEveningBP > avgMorningBP + 5 && eveningMealBP.length >= 3 && morningMealBP.length >= 3) {
    insight = {
      type: 'neutral',
      title: 'Evening Meal Timing May Affect BP',
      description: `Your BP tends to be ${Math.round(avgEveningBP - avgMorningBP)} mmHg higher on days with late evening meals. Consider eating dinner earlier when possible.`,
      confidence: 'medium',
      metric: avgEveningBP - avgMorningBP,
    }
  } else if (mealTypeAnalysis.size >= 2) {
    // Find meal type with best BP
    let bestMealType = ''
    let bestMealBP = Infinity
    mealTypeAnalysis.forEach((data, type) => {
      if (data.count >= 2) {
        const avgBP = data.totalBP / data.count
        if (avgBP < bestMealBP) {
          bestMealBP = avgBP
          bestMealType = type
        }
      }
    })
    
    if (bestMealType) {
      insight = {
        type: 'neutral',
        title: 'Meal Pattern Insights',
        description: `You log an average of ${avgMeals.toFixed(1)} meals per day. Your ${bestMealType} meals are associated with better BP readings. Consider noting sodium content for more detailed insights.`,
        confidence: 'medium',
        metric: avgMeals,
      }
    }
  } else if (Math.abs(correlation) > 0.25) {
    if (correlation > 0.25) {
      insight = {
        type: 'neutral',
        title: 'Diet Logging Patterns Detected',
        description: `You log an average of ${avgMeals.toFixed(1)} meals per day. Consistent tracking helps identify patterns. Consider noting sodium content in your meals.`,
        confidence: 'medium',
        metric: avgMeals,
      }
    }
  }

  return { correlation, insight }
}

/**
 * Calculate the impact of rest days (no exercise) on blood pressure
 * Compares BP on days with exercise vs days without exercise
 */
export function calculateRestDayImpact(
  bloodPressure: BloodPressureReading[],
  exercise: ExerciseLog[]
): CorrelationInsight | null {
  if (bloodPressure.length < 7 || exercise.length < 3) {
    return null
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

  // Identify days with exercise
  const exerciseDays = new Set<string>()
  exercise.forEach((ex) => {
    const day = new Date(ex.logged_at).toISOString().split('T')[0]
    exerciseDays.add(day)
  })

  // Separate BP readings into exercise days and rest days
  const exerciseDayBP: number[] = []
  const restDayBP: number[] = []

  bpByDay.forEach((value, day) => {
    const avgSystolic = value.systolic / value.count
    if (exerciseDays.has(day)) {
      exerciseDayBP.push(avgSystolic)
    } else {
      restDayBP.push(avgSystolic)
    }
  })

  // Need at least 2 days of each type
  if (exerciseDayBP.length < 2 || restDayBP.length < 2) {
    return null
  }

  // Calculate averages
  const avgExerciseDayBP = exerciseDayBP.reduce((a, b) => a + b, 0) / exerciseDayBP.length
  const avgRestDayBP = restDayBP.reduce((a, b) => a + b, 0) / restDayBP.length
  const difference = avgRestDayBP - avgExerciseDayBP

  // Only return insight if difference is significant (>5 mmHg)
  if (Math.abs(difference) < 5) {
    return null
  }

  if (difference > 5) {
    return {
      type: 'positive',
      title: 'Rest Days Show Higher Blood Pressure',
      description: `Your BP is typically ${Math.round(difference)} mmHg higher on rest days compared to exercise days. Try light activity like walking even on rest days to maintain healthy BP levels.`,
      confidence: difference > 10 ? 'high' : 'medium',
      metric: difference,
    }
  } else if (difference < -5) {
    return {
      type: 'neutral',
      title: 'Rest Days May Help Recovery',
      description: `Your BP is ${Math.round(Math.abs(difference))} mmHg lower on rest days. This could indicate good recovery. Ensure you're not overtraining.`,
      confidence: 'medium',
      metric: Math.abs(difference),
    }
  }

  return null
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

/**
 * Calculate BP trend using linear regression
 * Returns slope (mmHg per day), direction, and confidence
 */
export function calculateBPTrend(readings: BloodPressureReading[]): {
  slope: number
  direction: 'improving' | 'stable' | 'worsening'
  weeklyChange: number
  confidence: 'high' | 'medium' | 'low'
  projectedChange30Days: number
} {
  if (readings.length < 5) {
    return {
      slope: 0,
      direction: 'stable',
      weeklyChange: 0,
      confidence: 'low',
      projectedChange30Days: 0,
    }
  }

  // Sort readings by date
  const sortedReadings = [...readings].sort(
    (a, b) => new Date(a.measured_at).getTime() - new Date(b.measured_at).getTime()
  )

  // Convert dates to days since first reading
  const firstDate = new Date(sortedReadings[0].measured_at).getTime()
  const x = sortedReadings.map((r) => {
    const daysSinceFirst = (new Date(r.measured_at).getTime() - firstDate) / (1000 * 60 * 60 * 24)
    return daysSinceFirst
  })

  // Use systolic values
  const y = sortedReadings.map((r) => r.systolic)

  // Calculate linear regression
  const n = x.length
  const sumX = x.reduce((a, b) => a + b, 0)
  const sumY = y.reduce((a, b) => a + b, 0)
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0)
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0)

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const weeklyChange = slope * 7
  const projectedChange30Days = slope * 30

  // Determine direction (significant if >2 mmHg per week)
  let direction: 'improving' | 'stable' | 'worsening'
  if (weeklyChange < -2) {
    direction = 'improving'
  } else if (weeklyChange > 2) {
    direction = 'worsening'
  } else {
    direction = 'stable'
  }

  // Calculate R² for confidence
  const meanY = sumY / n
  const ssTotal = y.reduce((sum, yi) => sum + Math.pow(yi - meanY, 2), 0)
  const yPredicted = x.map((xi) => {
    const intercept = (sumY - slope * sumX) / n
    return slope * xi + intercept
  })
  const ssResidual = y.reduce((sum, yi, i) => sum + Math.pow(yi - yPredicted[i], 2), 0)
  const rSquared = 1 - ssResidual / ssTotal

  // Determine confidence based on R² and number of readings
  let confidence: 'high' | 'medium' | 'low'
  if (rSquared > 0.7 && n >= 14) {
    confidence = 'high'
  } else if (rSquared > 0.4 && n >= 7) {
    confidence = 'medium'
  } else {
    confidence = 'low'
  }

  return {
    slope,
    direction,
    weeklyChange,
    confidence,
    projectedChange30Days,
  }
}

/**
 * Calculate week-over-week comparison
 */
export function calculateWeekOverWeekComparison(
  readings: BloodPressureReading[],
  exercise: ExerciseLog[],
  diet: DietLog[]
): {
  thisWeek: {
    avgSystolic: number
    avgDiastolic: number
    avgPulse: number
    exerciseMinutes: number
    mealCount: number
    readingCount: number
  }
  lastWeek: {
    avgSystolic: number
    avgDiastolic: number
    avgPulse: number
    exerciseMinutes: number
    mealCount: number
    readingCount: number
  }
  changes: {
    systolic: number
    diastolic: number
    pulse: number
    exercise: number
    meals: number
    readings: number
  }
} {
  const now = new Date()
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

  // Filter data for this week
  const thisWeekBP = readings.filter((r) => new Date(r.measured_at) >= oneWeekAgo)
  const thisWeekExercise = exercise.filter((e) => new Date(e.logged_at) >= oneWeekAgo)
  const thisWeekDiet = diet.filter((d) => new Date(d.logged_at) >= oneWeekAgo)

  // Filter data for last week
  const lastWeekBP = readings.filter(
    (r) => new Date(r.measured_at) >= twoWeeksAgo && new Date(r.measured_at) < oneWeekAgo
  )
  const lastWeekExercise = exercise.filter(
    (e) => new Date(e.logged_at) >= twoWeeksAgo && new Date(e.logged_at) < oneWeekAgo
  )
  const lastWeekDiet = diet.filter(
    (d) => new Date(d.logged_at) >= twoWeeksAgo && new Date(d.logged_at) < oneWeekAgo
  )

  // Calculate this week stats
  const thisWeek = {
    avgSystolic:
      thisWeekBP.length > 0
        ? Math.round(thisWeekBP.reduce((sum, r) => sum + r.systolic, 0) / thisWeekBP.length)
        : 0,
    avgDiastolic:
      thisWeekBP.length > 0
        ? Math.round(thisWeekBP.reduce((sum, r) => sum + r.diastolic, 0) / thisWeekBP.length)
        : 0,
    avgPulse:
      thisWeekBP.length > 0
        ? Math.round(thisWeekBP.reduce((sum, r) => sum + r.pulse, 0) / thisWeekBP.length)
        : 0,
    exerciseMinutes: thisWeekExercise.reduce((sum, e) => sum + e.duration_minutes, 0),
    mealCount: thisWeekDiet.length,
    readingCount: thisWeekBP.length,
  }

  // Calculate last week stats
  const lastWeek = {
    avgSystolic:
      lastWeekBP.length > 0
        ? Math.round(lastWeekBP.reduce((sum, r) => sum + r.systolic, 0) / lastWeekBP.length)
        : 0,
    avgDiastolic:
      lastWeekBP.length > 0
        ? Math.round(lastWeekBP.reduce((sum, r) => sum + r.diastolic, 0) / lastWeekBP.length)
        : 0,
    avgPulse:
      lastWeekBP.length > 0
        ? Math.round(lastWeekBP.reduce((sum, r) => sum + r.pulse, 0) / lastWeekBP.length)
        : 0,
    exerciseMinutes: lastWeekExercise.reduce((sum, e) => sum + e.duration_minutes, 0),
    mealCount: lastWeekDiet.length,
    readingCount: lastWeekBP.length,
  }

  // Calculate changes
  const changes = {
    systolic: thisWeek.avgSystolic - lastWeek.avgSystolic,
    diastolic: thisWeek.avgDiastolic - lastWeek.avgDiastolic,
    pulse: thisWeek.avgPulse - lastWeek.avgPulse,
    exercise: thisWeek.exerciseMinutes - lastWeek.exerciseMinutes,
    meals: thisWeek.mealCount - lastWeek.mealCount,
    readings: thisWeek.readingCount - lastWeek.readingCount,
  }

  return { thisWeek, lastWeek, changes }
}

/**
 * Generate predictive insights based on historical health data patterns
 * Uses existing correlation data to predict future outcomes
 */
export function generatePredictiveInsights(
  healthData: UnifiedHealthData
): CorrelationInsight[] {
  const insights: CorrelationInsight[] = []
  const { bloodPressure, exercise, diet, medicationDoses } = healthData

  // Need sufficient data for predictions
  if (bloodPressure.length < 7) {
    return insights
  }

  // 1. EXERCISE IMPACT PREDICTION
  const exerciseCorr = calculateExerciseBPCorrelation(bloodPressure, exercise)
  const restDayImpact = calculateRestDayImpact(bloodPressure, exercise)
  
  if (restDayImpact && restDayImpact.metric && restDayImpact.metric > 5) {
    insights.push({
      type: 'negative',
      title: 'Prediction: Skipping Exercise Raises BP',
      description: `Based on your patterns, skipping exercise for a full week could raise your BP by approximately ${Math.round(restDayImpact.metric * 1.5)} mmHg. Maintain regular activity to keep BP in check.`,
      confidence: restDayImpact.confidence,
      metric: restDayImpact.metric * 1.5,
    })
  } else if (exerciseCorr.correlation < -0.4 && exercise.length >= 5) {
    const avgExerciseMinutes = exercise.reduce((sum, ex) => sum + ex.duration_minutes, 0) / exercise.length
    insights.push({
      type: 'positive',
      title: 'Prediction: Consistent Exercise Improves BP',
      description: `Your data shows strong exercise benefits. Maintaining ${Math.round(avgExerciseMinutes)} minutes of daily exercise could lower your BP by 5-10 mmHg over the next month.`,
      confidence: 'high',
      metric: avgExerciseMinutes,
    })
  }

  // 2. MEDICATION TIMING PREDICTION
  if (medicationDoses.length >= 7) {
    // Group doses by time of day
    const morningDoses = medicationDoses.filter((d) => {
      const hour = new Date(d.scheduled_time).getHours()
      return hour >= 6 && hour < 12
    })

    const morningAdherence = morningDoses.filter((d) => d.was_taken).length / Math.max(morningDoses.length, 1)

    if (morningAdherence < 0.7 && morningDoses.length >= 3) {
      // Analyze BP on days with missed morning meds
      const bpByDay = new Map<string, number[]>()
      bloodPressure.forEach((bp) => {
        const day = new Date(bp.measured_at).toISOString().split('T')[0]
        const existing = bpByDay.get(day) || []
        bpByDay.set(day, [...existing, bp.systolic])
      })

      const missedMorningDays = morningDoses
        .filter((d) => !d.was_taken)
        .map((d) => new Date(d.scheduled_time).toISOString().split('T')[0])

      const bpOnMissedDays: number[] = []
      missedMorningDays.forEach((day) => {
        const dayBP = bpByDay.get(day)
        if (dayBP && dayBP.length > 0) {
          bpOnMissedDays.push(...dayBP)
        }
      })

      if (bpOnMissedDays.length >= 2) {
        const avgMissedDayBP = bpOnMissedDays.reduce((a, b) => a + b, 0) / bpOnMissedDays.length
        const overallAvgBP = bloodPressure.reduce((sum, bp) => sum + bp.systolic, 0) / bloodPressure.length
        const difference = avgMissedDayBP - overallAvgBP

        if (difference > 3) {
          insights.push({
            type: 'negative',
            title: 'Prediction: Missing Morning Meds Raises Evening BP',
            description: `Skipping morning medication raises your BP by approximately ${Math.round(difference)} mmHg. Set a daily alarm to improve adherence and maintain stable BP levels.`,
            confidence: difference > 8 ? 'high' : 'medium',
            metric: difference,
          })
        }
      }
    }
  }

  // 3. SODIUM IMPACT PREDICTION
  // Look for sodium-related keywords in meal descriptions and notes
  const sodiumKeywords = ['sodium', 'salt', 'salty', 'soy sauce', 'processed', 'canned', 'fast food']
  const highSodiumMeals = diet.filter((d) => {
    const text = `${d.description} ${d.notes || ''}`.toLowerCase()
    return sodiumKeywords.some(keyword => text.includes(keyword))
  })
  
  if (highSodiumMeals.length >= 3 && bloodPressure.length >= 7) {
    const bpByDay = new Map<string, number>()
    bloodPressure.forEach((bp) => {
      const day = new Date(bp.measured_at).toISOString().split('T')[0]
      const existing = bpByDay.get(day)
      if (!existing || bp.systolic > existing) {
        bpByDay.set(day, bp.systolic)
      }
    })

    const nextDayBP: number[] = []
    const sortedDays = Array.from(bpByDay.keys()).sort()
    
    highSodiumMeals.forEach((meal) => {
      const mealDay = new Date(meal.logged_at).toISOString().split('T')[0]
      const mealDayIndex = sortedDays.indexOf(mealDay)
      if (mealDayIndex >= 0 && mealDayIndex < sortedDays.length - 1) {
        const nextDay = sortedDays[mealDayIndex + 1]
        const nextDayBPValue = bpByDay.get(nextDay)
        if (nextDayBPValue) {
          nextDayBP.push(nextDayBPValue)
        }
      }
    })

    if (nextDayBP.length >= 2) {
      const avgNextDayBP = nextDayBP.reduce((a, b) => a + b, 0) / nextDayBP.length
      const overallAvgBP = Array.from(bpByDay.values()).reduce((a, b) => a + b, 0) / bpByDay.size
      const sodiumImpact = avgNextDayBP - overallAvgBP

      if (sodiumImpact > 5) {
        insights.push({
          type: 'negative',
          title: 'Prediction: High-Sodium Meals Increase Next-Day BP',
          description: `High-sodium meals increase your BP by approximately ${Math.round(sodiumImpact)} mmHg the next day. Reducing sodium intake could lower your average BP by 5-10 mmHg over time.`,
          confidence: sodiumImpact > 10 ? 'high' : 'medium',
          metric: sodiumImpact,
        })
      }
    }
  }

  // 4. TREND-BASED PREDICTION
  const trend = calculateBPTrend(bloodPressure)
  if (trend.direction !== 'stable' && Math.abs(trend.weeklyChange) > 2) {
    const thirtyDayChange = trend.projectedChange30Days
    const currentAvgBP = bloodPressure.reduce((sum, bp) => sum + bp.systolic, 0) / bloodPressure.length
    const projected30DayBP = currentAvgBP + thirtyDayChange

    if (trend.direction === 'improving') {
      insights.push({
        type: 'positive',
        title: 'Prediction: BP Trending Downward',
        description: `Your BP is improving by ${Math.abs(trend.weeklyChange).toFixed(1)} mmHg per week. At this rate, your BP could reach ${Math.round(projected30DayBP)} mmHg in 30 days. Keep up your current lifestyle!`,
        confidence: trend.confidence,
        metric: thirtyDayChange,
      })
    } else if (trend.direction === 'worsening') {
      insights.push({
        type: 'negative',
        title: 'Prediction: BP Trending Upward',
        description: `Your BP is increasing by ${trend.weeklyChange.toFixed(1)} mmHg per week. Without changes, it could reach ${Math.round(projected30DayBP)} mmHg in 30 days. Review your diet, exercise, and medication adherence.`,
        confidence: trend.confidence,
        metric: thirtyDayChange,
      })
    }
  }

  // 5. ADHERENCE IMPACT PREDICTION
  if (medicationDoses.length >= 14) {
    // Calculate adherence by day
    const adherenceByDay = new Map<string, { taken: number; total: number }>()
    medicationDoses.forEach((dose) => {
      const day = new Date(dose.scheduled_time).toISOString().split('T')[0]
      const existing = adherenceByDay.get(day) || { taken: 0, total: 0 }
      adherenceByDay.set(day, {
        taken: existing.taken + (dose.was_taken ? 1 : 0),
        total: existing.total + 1,
      })
    })

    // Calculate BP on high adherence days (>80%) vs low adherence days (<80%)
    const highAdherenceBP: number[] = []
    const lowAdherenceBP: number[] = []

    const bpByDay = new Map<string, number[]>()
    bloodPressure.forEach((bp) => {
      const day = new Date(bp.measured_at).toISOString().split('T')[0]
      const existing = bpByDay.get(day) || []
      bpByDay.set(day, [...existing, bp.systolic])
    })

    adherenceByDay.forEach((adherence, day) => {
      const adherencePercent = (adherence.taken / adherence.total) * 100
      const dayBP = bpByDay.get(day)
      
      if (dayBP && dayBP.length > 0) {
        const avgDayBP = dayBP.reduce((a, b) => a + b, 0) / dayBP.length
        if (adherencePercent > 80) {
          highAdherenceBP.push(avgDayBP)
        } else {
          lowAdherenceBP.push(avgDayBP)
        }
      }
    })

    if (highAdherenceBP.length >= 3 && lowAdherenceBP.length >= 2) {
      const avgHighAdherenceBP = highAdherenceBP.reduce((a, b) => a + b, 0) / highAdherenceBP.length
      const avgLowAdherenceBP = lowAdherenceBP.reduce((a, b) => a + b, 0) / lowAdherenceBP.length
      const adherenceImpact = avgLowAdherenceBP - avgHighAdherenceBP

      if (adherenceImpact > 5) {
        const overallAdherence = (medicationDoses.filter((d) => d.was_taken).length / medicationDoses.length) * 100
        insights.push({
          type: overallAdherence > 80 ? 'positive' : 'negative',
          title: 'Prediction: Adherence Directly Affects BP',
          description: `Days with >80% medication adherence show ${Math.round(adherenceImpact)} mmHg lower BP. Improving adherence to 95%+ could significantly improve your BP control.`,
          confidence: adherenceImpact > 10 ? 'high' : 'medium',
          metric: adherenceImpact,
        })
      }
    }
  }

  return insights
}



