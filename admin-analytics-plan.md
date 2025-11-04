---
title: "Admin Analytics Dashboard — Privacy-Compliant Cohort Analysis"
status: planned
compliance: NDPA 2023 (Nigeria), WCAG 2.1 AA
owner: Femi
created: 2025-11-04
updated: 2025-11-04
---

# Admin Analytics Dashboard — Privacy-Compliant Cohort Analysis

## Executive Summary

Build an admin-only analytics dashboard to analyze **aggregated, de-identified cohorts** of 10,000+ users over 6 months to inform health policy decisions about how diet, exercise, and medications impact blood pressure outcomes by region/country—**without accessing individual user names or PII**.

## Use Case

**Goal**: Answer questions like:
- In Lagos State (Nigeria), do users who exercise ≥150 min/week show better BP improvement?
- Does high meal-logging frequency correlate with lower systolic readings?
- What's the medication adherence rate, and does it impact BP control in hypertension cohorts?
- Which regions show the best BP improvement trends over 6 months?

**Privacy-first**: No drill-down to individual users; only aggregated cohort metrics with k-anonymity (minimum n=20 users per cohort).

---

## Architecture Overview

### 1. Data Collection Enhancement

#### Add Region/Demographics to Profiles

```sql
-- Migration: add_region_demographics_to_profiles
ALTER TABLE profiles
  ADD COLUMN country_code TEXT DEFAULT 'NG',
  ADD COLUMN state TEXT,
  ADD COLUMN lga TEXT, -- Local Government Area (optional, granular)
  ADD COLUMN date_of_birth DATE,
  ADD COLUMN gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  ADD COLUMN analytics_consent BOOLEAN DEFAULT FALSE,
  ADD COLUMN analytics_consent_at TIMESTAMPTZ;

CREATE INDEX idx_profiles_region ON profiles(country_code, state) WHERE analytics_consent = true;
COMMENT ON COLUMN profiles.analytics_consent IS 'User consent for anonymized analytics aggregation';
```

#### Analytics Consent Flow

- Add consent checkbox during onboarding or in Profile settings.
- Wording: "Help improve healthcare insights by allowing us to analyze your anonymized data in aggregated reports (no personal information shared)."
- Only users with `analytics_consent = true` are included in cohort analytics.

---

### 2. Materialized Views for Scalable Analytics

#### User-Month Aggregates (Intermediate)

```sql
-- Migration: create_analytics_user_monthly_mv
CREATE MATERIALIZED VIEW analytics_user_monthly AS
SELECT
  bpr.user_id,
  date_trunc('month', bpr.measured_at)::date AS month,
  p.country_code,
  p.state,
  p.lga,
  EXTRACT(YEAR FROM AGE(p.date_of_birth)) AS age_group, -- Age buckets later
  p.gender,
  
  -- Blood Pressure Metrics
  AVG(bpr.systolic) AS avg_systolic,
  AVG(bpr.diastolic) AS avg_diastolic,
  AVG(bpr.pulse) AS avg_pulse,
  STDDEV(bpr.systolic) AS stddev_systolic,
  COUNT(*) AS bp_reading_count,
  
  -- Exercise Metrics
  COALESCE((
    SELECT SUM(el.duration_minutes)
    FROM exercise_logs el
    WHERE el.user_id = bpr.user_id
      AND date_trunc('month', el.logged_at) = date_trunc('month', bpr.measured_at)
  ), 0) AS total_exercise_minutes,
  
  COALESCE((
    SELECT COUNT(DISTINCT DATE(el.logged_at))
    FROM exercise_logs el
    WHERE el.user_id = bpr.user_id
      AND date_trunc('month', el.logged_at) = date_trunc('month', bpr.measured_at)
  ), 0) AS exercise_days,
  
  -- Diet Metrics
  COALESCE((
    SELECT COUNT(*)
    FROM diet_logs dl
    WHERE dl.user_id = bpr.user_id
      AND date_trunc('month', dl.logged_at) = date_trunc('month', bpr.measured_at)
  ), 0) AS meals_logged,
  
  -- Medication Adherence
  COALESCE((
    SELECT AVG(CASE WHEN md.was_taken THEN 1 ELSE 0 END)::float * 100
    FROM medication_doses md
    WHERE md.user_id = bpr.user_id
      AND date_trunc('month', md.scheduled_time) = date_trunc('month', bpr.measured_at)
  ), 0) AS medication_adherence_pct

FROM blood_pressure_readings bpr
JOIN profiles p ON p.id = bpr.user_id
WHERE p.analytics_consent = true
GROUP BY bpr.user_id, date_trunc('month', bpr.measured_at), p.country_code, p.state, p.lga, p.date_of_birth, p.gender;

CREATE INDEX idx_analytics_user_monthly_lookup 
  ON analytics_user_monthly (month, country_code, state, user_id);

COMMENT ON MATERIALIZED VIEW analytics_user_monthly 
  IS 'Per-user monthly health metrics aggregation (intermediate view for cohort rollups)';
```

