# Agent Beta - Dashboard & BP Tracking Specification

**Lead**: Dashboard, Data Visualization, Blood Pressure Features
**Priority**: HIGH (Depends on Agent Alpha's auth hooks)
**Estimated Time**: 3-4 hours

## 🎯 Objectives

Build a high-performance dashboard with real-time BP tracking, data visualization using Recharts, and optimistic UI updates using React 19 features.

## 📚 Technical Requirements

### Architecture Patterns (from .cursorrules)

1. **Server Components**: Use for data fetching
2. **Streaming with Suspense**: Progressive rendering
3. **Parallel Data Fetching**: Reduce waterfalls with Promise.all()
4. **React 19 useOptimistic**: Instant UI feedback
5. **Server Actions**: All mutations
6. **Recharts**: Data visualization

### File Structure

```
app/(dashboard)/
├── layout.tsx                # Dashboard layout with nav
├── dashboard/
│   ├── page.tsx             # Main dashboard (Server Component)
│   └── loading.tsx          # Loading skeleton
└── log-bp/
    ├── page.tsx             # BP logging page
    └── loading.tsx          # Loading skeleton
app/actions/
└── bp-readings.ts           # Server Actions for BP CRUD
lib/validations/
└── bp-readings.ts           # Zod schemas
components/
├── charts/
│   ├── bp-trend-chart.tsx   # Recharts line chart
│   └── stat-card.tsx        # Statistics card
├── forms/
│   └── bp-reading-form.tsx  # BP entry form
└── layout/
    ├── dashboard-nav.tsx    # Desktop navigation
    └── mobile-nav.tsx       # Mobile bottom nav
hooks/
└── use-bp-readings.ts       # BP data hook
```

## 🔨 Implementation Details

### 1. Zod Validation (`lib/validations/bp-readings.ts`)

```typescript
import { z } from 'zod'

export const bpReadingSchema = z.object({
  systolic: z
    .number()
    .int()
    .min(70, 'Systolic must be at least 70')
    .max(250, 'Systolic must be at most 250'),
  diastolic: z
    .number()
    .int()
    .min(40, 'Diastolic must be at least 40')
    .max(150, 'Diastolic must be at most 150'),
  pulse: z
    .number()
    .int()
    .min(30, 'Pulse must be at least 30')
    .max(220, 'Pulse must be at most 220'),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
  measuredAt: z.string().datetime(),
})

export const bpReadingFormSchema = z.object({
  systolic: z.string().min(1, 'Systolic is required'),
  diastolic: z.string().min(1, 'Diastolic is required'),
  pulse: z.string().min(1, 'Pulse is required'),
  notes: z.string().max(500).optional(),
  measuredAt: z.string().min(1, 'Date and time are required'),
})

export type BPReadingInput = z.infer<typeof bpReadingSchema>
export type BPReadingFormInput = z.infer<typeof bpReadingFormSchema>
```

### 2. Server Actions (`app/actions/bp-readings.ts`)

```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { bpReadingFormSchema } from '@/lib/validations/bp-readings'
import type { BloodPressureReading } from '@/types'

type ActionResponse<T = null> = {
  success: boolean
  data?: T
  error?: string
}

export async function createBPReading(
  formData: FormData
): Promise<ActionResponse<BloodPressureReading>> {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      success: false,
      error: 'You must be logged in to create a reading',
    }
  }

  // Validate input
  const validatedFields = bpReadingFormSchema.safeParse({
    systolic: formData.get('systolic'),
    diastolic: formData.get('diastolic'),
    pulse: formData.get('pulse'),
    notes: formData.get('notes') || undefined,
    measuredAt: formData.get('measuredAt'),
  })

  if (!validatedFields.success) {
    return {
      success: false,
      error: validatedFields.error.errors[0].message,
    }
  }

  const { systolic, diastolic, pulse, notes, measuredAt } = validatedFields.data

  // Insert reading
  const { data, error } = await supabase
    .from('blood_pressure_readings')
    .insert({
      user_id: user.id,
      systolic: parseInt(systolic),
      diastolic: parseInt(diastolic),
      pulse: parseInt(pulse),
      notes: notes || null,
      measured_at: measuredAt,
    })
    .select()
    .single()

  if (error) {
    return {
      success: false,
      error: 'Failed to create reading. Please try again.',
    }
  }

  revalidatePath('/dashboard')
  return {
    success: true,
    data,
  }
}

export async function getBPReadings(limit: number = 30) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated', data: [] }
  }

  const { data, error } = await supabase
    .from('blood_pressure_readings')
    .select('*')
    .eq('user_id', user.id)
    .order('measured_at', { ascending: false })
    .limit(limit)

  if (error) {
    return { success: false, error: error.message, data: [] }
  }

  return { success: true, data: data || [] }
}

export async function deleteBPReading(id: string): Promise<ActionResponse> {
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
    .from('blood_pressure_readings')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return {
      success: false,
      error: 'Failed to delete reading',
    }
  }

  revalidatePath('/dashboard')
  return { success: true }
}
```

### 3. Dashboard Layout (`app/(dashboard)/layout.tsx`)

```typescript
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardNav } from '@/components/layout/dashboard-nav'
import { MobileNav } from '@/components/layout/mobile-nav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardNav user={user} />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <MobileNav />
    </div>
  )
}
```

### 4. Dashboard Page (`app/(dashboard)/dashboard/page.tsx`)

```typescript
import { Suspense } from 'react'
import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { BPTrendChart } from '@/components/charts/bp-trend-chart'
import { StatCard } from '@/components/charts/stat-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Activity, Heart, TrendingDown, TrendingUp } from 'lucide-react'
import { classifyBloodPressure, getBPClassificationLabel } from '@/types'

export const metadata: Metadata = {
  title: 'Dashboard',
}

async function DashboardStats() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch recent readings (last 30 days)
  const { data: readings } = await supabase
    .from('blood_pressure_readings')
    .select('*')
    .eq('user_id', user.id)
    .order('measured_at', { ascending: false })
    .limit(30)

  if (!readings || readings.length === 0) {
    return (
      <div className="col-span-full">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Heart className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">No readings yet</h3>
            <p className="text-center text-muted-foreground">
              Start tracking your blood pressure by logging your first reading
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Calculate statistics
  const latest = readings[0]
  const avgSystolic = Math.round(
    readings.reduce((sum, r) => sum + r.systolic, 0) / readings.length
  )
  const avgDiastolic = Math.round(
    readings.reduce((sum, r) => sum + r.diastolic, 0) / readings.length
  )
  const avgPulse = Math.round(
    readings.reduce((sum, r) => sum + r.pulse, 0) / readings.length
  )

  const classification = classifyBloodPressure(latest.systolic, latest.diastolic)
  const classificationLabel = getBPClassificationLabel(classification)

  // Calculate trend (compare last 7 days vs previous 7 days)
  const last7Days = readings.slice(0, 7)
  const previous7Days = readings.slice(7, 14)
  
  let trend: 'up' | 'down' | 'stable' = 'stable'
  if (last7Days.length > 0 && previous7Days.length > 0) {
    const recentAvg =
      last7Days.reduce((sum, r) => sum + r.systolic, 0) / last7Days.length
    const previousAvg =
      previous7Days.reduce((sum, r) => sum + r.systolic, 0) / previous7Days.length
    
    if (recentAvg > previousAvg + 5) trend = 'up'
    else if (recentAvg < previousAvg - 5) trend = 'down'
  }

  return (
    <>
      <StatCard
        title="Latest Reading"
        value={`${latest.systolic}/${latest.diastolic}`}
        subtitle={classificationLabel}
        icon={Heart}
        trend={trend}
      />
      <StatCard
        title="Average (30 days)"
        value={`${avgSystolic}/${avgDiastolic}`}
        subtitle={`Pulse: ${avgPulse} bpm`}
        icon={Activity}
      />
      <StatCard
        title="Total Readings"
        value={readings.length.toString()}
        subtitle="Last 30 days"
        icon={TrendingUp}
      />
    </>
  )
}

async function BPChart() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: readings } = await supabase
    .from('blood_pressure_readings')
    .select('*')
    .eq('user_id', user.id)
    .order('measured_at', { ascending: true })
    .limit(30)

  return <BPTrendChart data={readings || []} />
}

function StatsLoading() {
  return (
    <>
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-32" />
            <Skeleton className="mt-2 h-4 w-20" />
          </CardContent>
        </Card>
      ))}
    </>
  )
}

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Track your blood pressure and monitor your health trends
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <Suspense fallback={<StatsLoading />}>
          <DashboardStats />
        </Suspense>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Blood Pressure Trends</CardTitle>
          <CardDescription>Your readings over the past 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
            <BPChart />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
```

### 5. BP Trend Chart (`components/charts/bp-trend-chart.tsx`)

```typescript
'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'
import type { BloodPressureReading } from '@/types'

interface BPTrendChartProps {
  data: BloodPressureReading[]
}

export function BPTrendChart({ data }: BPTrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center text-muted-foreground">
        No data to display
      </div>
    )
  }

  const chartData = data.map((reading) => ({
    date: format(new Date(reading.measured_at), 'MMM dd'),
    systolic: reading.systolic,
    diastolic: reading.diastolic,
    pulse: reading.pulse,
  }))

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="date"
          className="text-xs"
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
        />
        <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="systolic"
          stroke="hsl(var(--chart-1))"
          strokeWidth={2}
          name="Systolic"
          dot={{ fill: 'hsl(var(--chart-1))' }}
        />
        <Line
          type="monotone"
          dataKey="diastolic"
          stroke="hsl(var(--chart-2))"
          strokeWidth={2}
          name="Diastolic"
          dot={{ fill: 'hsl(var(--chart-2))' }}
        />
        <Line
          type="monotone"
          dataKey="pulse"
          stroke="hsl(var(--chart-3))"
          strokeWidth={2}
          name="Pulse"
          dot={{ fill: 'hsl(var(--chart-3))' }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
```

### 6. Stat Card Component (`components/charts/stat-card.tsx`)

```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LucideIcon, TrendingDown, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string
  subtitle?: string
  icon: LucideIcon
  trend?: 'up' | 'down' | 'stable'
}

export function StatCard({ title, value, subtitle, icon: Icon, trend }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="flex items-center text-xs text-muted-foreground">
            {trend && trend !== 'stable' && (
              <>
                {trend === 'up' ? (
                  <TrendingUp className="mr-1 h-3 w-3 text-red-500" />
                ) : (
                  <TrendingDown className="mr-1 h-3 w-3 text-green-500" />
                )}
              </>
            )}
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
```

### 7. BP Reading Form (`components/forms/bp-reading-form.tsx`)

```typescript
'use client'

import { useActionState, useOptimistic } from 'react'
import { useFormStatus } from 'react-dom'
import { createBPReading } from '@/app/actions/bp-readings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <Button type="submit" className="w-full" size="lg" disabled={pending}>
      {pending ? 'Saving...' : 'Save Reading'}
    </Button>
  )
}

export function BPReadingForm() {
  const [state, formAction] = useActionState(createBPReading, { success: false })

  // Show success toast
  if (state?.success) {
    toast.success('Blood pressure reading saved successfully!')
  }

  // Get current date/time for default value
  const now = new Date()
  const defaultDateTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  return (
    <form action={formAction} className="space-y-6">
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
            Reading saved successfully!
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="measuredAt">Date & Time</Label>
        <Input
          id="measuredAt"
          name="measuredAt"
          type="datetime-local"
          defaultValue={defaultDateTime}
          required
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="systolic">Systolic (mmHg)</Label>
          <Input
            id="systolic"
            name="systolic"
            type="number"
            placeholder="120"
            min="70"
            max="250"
            required
          />
          <p className="text-xs text-muted-foreground">Top number</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="diastolic">Diastolic (mmHg)</Label>
          <Input
            id="diastolic"
            name="diastolic"
            type="number"
            placeholder="80"
            min="40"
            max="150"
            required
          />
          <p className="text-xs text-muted-foreground">Bottom number</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="pulse">Pulse (bpm)</Label>
          <Input
            id="pulse"
            name="pulse"
            type="number"
            placeholder="70"
            min="30"
            max="220"
            required
          />
          <p className="text-xs text-muted-foreground">Heart rate</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Any additional notes about this reading..."
          rows={3}
          maxLength={500}
        />
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
        <h3 className="mb-2 font-semibold text-blue-900 dark:text-blue-100">
          Blood Pressure Guidelines
        </h3>
        <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
          <li>• Normal: Less than 120/80 mmHg</li>
          <li>• Elevated: 120-129/less than 80 mmHg</li>
          <li>• High (Stage 1): 130-139/80-89 mmHg</li>
          <li>• High (Stage 2): 140+/90+ mmHg</li>
        </ul>
      </div>

      <SubmitButton />
    </form>
  )
}
```

### 8. Navigation Components

**Desktop Nav** (`components/layout/dashboard-nav.tsx`):
```typescript
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { signOut } from '@/app/actions/auth'
import { Activity, Heart, LayoutDashboard, LogOut, User as UserIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DashboardNavProps {
  user: User
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/log-bp', label: 'Log BP', icon: Heart },
  { href: '/log-diet-exercise', label: 'Diet & Exercise', icon: Activity },
  { href: '/profile', label: 'Profile', icon: UserIcon },
]

export function DashboardNav({ user }: DashboardNavProps) {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/dashboard" className="mr-6 flex items-center space-x-2">
            <Heart className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block">BP Tracker</span>
          </Link>
          <nav className="hidden items-center space-x-6 text-sm font-medium md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'transition-colors hover:text-foreground/80',
                  pathname === item.href ? 'text-foreground' : 'text-foreground/60'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="ml-auto flex items-center space-x-4">
          <span className="hidden text-sm text-muted-foreground sm:inline-block">
            {user.email}
          </span>
          <form action={signOut}>
            <Button variant="ghost" size="sm" type="submit">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </form>
        </div>
      </div>
    </header>
  )
}
```

**Mobile Nav** (`components/layout/mobile-nav.tsx`):
```typescript
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Activity, Heart, LayoutDashboard, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/log-bp', label: 'Log BP', icon: Heart },
  { href: '/log-diet-exercise', label: 'Activity', icon: Activity },
  { href: '/profile', label: 'Profile', icon: User },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden">
      <div className="grid h-16 grid-cols-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center space-y-1',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
```

## ✅ Acceptance Criteria

- [ ] Dashboard displays user statistics
- [ ] Chart shows BP trends over time
- [ ] Users can log new BP readings
- [ ] Form validation works correctly
- [ ] Optimistic updates provide instant feedback
- [ ] Loading states show during data fetch
- [ ] Empty states for new users
- [ ] Navigation works on mobile and desktop
- [ ] All components are responsive
- [ ] Dark mode works correctly
- [ ] TypeScript compiles without errors

## 🧪 Testing Checklist

1. **Dashboard**
   - [ ] Stats calculate correctly
   - [ ] Chart renders with data
   - [ ] Empty state shows for new users
   - [ ] Loading skeletons appear

2. **BP Logging**
   - [ ] Form validates input
   - [ ] Success message appears
   - [ ] Dashboard updates after submission
   - [ ] BP classification shows correctly

3. **Navigation**
   - [ ] Desktop nav highlights active route
   - [ ] Mobile nav works on small screens
   - [ ] Sign out redirects to home

## 📦 Deliverables

1. Dashboard with statistics and chart
2. BP logging functionality
3. Navigation components
4. Server Actions working
5. Responsive design verified

## 🔗 Dependencies

**Requires from Agent Alpha:**
- `useUser()` hook
- `signOut()` Server Action

## 📝 Notes

- Use Server Components for data fetching
- Implement Suspense boundaries
- Add loading skeletons
- Use Recharts for visualization
- Follow `.cursorrules` patterns
- Test on mobile and desktop

**Questions? Ping @mark in coordination**

