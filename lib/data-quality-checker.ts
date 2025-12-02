import type {
  BloodPressureReading,
  DietLog,
  ExerciseLog,
  MedicationDose,
  UnifiedHealthData,
} from '@/types'
import { differenceInDays, startOfDay, parseISO } from 'date-fns'

/**
 * Find high BP readings without notes
 */
export function findHighBPWithoutNotes(
  readings: BloodPressureReading[]
): BloodPressureReading[] {
  return readings.filter((reading) => {
    const isHigh = reading.systolic >= 140 || reading.diastolic >= 90
    const hasNotes = reading.notes && reading.notes.trim().length >= 10
    return isHigh && !hasNotes
  })
}

/**
 * Find BP readings without same-day context (diet or exercise)
 */
export function findBPWithoutContext(
  readings: BloodPressureReading[],
  diet: DietLog[],
  exercise: ExerciseLog[]
): Date[] {
  const datesWithoutContext: Date[] = []

  readings.forEach((reading) => {
    const readingDate = startOfDay(parseISO(reading.measured_at))

    const hasDiet = diet.some((d) => {
      const dietDate = startOfDay(parseISO(d.logged_at))
      return dietDate.getTime() === readingDate.getTime()
    })

    const hasExercise = exercise.some((e) => {
      const exerciseDate = startOfDay(parseISO(e.logged_at))
      return exerciseDate.getTime() === readingDate.getTime()
    })

    if (!hasDiet && !hasExercise) {
      datesWithoutContext.push(readingDate)
    }
  })

  return datesWithoutContext
}

/**
 * Find missed medication doses
 */
export function findMissedMedications(doses: MedicationDose[]): MedicationDose[] {
  const now = new Date()

  return doses.filter((dose) => {
    const scheduledTime = parseISO(dose.scheduled_time)
    const isPast = scheduledTime < now
    const notTaken = !dose.was_taken

    return isPast && notTaken
  })
}

/**
 * Calculate data quality score (0-100)
 */
export function calculateDataQualityScore(
  healthData: UnifiedHealthData,
  days: number = 21
): {
  overall: number
  breakdown: {
    bpLogging: number
    exerciseLogging: number
    dietLogging: number
    medicationAdherence: number
    bpContextNotes: number
  }
} {
  const { bloodPressure, diet, exercise, medicationDoses } = healthData

  // Calculate BP logging score (days with at least one reading)
  const uniqueBPDays = new Set(
    bloodPressure.map((bp) => startOfDay(parseISO(bp.measured_at)).toISOString())
  )
  const bpLoggingScore = Math.min(100, (uniqueBPDays.size / days) * 100)

  // Calculate exercise logging score
  const uniqueExerciseDays = new Set(
    exercise.map((ex) => startOfDay(parseISO(ex.logged_at)).toISOString())
  )
  const exerciseLoggingScore = Math.min(100, (uniqueExerciseDays.size / days) * 100)

  // Calculate diet logging score (aim for 3 meals/day)
  const dietLoggingScore = Math.min(100, (diet.length / (days * 3)) * 100)

  // Calculate medication adherence
  const totalDoses = medicationDoses.length
  const takenDoses = medicationDoses.filter((d) => d.was_taken).length
  const medicationAdherenceScore = totalDoses > 0 ? (takenDoses / totalDoses) * 100 : 100

  // Calculate BP context notes score (high readings with notes)
  const highBPReadings = bloodPressure.filter(
    (bp) => bp.systolic >= 140 || bp.diastolic >= 90
  )
  const highBPWithNotes = highBPReadings.filter(
    (bp) => bp.notes && bp.notes.trim().length >= 10
  )
  const bpContextNotesScore =
    highBPReadings.length > 0 ? (highBPWithNotes.length / highBPReadings.length) * 100 : 100

  // Weighted overall score
  const overall = Math.round(
    bpLoggingScore * 0.3 +
      exerciseLoggingScore * 0.2 +
      dietLoggingScore * 0.2 +
      medicationAdherenceScore * 0.2 +
      bpContextNotesScore * 0.1
  )

  return {
    overall,
    breakdown: {
      bpLogging: Math.round(bpLoggingScore),
      exerciseLogging: Math.round(exerciseLoggingScore),
      dietLogging: Math.round(dietLoggingScore),
      medicationAdherence: Math.round(medicationAdherenceScore),
      bpContextNotes: Math.round(bpContextNotesScore),
    },
  }
}

/**
 * Get data completeness for specific time period
 */