#### Cohort-Month Aggregates (Admin-facing, de-identified)

```sql
-- Migration: create_analytics_cohort_monthly_mv
CREATE MATERIALIZED VIEW analytics_cohort_monthly AS
SELECT
  month,
  country_code,
  state,
  lga,
  gender,
  
  -- Cohort Size (for k-anonymity enforcement)
  COUNT(DISTINCT user_id) AS cohort_size,
  
  -- Blood Pressure Metrics
  AVG(avg_systolic) AS cohort_avg_systolic,
  AVG(avg_diastolic) AS cohort_avg_diastolic,
  STDDEV(avg_systolic) AS cohort_stddev_systolic,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY avg_systolic) AS cohort_median_systolic,
  
  -- Exercise Metrics
  AVG(total_exercise_minutes) AS cohort_avg_exercise_minutes,
  AVG(exercise_days) AS cohort_avg_exercise_days,
  SUM(CASE WHEN total_exercise_minutes >= 150 THEN 1 ELSE 0 END)::float / COUNT(*) * 100 AS pct_meeting_who_guidelines,
  
  -- Diet Metrics
  AVG(meals_logged) AS cohort_avg_meals_logged,
  
  -- Medication Metrics
  AVG(medication_adherence_pct) AS cohort_avg_medication_adherence,
  
  -- Data Quality
  AVG(bp_reading_count) AS cohort_avg_bp_readings_per_user

FROM analytics_user_monthly
GROUP BY month, country_code, state, lga, gender;

CREATE INDEX idx_analytics_cohort_monthly_filters 
  ON analytics_cohort_monthly (month, country_code, state);

COMMENT ON MATERIALIZED VIEW analytics_cohort_monthly 
  IS 'De-identified cohort aggregates by region/month (admin analytics only)';
```

#### Refresh Strategy

```sql
-- Scheduled refresh (run daily via cron job or Supabase Edge Function)
REFRESH MATERIALIZED VIEW CONCURRENTLY analytics_user_monthly;
REFRESH MATERIALIZED VIEW CONCURRENTLY analytics_cohort_monthly;
```

---

### 3. Admin Dashboard Access Control

#### Add Admin Role

```sql
-- Migration: add_admin_role
ALTER TABLE profiles
  ADD COLUMN role TEXT DEFAULT 'user' CHECK (role IN ('user', 'doctor', 'admin'));

-- Set yourself as admin
UPDATE profiles SET role = 'admin' WHERE email = 'hgrayai@gmail.com';
```

#### Middleware Protection

```typescript
// lib/supabase/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'
import type { Database } from '@/types/database.types'

export async function updateSession(request: NextRequest) {
  // Create an unmodified response
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Refresh session if expired - required for Server Components
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protected routes
  const protectedRoutes = ['/dashboard', '/log-bp', '/log-diet-exercise', '/profile', '/admin']
  const isProtectedRoute = protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

  // Redirect to login if accessing protected route without authentication
  if (isProtectedRoute && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Admin-only routes: check role
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // Redirect to dashboard if accessing auth pages while authenticated
  const authRoutes = ['/login', '/signup']
  const isAuthRoute = authRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}
```

---

