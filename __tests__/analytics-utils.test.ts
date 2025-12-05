import { 
  calculateBPTrend, 
  calculateWeekOverWeekComparison,
  calculatePearsonCorrelation 
} from '@/lib/analytics-utils'
import type { BloodPressureReading, ExerciseLog, DietLog } from '@/types'

// Helper to create test BP reading with all required fields (kept for future use)
// const createBPReading = (overrides: Partial<BloodPressureReading>): BloodPressureReading => ({
//   id: 'test-id',
//   systolic: 120,
//   diastolic: 80,
//   pulse: 70,
//   measured_at: new Date().toISOString(),
//   user_id: 'test',
//   notes: null,
//   created_at: new Date().toISOString(),
//   updated_at: new Date().toISOString(),
//   ...overrides,
// })

// Helper to create test diet log with all required fields (kept for future use)
// const createDietLog = (overrides: Partial<DietLog>): DietLog => ({
//   id: 'test-id',
//   meal_type: 'breakfast',
//   description: 'Test meal',
//   logged_at: new Date().toISOString(),
//   user_id: 'test',
//   notes: null,
//   created_at: new Date().toISOString(),
//   updated_at: new Date().toISOString(),
//   sodium_level: null,
//   sodium_mg: null,
//   ...overrides,
// })

