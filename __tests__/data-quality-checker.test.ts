import { 
  calculateDataQualityScore,
  findHighBPWithoutNotes,
  calculateLoggingStreak,
  findBPWithoutContext,
  getImprovementSuggestions
} from '@/lib/data-quality-checker'
import type { BloodPressureReading, UnifiedHealthData } from '@/types'

describe('Data Quality Checker', () => {
  test('finds high BP readings without notes', () => {
    const readings: BloodPressureReading[] = [
      { id: '1', systolic: 145, diastolic: 95, pulse: 70, measured_at: '2024-01-01T08:00:00Z', user_id: 'test', notes: null },
      { id: '2', systolic: 130, diastolic: 85, pulse: 70, measured_at: '2024-01-02T08:00:00Z', user_id: 'test', notes: 'feeling good' },
      { id: '3', systolic: 150, diastolic: 100, pulse: 75, measured_at: '2024-01-03T08:00:00Z', user_id: 'test', notes: '' },
    ]
    
    const highBPWithoutNotes = findHighBPWithoutNotes(readings)
    
    expect(highBPWithoutNotes).toHaveLength(2)
    expect(highBPWithoutNotes[0].systolic).toBe(145)
    expect(highBPWithoutNotes[1].systolic).toBe(150)
  })

  test('requires at least 10 characters in notes', () => {
    const readings: BloodPressureReading[] = [
      { id: '1', systolic: 145, diastolic: 95, pulse: 70, measured_at: '2024-01-01T08:00:00Z', user_id: 'test', notes: 'short' },
      { id: '2', systolic: 145, diastolic: 95, pulse: 70, measured_at: '2024-01-02T08:00:00Z', user_id: 'test', notes: 'This is a longer note' },
    ]
    
    const highBPWithoutNotes = findHighBPWithoutNotes(readings)
    
    expect(highBPWithoutNotes).toHaveLength(1)
  })
  
  test('calculates quality score correctly', () => {
    const today = new Date()
    const healthData: UnifiedHealthData = {
      bloodPressure: Array(21).fill(null).map((_, i) => ({
        id: `bp-${i}`,
        systolic: 130,
        diastolic: 85,
        pulse: 70,
        measured_at: new Date(today.getTime() - i * 24 * 60 * 60 * 1000).toISOString(),
        user_id: 'test',
        notes: null
      })),
      diet: Array(42).fill(null).map((_, i) => ({
        id: `diet-${i}`,
        meal_type: 'breakfast',
        description: 'Meal',
        logged_at: new Date(today.getTime() - i * 12 * 60 * 60 * 1000).toISOString(),
        user_id: 'test',
        notes: null
      })),
      exercise: Array(14).fill(null).map((_, i) => ({
        id: `ex-${i}`,
        type: 'walking',
        duration_minutes: 30,
        intensity: 'moderate',
        logged_at: new Date(today.getTime() - i * 24 * 60 * 60 * 1000).toISOString(),
        user_id: 'test',
        notes: null
      })),
      medications: [],
      medicationDoses: Array(20).fill(null).map((_, i) => ({
        id: `dose-${i}`,
        medication_log_id: 'med-1',
        user_id: 'test',
        scheduled_time: new Date(today.getTime() - i * 12 * 60 * 60 * 1000).toISOString(),
        taken_at: new Date(today.getTime() - i * 12 * 60 * 60 * 1000).toISOString(),
        was_taken: true,
        notes: null
      }))
    }
    
    const score = calculateDataQualityScore(healthData, 21)
    
    expect(score.overall).toBeGreaterThan(70)
    expect(score.breakdown.bpLogging).toBe(100)
    expect(score.breakdown.medicationAdherence).toBe(100)
  })
  
  test('calculates streak correctly', () => {
    const today = new Date()
    const readings: BloodPressureReading[] = [
      { id: '1', systolic: 130, diastolic: 80, pulse: 70, measured_at: today.toISOString(), user_id: 'test', notes: null },
      { id: '2', systolic: 130, diastolic: 80, pulse: 70, measured_at: new Date(today.getTime() - 24*60*60*1000).toISOString(), user_id: 'test', notes: null },
      { id: '3', systolic: 130, diastolic: 80, pulse: 70, measured_at: new Date(today.getTime() - 2*24*60*60*1000).toISOString(), user_id: 'test', notes: null },
    ]
    
    const streak = calculateLoggingStreak(readings)
    
    expect(streak.currentStreak).toBe(3)
    expect(streak.longestStreak).toBeGreaterThanOrEqual(3)
  })

  test('handles empty readings for streak', () => {
    const streak = calculateLoggingStreak([])
    
    expect(streak.currentStreak).toBe(0)
    expect(streak.longestStreak).toBe(0)
    expect(streak.lastLogDate).toBeNull()
  })

  test('finds BP without context', () => {
    const readings: BloodPressureReading[] = [
      { id: '1', systolic: 130, diastolic: 80, pulse: 70, measured_at: '2024-01-01T08:00:00Z', user_id: 'test', notes: null },
      { id: '2', systolic: 130, diastolic: 80, pulse: 70, measured_at: '2024-01-02T08:00:00Z', user_id: 'test', notes: null },
    ]

    const datesWithoutContext = findBPWithoutContext(readings, [], [])
    
    expect(datesWithoutContext).toHaveLength(2)
  })

  test('provides improvement suggestions', () => {
    const healthData: UnifiedHealthData = {
      bloodPressure: [],
      diet: [],
      exercise: [],
      medications: [],
      medicationDoses: []
    }

    const suggestions = getImprovementSuggestions(healthData, 21)
    
    expect(suggestions.length).toBeGreaterThan(0)
    expect(suggestions.some(s => s.includes('blood pressure'))).toBe(true)
  })
})

