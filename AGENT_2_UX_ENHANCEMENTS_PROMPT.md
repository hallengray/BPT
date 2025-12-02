# Agent 2: UX Enhancements & Gamification

## Your Mission
Implement user experience enhancements that encourage consistent logging through smart reminders, streak tracking, and improved quick-log functionality.

## Context
You're working on a Next.js 15 + React 19 healthcare app. Phase 1 (Medication Adherence) and Phase 2 (Data Quality) are COMPLETE. Your job is to complete Phase 4 (UX Enhancements).

**Already Implemented:**
- ✅ Data completeness scoring
- ✅ Contextual prompt dialog
- ✅ Dose quick-log component
- ✅ Pending doses widget on dashboard

**Your Tasks (3 todos):**
1. **Smart Reminders System** - Intelligent logging reminders
2. **Streak Tracking** - Gamification with milestone badges
3. **Enhanced Quick Log** - Add medication tab to quick-log page

---

## Task 1: Smart Reminders System

### File: `components/dashboard/smart-reminders.tsx` (NEW)

Create intelligent reminder component:

```typescript
'use client'

import { X, Activity, Utensils, Heart, Pill, Clock } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Reminder {
  id: string
  type: 'exercise' | 'diet' | 'bp' | 'medication'
  priority: 'high' | 'medium' | 'low'
  title: string
  message: string
  action: {
    label: string
    href: string
  }
  icon: React.ComponentType
}

interface SmartRemindersProps {
  reminders: Reminder[]
  onDismiss: (id: string) => void
}

export function SmartReminders({ reminders, onDismiss }: SmartRemindersProps) {
  // Display max 2 reminders at once (highest priority)
  // Dismissible with X button
  // Each reminder has:
  // - Icon (color-coded by type)
  // - Title and message
  // - Action button linking to relevant page
  // - Dismiss button
  
  // Priority order: high > medium > low
  // Within same priority: medication > bp > exercise > diet
}
```

### File: `lib/reminder-generator.ts` (NEW)

Create logic for generating reminders:

```typescript
import type { UnifiedHealthData } from '@/types'
import { differenceInDays, startOfDay } from 'date-fns'

export function generateSmartReminders(
  healthData: UnifiedHealthData,
  userId: string
): Reminder[] {
  const reminders: Reminder[] = []
  const now = new Date()
  
  // 1. Exercise Reminder
  // If no exercise logged in 3+ days
  const lastExercise = healthData.exercise[0]
  if (!lastExercise || differenceInDays(now, new Date(lastExercise.logged_at)) >= 3) {
    reminders.push({
      id: 'exercise-gap',
      type: 'exercise',
      priority: 'medium',
      title: 'Time to Move!',
      message: "You haven't logged exercise in 3 days. Even light activity helps!",
      action: { label: 'Log Exercise', href: '/log-diet-exercise?tab=exercise' },
      icon: Activity
    })
  }
  
  // 2. BP Logging Reminder
  // If no BP reading today
  const todayBP = healthData.bloodPressure.filter(bp => 
    startOfDay(new Date(bp.measured_at)).getTime() === startOfDay(now).getTime()
  )
  if (todayBP.length === 0) {
    reminders.push({
      id: 'bp-today',
      type: 'bp',
      priority: 'high',
      title: 'Log Your Blood Pressure',
      message: 'Daily readings help track your progress and identify patterns.',
      action: { label: 'Log BP', href: '/log-bp' },
      icon: Heart
    })
  }
  
  // 3. Diet Context Reminder
  // If BP readings exist but no diet logs today
  if (todayBP.length > 0) {
    const todayDiet = healthData.diet.filter(d =>
      startOfDay(new Date(d.logged_at)).getTime() === startOfDay(now).getTime()
    )
    if (todayDiet.length === 0) {
      reminders.push({
        id: 'diet-context',
        type: 'diet',
        priority: 'low',
        title: 'Add Meal Context',
        message: 'Your BP readings need context. Log your meals to improve insights.',
        action: { label: 'Log Meals', href: '/log-diet-exercise?tab=diet' },
        icon: Utensils
      })
    }
  }
  
  // 4. Medication Reminder
  // If pending doses exist
  const pendingDoses = healthData.medicationDoses.filter(d => 
    !d.was_taken && new Date(d.scheduled_time) < now
  )
  if (pendingDoses.length > 0) {
    reminders.push({
      id: 'medication-pending',
      type: 'medication',
      priority: 'high',
      title: `${pendingDoses.length} Medication${pendingDoses.length > 1 ? 's' : ''} Due`,
      message: 'Take your medications to maintain consistent BP control.',
      action: { label: 'View Medications', href: '/medications' },
      icon: Pill
    })
  }
  
  return reminders
}
```

### Integration: Add to Dashboard

**File: `app/(dashboard)/dashboard/page.tsx`**

Add after PendingDosesWidget:
```typescript
import { SmartRemindersWidget } from '@/components/dashboard/smart-reminders-widget'

// In page component:
<SmartRemindersWidget />
```

---

## Task 2: Streak Tracking & Badges

