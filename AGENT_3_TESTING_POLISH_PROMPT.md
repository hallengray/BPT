# Agent 3: Testing, Accessibility & Performance

## Your Mission
Ensure the BPT app is production-ready through comprehensive testing, accessibility compliance, and performance optimization.

## Context
You're working on a Next.js 15 + React 19 healthcare app. Phases 1-3 are mostly complete. Your job is to test everything, ensure accessibility, and optimize performance.

**Your Tasks (3 todos):**
1. **Comprehensive Testing** - Test all new features
2. **Accessibility Audit** - WCAG 2.1 AA compliance
3. **Performance Optimization** - Memoization and loading states

---

## Task 1: Comprehensive Testing

### A. Test Medication Dose Generation

**File: `__tests__/medication-scheduler.test.ts` (NEW)**

Create test file:

```typescript
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
    
    expect(doses).toHaveLength(7)
    expect(doses[0].scheduled_time).toContain('08:00')
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
    
    expect(doses).toHaveLength(14) // 7 days * 2 doses
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
    
    expect(doses).toHaveLength(21) // 7 days * 3 doses
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
    
    expect(doses).toHaveLength(5) // ~4-5 weeks
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
    
    expect(doses.length).toBeLessThanOrEqual(3)
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
})
```

### B. Test Analytics Calculations

**File: `__tests__/analytics-utils.test.ts` (NEW)**

```typescript
import { 
  calculateBPTrend, 
  calculateWeekOverWeekComparison,
  calculatePearsonCorrelation 
} from '@/lib/analytics-utils'

describe('Analytics Utils', () => {
  describe('calculateBPTrend', () => {
    test('detects improving trend', () => {
      const readings = [
        { systolic: 140, measured_at: '2024-01-01' },
        { systolic: 138, measured_at: '2024-01-02' },
        { systolic: 136, measured_at: '2024-01-03' },
        { systolic: 134, measured_at: '2024-01-04' },
        { systolic: 132, measured_at: '2024-01-05' },
      ]
      
      const trend = calculateBPTrend(readings)
      
      expect(trend.direction).toBe('improving')
      expect(trend.slope).toBeLessThan(0)
      expect(trend.weeklyChange).toBeLessThan(-2)
    })
    
    test('detects worsening trend', () => {
      const readings = [
        { systolic: 130, measured_at: '2024-01-01' },
        { systolic: 132, measured_at: '2024-01-02' },
        { systolic: 134, measured_at: '2024-01-03' },
        { systolic: 136, measured_at: '2024-01-04' },
        { systolic: 138, measured_at: '2024-01-05' },
      ]
      
      const trend = calculateBPTrend(readings)
      
      expect(trend.direction).toBe('worsening')
      expect(trend.slope).toBeGreaterThan(0)
      expect(trend.weeklyChange).toBeGreaterThan(2)
    })
    
    test('detects stable trend', () => {
      const readings = [
        { systolic: 130, measured_at: '2024-01-01' },
        { systolic: 131, measured_at: '2024-01-02' },
        { systolic: 130, measured_at: '2024-01-03' },
        { systolic: 129, measured_at: '2024-01-04' },
        { systolic: 130, measured_at: '2024-01-05' },
      ]
      
      const trend = calculateBPTrend(readings)
      
      expect(trend.direction).toBe('stable')
      expect(Math.abs(trend.weeklyChange)).toBeLessThan(2)
    })
    
    test('returns low confidence with insufficient data', () => {
      const readings = [
        { systolic: 130, measured_at: '2024-01-01' },
        { systolic: 132, measured_at: '2024-01-02' },
      ]
      
      const trend = calculateBPTrend(readings)
      
      expect(trend.confidence).toBe('low')
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
      
      expect(Math.abs(correlation)).toBeLessThan(0.5)
    })
  })
})
```

### C. Test Data Quality Checker

**File: `__tests__/data-quality-checker.test.ts` (NEW)**

