import type { MedicationFrequency, MedicationDoseInsert } from '@/types'
import { addDays, setHours, setMinutes, setSeconds, setMilliseconds, isBefore } from 'date-fns'

/**
 * Generate scheduled medication doses based on frequency and time of day
 * @param medicationId - UUID of the medication log
 * @param userId - UUID of the user
 * @param frequency - How often medication should be taken
 * @param timeOfDay - Array of time strings in HH:mm format
 * @param startDate - When to start generating doses
 * @param endDate - When to stop generating doses (null for ongoing)
 * @param daysToGenerate - Number of days to generate doses for (default 30)
 * @returns Array of medication dose inserts ready for database
 */
export function generateScheduledDoses(
  medicationId: string,
  userId: string,
  frequency: MedicationFrequency,
  timeOfDay: string[],
  startDate: Date,
  endDate: Date | null,
  daysToGenerate: number = 30
): MedicationDoseInsert[] {
  const doses: MedicationDoseInsert[] = []
  
  // Normalize start date to beginning of day
  const normalizedStartDate = setMilliseconds(
    setSeconds(setMinutes(setHours(startDate, 0), 0), 0),
    0
  )
  
  // Calculate end date for generation
  const generationEndDate = endDate && isBefore(endDate, addDays(normalizedStartDate, daysToGenerate))
    ? endDate
    : addDays(normalizedStartDate, daysToGenerate)

  // Generate doses based on frequency
  switch (frequency) {
    case 'once_daily':
    case 'twice_daily':
    case 'three_times_daily':
      doses.push(...generateDailyDoses(
        medicationId,
        userId,
        timeOfDay,
        normalizedStartDate,
        generationEndDate
      ))
      break

    case 'weekly':
      doses.push(...generateWeeklyDoses(
        medicationId,
        userId,
        timeOfDay,
        normalizedStartDate,
        generationEndDate
      ))
      break

    case 'as_needed':
      // As-needed medications don't get scheduled doses
      // They are logged manually when taken
      break

    case 'other':
      // Custom frequency - generate daily by default
      doses.push(...generateDailyDoses(
        medicationId,
        userId,
        timeOfDay,
        normalizedStartDate,
        generationEndDate
      ))
      break
  }

  return doses
}

/**
 * Generate daily doses for medications taken every day
 */
function generateDailyDoses(
  medicationId: string,
  userId: string,
  timeOfDay: string[],
  startDate: Date,
  endDate: Date
): MedicationDoseInsert[] {
  const doses: MedicationDoseInsert[] = []
  let currentDate = new Date(startDate)

  while (isBefore(currentDate, endDate) || currentDate.getTime() === endDate.getTime()) {
    // Generate a dose for each time of day
    for (const time of timeOfDay) {
      const scheduledTime = parseTimeString(time, currentDate)
      
      // Only include doses that are on or after the start date
      if (!isBefore(scheduledTime, startDate)) {
        doses.push({
          medication_log_id: medicationId,
          user_id: userId,
          scheduled_time: scheduledTime.toISOString(),
          taken_at: null,
          was_taken: false,
          notes: null,
        })
      }
    }

    currentDate = addDays(currentDate, 1)
  }

  return doses
}

/**
 * Generate weekly doses for medications taken once per week
 * Uses the day of week from the start date
 */
function generateWeeklyDoses(
  medicationId: string,
  userId: string,
  timeOfDay: string[],
  startDate: Date,
  endDate: Date
): MedicationDoseInsert[] {
  const doses: MedicationDoseInsert[] = []
  let currentDate = new Date(startDate)

  while (isBefore(currentDate, endDate) || currentDate.getTime() === endDate.getTime()) {
    // Generate a dose for each time of day on this weekly occurrence
    for (const time of timeOfDay) {
      const scheduledTime = parseTimeString(time, currentDate)
      
      if (!isBefore(scheduledTime, startDate)) {
        doses.push({
          medication_log_id: medicationId,
          user_id: userId,
          scheduled_time: scheduledTime.toISOString(),
          taken_at: null,
          was_taken: false,
          notes: null,
        })
      }
    }

    // Move to same day next week
    currentDate = addDays(currentDate, 7)
  }

  return doses
}

/**
 * Parse time string (HH:mm) and apply to a specific date
 */
function parseTimeString(timeString: string, date: Date): Date {
  const [hours, minutes] = timeString.split(':').map(Number)
  
  let result = setHours(date, hours)
  result = setMinutes(result, minutes)
  result = setSeconds(result, 0)
  result = setMilliseconds(result, 0)
  
  return result
}

/**
 * Regenerate doses for a medication
 * Useful when medication schedule is updated or doses are running low
 */
export function shouldRegenerateDoses(
  existingDoses: { scheduled_time: string }[],
  daysBuffer: number = 7
): boolean {
  if (existingDoses.length === 0) {
    return true
  }

  // Find the latest scheduled dose
  const latestDose = existingDoses.reduce((latest, dose) => {
    const doseDate = new Date(dose.scheduled_time)
    return doseDate > latest ? doseDate : latest
  }, new Date(existingDoses[0].scheduled_time))

  // Check if we need more doses (less than buffer days remaining)
  const bufferDate = addDays(new Date(), daysBuffer)
  
  return isBefore(latestDose, bufferDate)
}

/**
 * Calculate the number of expected doses per day based on frequency
 */
export function getExpectedDosesPerDay(frequency: MedicationFrequency): number {
  switch (frequency) {
    case 'once_daily':
      return 1
    case 'twice_daily':
      return 2
    case 'three_times_daily':
      return 3
    case 'weekly':
      return 1 / 7 // One dose per week
    case 'as_needed':
      return 0 // Variable, not scheduled
    case 'other':
      return 1 // Default to once daily
    default:
      return 1
  }
}

/**
 * Get user-friendly frequency label
 */
export function getFrequencyLabel(frequency: MedicationFrequency): string {
  switch (frequency) {
    case 'once_daily':
      return 'Once daily'
    case 'twice_daily':
      return 'Twice daily'
    case 'three_times_daily':
      return 'Three times daily'
    case 'weekly':
      return 'Weekly'
    case 'as_needed':
      return 'As needed'
    case 'other':
      return 'Custom schedule'
    default:
      return frequency
  }
}