### 4. Admin Analytics Dashboard UI

#### Route Structure

```
app/
└── admin/
    ├── layout.tsx              # Admin shell with breadcrumbs
    ├── page.tsx                # Admin home (system stats)
    └── analytics/
        ├── page.tsx            # Cohort analytics dashboard
        ├── cohort-filters.tsx  # Client component for filters
        ├── bp-trends-chart.tsx # Line chart: cohort BP over time
        ├── regional-map.tsx    # Heat map: BP by state
        └── insights-cards.tsx  # Summary cards with key metrics
```

#### Dashboard Page (Server Component)

```typescript
// app/admin/analytics/page.tsx
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CohortFilters } from './cohort-filters'
import { BPTrendsChart } from './bp-trends-chart'
import { RegionalInsights } from './regional-insights'
import { InsightsCards } from './insights-cards'

export const metadata = {
  title: 'Admin Analytics | Blood Pressure Tracker',
  description: 'Aggregated cohort health analytics',
}

interface PageProps {
  searchParams: {
    startMonth?: string
    endMonth?: string
    country?: string
    state?: string
    gender?: string
  }
}

async function getCohortData(filters: PageProps['searchParams']) {
  const supabase = await createClient()
  
  const startMonth = filters.startMonth || 
    new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().slice(0, 7) + '-01'
  const endMonth = filters.endMonth || 
    new Date().toISOString().slice(0, 7) + '-01'
  
  let query = supabase
    .from('analytics_cohort_monthly')
    .select('*')
    .gte('month', startMonth)
    .lte('month', endMonth)
    .gte('cohort_size', 20) // k-anonymity: minimum 20 users
  
  if (filters.country) query = query.eq('country_code', filters.country)
  if (filters.state) query = query.eq('state', filters.state)
  if (filters.gender) query = query.eq('gender', filters.gender)
  
  const { data, error } = await query.order('month', { ascending: true })
  
  if (error) throw error
  return data || []
}

export default async function AdminAnalyticsPage({ searchParams }: PageProps) {
  const cohortData = await getCohortData(searchParams)
  
  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Cohort Analytics</h1>
        <p className="text-muted-foreground">
          Aggregated, de-identified health insights (minimum 20 users per cohort)
        </p>
      </div>
      
      {/* Filters */}
      <CohortFilters />
      
      {/* Summary Cards */}
      <Suspense fallback={<div>Loading insights...</div>}>
        <InsightsCards data={cohortData} />
      </Suspense>
      
      {/* BP Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Blood Pressure Trends by Cohort</CardTitle>
          <CardDescription>
            Average systolic/diastolic readings over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BPTrendsChart data={cohortData} />
        </CardContent>
      </Card>
      
      {/* Regional Insights */}
      <Suspense fallback={<div>Loading regional data...</div>}>
        <RegionalInsights data={cohortData} />
      </Suspense>
      
      {/* Data Quality Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-900">
            <strong>Privacy Notice:</strong> All data is anonymized and aggregated. 
            Cohorts with fewer than 20 users are excluded to protect privacy.
            No individual user identifiers are accessible in this view.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
```

#### Cohort Filters (Client Component)

```typescript
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function CohortFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`?${params.toString()}`)
  }
  
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <div>
        <Label htmlFor="startMonth">Start Month</Label>
        <Input
          id="startMonth"
          type="month"
          defaultValue={searchParams.get('startMonth') || ''}
          onChange={(e) => handleFilterChange('startMonth', e.target.value)}
        />
      </div>
      
      <div>
        <Label htmlFor="endMonth">End Month</Label>
        <Input
          id="endMonth"
          type="month"
          defaultValue={searchParams.get('endMonth') || ''}
          onChange={(e) => handleFilterChange('endMonth', e.target.value)}
        />
      </div>
      
      <div>
        <Label htmlFor="state">State</Label>
        <Select
          defaultValue={searchParams.get('state') || 'all'}
          onValueChange={(val) => handleFilterChange('state', val === 'all' ? '' : val)}
        >
          <SelectTrigger id="state">
            <SelectValue placeholder="All States" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All States</SelectItem>
            <SelectItem value="Lagos">Lagos</SelectItem>
            <SelectItem value="Kano">Kano</SelectItem>
            <SelectItem value="Rivers">Rivers</SelectItem>
            <SelectItem value="Oyo">Oyo</SelectItem>
            {/* Add more Nigerian states */}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="gender">Gender</Label>
        <Select
          defaultValue={searchParams.get('gender') || 'all'}
          onValueChange={(val) => handleFilterChange('gender', val === 'all' ? '' : val)}
        >
          <SelectTrigger id="gender">
            <SelectValue placeholder="All Genders" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Genders</SelectItem>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
```