export function getDataCompleteness(
  healthData: UnifiedHealthData,
  days: number = 21
): {
  bpDays: number
  exerciseDays: number
  dietDays: number
  totalDays: number
  bpPercentage: number
  exercisePercentage: number
  dietPercentage: number
} {
  const { bloodPressure, diet, exercise } = healthData

  const uniqueBPDays = new Set(
    bloodPressure.map((bp) => startOfDay(parseISO(bp.measured_at)).toISOString())
  ).size

  const uniqueExerciseDays = new Set(
    exercise.map((ex) => startOfDay(parseISO(ex.logged_at)).toISOString())
  ).size

  const uniqueDietDays = new Set(
    diet.map((d) => startOfDay(parseISO(d.logged_at)).toISOString())
  ).size

  return {
    bpDays: uniqueBPDays,
    exerciseDays: uniqueExerciseDays,
    dietDays: uniqueDietDays,
    totalDays: days,
    bpPercentage: Math.round((uniqueBPDays / days) * 100),
    exercisePercentage: Math.round((uniqueExerciseDays / days) * 100),
    dietPercentage: Math.round((uniqueDietDays / days) * 100),
  }
}

/**
 * Get improvement suggestions based on data quality
 */
export function getImprovementSuggestions(
  healthData: UnifiedHealthData,
  days: number = 21
): string[] {
  const suggestions: string[] = []
  const completeness = getDataCompleteness(healthData, days)
  const qualityScore = calculateDataQualityScore(healthData, days)

  // BP logging suggestions
  if (completeness.bpPercentage < 70) {
    suggestions.push(
      `Log your blood pressure more consistently. You've logged ${completeness.bpDays} out of ${days} days (${completeness.bpPercentage}%). Aim for daily readings.`
    )
  }

  // Exercise suggestions
  if (completeness.exercisePercentage < 50) {
    suggestions.push(
      `Track your exercise regularly. You've logged ${completeness.exerciseDays} out of ${days} days. Regular activity tracking helps identify BP patterns.`
    )
  }

  // Diet suggestions
  if (completeness.dietPercentage < 50) {
    suggestions.push(
      `Log your meals more frequently. You've logged ${completeness.dietDays} days of meals. Try to log at least 2-3 meals per day.`
    )
  }

  // Medication adherence
  if (qualityScore.breakdown.medicationAdherence < 80) {
    suggestions.push(
      `Improve medication adherence (currently ${qualityScore.breakdown.medicationAdherence}%). Consistent medication use is crucial for BP control.`
    )
  }

  // High BP notes
  if (qualityScore.breakdown.bpContextNotes < 90) {
    suggestions.push(
      'Add notes to high BP readings (≥140/90) to help identify triggers and patterns.'
    )
  }

  // Context logging
  const datesWithoutContext = findBPWithoutContext(
    healthData.bloodPressure,
    healthData.diet,
    healthData.exercise
  )
  if (datesWithoutContext.length > days * 0.3) {
    suggestions.push(
      'Add context to your BP readings by logging diet and exercise on the same day.'
    )
  }

  return suggestions
}

/**
 * Calculate logging streak
 */
export function calculateLoggingStreak(readings: BloodPressureReading[]): {
  currentStreak: number
  longestStreak: number
  lastLogDate: Date | null
} {
  if (readings.length === 0) {
    return { currentStreak: 0, longestStreak: 0, lastLogDate: null }
  }

  // Sort readings by date (newest first)
  const sortedReadings = [...readings].sort(
    (a, b) => parseISO(b.measured_at).getTime() - parseISO(a.measured_at).getTime()
  )

  // Get unique days with readings
  const uniqueDays = Array.from(
    new Set(sortedReadings.map((r) => startOfDay(parseISO(r.measured_at)).toISOString()))
  ).map((dateStr) => parseISO(dateStr))

  // Calculate current streak
  let currentStreak = 0
  const today = startOfDay(new Date())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  // Check if there's a reading today or yesterday (1 day grace period)
  const hasRecentReading =
    uniqueDays[0].getTime() === today.getTime() ||
    uniqueDays[0].getTime() === yesterday.getTime()

  if (hasRecentReading) {
    currentStreak = 1
    let checkDate = new Date(uniqueDays[0])
    checkDate.setDate(checkDate.getDate() - 1)

    for (let i = 1; i < uniqueDays.length; i++) {
      if (uniqueDays[i].getTime() === checkDate.getTime()) {
        currentStreak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        break
      }
    }
  }

  // Calculate longest streak
  let longestStreak = 0
  let tempStreak = 1

  for (let i = 0; i < uniqueDays.length - 1; i++) {
    const dayDiff = differenceInDays(uniqueDays[i], uniqueDays[i + 1])

    if (dayDiff === 1) {
      tempStreak++
      longestStreak = Math.max(longestStreak, tempStreak)
    } else {
      tempStreak = 1
    }
  }

  longestStreak = Math.max(longestStreak, tempStreak, currentStreak)

  return {
    currentStreak,
    longestStreak,
    lastLogDate: parseISO(sortedReadings[0].measured_at),
  }
}

