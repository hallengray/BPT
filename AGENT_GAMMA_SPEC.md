# Agent Gamma - Diet & Exercise Logging Specification

**Lead**: Diet & Exercise Features, Form UX, Data Entry
**Priority**: MEDIUM (Depends on Agent Alpha's auth hooks)
**Estimated Time**: 2-3 hours

## 🎯 Objectives

Build intuitive diet and exercise logging features with excellent UX, form validation, and optimistic updates using React 19 features.

## 📚 Technical Requirements

### Architecture Patterns (from .cursorrules)

1. **React 19 Features**: `useOptimistic()`, `useFormStatus()`, `useActionState()`
2. **Server Actions**: All mutations
3. **Zod Validation**: Strict input validation
4. **Accessibility**: WCAG 2.1 AA compliant
5. **Optimistic Updates**: Instant UI feedback

## 🔧 MCP Server Usage

### Context7 MCP
Before implementing, consult Context7 for latest patterns:
```typescript
// Query for React 19 form patterns
@context7 get-library-docs /reactjs/react.dev "useOptimistic useFormStatus forms"

// Query for Next.js 15 Server Actions
@context7 get-library-docs /vercel/next.js/v15.1.8 "server actions forms validation"

// Query for Zod validation patterns
@context7 resolve-library-id zod
@context7 get-library-docs /colinhacks/zod "form validation schemas"
```

### Supabase MCP
Use for database operations:
```typescript
// Check table schema
@supabase list-tables ["public"]

// Test queries before implementing
@supabase execute-sql "SELECT * FROM diet_logs LIMIT 5"
@supabase execute-sql "SELECT * FROM exercise_logs LIMIT 5"

// Check RLS policies
@supabase get-advisors security
```

### File Structure

```
app/(dashboard)/
└── log-diet-exercise/
    ├── page.tsx             # Combined page with tabs
    └── loading.tsx          # Loading skeleton
app/actions/
├── diet-logs.ts             # Server Actions for diet CRUD
└── exercise-logs.ts         # Server Actions for exercise CRUD
lib/validations/
├── diet-logs.ts             # Zod schemas for diet
└── exercise-logs.ts         # Zod schemas for exercise
components/forms/
├── diet-log-form.tsx        # Diet entry form
└── exercise-log-form.tsx    # Exercise entry form
components/ui/
├── tabs.tsx                 # shadcn/ui Tabs
├── select.tsx               # shadcn/ui Select
└── textarea.tsx             # shadcn/ui Textarea
hooks/
├── use-diet-logs.ts         # Diet data hook
└── use-exercise-logs.ts     # Exercise data hook
```

## 🔨 Implementation Details

### 1. Zod Validation Schemas

**Diet Logs** (`lib/validations/diet-logs.ts`):
```typescript
import { z } from 'zod'

export const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack', 'other'] as const

export const dietLogSchema = z.object({
  mealType: z.enum(mealTypes, {
    required_error: 'Please select a meal type',
  }),
  description: z
    .string()
    .min(3, 'Description must be at least 3 characters')
    .max(500, 'Description must be less than 500 characters'),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
  loggedAt: z.string().datetime(),
})

export const dietLogFormSchema = z.object({
  mealType: z.string().min(1, 'Meal type is required'),
  description: z.string().min(3, 'Description must be at least 3 characters'),
  notes: z.string().max(500).optional(),
  loggedAt: z.string().min(1, 'Date and time are required'),
})

export type DietLogInput = z.infer<typeof dietLogSchema>
export type DietLogFormInput = z.infer<typeof dietLogFormSchema>
```

**Exercise Logs** (`lib/validations/exercise-logs.ts`):
```typescript
import { z } from 'zod'

export const intensityLevels = ['low', 'moderate', 'high'] as const

export const exerciseLogSchema = z.object({
  activityType: z
    .string()
    .min(2, 'Activity type must be at least 2 characters')
    .max(100, 'Activity type must be less than 100 characters'),
  durationMinutes: z
    .number()
    .int()
    .min(1, 'Duration must be at least 1 minute')
    .max(600, 'Duration must be less than 600 minutes'),
  intensity: z.enum(intensityLevels).optional(),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
  loggedAt: z.string().datetime(),
})

export const exerciseLogFormSchema = z.object({
  activityType: z.string().min(2, 'Activity type is required'),
  durationMinutes: z.string().min(1, 'Duration is required'),
  intensity: z.string().optional(),
  notes: z.string().max(500).optional(),
  loggedAt: z.string().min(1, 'Date and time are required'),
})

export type ExerciseLogInput = z.infer<typeof exerciseLogSchema>
export type ExerciseLogFormInput = z.infer<typeof exerciseLogFormSchema>
```

### 2. Server Actions - Diet Logs (`app/actions/diet-logs.ts`)

```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { dietLogFormSchema } from '@/lib/validations/diet-logs'
import type { DietLog } from '@/types'

type ActionResponse<T = null> = {
  success: boolean
  data?: T
  error?: string
}

export async function createDietLog(
  formData: FormData
): Promise<ActionResponse<DietLog>> {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      success: false,
      error: 'You must be logged in to create a diet log',
    }
  }

  // Validate input
  const validatedFields = dietLogFormSchema.safeParse({
    mealType: formData.get('mealType'),
    description: formData.get('description'),
    notes: formData.get('notes') || undefined,
    loggedAt: formData.get('loggedAt'),
  })

  if (!validatedFields.success) {
    return {
      success: false,
      error: validatedFields.error.errors[0].message,
    }
  }

  const { mealType, description, notes, loggedAt } = validatedFields.data

  // Insert diet log
  const { data, error } = await supabase
    .from('diet_logs')
    .insert({
      user_id: user.id,
      meal_type: mealType,
      description,
      notes: notes || null,
      logged_at: loggedAt,
    })
    .select()
    .single()

  if (error) {
    console.error('Diet log creation error:', error)
    return {
      success: false,
      error: 'Failed to create diet log. Please try again.',
    }
  }

  revalidatePath('/log-diet-exercise')
  revalidatePath('/dashboard')
  
  return {
    success: true,
    data,
  }
}

export async function getDietLogs(limit: number = 10) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated', data: [] }
  }

  const { data, error } = await supabase
    .from('diet_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('logged_at', { ascending: false })
    .limit(limit)

  if (error) {
    return { success: false, error: error.message, data: [] }
  }

  return { success: true, data: data || [] }
}

export async function deleteDietLog(id: string): Promise<ActionResponse> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      success: false,
      error: 'You must be logged in',
    }
  }

  const { error } = await supabase
    .from('diet_logs')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return {
      success: false,
      error: 'Failed to delete diet log',
    }
  }

  revalidatePath('/log-diet-exercise')
  return { success: true }
}
```

### 3. Server Actions - Exercise Logs (`app/actions/exercise-logs.ts`)

```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { exerciseLogFormSchema } from '@/lib/validations/exercise-logs'
import type { ExerciseLog } from '@/types'

type ActionResponse<T = null> = {
  success: boolean
  data?: T
  error?: string
}

export async function createExerciseLog(
  formData: FormData
): Promise<ActionResponse<ExerciseLog>> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      success: false,
      error: 'You must be logged in to create an exercise log',
    }
  }

  const validatedFields = exerciseLogFormSchema.safeParse({
    activityType: formData.get('activityType'),
    durationMinutes: formData.get('durationMinutes'),
    intensity: formData.get('intensity') || undefined,
    notes: formData.get('notes') || undefined,
    loggedAt: formData.get('loggedAt'),
  })

  if (!validatedFields.success) {
    return {
      success: false,
      error: validatedFields.error.errors[0].message,
    }
  }

  const { activityType, durationMinutes, intensity, notes, loggedAt } = validatedFields.data

  const { data, error } = await supabase
    .from('exercise_logs')
    .insert({
      user_id: user.id,
      activity_type: activityType,
      duration_minutes: parseInt(durationMinutes),
      intensity: intensity || null,
      notes: notes || null,
      logged_at: loggedAt,
    })
    .select()
    .single()

  if (error) {
    console.error('Exercise log creation error:', error)
    return {
      success: false,
      error: 'Failed to create exercise log. Please try again.',
    }
  }

  revalidatePath('/log-diet-exercise')
  revalidatePath('/dashboard')
  
  return {
    success: true,
    data,
  }
}

export async function getExerciseLogs(limit: number = 10) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated', data: [] }
  }

  const { data, error } = await supabase
    .from('exercise_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('logged_at', { ascending: false })
    .limit(limit)

  if (error) {
    return { success: false, error: error.message, data: [] }
  }

  return { success: true, data: data || [] }
}

export async function deleteExerciseLog(id: string): Promise<ActionResponse> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      success: false,
      error: 'You must be logged in',
    }
  }

  const { error } = await supabase
    .from('exercise_logs')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return {
      success: false,
      error: 'Failed to delete exercise log',
    }
  }

  revalidatePath('/log-diet-exercise')
  return { success: true }
}
```

### 4. Main Page with Tabs (`app/(dashboard)/log-diet-exercise/page.tsx`)

```typescript
import { Suspense } from 'react'
import { Metadata } from 'next'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DietLogForm } from '@/components/forms/diet-log-form'
import { ExerciseLogForm } from '@/components/forms/exercise-log-form'
import { Skeleton } from '@/components/ui/skeleton'
import { getDietLogs } from '@/app/actions/diet-logs'
import { getExerciseLogs } from '@/app/actions/exercise-logs'
import { formatDateTime } from '@/lib/utils'
import { Utensils, Dumbbell } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Log Diet & Exercise',
}

async function RecentDietLogs() {
  const { data: logs } = await getDietLogs(5)

  if (!logs || logs.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground">
        No diet logs yet. Start by logging your first meal!
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {logs.map((log) => (
        <div key={log.id} className="rounded-lg border p-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium capitalize">{log.meal_type}</p>
              <p className="text-sm text-muted-foreground">{log.description}</p>
              {log.notes && (
                <p className="mt-1 text-xs text-muted-foreground italic">{log.notes}</p>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {formatDateTime(log.logged_at)}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

async function RecentExerciseLogs() {
  const { data: logs } = await getExerciseLogs(5)

  if (!logs || logs.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground">
        No exercise logs yet. Start by logging your first activity!
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {logs.map((log) => (
        <div key={log.id} className="rounded-lg border p-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium">{log.activity_type}</p>
              <p className="text-sm text-muted-foreground">
                {log.duration_minutes} minutes
                {log.intensity && ` • ${log.intensity} intensity`}
              </p>
              {log.notes && (
                <p className="mt-1 text-xs text-muted-foreground italic">{log.notes}</p>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {formatDateTime(log.logged_at)}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function LogDietExercisePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Log Diet & Exercise</h1>
        <p className="text-muted-foreground">
          Track your meals and physical activities
        </p>
      </div>

      <Tabs defaultValue="diet" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="diet" className="flex items-center gap-2">
            <Utensils className="h-4 w-4" />
            Diet
          </TabsTrigger>
          <TabsTrigger value="exercise" className="flex items-center gap-2">
            <Dumbbell className="h-4 w-4" />
            Exercise
          </TabsTrigger>
        </TabsList>

        <TabsContent value="diet" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Log a Meal</CardTitle>
                <CardDescription>Record what you ate and when</CardDescription>
              </CardHeader>
              <CardContent>
                <DietLogForm />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Diet Logs</CardTitle>
                <CardDescription>Your latest meal entries</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                  <RecentDietLogs />
                </Suspense>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="exercise" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Log Exercise</CardTitle>
                <CardDescription>Record your physical activity</CardDescription>
              </CardHeader>
              <CardContent>
                <ExerciseLogForm />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Exercise Logs</CardTitle>
                <CardDescription>Your latest activities</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                  <RecentExerciseLogs />
                </Suspense>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

### 5. Diet Log Form (`components/forms/diet-log-form.tsx`)

```typescript
'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { createDietLog } from '@/app/actions/diet-logs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { mealTypes } from '@/lib/validations/diet-logs'

function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Saving...' : 'Save Diet Log'}
    </Button>
  )
}