#### BP Trends Chart

```typescript
'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface CohortData {
  month: string
  cohort_avg_systolic: number
  cohort_avg_diastolic: number
  cohort_size: number
}

export function BPTrendsChart({ data }: { data: CohortData[] }) {
  const chartData = data.map((d) => ({
    month: new Date(d.month).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
    systolic: Math.round(d.cohort_avg_systolic),
    diastolic: Math.round(d.cohort_avg_diastolic),
    users: d.cohort_size,
  }))
  
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis domain={[60, 160]} label={{ value: 'BP (mmHg)', angle: -90, position: 'insideLeft' }} />
        <Tooltip 
          content={({ payload }) => {
            if (!payload?.[0]) return null
            const data = payload[0].payload
            return (
              <div className="rounded-lg border bg-white p-3 shadow-md">
                <p className="font-semibold">{data.month}</p>
                <p className="text-sm">Systolic: {data.systolic} mmHg</p>
                <p className="text-sm">Diastolic: {data.diastolic} mmHg</p>
                <p className="text-xs text-muted-foreground">n = {data.users} users</p>
              </div>
            )
          }}
        />
        <Legend />
        <Line type="monotone" dataKey="systolic" stroke="#ef4444" strokeWidth={2} name="Systolic" />
        <Line type="monotone" dataKey="diastolic" stroke="#3b82f6" strokeWidth={2} name="Diastolic" />
      </LineChart>
    </ResponsiveContainer>
  )
}
```

#### Insights Cards

```typescript
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingDown, TrendingUp, Activity, Utensils, Pill } from 'lucide-react'

interface CohortData {
  cohort_avg_systolic: number
  cohort_avg_diastolic: number
  cohort_avg_exercise_minutes: number
  cohort_avg_meals_logged: number
  cohort_avg_medication_adherence: number
  cohort_size: number
}

export function InsightsCards({ data }: { data: CohortData[] }) {
  if (!data.length) {
    return <p className="text-muted-foreground">No data available for selected filters.</p>
  }
  
  const totalUsers = data.reduce((sum, d) => sum + d.cohort_size, 0)
  const avgSystolic = data.reduce((sum, d) => sum + d.cohort_avg_systolic, 0) / data.length
  const avgExercise = data.reduce((sum, d) => sum + d.cohort_avg_exercise_minutes, 0) / data.length
  const avgMedAdherence = data.reduce((sum, d) => sum + d.cohort_avg_medication_adherence, 0) / data.length
  
  // Calculate trend (first vs last month)
  const bpTrend = data.length > 1 
    ? data[data.length - 1].cohort_avg_systolic - data[0].cohort_avg_systolic 
    : 0
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalUsers.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Consented to analytics</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Systolic BP</CardTitle>
          {bpTrend < 0 ? (
            <TrendingDown className="h-4 w-4 text-green-600" />
          ) : (
            <TrendingUp className="h-4 w-4 text-red-600" />
          )}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{Math.round(avgSystolic)} mmHg</div>
          <p className="text-xs text-muted-foreground">
            {bpTrend < 0 ? '↓' : '↑'} {Math.abs(bpTrend).toFixed(1)} mmHg vs period start
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Exercise</CardTitle>
          <Activity className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{Math.round(avgExercise)} min/month</div>
          <p className="text-xs text-muted-foreground">
            {avgExercise >= 600 ? '✓ Meets WHO guidelines' : 'Below 150 min/week'}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Medication Adherence</CardTitle>
          <Pill className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{Math.round(avgMedAdherence)}%</div>
          <p className="text-xs text-muted-foreground">
            {avgMedAdherence >= 80 ? 'Good adherence' : 'Needs improvement'}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
```