### File: `lib/streak-calculator.ts` (NEW)

Note: Basic streak calculation exists in `lib/data-quality-checker.ts` (`calculateLoggingStreak`). Enhance it:

```typescript
import type { BloodPressureReading } from '@/types'
import { differenceInDays, startOfDay, parseISO } from 'date-fns'

export interface StreakData {
  currentStreak: number
  longestStreak: number
  lastLogDate: Date | null
  nextMilestone: number
  daysUntilMilestone: number
  milestoneProgress: number // percentage
}

export function calculateStreak(readings: BloodPressureReading[]): StreakData {
  // Use existing calculateLoggingStreak logic
  // Add milestone tracking:
  // Milestones: 3, 7, 14, 21, 30, 60, 90, 180, 365 days
  
  const milestones = [3, 7, 14, 21, 30, 60, 90, 180, 365]
  const currentStreak = /* calculate */
  
  // Find next milestone
  const nextMilestone = milestones.find(m => m > currentStreak) || 365
  const daysUntilMilestone = nextMilestone - currentStreak
  const previousMilestone = milestones.reverse().find(m => m <= currentStreak) || 0
  const milestoneProgress = ((currentStreak - previousMilestone) / (nextMilestone - previousMilestone)) * 100
  
  return {
    currentStreak,
    longestStreak,
    lastLogDate,
    nextMilestone,
    daysUntilMilestone,
    milestoneProgress
  }
}

export function getMilestoneBadge(streak: number): {
  emoji: string
  title: string
  description: string
  color: string
} {
  if (streak >= 365) return { emoji: '👑', title: 'Legend', description: '1 Year Streak!', color: 'gold' }
  if (streak >= 180) return { emoji: '💎', title: 'Diamond', description: '6 Month Streak!', color: 'cyan' }
  if (streak >= 90) return { emoji: '🏆', title: 'Champion', description: '90 Day Streak!', color: 'purple' }
  if (streak >= 30) return { emoji: '⭐', title: 'Star', description: '30 Day Streak!', color: 'yellow' }
  if (streak >= 21) return { emoji: '🔥', title: 'Hot Streak', description: '3 Week Streak!', color: 'orange' }
  if (streak >= 14) return { emoji: '💪', title: 'Strong', description: '2 Week Streak!', color: 'blue' }
  if (streak >= 7) return { emoji: '🎯', title: 'Consistent', description: '1 Week Streak!', color: 'green' }
  if (streak >= 3) return { emoji: '🌱', title: 'Growing', description: '3 Day Streak!', color: 'lime' }
  return { emoji: '🆕', title: 'Getting Started', description: 'Keep it up!', color: 'gray' }
}
```

### File: `components/dashboard/streak-badge.tsx` (NEW)

Create visual streak display:

```typescript
'use client'

import { Flame, Trophy, Target } from 'lucide-react'
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from '@/components/ui/glass-card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface StreakBadgeProps {
  currentStreak: number
  longestStreak: number
  nextMilestone: number
  daysUntilMilestone: number
  milestoneProgress: number
}

export function StreakBadge({
  currentStreak,
  longestStreak,
  nextMilestone,
  daysUntilMilestone,
  milestoneProgress
}: StreakBadgeProps) {
  const badge = getMilestoneBadge(currentStreak)
  
  return (
    <GlassCard>
      <GlassCardHeader>
        <div className="flex items-center gap-3">
          <div className={cn(
            'rounded-lg p-2.5 shadow-lg',
            `bg-gradient-to-br from-${badge.color}-500 to-${badge.color}-600`
          )}>
            <Flame className="h-5 w-5 text-white" />
          </div>
          <div>
            <GlassCardTitle>Logging Streak</GlassCardTitle>
            <p className="text-sm text-muted-foreground">
              Keep the momentum going!
            </p>
          </div>
        </div>
      </GlassCardHeader>
      <GlassCardContent className="space-y-4">
        {/* Current Streak Display */}
        <div className="text-center">
          <div className="text-6xl mb-2">{badge.emoji}</div>
          <div className="text-4xl font-bold">{currentStreak}</div>
          <div className="text-sm text-muted-foreground">Day Streak</div>
          <Badge className="mt-2">{badge.title}</Badge>
        </div>
        
        {/* Progress to Next Milestone */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Next milestone: {nextMilestone} days</span>
            <span className="font-semibold">{daysUntilMilestone} days to go</span>
          </div>
          <Progress value={milestoneProgress} className="h-2" />
        </div>
        
        {/* Longest Streak */}
        {longestStreak > currentStreak && (
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-600" />
              <span className="text-sm">Personal Best</span>
            </div>
            <span className="font-semibold">{longestStreak} days</span>
          </div>
        )}
        
        {/* Motivational Message */}
        <div className="rounded-lg bg-muted p-3 text-center text-sm">
          {daysUntilMilestone === 1 && "🎉 One more day to your next milestone!"}
          {daysUntilMilestone <= 3 && daysUntilMilestone > 1 && "🔥 You're so close! Keep going!"}
          {daysUntilMilestone > 3 && "💪 Stay consistent to reach your next goal!"}
        </div>
      </GlassCardContent>
    </GlassCard>
  )
}
```