export function DietLogForm() {
  const [state, formAction] = useActionState(createDietLog, { success: false })

  if (state?.success) {
    toast.success('Diet log saved successfully!')
  }

  const now = new Date()
  const defaultDateTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {state?.success && (
        <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-600">
            Diet log saved successfully!
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="loggedAt">Date & Time</Label>
        <Input
          id="loggedAt"
          name="loggedAt"
          type="datetime-local"
          defaultValue={defaultDateTime}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="mealType">Meal Type</Label>
        <Select name="mealType" required>
          <SelectTrigger>
            <SelectValue placeholder="Select meal type" />
          </SelectTrigger>
          <SelectContent>
            {mealTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="e.g., Grilled chicken salad with olive oil"
          rows={3}
          required
          maxLength={500}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Any additional notes..."
          rows={2}
          maxLength={500}
        />
      </div>

      <div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950">
        <h4 className="mb-1 text-sm font-semibold text-green-900 dark:text-green-100">
          Diet Tips for Blood Pressure
        </h4>
        <ul className="space-y-1 text-xs text-green-800 dark:text-green-200">
          <li>• Reduce sodium intake (less than 2,300 mg/day)</li>
          <li>• Eat more fruits and vegetables</li>
          <li>• Choose whole grains over refined grains</li>
        </ul>
      </div>

      <SubmitButton />
    </form>
  )
}
```

### 6. Exercise Log Form (`components/forms/exercise-log-form.tsx`)

```typescript
'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { createExerciseLog } from '@/app/actions/exercise-logs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { intensityLevels } from '@/lib/validations/exercise-logs'

function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Saving...' : 'Save Exercise Log'}
    </Button>
  )
}