---

### 5. Key Insights & Correlation Analysis

#### Server Actions for Advanced Analytics

```typescript
// app/actions/admin-analytics.ts
'use server'

import { createClient } from '@/lib/supabase/server'

export async function getExerciseBPCorrelation(
  startMonth: string,
  endMonth: string,
  country: string = 'NG'
) {
  const supabase = await createClient()
  
  // Verify admin role
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (profile?.role !== 'admin') {
    return { success: false, error: 'Admin access required' }
  }
  
  // Fetch cohort data
  const { data, error } = await supabase
    .from('analytics_cohort_monthly')
    .select('cohort_avg_systolic, cohort_avg_exercise_minutes, cohort_size')
    .eq('country_code', country)
    .gte('month', startMonth)
    .lte('month', endMonth)
    .gte('cohort_size', 20)
  
  if (error || !data) {
    return { success: false, error: 'Failed to fetch data' }
  }
  
  // Simple Pearson correlation
  const n = data.length
  const sumX = data.reduce((sum, d) => sum + d.cohort_avg_exercise_minutes, 0)
  const sumY = data.reduce((sum, d) => sum + d.cohort_avg_systolic, 0)
  const sumXY = data.reduce((sum, d) => sum + d.cohort_avg_exercise_minutes * d.cohort_avg_systolic, 0)
  const sumX2 = data.reduce((sum, d) => sum + d.cohort_avg_exercise_minutes ** 2, 0)
  const sumY2 = data.reduce((sum, d) => sum + d.cohort_avg_systolic ** 2, 0)
  
  const correlation = (n * sumXY - sumX * sumY) / 
    Math.sqrt((n * sumX2 - sumX ** 2) * (n * sumY2 - sumY ** 2))
  
  let interpretation = ''
  if (correlation < -0.5) interpretation = 'Strong negative correlation: more exercise → lower BP'
  else if (correlation < -0.3) interpretation = 'Moderate negative correlation'
  else if (correlation < 0.3) interpretation = 'Weak or no correlation'
  else interpretation = 'Positive correlation (unexpected)'
  
  return {
    success: true,
    data: {
      correlation: correlation.toFixed(3),
      interpretation,
      sampleSize: n,
    },
  }
}
```

---

### 6. Compliance & Privacy Safeguards

#### Analytics Consent UI

```typescript
// components/analytics-consent-banner.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { giveAnalyticsConsent } from '@/app/actions/profile'

export function AnalyticsConsentBanner({ hasConsent }: { hasConsent: boolean }) {
  const [dismissed, setDismissed] = useState(hasConsent)
  
  if (dismissed) return null
  
  const handleConsent = async () => {
    const result = await giveAnalyticsConsent()
    if (result.success) setDismissed(true)
  }
  
  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <p className="font-medium">Help improve healthcare in your region</p>
          <p className="text-sm text-muted-foreground">
            Allow us to analyze your anonymized data to improve health outcomes. 
            No personal information is shared.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setDismissed(true)}>Not now</Button>
          <Button onClick={handleConsent}>I agree</Button>
        </div>
      </CardContent>
    </Card>
  )
}
```

#### Audit Logging

```sql
-- Migration: create_admin_audit_logs
CREATE TABLE admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users(id) NOT NULL,
  action TEXT NOT NULL, -- 'view_cohort_analytics', 'export_data', etc.
  resource TEXT, -- 'analytics_cohort_monthly'
  filters JSONB, -- { startMonth, endMonth, state }
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_admin_audit_logs_admin ON admin_audit_logs(admin_id, created_at DESC);
CREATE INDEX idx_admin_audit_logs_action ON admin_audit_logs(action, created_at DESC);

-- RLS: only admins can read their own logs
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read own audit logs"
  ON admin_audit_logs FOR SELECT
  USING (
    admin_id = auth.uid() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
```

Log every admin analytics view:

