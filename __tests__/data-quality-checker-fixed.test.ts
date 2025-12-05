import { 
  calculateDataQualityScore,
  findHighBPWithoutNotes,
  calculateLoggingStreak,
  findBPWithoutContext,
  getImprovementSuggestions
} from '@/lib/data-quality-checker'
import type { BloodPressureReading, UnifiedHealthData } from '@/types'

const createBPReading = (overrides: Partial<BloodPressureReading>): BloodPressureReading => ({
  id: 'test-id',
  systolic: 120,
  diastolic: 80,
  pulse: 70,
  measured_at: new Date().toISOString(),
  user_id: 'test',
  notes: null,
  created_at: new Date().toISOString(),
  updated_at: null,
  ...overrides,
})

describe('Data Quality Checker', () => {
  test('finds high BP readings without notes', () => {
    const readings: BloodPressureReading[] = [
      createBPReading({ id: '1', systolic: 145, diastolic: 95, measured_at: '2024-01-01T08:00:00Z' }),
      createBPReading({ id: '2', systolic: 130, diastolic: 85, measured_at: '2024-01-02T08:00:00Z', notes: 'feeling good' }),
      createBPReading({ id: '3', systolic: 150, diastolic: 100, measured_at: '2024-01-03T08:00:00Z', notes: '' }),
    ]
    
    const highBPWithoutNotes = findHighBPWithoutNotes(readings)
    
    expect(highBPWithoutNotes).toHaveLength(2)
    expect(highBPWithoutNotes[0].systolic).toBe(145)
    expect(highBPWithoutNotes[1].systolic).toBe(150)
  })

  test('requires at least 10 characters in notes', () => {
    const readings: BloodPressureReading[] = [
      createBPReading({ id: '1', systolic: 145, diastolic: 95, measured_at: '2024-01-01T08:00:00Z', notes: 'short' }),
      createBPReading({ id: '2', systolic: 145, diastolic: 95, measured_at: '2024-01-02T08:00:00Z', notes: 'This is a longer note' }),
    ]
    
    const highBPWithoutNotes = findHighBPWithoutNotes(readings)
    
    expect(highBPWithoutNotes).toHaveLength(1)
  })
  
  test('calculates quality score correctly', () => {
    const today = new Date()
    const healthData: UnifiedHealthData = {
      bloodPressure: Array(21).fill(null).map((_, i) => createBPReading({
        id: `bp-${i}`,
        measured_at: new Date(today.getTime() - i * 24 * 60 * 60 * 1000).toISOString(),
      })),
      diet: Array(42).fill(null).map((_, i) => ({
        id: `diet-${i}`,
        meal_type: 'breakfast',
        description: 'Meal',
        logged_at: new Date(today.getTime() - i * 12 * 60 * 60 * 1000).toISOString(),
        user_id: 'test',
        notes: null,
        created_at: new Date().toISOString(),
        updated_at: null,
        sodium_level: null,
        sodium_mg: null,
      })),
      exercise: Array(14).fill(null).map((_, i) => ({
        id: `ex-${i}`,
        activity_type: 'walking',
        duration_minutes: 30,
        intensity: 'moderate',
        logged_at: new Date(today.getTime() - i * 24 * 60 * 60 * 1000).toISOString(),
        user_id: 'test',
        notes: null,
        created_at: new Date().toISOString(),
        updated_at: null,
      })),
      medications: [],
      medicationDoses: Array(20).fill(null).map((_, i) => ({
        id: `dose-${i}`,
        medication_log_id: 'med-1',
        user_id: 'test',
        scheduled_time: new Date(today.getTime() - i * 12 * 60 * 60 * 1000).toISOString(),
        taken_at: new Date(today.getTime() - i * 12 * 60 * 60 * 1000).toISOString(),
        was_taken: true,
        notes: null,
        created_at: new Date().toISOString(),
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
      createBPReading({ id: '1', measured_at: today.toISOString() }),
      createBPReading({ id: '2', measured_at: new Date(today.getTime() - 24*60*60*1000).toISOString() }),
      createBPReading({ id: '3', measured_at: new Date(today.getTime() - 2*24*60*60*1000).toISOString() }),
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
      createBPReading({ id: '1', measured_at: '2024-01-01T08:00:00Z' }),
      createBPReading({ id: '2', measured_at: '2024-01-02T08:00:00Z' }),
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