```typescript
import { 
  calculateDataQualityScore,
  findHighBPWithoutNotes,
  calculateLoggingStreak 
} from '@/lib/data-quality-checker'

describe('Data Quality Checker', () => {
  test('finds high BP readings without notes', () => {
    const readings = [
      { systolic: 145, diastolic: 95, notes: null },
      { systolic: 130, diastolic: 85, notes: 'feeling good' },
      { systolic: 150, diastolic: 100, notes: '' },
    ]
    
    const highBPWithoutNotes = findHighBPWithoutNotes(readings)
    
    expect(highBPWithoutNotes).toHaveLength(2)
  })
  
  test('calculates quality score correctly', () => {
    const healthData = {
      bloodPressure: Array(21).fill({ systolic: 130, diastolic: 85, measured_at: new Date().toISOString() }),
      diet: Array(42).fill({ logged_at: new Date().toISOString() }),
      exercise: Array(14).fill({ logged_at: new Date().toISOString() }),
      medications: [],
      medicationDoses: Array(20).fill({ was_taken: true, scheduled_time: new Date().toISOString() })
    }
    
    const score = calculateDataQualityScore(healthData, 21)
    
    expect(score.overall).toBeGreaterThan(70)
    expect(score.breakdown.bpLogging).toBe(100)
  })
  
  test('calculates streak correctly', () => {
    const today = new Date()
    const readings = [
      { measured_at: today.toISOString() },
      { measured_at: new Date(today.getTime() - 24*60*60*1000).toISOString() },
      { measured_at: new Date(today.getTime() - 2*24*60*60*1000).toISOString() },
    ]
    
    const streak = calculateLoggingStreak(readings)
    
    expect(streak.currentStreak).toBe(3)
  })
})
```

### D. Manual Testing Checklist

Create file: `TESTING_CHECKLIST.md`

```markdown
# Manual Testing Checklist

## Medication Adherence
- [ ] Create medication with once_daily frequency
- [ ] Verify 30 doses generated automatically
- [ ] Check doses appear in pending doses widget
- [ ] Mark dose as "Taken" - verify optimistic UI
- [ ] Mark dose as "Skip" - verify it's recorded
- [ ] Create medication with end date - verify doses stop
- [ ] Create weekly medication - verify correct schedule

## Data Quality
- [ ] Log BP ≥140/90 without notes - verify error message
- [ ] Log BP ≥140/90 with notes - verify success
- [ ] Check data completeness widget shows correct scores
- [ ] Verify contextual prompt appears after BP logging
- [ ] Dismiss contextual prompt - verify it doesn't reappear immediately

## Analytics
- [ ] View analytics page with 14+ days of data
- [ ] Verify trend analysis shows direction (improving/stable/worsening)
- [ ] Check correlation insights display
- [ ] Verify week-over-week comparison
- [ ] Test with insufficient data - verify graceful handling

## Dashboard
- [ ] Pending doses widget shows today's medications
- [ ] Data completeness card displays scores
- [ ] All widgets load without errors
- [ ] Loading states display correctly

## Accessibility
- [ ] Tab through all interactive elements
- [ ] Verify focus indicators visible
- [ ] Test with screen reader (NVDA/JAWS)
- [ ] Check color contrast (use DevTools)
- [ ] Verify ARIA labels present

## Performance
- [ ] Dashboard loads in <2 seconds
- [ ] Analytics page loads in <3 seconds
- [ ] No console errors
- [ ] No memory leaks (check DevTools)
```

---

## Task 2: Accessibility Audit

### A. Run Lighthouse Audit

```bash
# In Chrome DevTools:
# 1. Open DevTools (F12)
# 2. Go to Lighthouse tab
# 3. Select "Accessibility" category
# 4. Run audit
# 5. Fix all issues until score > 90
```

### B. Keyboard Navigation Testing

**File: `ACCESSIBILITY_AUDIT.md` (NEW)**