```typescript
// lib/audit.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

export async function logAdminAction(action: string, resource: string, filters: object) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return
  
  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip')
  const userAgent = headersList.get('user-agent')
  
  await supabase.from('admin_audit_logs').insert({
    admin_id: user.id,
    action,
    resource,
    filters,
    ip_address: ip,
    user_agent: userAgent,
  })
}
```

Call in admin pages:

```typescript
// app/admin/analytics/page.tsx
import { logAdminAction } from '@/lib/audit'

export default async function AdminAnalyticsPage({ searchParams }: PageProps) {
  await logAdminAction('view_cohort_analytics', 'analytics_cohort_monthly', searchParams)
  // ... rest of page
}
```

---

### 7. Data Export for External Analysis

#### CSV Export Action

```typescript
// app/actions/admin-analytics.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { logAdminAction } from '@/lib/audit'

export async function exportCohortDataCSV(filters: {
  startMonth: string
  endMonth: string
  country?: string
  state?: string
}) {
  const supabase = await createClient()
  
  // Verify admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (profile?.role !== 'admin') {
    return { success: false, error: 'Admin access required' }
  }
  
  // Fetch data
  let query = supabase
    .from('analytics_cohort_monthly')
    .select('*')
    .gte('month', filters.startMonth)
    .lte('month', filters.endMonth)
    .gte('cohort_size', 20)
  
  if (filters.country) query = query.eq('country_code', filters.country)
  if (filters.state) query = query.eq('state', filters.state)
  
  const { data, error } = await query.order('month')
  
  if (error || !data) {
    return { success: false, error: 'Failed to fetch data' }
  }
  
  // Log export
  await logAdminAction('export_cohort_data_csv', 'analytics_cohort_monthly', filters)
  
  // Generate CSV
  const headers = Object.keys(data[0])
  const csv = [
    headers.join(','),
    ...data.map((row) => headers.map((h) => row[h]).join(',')),
  ].join('\n')
  
  return {
    success: true,
    data: {
      csv,
      filename: `cohort-analytics-${filters.startMonth}-to-${filters.endMonth}.csv`,
    },
  }
}
```

#### Export Button

```typescript
'use client'

import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { exportCohortDataCSV } from '@/app/actions/admin-analytics'
import { useSearchParams } from 'next/navigation'

export function ExportButton() {
  const searchParams = useSearchParams()
  
  const handleExport = async () => {
    const result = await exportCohortDataCSV({
      startMonth: searchParams.get('startMonth') || '',
      endMonth: searchParams.get('endMonth') || '',
      country: searchParams.get('country') || '',
      state: searchParams.get('state') || '',
    })
    
    if (result.success && result.data) {
      const blob = new Blob([result.data.csv], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = result.data.filename
      a.click()
    }
  }
  
  return (
    <Button onClick={handleExport} variant="outline">
      <Download className="mr-2 h-4 w-4" />
      Export CSV
    </Button>
  )
}
```

---

### 8. Implementation Checklist

#### Phase 1: Foundation (Week 1)
- [ ] Add `country_code`, `state`, `analytics_consent` to `profiles` table
- [ ] Create migration for `analytics_user_monthly` materialized view
- [ ] Create migration for `analytics_cohort_monthly` materialized view
- [ ] Add `role` column to `profiles` and set admin users
- [ ] Create `admin_audit_logs` table
- [ ] Update middleware to protect `/admin` routes
- [ ] Set up daily MV refresh via cron/Edge Function

#### Phase 2: UI & Analytics (Week 2)
- [ ] Build `app/admin/analytics/page.tsx` with cohort filters
- [ ] Implement `BPTrendsChart` component (Recharts)
- [ ] Implement `InsightsCards` component
- [ ] Add analytics consent banner to user dashboard
- [ ] Create Server Action for analytics consent opt-in
- [ ] Implement audit logging in all admin views

#### Phase 3: Advanced Features (Week 3)
- [ ] Build correlation analysis Server Actions
- [ ] Add regional map visualization (optional: react-simple-maps)
- [ ] Implement CSV export functionality
- [ ] Add "Insights" page with automated recommendations
- [ ] Create admin user management page
- [ ] Write comprehensive tests

