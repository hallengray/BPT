import { generateScheduledDoses, shouldRegenerateDoses } from '@/lib/medication-scheduler'
import { addDays } from 'date-fns'

describe('Medication Scheduler', () => {
  const userId = 'test-user-id'
  const medicationId = 'test-med-id'
  const startDate = new Date('2024-01-01T08:00:00')
  
  test('generates once_daily doses correctly', () => {
    const doses = generateScheduledDoses(
      medicationId,
      userId,
      'once_daily',
      ['08:00'],
      startDate,
      null,
      7
    )
    
    expect(doses.length).toBeGreaterThanOrEqual(7)
    expect(doses.length).toBeLessThanOrEqual(8) // May include boundary day
    expect(doses[0].scheduled_time).toContain('08:00')
    expect(doses[0].medication_log_id).toBe(medicationId)
    expect(doses[0].user_id).toBe(userId)
    expect(doses[0].was_taken).toBe(false)
  })
  
  test('generates twice_daily doses correctly', () => {
    const doses = generateScheduledDoses(
      medicationId,
      userId,
      'twice_daily',
      ['08:00', '20:00'],
      startDate,
      null,
      7
    )
    
    expect(doses.length).toBeGreaterThanOrEqual(14) // 7 days * 2 doses
    expect(doses.length).toBeLessThanOrEqual(16) // May include boundary day
    expect(doses[0].scheduled_time).toContain('08:00')
    expect(doses[1].scheduled_time).toContain('20:00')
  })
  
  test('generates three_times_daily doses correctly', () => {
    const doses = generateScheduledDoses(
      medicationId,
      userId,
      'three_times_daily',
      ['08:00', '14:00', '20:00'],
      startDate,
      null,
      7
    )
    
    expect(doses.length).toBeGreaterThanOrEqual(21) // 7 days * 3 doses
    expect(doses.length).toBeLessThanOrEqual(24) // May include boundary day
  })
  
  test('generates weekly doses correctly', () => {
    const doses = generateScheduledDoses(
      medicationId,
      userId,
      'weekly',
      ['08:00'],
      startDate,
      null,
      30
    )
    
    expect(doses.length).toBeGreaterThanOrEqual(4) // At least 4 weeks
    expect(doses.length).toBeLessThanOrEqual(5) // At most 5 weeks
  })
  
  test('respects end date', () => {
    const endDate = addDays(startDate, 3)
    const doses = generateScheduledDoses(
      medicationId,
      userId,
      'once_daily',
      ['08:00'],
      startDate,
      endDate,
      30
    )
    
    expect(doses.length).toBeGreaterThanOrEqual(3)
    expect(doses.length).toBeLessThanOrEqual(4) // May include boundary day
  })
  
  test('handles as_needed frequency (no scheduled doses)', () => {
    const doses = generateScheduledDoses(
      medicationId,
      userId,
      'as_needed',
      ['08:00'],
      startDate,
      null,
      7
    )
    
    expect(doses).toHaveLength(0)
  })
  
  test('shouldRegenerateDoses returns true when buffer low', () => {
    const existingDoses = [
      { scheduled_time: addDays(new Date(), 5).toISOString() }
    ]
    
    expect(shouldRegenerateDoses(existingDoses, 7)).toBe(true)
  })
  
  test('shouldRegenerateDoses returns false when buffer sufficient', () => {
    const existingDoses = [
      { scheduled_time: addDays(new Date(), 10).toISOString() }
    ]
    
    expect(shouldRegenerateDoses(existingDoses, 7)).toBe(false)
  })

  test('shouldRegenerateDoses returns true when no doses exist', () => {
    expect(shouldRegenerateDoses([], 7)).toBe(true)
  })

  test('generates doses with correct structure', () => {
    const doses = generateScheduledDoses(
      medicationId,
      userId,
      'once_daily',
      ['08:00'],
      startDate,
      null,
      1
    )
    
    expect(doses[0]).toMatchObject({
      medication_log_id: medicationId,
      user_id: userId,
      scheduled_time: expect.any(String),
      taken_at: null,
      was_taken: false,
      notes: null,
    })
  })
})