### Integration: Add to Dashboard

**File: `app/(dashboard)/dashboard/page.tsx`**

Add streak widget to dashboard grid.

---

## Task 3: Enhanced Quick Log - Medication Tab

### File: `app/(dashboard)/quick-log/quick-log-content.tsx`

**Add medication tab (after line 179):**

```typescript
// Import
import { DoseQuickLog } from '@/components/medication/dose-quick-log'
import { getTodaysPendingDoses } from '@/app/actions/medication-logs'

// Add to tabs:
<TabsList className="grid w-full grid-cols-4">
  <TabsTrigger value="bp">BP</TabsTrigger>
  <TabsTrigger value="diet">Diet</TabsTrigger>
  <TabsTrigger value="exercise">Exercise</TabsTrigger>
  <TabsTrigger value="medication">Meds</TabsTrigger>
</TabsList>

// Add tab content:
<TabsContent value="medication" className="space-y-4">
  <Suspense fallback={<Skeleton className="h-[300px]" />}>
    <MedicationQuickLog />
  </Suspense>
</TabsContent>

// Create async component:
async function MedicationQuickLog() {
  const result = await getTodaysPendingDoses()
  
  if (!result.success || !result.data) {
    return <div>No medications scheduled</div>
  }
  
  return (
    <>
      {/* Batch "Take All" Button */}
      {result.data.filter(d => !d.was_taken).length > 0 && (
        <Button 
          className="w-full" 
          size="lg"
          onClick={handleTakeAll}
        >
          <Check className="mr-2 h-5 w-5" />
          Take All Medications ({pendingCount})
        </Button>
      )}
      
      {/* Individual Dose Cards */}
      <DoseQuickLog doses={result.data} />
      
      {/* Next Scheduled Doses */}
      <div className="mt-4 rounded-lg border p-4">
        <h4 className="font-semibold mb-2">Upcoming Today</h4>
        {/* Show next scheduled doses with times */}
      </div>
    </>
  )
}
```

---

## Quality Standards

### TypeScript
- ✅ Strict mode, no `any` types
- ✅ Explicit types for all props and state
- ✅ Use existing types from `@/types`

### Code Quality
- ✅ Clean, readable, well-commented
- ✅ Reuse existing components (GlassCard, Badge, Progress)
- ✅ Follow Next.js 15 patterns (Server Components, Suspense)
- ✅ Handle loading and error states

### UX Principles
- ✅ Motivational, not nagging
- ✅ Max 2 reminders at once (avoid overwhelming)
- ✅ Dismissible reminders
- ✅ Celebrate achievements (streaks, milestones)
- ✅ Clear call-to-action buttons

### Accessibility
- ✅ ARIA labels on all interactive elements
- ✅ Keyboard navigation
- ✅ Screen reader friendly
- ✅ Color + icon + text (not color alone)

---

## MCP Tools Available

**@Context7** - Use for latest patterns:
```
@Context7 Next.js 15 Server Components patterns
@Context7 React 19 useOptimistic hook
@Context7 gamification UI best practices
```

**Check your work:**
```bash
npm run build  # TypeScript errors
npm run lint   # Linting errors
```

---

## File References

**Read for context:**
- `lib/data-quality-checker.ts` - Existing streak calculation
- `components/dashboard/pending-doses-widget.tsx` - Widget pattern
- `components/medication/dose-quick-log.tsx` - Dose logging UI
- `app/(dashboard)/quick-log/quick-log-content.tsx` - Quick log tabs

**Files you'll create:**
1. `components/dashboard/smart-reminders.tsx`
2. `components/dashboard/smart-reminders-widget.tsx` (wrapper with data fetching)
3. `lib/reminder-generator.ts`
4. `lib/streak-calculator.ts`
5. `components/dashboard/streak-badge.tsx`
6. `components/dashboard/streak-widget.tsx` (wrapper)

**Files you'll modify:**
1. `app/(dashboard)/quick-log/quick-log-content.tsx` - Add medication tab
2. `app/(dashboard)/dashboard/page.tsx` - Add widgets

---

## Success Criteria

✅ Smart reminders show max 2 at a time, prioritized correctly
✅ Reminders are helpful, not annoying (good copy)
✅ Streak badge displays current streak with emoji and progress
✅ Milestone badges unlock at correct intervals
✅ Quick-log medication tab shows pending doses
✅ "Take All" button works for batch logging
✅ No TypeScript or build errors
✅ All components accessible (WCAG 2.1 AA)
✅ Motivational and encouraging UX

---

## Start Here

1. Create `lib/reminder-generator.ts` first (pure logic)
2. Then `components/dashboard/smart-reminders.tsx` (UI)
3. Create `lib/streak-calculator.ts` (enhance existing logic)
4. Then `components/dashboard/streak-badge.tsx` (UI)
5. Finally update quick-log with medication tab
6. Test thoroughly with `npm run build`

Good luck! 🎯