#### Phase 4: Compliance & Launch (Week 4)
- [ ] Update privacy policy with analytics clause
- [ ] Implement k-anonymity enforcement (n ≥ 20)
- [ ] Add data retention policy (delete old MVs after 2 years)
- [ ] Security audit: verify no PII leakage
- [ ] Performance testing with 10k+ users
- [ ] Deploy to production with feature flag

---

### 9. Sample Insights & Use Cases

#### Example Query Results

**Use Case 1: Exercise Impact in Lagos**
```
Cohort: Lagos State, 6 months (Jan–Jun 2026)
Users: 3,240
- Users exercising ≥150 min/week: Avg systolic = 125 mmHg
- Users exercising <150 min/week: Avg systolic = 132 mmHg
→ Insight: 7 mmHg reduction associated with WHO exercise guidelines
```

**Use Case 2: Medication Adherence**
```
Cohort: All Nigeria, 6 months
Users: 8,900
- High adherence (≥80%): Avg systolic = 128 mmHg
- Low adherence (<80%): Avg systolic = 138 mmHg
→ Insight: 10 mmHg difference; target adherence interventions
```

**Use Case 3: Regional Comparison**
```
Top 3 States with Best BP Improvement (Jan–Jun 2026):
1. Abuja: -8 mmHg avg systolic
2. Lagos: -5 mmHg
3. Rivers: -3 mmHg
→ Insight: Investigate successful interventions in Abuja
```

---

### 10. Performance & Scalability

#### Expected Performance

- **10,000 users × 6 months** = ~60,000 user-month records in `analytics_user_monthly`
- **Daily MV refresh**: ~5-10 seconds
- **Admin dashboard load**: <1 second (querying pre-aggregated `analytics_cohort_monthly`)
- **CSV export**: <5 seconds for 200 cohort-month rows

#### Scaling Beyond 100k Users

- Add partitioning on `analytics_user_monthly` by month
- Use incremental MV refreshes (only update changed data)
- Cache frequently accessed cohort queries with Redis
- Consider Postgres read replicas for analytics queries

---

### 11. Security & Compliance Summary

| Requirement | Implementation |
|-------------|---------------|
| **No PII in Admin UI** | Only aggregated cohorts; no names/emails |
| **k-Anonymity** | Filter `cohort_size >= 20` in all queries |
| **Consent Required** | `analytics_consent = true` filter on all MVs |
| **Audit Trail** | Log every admin view/export in `admin_audit_logs` |
| **Role-Based Access** | Middleware + RLS enforce `role = 'admin'` |
| **Data Minimization** | MVs contain only necessary aggregates |
| **NDPA Compliance** | Consent + purpose limitation + data subject rights |

---

### 12. Future Enhancements

- **Machine Learning**: Predict BP outcomes based on exercise/diet patterns
- **A/B Testing**: Compare intervention effectiveness across cohorts
- **Real-time Dashboards**: WebSocket updates for live cohort metrics
- **Multi-Country Support**: Add country comparisons (NG vs Ghana vs Kenya)
- **Patient Risk Stratification**: Identify high-risk cohorts for targeted outreach
- **Telemedicine Integration**: Link cohort insights to doctor assignment (see `future.md`)

---

## Questions or Concerns?

This plan provides a **production-ready, privacy-compliant admin analytics system** for cohort analysis. When you're ready to build, start with Phase 1 migrations and work through the checklist sequentially.

**Key Files to Create:**
1. `supabase/migrations/add_region_demographics.sql`
2. `supabase/migrations/create_analytics_user_monthly_mv.sql`
3. `supabase/migrations/create_analytics_cohort_monthly_mv.sql`
4. `supabase/migrations/add_admin_role.sql`
5. `supabase/migrations/create_admin_audit_logs.sql`
6. `app/admin/analytics/page.tsx`
7. `app/actions/admin-analytics.ts`
8. `lib/audit.ts`

All code follows your stack: **Next.js 15, React 19, TypeScript strict, Supabase, WCAG 2.1 AA, NDPA compliance**.