export function ExerciseLogForm() {
  const [state, formAction] = useActionState(createExerciseLog, { success: false })

  if (state?.success) {
    toast.success('Exercise log saved successfully!')
  }

  const now = new Date()
  const defaultDateTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {state?.success && (
        <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-600">
            Exercise log saved successfully!
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="loggedAt">Date & Time</Label>
        <Input
          id="loggedAt"
          name="loggedAt"
          type="datetime-local"
          defaultValue={defaultDateTime}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="activityType">Activity</Label>
        <Input
          id="activityType"
          name="activityType"
          type="text"
          placeholder="e.g., Running, Walking, Cycling"
          required
          maxLength={100}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="durationMinutes">Duration (minutes)</Label>
          <Input
            id="durationMinutes"
            name="durationMinutes"
            type="number"
            placeholder="30"
            min="1"
            max="600"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="intensity">Intensity (Optional)</Label>
          <Select name="intensity">
            <SelectTrigger>
              <SelectValue placeholder="Select intensity" />
            </SelectTrigger>
            <SelectContent>
              {intensityLevels.map((level) => (
                <SelectItem key={level} value={level}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Any additional notes..."
          rows={2}
          maxLength={500}
        />
      </div>

      <div className="rounded-lg border border-purple-200 bg-purple-50 p-3 dark:border-purple-800 dark:bg-purple-950">
        <h4 className="mb-1 text-sm font-semibold text-purple-900 dark:text-purple-100">
          Exercise Benefits
        </h4>
        <ul className="space-y-1 text-xs text-purple-800 dark:text-purple-200">
          <li>• Aim for 150 minutes of moderate activity per week</li>
          <li>• Regular exercise can lower BP by 5-8 mmHg</li>
          <li>• Consistency is more important than intensity</li>
        </ul>
      </div>

      <SubmitButton />
    </form>
  )
}
```

### 7. Required shadcn/ui Components

**Tabs** (`components/ui/tabs.tsx`):
```bash
npx shadcn@latest add tabs
```

**Select** (`components/ui/select.tsx`):
```bash
npx shadcn@latest add select
```

**Textarea** (`components/ui/textarea.tsx`):
```bash
npx shadcn@latest add textarea
```

**Skeleton** (`components/ui/skeleton.tsx`):
```bash
npx shadcn@latest add skeleton
```

**Alert** (`components/ui/alert.tsx`):
```bash
npx shadcn@latest add alert
```

## ✅ Acceptance Criteria

- [ ] Users can log diet entries
- [ ] Users can log exercise activities
- [ ] Tabs switch smoothly between diet and exercise
- [ ] Form validation works correctly
- [ ] Success messages appear
- [ ] Recent logs display correctly
- [ ] Forms reset after successful submission
- [ ] Loading states show during submission
- [ ] All forms are keyboard accessible
- [ ] Mobile responsive design
- [ ] Dark mode compatible
- [ ] TypeScript compiles without errors

## 🧪 Testing Checklist

1. **Diet Logging**
   - [ ] All meal types selectable
   - [ ] Description validation
   - [ ] Optional notes work
   - [ ] Success toast appears
   - [ ] Recent logs update

2. **Exercise Logging**
   - [ ] Activity name validation
   - [ ] Duration validation (1-600)
   - [ ] Intensity is optional
   - [ ] Success toast appears
   - [ ] Recent logs update

3. **UI/UX**
   - [ ] Tabs switch correctly
   - [ ] Forms are responsive
   - [ ] Tips boxes display
   - [ ] Loading states work

## 📦 Deliverables

1. Diet logging functionality
2. Exercise logging functionality
3. Tabbed interface
4. Form components
5. Server Actions
6. Validation schemas
7. shadcn/ui components added

## 🔗 Dependencies

**Requires from Agent Alpha:**
- `useUser()` hook (for auth state)

**Coordinates with Agent Beta:**
- Dashboard should show diet/exercise data
- Shared types in `types/index.ts`

## 📝 Notes

- Use MCP servers for best practices
- Consult Context7 before implementing
- Test with Supabase MCP
- Follow `.cursorrules` strictly
- Implement optimistic updates
- Add proper error handling
- Ensure accessibility
- Test on mobile

## 🔧 MCP Commands to Run

**Before starting:**
```bash
# Get React 19 patterns
@context7 get-library-docs /reactjs/react.dev "useOptimistic forms"

# Verify database schema
@supabase list-tables ["public"]

# Check RLS policies
@supabase get-advisors security
```

**During development:**
```bash
# Test queries
@supabase execute-sql "SELECT * FROM diet_logs WHERE user_id = 'test' LIMIT 5"
@supabase execute-sql "SELECT * FROM exercise_logs WHERE user_id = 'test' LIMIT 5"
```

**Questions? Ping @mark in coordination**