```markdown
# Accessibility Audit Report

## Keyboard Navigation
- [ ] All interactive elements reachable via Tab
- [ ] Tab order is logical (top to bottom, left to right)
- [ ] Focus indicators visible on all elements
- [ ] Escape key closes modals/dialogs
- [ ] Enter/Space activates buttons
- [ ] Arrow keys navigate within components (tabs, lists)

## Screen Reader Testing
- [ ] Page titles announced correctly
- [ ] Headings in logical order (H1 → H2 → H3)
- [ ] Form labels associated with inputs
- [ ] Error messages announced
- [ ] Success messages announced
- [ ] Loading states announced
- [ ] Dynamic content changes announced (aria-live)

## Color Contrast
- [ ] Normal text: 4.5:1 minimum
- [ ] Large text: 3:1 minimum
- [ ] Interactive elements: 3:1 minimum
- [ ] Use DevTools to check all text

## ARIA Labels
- [ ] Icon-only buttons have aria-label
- [ ] Form fields have aria-describedby for hints
- [ ] Error states have aria-invalid
- [ ] Loading states have aria-busy
- [ ] Dialogs have aria-modal

## Forms
- [ ] All inputs have labels
- [ ] Required fields marked with aria-required
- [ ] Error messages linked with aria-describedby
- [ ] Success messages announced
- [ ] Form submission feedback clear
```

### C. Fix Common Issues

**Update components with accessibility improvements:**

1. **Add ARIA labels to icon buttons:**
```typescript
<Button aria-label="Mark medication as taken">
  <Check className="h-4 w-4" />
</Button>
```

2. **Add aria-live regions for dynamic content:**
```typescript
<div aria-live="polite" aria-atomic="true">
  {successMessage}
</div>
```

3. **Ensure focus management in dialogs:**
```typescript
<Dialog onOpenChange={(open) => {
  if (open) {
    // Focus first interactive element
  }
}}>
```

4. **Add loading announcements:**
```typescript
<div role="status" aria-live="polite">
  {isLoading && <span className="sr-only">Loading...</span>}
</div>
```

---

## Task 3: Performance Optimization

### A. Add Memoization to Analytics

**File: `lib/analytics-utils.ts`**

Wrap expensive calculations:

```typescript
import { useMemo } from 'react'

// In components that use analytics:
const trend = useMemo(() => calculateBPTrend(readings), [readings])

const weekComparison = useMemo(
  () => calculateWeekOverWeekComparison(readings, exercise, diet),
  [readings, exercise, diet]
)
```

### B. Optimize Components with React.memo

**File: `components/charts/correlation-insights.tsx`**

```typescript
import { memo } from 'react'

const InsightCard = memo(function InsightCard({ insight }: InsightCardProps) {
  // component code
})

export const CorrelationInsights = memo(function CorrelationInsights({ insights }: Props) {
  // component code
})
```

**File: `components/medication/dose-quick-log.tsx`**

```typescript
const DoseItem = memo(function DoseItem({ dose, status, onTake, onSkip }: DoseItemProps) {
  // component code
}, (prevProps, nextProps) => {
  // Custom comparison
  return prevProps.dose.id === nextProps.dose.id && 
         prevProps.dose.was_taken === nextProps.dose.was_taken
})
```

### C. Add useCallback for Stable Functions

**File: `components/medication/dose-quick-log.tsx`**

```typescript
import { useCallback } from 'react'

const handleDoseAction = useCallback(async (dose: DoseWithMedication, wasTaken: boolean) => {
  // action code
}, []) // Dependencies
```

### D. Lazy Load Heavy Components

**File: `app/(dashboard)/analytics/page.tsx`**

```typescript
import dynamic from 'next/dynamic'

const AnalyticsContent = dynamic(() => import('./analytics-content'), {
  loading: () => <AnalyticsLoadingSkeleton />,
  ssr: false // If client-side only
})
```

### E. Add Loading States

Ensure all async components have loading states:

```typescript
<Suspense fallback={<LoadingSkeleton />}>
  <AsyncComponent />
</Suspense>
```

