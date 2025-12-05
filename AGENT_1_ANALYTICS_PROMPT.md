# Agent 1: Advanced Analytics & Predictive Insights

## Your Mission
Complete the advanced analytics features for the BPT (Blood Pressure Tracker) app, focusing on enhanced correlations, predictive insights, and analytics UI updates.

## Context
You're working on a Next.js 15 + React 19 healthcare app. Phase 1 (Medication Adherence) and Phase 2 (Data Quality) are COMPLETE. Your job is to finish Phase 3 (Advanced Analytics).

**Already Implemented:**
- ✅ BP trend analysis with linear regression (`calculateBPTrend`)
- ✅ Week-over-week comparison (`calculateWeekOverWeekComparison`)
- ✅ Basic correlation functions for exercise, diet, and medication

**Your Tasks (3 todos):**
1. **Enhanced Correlations** - Improve existing correlation analysis
2. **Predictive Insights** - Generate pattern-based predictions
3. **Analytics UI Updates** - Display new analytics in user interface

---

## Task 1: Enhanced Correlation Analysis

### File: `lib/analytics-utils.ts`

**Update `calculateExerciseBPCorrelation()` (lines 7-87):**

Add these enhancements:
```typescript
// 1. Rest Day Analysis
// Compare BP on days WITH exercise vs days WITHOUT exercise
// Calculate average BP difference

// 2. Before/After Exercise Analysis
// Find BP readings within 4 hours after exercise
// Show if BP temporarily elevates (normal) or reduces

// 3. Optimal Exercise Timing
// Identify which time of day exercise has best BP impact
```

**Update `calculateDietBPCorrelation()` (lines 92-158):**

Add these enhancements:
```typescript
// 1. Meal Type Analysis
// Compare breakfast vs lunch vs dinner impact on BP
// Use meal_type field from diet_logs

// 2. Sodium Level Correlation
// Use new sodium_level field (low/medium/high/unknown)
// Calculate correlation between high-sodium meals and next-day BP

// 3. Meal Timing Effects
// Morning meals vs evening meals impact
```

**Create NEW function `calculateRestDayImpact()`:**

```typescript
export function calculateRestDayImpact(
  bloodPressure: BloodPressureReading[],
  exercise: ExerciseLog[]
): CorrelationInsight | null {
  // 1. Group BP readings by date
  // 2. Identify days with exercise vs without
  // 3. Calculate average BP for each group
  // 4. Return insight if difference is significant (>5 mmHg)
  
  // Example insight:
  // "Your BP is typically 8 points higher on rest days. 
  //  Try light activity even on rest days."
}
```

---

## Task 2: Predictive Insights Generation

### File: `lib/analytics-utils.ts`

**Create NEW function `generatePredictiveInsights()`:**

```typescript
export function generatePredictiveInsights(
  healthData: UnifiedHealthData
): CorrelationInsight[] {
  const insights: CorrelationInsight[] = []
  
  // Use existing correlation data to generate predictions:
  
  // 1. Exercise Impact Prediction
  // "Your BP is typically X points higher on days without exercise"
  
  // 2. Medication Timing Prediction
  // "Skipping morning medication raises evening BP by X points"
  
  // 3. Sodium Impact Prediction
  // "High-sodium meals increase next-day BP by X points"
  
  // 4. Trend-Based Prediction
  // "Your BP improves by X points per week on average"
  // Use calculateBPTrend() results
  
  // 5. Adherence Impact
  // "Days with >80% medication adherence show X points lower BP"
  
  return insights
}
```

**Insight Format:**
```typescript
{
  type: 'positive' | 'negative' | 'neutral',
  title: string,
  description: string,
  confidence: 'high' | 'medium' | 'low',
  metric?: number
}
```

---

## Task 3: Analytics UI Updates

### File: `app/actions/analytics.ts`

**Update `getCorrelationInsights()` (lines 202-262):**

```typescript
// Add calls to new functions:
const restDayImpact = calculateRestDayImpact(bloodPressure, exercise)
if (restDayImpact) insights.push(restDayImpact)

const predictiveInsights = generatePredictiveInsights(healthData.data)
insights.push(...predictiveInsights)

// Add trend analysis insight
const trend = calculateBPTrend(bloodPressure)
if (trend.direction !== 'stable') {
  insights.push({
    type: trend.direction === 'improving' ? 'positive' : 'negative',
    title: `BP Trend: ${trend.direction}`,
    description: `Your BP is ${trend.direction} by ${Math.abs(trend.weeklyChange).toFixed(1)} mmHg per week.`,
    confidence: trend.confidence,
    metric: trend.weeklyChange
  })
}

// Sort by importance: negative > positive > neutral
// Within same type, sort by confidence: high > medium > low
```