describe('Analytics Utils', () => {
  describe('calculateBPTrend', () => {
    test('detects improving trend', () => {
      const readings: BloodPressureReading[] = [
        { id: '1', systolic: 140, diastolic: 90, pulse: 70, measured_at: '2024-01-01T08:00:00Z', user_id: 'test', notes: null, created_at: '2024-01-01T08:00:00Z', updated_at: null },
        { id: '2', systolic: 138, diastolic: 88, pulse: 70, measured_at: '2024-01-02T08:00:00Z', user_id: 'test', notes: null, created_at: '2024-01-02T08:00:00Z', updated_at: null },
        { id: '3', systolic: 136, diastolic: 86, pulse: 70, measured_at: '2024-01-03T08:00:00Z', user_id: 'test', notes: null, created_at: '2024-01-03T08:00:00Z', updated_at: null },
        { id: '4', systolic: 134, diastolic: 84, pulse: 70, measured_at: '2024-01-04T08:00:00Z', user_id: 'test', notes: null, created_at: '2024-01-04T08:00:00Z', updated_at: null },
        { id: '5', systolic: 132, diastolic: 82, pulse: 70, measured_at: '2024-01-05T08:00:00Z', user_id: 'test', notes: null, created_at: '2024-01-05T08:00:00Z', updated_at: null },
      ]
      
      const trend = calculateBPTrend(readings)
      
      expect(trend.direction).toBe('improving')
      expect(trend.slope).toBeLessThan(0)
      expect(trend.weeklyChange).toBeLessThan(-2)
    })
    
    test('detects worsening trend', () => {
      const readings: BloodPressureReading[] = [
        { id: '1', systolic: 130, diastolic: 80, pulse: 70, measured_at: '2024-01-01T08:00:00Z', user_id: 'test', notes: null, created_at: '2024-01-01T08:00:00Z', updated_at: null },
        { id: '2', systolic: 132, diastolic: 82, pulse: 70, measured_at: '2024-01-02T08:00:00Z', user_id: 'test', notes: null, created_at: '2024-01-02T08:00:00Z', updated_at: null },
        { id: '3', systolic: 134, diastolic: 84, pulse: 70, measured_at: '2024-01-03T08:00:00Z', user_id: 'test', notes: null, created_at: '2024-01-03T08:00:00Z', updated_at: null },
        { id: '4', systolic: 136, diastolic: 86, pulse: 70, measured_at: '2024-01-04T08:00:00Z', user_id: 'test', notes: null, created_at: '2024-01-04T08:00:00Z', updated_at: null },
        { id: '5', systolic: 138, diastolic: 88, pulse: 70, measured_at: '2024-01-05T08:00:00Z', user_id: 'test', notes: null, created_at: '2024-01-05T08:00:00Z', updated_at: null },
      ]
      
      const trend = calculateBPTrend(readings)
      
      expect(trend.direction).toBe('worsening')
      expect(trend.slope).toBeGreaterThan(0)
      expect(trend.weeklyChange).toBeGreaterThan(2)
    })
    
    test('detects stable trend', () => {
      const readings: BloodPressureReading[] = [
        { id: '1', systolic: 130, diastolic: 80, pulse: 70, measured_at: '2024-01-01T08:00:00Z', user_id: 'test', notes: null, created_at: '2024-01-01T08:00:00Z', updated_at: null },
        { id: '2', systolic: 131, diastolic: 81, pulse: 70, measured_at: '2024-01-02T08:00:00Z', user_id: 'test', notes: null, created_at: '2024-01-02T08:00:00Z', updated_at: null },
        { id: '3', systolic: 130, diastolic: 80, pulse: 70, measured_at: '2024-01-03T08:00:00Z', user_id: 'test', notes: null, created_at: '2024-01-03T08:00:00Z', updated_at: null },
        { id: '4', systolic: 129, diastolic: 79, pulse: 70, measured_at: '2024-01-04T08:00:00Z', user_id: 'test', notes: null, created_at: '2024-01-04T08:00:00Z', updated_at: null },
        { id: '5', systolic: 130, diastolic: 80, pulse: 70, measured_at: '2024-01-05T08:00:00Z', user_id: 'test', notes: null, created_at: '2024-01-05T08:00:00Z', updated_at: null },
      ]
      
      const trend = calculateBPTrend(readings)
      
      expect(trend.direction).toBe('stable')
      expect(Math.abs(trend.weeklyChange)).toBeLessThan(2)
    })
    
    test('returns low confidence with insufficient data', () => {
      const readings: BloodPressureReading[] = [
        { id: '1', systolic: 130, diastolic: 80, pulse: 70, measured_at: '2024-01-01T08:00:00Z', user_id: 'test', notes: null, created_at: '2024-01-01T08:00:00Z', updated_at: null },
        { id: '2', systolic: 132, diastolic: 82, pulse: 70, measured_at: '2024-01-02T08:00:00Z', user_id: 'test', notes: null, created_at: '2024-01-02T08:00:00Z', updated_at: null },
      ]
      
      const trend = calculateBPTrend(readings)
      
      expect(trend.confidence).toBe('low')
    })

    test('handles empty array', () => {
      const trend = calculateBPTrend([])
      
      expect(trend.direction).toBe('stable')
      expect(trend.confidence).toBe('low')
      expect(trend.slope).toBe(0)
    })
  })
  
  describe('calculatePearsonCorrelation', () => {
    test('calculates perfect positive correlation', () => {
      const x = [1, 2, 3, 4, 5]
      const y = [2, 4, 6, 8, 10]
      
      const correlation = calculatePearsonCorrelation(x, y)
      
      expect(correlation).toBeCloseTo(1, 2)
    })
    
    test('calculates perfect negative correlation', () => {
      const x = [1, 2, 3, 4, 5]
      const y = [10, 8, 6, 4, 2]
      
      const correlation = calculatePearsonCorrelation(x, y)
      
      expect(correlation).toBeCloseTo(-1, 2)
    })
    
    test('calculates no correlation', () => {
      const x = [1, 2, 3, 4, 5]
      const y = [3, 1, 4, 2, 5]
      
      const correlation = calculatePearsonCorrelation(x, y)
      
      expect(Math.abs(correlation)).toBeLessThanOrEqual(0.6) // Low correlation
    })

    test('handles empty arrays', () => {
      expect(calculatePearsonCorrelation([], [])).toBe(0)
    })

    test('handles mismatched array lengths', () => {
      expect(calculatePearsonCorrelation([1, 2, 3], [1, 2])).toBe(0)
    })

    test('handles zero variance', () => {
      const x = [1, 1, 1, 1, 1]
      const y = [2, 3, 4, 5, 6]
      
      expect(calculatePearsonCorrelation(x, y)).toBe(0)
    })
  })

  describe('calculateWeekOverWeekComparison', () => {
    const now = new Date()
    const thisWeekDate = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
    const lastWeekDate = new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000) // 9 days ago

    test('calculates this week vs last week correctly', () => {
      const readings: BloodPressureReading[] = [
        { id: '1', systolic: 130, diastolic: 80, pulse: 70, measured_at: thisWeekDate.toISOString(), user_id: 'test', notes: null, created_at: thisWeekDate.toISOString(), updated_at: null },
        { id: '2', systolic: 140, diastolic: 90, pulse: 75, measured_at: lastWeekDate.toISOString(), user_id: 'test', notes: null, created_at: lastWeekDate.toISOString(), updated_at: null },
      ]

      const exercise: ExerciseLog[] = [
        { id: '1', activity_type: 'running', duration_minutes: 30, intensity: 'moderate', logged_at: thisWeekDate.toISOString(), user_id: 'test', notes: null, created_at: thisWeekDate.toISOString(), updated_at: null },
        { id: '2', activity_type: 'walking', duration_minutes: 20, intensity: 'light', logged_at: lastWeekDate.toISOString(), user_id: 'test', notes: null, created_at: lastWeekDate.toISOString(), updated_at: null },
      ]

      const diet: DietLog[] = [
        { id: '1', meal_type: 'breakfast', description: 'Oatmeal', logged_at: thisWeekDate.toISOString(), user_id: 'test', notes: null, created_at: thisWeekDate.toISOString(), updated_at: null, sodium_level: null, sodium_mg: null },
        { id: '2', meal_type: 'lunch', description: 'Salad', logged_at: lastWeekDate.toISOString(), user_id: 'test', notes: null, created_at: lastWeekDate.toISOString(), updated_at: null, sodium_level: null, sodium_mg: null },
      ]

      const comparison = calculateWeekOverWeekComparison(readings, exercise, diet)

      expect(comparison.thisWeek.avgSystolic).toBe(130)
      expect(comparison.lastWeek.avgSystolic).toBe(140)
      expect(comparison.changes.systolic).toBe(-10)
      expect(comparison.thisWeek.exerciseMinutes).toBe(30)
      expect(comparison.lastWeek.exerciseMinutes).toBe(20)
    })

    test('handles no data gracefully', () => {
      const comparison = calculateWeekOverWeekComparison([], [], [])

      expect(comparison.thisWeek.avgSystolic).toBe(0)
      expect(comparison.lastWeek.avgSystolic).toBe(0)
      expect(comparison.changes.systolic).toBe(0)
    })
  })
})