### F. Performance Testing

**File: `PERFORMANCE_AUDIT.md` (NEW)**

```markdown
# Performance Audit

## Core Web Vitals (Target)
- [ ] LCP (Largest Contentful Paint): < 2.5s
- [ ] FID (First Input Delay): < 100ms
- [ ] CLS (Cumulative Layout Shift): < 0.1

## Page Load Times
- [ ] Dashboard: < 2s
- [ ] Analytics: < 3s
- [ ] Log BP: < 1s
- [ ] Medications: < 2s

## Bundle Size
- [ ] Check bundle size: `npm run build`
- [ ] Main bundle < 200KB gzipped
- [ ] No duplicate dependencies

## Database Queries
- [ ] All queries use indexes (check EXPLAIN)
- [ ] No N+1 queries
- [ ] Parallel fetching where possible

## Optimization Checklist
- [ ] Images use Next.js Image component
- [ ] Heavy components lazy loaded
- [ ] Expensive calculations memoized
- [ ] Components use React.memo where appropriate
- [ ] Functions use useCallback where appropriate
- [ ] No unnecessary re-renders (use React DevTools Profiler)
```

---

## Quality Standards

### Testing
- ✅ Unit tests for all utility functions
- ✅ Integration tests for critical flows
- ✅ Manual testing checklist completed
- ✅ Edge cases handled
- ✅ Error scenarios tested

### Accessibility
- ✅ Lighthouse accessibility score > 90
- ✅ Keyboard navigation works perfectly
- ✅ Screen reader friendly
- ✅ Color contrast meets WCAG 2.1 AA
- ✅ ARIA labels on all interactive elements

### Performance
- ✅ Core Web Vitals meet targets
- ✅ No unnecessary re-renders
- ✅ Heavy calculations memoized
- ✅ Components optimized with memo/useCallback
- ✅ Loading states for all async operations

---

## MCP Tools Available

**@Context7** - Use for best practices:
```
@Context7 React testing library best practices
@Context7 Next.js 15 performance optimization
@Context7 WCAG 2.1 AA compliance checklist
```

**Check your work:**
```bash
npm run build          # TypeScript + build errors
npm run lint           # Linting errors
npm test              # Run test suite
npm run test:coverage # Check coverage
```

---

## File References

**Read for context:**
- `lib/medication-scheduler.ts` - Dose generation logic
- `lib/analytics-utils.ts` - Analytics calculations
- `lib/data-quality-checker.ts` - Data quality functions
- All component files in `components/`

**Files you'll create:**
1. `__tests__/medication-scheduler.test.ts`
2. `__tests__/analytics-utils.test.ts`
3. `__tests__/data-quality-checker.test.ts`
4. `TESTING_CHECKLIST.md`
5. `ACCESSIBILITY_AUDIT.md`
6. `PERFORMANCE_AUDIT.md`

**Files you'll modify:**
- Add `React.memo` to components
- Add `useMemo` for calculations
- Add `useCallback` for functions
- Add ARIA labels throughout
- Add loading states where missing

---

## Success Criteria

✅ All unit tests pass with >80% coverage
✅ Manual testing checklist 100% complete
✅ Lighthouse accessibility score > 90
✅ Keyboard navigation works perfectly
✅ Screen reader announces all content correctly
✅ Core Web Vitals meet targets (LCP < 2.5s, FID < 100ms, CLS < 0.1)
✅ No console errors or warnings
✅ No TypeScript or build errors
✅ Bundle size optimized
✅ All components have proper loading states

---

## Start Here

1. Set up testing framework (if not already done)
2. Write unit tests for medication-scheduler
3. Write unit tests for analytics-utils
4. Run manual testing checklist
5. Run Lighthouse accessibility audit
6. Fix all accessibility issues
7. Add memoization to expensive calculations
8. Add React.memo to components
9. Test performance with DevTools
10. Document all findings

Good luck! 🧪