### File: `components/charts/analytics-summary.tsx`

**Add trend indicators (after line 203):**

```typescript
// Import calculateBPTrend
import { calculateBPTrend } from '@/lib/analytics-utils'

// In component, calculate trend
const trend = calculateBPTrend(readings)

// Display:
// - Trend arrow (↗ worsening, → stable, ↘ improving)
// - Percentage change per week
// - "Improving/Stable/Worsening" badge with color
// - Projected BP in 30 days: "At this rate, your BP will be X/Y in 30 days"
```

### File: `components/charts/correlation-insights.tsx`

**Enhance insight cards (lines 41-143):**

Add support for "predictive" insight type:
```typescript
// Add to getColorClasses():
case 'predictive':
  return {
    border: 'border-l-purple-500',
    icon: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-500/10',
    badge: 'bg-purple-500/20 text-purple-700 dark:text-purple-300',
  }

// Use Sparkles icon from lucide-react for predictive insights
// Add "Prediction" badge
// Show confidence intervals if available
```

### File: `components/charts/weekly-comparison-chart.tsx` (NEW)

Create bar chart component:
```typescript
'use client'

import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { calculateWeekOverWeekComparison } from '@/lib/analytics-utils'

// Side-by-side bars comparing:
// - This Week vs Last Week
// - BP (systolic/diastolic)
// - Exercise minutes
// - Meal count
// - Reading count

// Show percentage change indicators
// Color-code: green for improvements, red for declines
```

---

## Quality Standards

### TypeScript
- ✅ Strict mode, no `any` types
- ✅ Explicit return types for all functions
- ✅ Use existing types from `@/types`

### Code Quality
- ✅ Clean, readable, well-commented
- ✅ Follow existing patterns in `lib/analytics-utils.ts`
- ✅ Reuse helper functions (calculatePearsonCorrelation, etc.)
- ✅ Handle edge cases (empty data, insufficient readings)

### Testing
- ✅ Test with various data scenarios
- ✅ Verify calculations are accurate
- ✅ Check for TypeScript errors: `npm run build`
- ✅ No linter errors

### Accessibility
- ✅ All charts have proper ARIA labels
- ✅ Color is not the only indicator (use icons + text)
- ✅ Keyboard navigable

---

## MCP Tools Available

**@Context7** - Use for latest library patterns:
```
@Context7 recharts best practices Next.js 15
@Context7 React 19 useOptimistic pattern
```

**Check your work:**
```bash
npm run build  # Check for TypeScript errors
npm run lint   # Check for linting errors
```

---

## File References

**Read these files for context:**
- `lib/analytics-utils.ts` - Existing analytics functions
- `app/actions/analytics.ts` - Server actions
- `components/charts/correlation-insights.tsx` - Insight display
- `types/index.ts` - Type definitions
- `IMPLEMENTATION_PROGRESS.md` - What's been done

**Files you'll modify:**
1. `lib/analytics-utils.ts` - Add enhanced correlations + predictive insights
2. `app/actions/analytics.ts` - Update getCorrelationInsights
3. `components/charts/analytics-summary.tsx` - Add trend indicators
4. `components/charts/correlation-insights.tsx` - Add predictive type

**Files you'll create:**
1. `components/charts/weekly-comparison-chart.tsx` - Week comparison visualization

---

## Success Criteria

✅ Enhanced correlations show rest day impact, meal timing, sodium effects
✅ Predictive insights generate 3-5 actionable predictions
✅ Analytics UI displays trends with arrows and projections
✅ Weekly comparison chart shows side-by-side bars
✅ No TypeScript or build errors
✅ All components are accessible (WCAG 2.1 AA)
✅ Code is clean, readable, and well-documented

---

## Start Here

1. Read `lib/analytics-utils.ts` to understand existing patterns
2. Implement enhanced correlations first (builds on existing code)
3. Then predictive insights (uses enhanced correlations)
4. Finally UI updates (displays the new data)
5. Test thoroughly with `npm run build`

Good luck! 🚀



