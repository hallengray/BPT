---
title: "Medication Reminders & BP Follow-up Notifications"
status: planned
owner: Femi
created: 2025-11-04
priority: high
---

# Medication Reminders & BP Follow-up Notifications Plan

## Executive Summary

Implement a comprehensive medication reminder system with two key features:
1. **Medication Reminders**: Notify users when it's time to take their medication
2. **BP Follow-up Reminders**: Prompt users to take BP reading 1-2 hours after medication intake

This will help improve medication adherence and enable better tracking of medication effects on blood pressure.

---

## Current System Analysis

### Existing Data Model

**`medication_logs` table:**
- `time_of_day`: Array of times (e.g., `["08:00", "20:00"]`)
- `frequency`: `once_daily`, `twice_daily`, `three_times_daily`, `as_needed`, `weekly`, `other`
- `start_date`, `end_date`: Medication period
- `is_active`: Boolean flag

**`medication_doses` table:**
- `scheduled_time`: When dose should be taken
- `taken_at`: When user marked as taken (nullable)
- `was_taken`: Boolean flag
- Currently only created when user manually records a dose

### Current Limitations

1. **No Automatic Scheduling**: Doses aren't pre-scheduled based on `time_of_day` array
2. **No Reminder System**: No notifications when medication time arrives
3. **No BP Follow-up**: No automatic reminder to check BP after medication
4. **Manual Tracking Only**: Users must remember to log doses manually

---

## Feature Requirements

### 1. Medication Reminder System

**User Stories:**
- As a user, I want to receive notifications when it's time to take my medication
- As a user, I want to customize reminder timing (e.g., 15 min before, at time, 15 min after)
- As a user, I want to see pending medication reminders in the app
- As a user, I want to mark medication as taken directly from the notification

**Requirements:**
- Generate scheduled doses automatically when medication is created/updated
- Support multiple notification channels (browser, in-app, SMS, email)
- Allow user to configure reminder preferences
- Handle missed doses with follow-up reminders
- Support timezone-aware scheduling

### 2. BP Follow-up Reminder System

**User Stories:**
- As a user, I want to be reminded to check my BP 1-2 hours after taking medication
- As a user, I want to configure the delay time (1 hour, 1.5 hours, 2 hours)
- As a user, I want to see which medication triggered the BP reminder

**Requirements:**
- Trigger BP reminder when user marks medication as taken
- Configurable delay (default: 1.5 hours)
- Link reminder to specific medication for context
- Allow user to dismiss or snooze reminder

---

## Architecture Design

### 1. Database Schema Changes

#### New Table: `medication_reminders`

```sql
CREATE TABLE medication_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  medication_log_id UUID REFERENCES medication_logs(id) NOT NULL,
  scheduled_dose_id UUID REFERENCES medication_doses(id),
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('medication', 'bp_followup')),
  scheduled_at TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  acknowledged_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'acknowledged', 'missed', 'cancelled')),
  notification_channels JSONB DEFAULT '["browser", "in_app"]'::jsonb,
  metadata JSONB, -- Store medication name, dosage, etc. for quick access
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_medication_reminders_user_scheduled 
  ON medication_reminders(user_id, scheduled_at) 
  WHERE status = 'pending';

CREATE INDEX idx_medication_reminders_dose 
  ON medication_reminders(scheduled_dose_id) 
  WHERE scheduled_dose_id IS NOT NULL;
```

#### New Table: `user_notification_preferences`

```sql
CREATE TABLE user_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
  
  -- Medication reminder preferences
  medication_reminders_enabled BOOLEAN DEFAULT true,
  medication_reminder_advance_minutes INTEGER DEFAULT 15, -- Remind 15 min before
  medication_reminder_channels JSONB DEFAULT '["browser", "in_app"]'::jsonb,
  medication_reminder_snooze_minutes INTEGER DEFAULT 15,
  medication_missed_dose_followup BOOLEAN DEFAULT true,
  
  -- BP follow-up preferences
  bp_followup_enabled BOOLEAN DEFAULT true,
  bp_followup_delay_hours DECIMAL(3,1) DEFAULT 1.5, -- 1.5 hours after medication
  bp_followup_channels JSONB DEFAULT '["browser", "in_app"]'::jsonb,
  
  -- General preferences
  quiet_hours_start TIME DEFAULT '22:00', -- No notifications after 10 PM
  quiet_hours_end TIME DEFAULT '07:00', -- No notifications before 7 AM
  timezone TEXT DEFAULT 'Africa/Lagos',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_notification_prefs_user ON user_notification_preferences(user_id);
```

#### Modify `medication_doses` table

```sql
-- Add reminder tracking
ALTER TABLE medication_doses
  ADD COLUMN reminder_sent_at TIMESTAMPTZ,
  ADD COLUMN reminder_acknowledged_at TIMESTAMPTZ;

-- Add index for pending doses
CREATE INDEX idx_medication_doses_pending 
  ON medication_doses(user_id, scheduled_time) 
  WHERE was_taken IS NULL OR was_taken = false;
```

### 2. Automatic Dose Scheduling System

#### Server Action: `generateScheduledDoses`

**Purpose**: Automatically create `medication_doses` entries based on medication schedule

**Trigger**: 
- When medication is created
- When medication `time_of_day` is updated
- Daily cron job to generate next 7 days of doses

**Logic**:
```typescript
// Pseudocode
function generateScheduledDoses(medicationId: string, days: number = 7) {
  const medication = getMedication(medicationId)
  const startDate = medication.start_date
  const endDate = medication.end_date || futureDate
  
  for each day from today to (today + days) {
    if (day is within startDate and endDate) {
      for each time in medication.time_of_day {
        const scheduledTime = combine(day, time)
        
        // Check if dose already exists
        if (!doseExists(medicationId, scheduledTime)) {
          create medication_dose {
            scheduled_time: scheduledTime,
            was_taken: false,
            medication_log_id: medicationId
          }
          
          // Create reminder
          create medication_reminder {
            scheduled_at: scheduledTime - advanceMinutes,
            reminder_type: 'medication',
            scheduled_dose_id: doseId
          }
        }
      }
    }
  }
}
```

**File**: `app/actions/medication-scheduling.ts`

### 3. Reminder Notification System

#### Notification Channels

**1. Browser Notifications (Web Push)**
- Use Web Push API with Service Worker
- Requires user permission
- Works when browser is open (even if tab is inactive)
- Best for desktop users

**2. In-App Notifications**
- Real-time notifications in app UI
- Badge count on medications page
- Toast notifications
- Always available

**3. SMS (Termii - Nigeria)**
- For critical reminders (missed doses)
- Requires phone number in profile
- Opt-in only
- Cost consideration

**4. Email (Resend)**
- Daily digest of missed doses
- Weekly adherence summary
- Opt-in only

#### Notification Service Architecture

**File**: `lib/notifications/medication-reminders.ts`

```typescript
export async function sendMedicationReminder(
  reminderId: string,
  userId: string,
  medicationName: string,
  scheduledTime: Date,
  channels: string[]
) {
  const preferences = await getUserNotificationPreferences(userId)
  
  // Check quiet hours
  if (isQuietHours(scheduledTime, preferences)) {
    return { success: false, reason: 'quiet_hours' }
  }
  
  const results = []
  
  if (channels.includes('browser')) {
    results.push(await sendBrowserNotification(...))
  }
  
  if (channels.includes('in_app')) {
    results.push(await createInAppNotification(...))
  }
  
  if (channels.includes('sms')) {
    results.push(await sendSMSNotification(...))
  }
  
  if (channels.includes('email')) {
    results.push(await sendEmailNotification(...))
  }
  
  // Update reminder status
  await updateReminderStatus(reminderId, 'sent')
  
  return { success: true, results }
}
```

### 4. BP Follow-up Reminder System

#### Trigger Logic

**When user marks medication as taken:**
1. Record `taken_at` timestamp in `medication_doses`
2. Calculate BP reminder time: `taken_at + delay_hours`
3. Create `medication_reminder` with:
   - `reminder_type: 'bp_followup'`
   - `scheduled_at: calculated_time`
   - `scheduled_dose_id: dose_id`
   - `metadata: { medication_name, dosage }`

**File**: `app/actions/medication-logs.ts` (modify `recordDose`)

```typescript
export async function recordDose(...) {
  // ... existing dose recording logic ...
  
  if (wasTaken && data) {
    // Create BP follow-up reminder
    const preferences = await getUserNotificationPreferences(user.id)
    
    if (preferences.bp_followup_enabled) {
      const bpReminderTime = new Date(takenAt)
      bpReminderTime.setHours(
        bpReminderTime.getHours() + preferences.bp_followup_delay_hours
      )
      
      await createBPFollowupReminder({
        user_id: user.id,
        medication_log_id: medicationLogId,
        scheduled_dose_id: data.id,
        scheduled_at: bpReminderTime,
        medication_name: medication.medication_name,
      })
    }
  }
  
  return { success: true, data }
}
```

### 5. Background Job System

**Decision**: Use **Supabase Edge Functions** (recommended for production reliability)

#### Comparison: Supabase Edge Functions vs Vercel Cron Jobs

**Current Context:**
- Production app deployed on Vercel
- Database: Supabase (PostgreSQL)
- Use case: Medication reminders every 5 minutes

#### Option A: Supabase Edge Functions ✅ **RECOMMENDED**

**Architecture:**
```
Supabase Cron (pg_cron) → Edge Function → Direct DB Access
```

**Implementation:**

**File**: `supabase/functions/check-medication-reminders/index.ts`

```typescript
// Runs every 5 minutes via Supabase Cron
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )
  
  const now = new Date()
  const windowStart = new Date(now.getTime() - 5 * 60 * 1000) // 5 min ago
  const windowEnd = new Date(now.getTime() + 5 * 60 * 1000) // 5 min ahead
  
  // Fetch pending reminders in time window
  const { data: reminders } = await supabase
    .from('medication_reminders')
    .select('*, medication_logs(*), user_notification_preferences(*)')
    .eq('status', 'pending')
    .gte('scheduled_at', windowStart.toISOString())
    .lte('scheduled_at', windowEnd.toISOString())
  
  // Send notifications
  for (const reminder of reminders || []) {
    await sendMedicationReminder(reminder)
  }
  
  // Check for missed doses (scheduled > 30 min ago, not taken)
  await checkMissedDoses()
  
  return new Response(JSON.stringify({ processed: reminders?.length || 0 }))
})
```

**Supabase Cron Configuration**:
```sql
-- Enable pg_cron extension (one-time setup)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule Edge Function to run every 5 minutes
SELECT cron.schedule(
  'check-medication-reminders',
  '*/5 * * * *', -- Every 5 minutes
  $$
  SELECT
    net.http_post(
      url := 'https://YOUR_PROJECT.supabase.co/functions/v1/check-medication-reminders',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ),
      body := '{}'::jsonb
    ) AS request_id;
  $$
);
```

**Pros:**
- ✅ **Maximum Reliability**: pg_cron is battle-tested PostgreSQL extension
- ✅ **Low Latency**: Direct database access (no external API calls)
- ✅ **Same Infrastructure**: Uses existing Supabase project
- ✅ **Cost-Effective**: Free tier (500K invocations/month) likely sufficient
- ✅ **Better Timezone Support**: PostgreSQL timezone functions
- ✅ **No Cold Starts**: Edge Functions stay warm for scheduled jobs
- ✅ **Scalable**: Auto-scales with Supabase infrastructure

**Cons:**
- ❌ **Vendor Lock-in**: Tied to Supabase platform
- ❌ **Deno Runtime**: Different from Node.js/Next.js codebase
- ❌ **Learning Curve**: Need to learn Deno APIs
- ❌ **Separate Deployment**: Different from Vercel deployment

**Cost:**
- Free tier: 500K invocations/month (likely sufficient)
- Pro plan: $25/month (2M invocations/month) if needed
- Your volume: ~8,640 runs/month = well within free tier

#### Option B: Vercel Cron Jobs

**Architecture:**
```
Vercel Cron → Next.js API Route → Supabase API Call
```

**Implementation:**

**File**: `app/api/cron/medication-reminders/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const supabase = await createClient()
  
  const now = new Date()
  const windowStart = new Date(now.getTime() - 5 * 60 * 1000)
  const windowEnd = new Date(now.getTime() + 5 * 60 * 1000)
  
  // Fetch pending reminders
  const { data: reminders } = await supabase
    .from('medication_reminders')
    .select('*, medication_logs(*), user_notification_preferences(*)')
    .eq('status', 'pending')
    .gte('scheduled_at', windowStart.toISOString())
    .lte('scheduled_at', windowEnd.toISOString())
  
  // Process reminders...
  
  return NextResponse.json({ processed: reminders?.length || 0 })
}
```

**Vercel Configuration**: `vercel.json`
```json
{
  "crons": [{
    "path": "/api/cron/medication-reminders",
    "schedule": "*/5 * * * *"
  }]
}
```

**Pros:**
- ✅ **Unified Deployment**: Same codebase, same deployment process
- ✅ **Familiar Stack**: Uses Next.js API routes (TypeScript, Node.js)
- ✅ **Easy Debugging**: Same tools as rest of app (Vercel logs)
- ✅ **Version Control**: Cron config in `vercel.json` (tracked in git)
- ✅ **No Learning Curve**: Same Next.js patterns

**Cons:**
- ❌ **External API Call**: Must call Supabase API (slight latency)
- ❌ **Cold Starts**: API routes may have cold start delays
- ❌ **Function Timeout**: 10s (Hobby), 60s (Pro) - may be tight for batch processing
- ❌ **Less Reliable**: Vercel cron is "best effort" (may skip runs)
- ❌ **No Guaranteed Execution**: May skip runs under load

**Cost:**
- Hobby plan: Free (includes cron, but limited)
- Pro plan: $20/month per user (unlimited cron jobs)

#### Option C: Hybrid Approach (Alternative)

**Architecture:**
```
Vercel Cron → Calls Supabase Edge Function → Direct DB Access
```

**Benefits:**
- ✅ Unified deployment (Vercel)
- ✅ Direct database access (Supabase)
- ✅ Familiar Next.js code
- ✅ Reliable execution

**Implementation:**
```typescript
// app/api/cron/medication-reminders/route.ts
export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Call Supabase Edge Function
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/check-medication-reminders`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    }
  )
  
  const result = await response.json()
  return NextResponse.json(result)
}
```

#### Decision Matrix

| Factor | Supabase Edge Functions | Vercel Cron Jobs | Winner |
|--------|-------------------------|------------------|--------|
| **Reliability** | High (pg_cron) | Medium (best effort) | 🟢 Supabase |
| **Latency** | Very low (~10-50ms) | Medium (~100-300ms) | 🟢 Supabase |
| **Setup Complexity** | Medium (Deno + pg_cron) | Low (Next.js route) | 🟢 Vercel |
| **Code Consistency** | Different runtime (Deno) | Same (Next.js) | 🟢 Vercel |
| **Database Access** | Direct (same network) | API call (external) | 🟢 Supabase |
| **Cost** | Free tier sufficient | Free tier sufficient | 🟡 Tie |
| **Production-Grade** | Yes | Best effort | 🟢 Supabase |

#### Final Recommendation: **Supabase Edge Functions** ✅

**Why:**
1. **Critical Health Reminders**: Need maximum reliability (pg_cron is more reliable)
2. **Low Latency**: Direct database access = faster processing
3. **Same Infrastructure**: Already using Supabase, keeps everything together
4. **Timezone Handling**: PostgreSQL timezone functions are more accurate
5. **Cost-Effective**: Free tier likely sufficient for your volume

**Trade-offs:**
- Need to learn Deno (minimal learning curve)
- Separate deployment process (but simple with Supabase CLI)
- Different debugging tools (but Supabase dashboard is good)

**When to Choose Vercel Cron Instead:**
- You want everything in one codebase (simpler mental model)
- You prioritize development speed over reliability
- You're comfortable with "best effort" scheduling
- Your reminder volume is very low (<100/day)

#### Implementation Plan: Supabase Edge Functions

**Phase 1: Setup (Day 1)**
1. Install Supabase CLI: `npm install -g supabase`
2. Initialize: `supabase init`
3. Link project: `supabase link --project-ref your-project-ref`
4. Create function: `supabase functions new check-medication-reminders`

**Phase 2: Development (Days 2-3)**
1. Write Edge Function code
2. Set up pg_cron
3. Configure environment variables

**Phase 3: Testing (Day 4)**
1. Local testing: `supabase functions serve check-medication-reminders`
2. Test cron job manually
3. Production testing

**Phase 4: Deployment (Day 5)**
1. Deploy: `supabase functions deploy check-medication-reminders`
2. Set secrets: `supabase secrets set TERMII_API_KEY=xxx`
3. Verify cron job in Supabase dashboard

**Estimated Setup Time**: 1-2 days
**Complexity**: Medium (learning Deno)
**Long-term Maintenance**: Low (stable system)

### 6. Web Push Notifications Setup

#### Service Worker

**File**: `public/sw.js`

```javascript
self.addEventListener('push', (event) => {
  const data = event.data.json()
  
  const options = {
    body: data.body,
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url,
      reminderId: data.reminderId,
      type: data.type
    },
    actions: [
      { action: 'take', title: 'Mark as Taken' },
      { action: 'snooze', title: 'Remind in 15 min' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  }
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  
  if (event.action === 'take') {
    // Open app and mark as taken
    event.waitUntil(
      clients.openWindow(`/medications?action=take&reminderId=${event.notification.data.reminderId}`)
    )
  } else if (event.action === 'snooze') {
    // Snooze reminder
    // ... API call to snooze ...
  } else {
    // Default: open app
    event.waitUntil(clients.openWindow('/medications'))
  }
})
```

#### Push Subscription Management

**File**: `app/actions/notifications.ts`

```typescript
export async function requestNotificationPermission() {
  if ('Notification' in window && 'serviceWorker' in navigator) {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }
  return false
}

export async function subscribeToPushNotifications() {
  const registration = await navigator.serviceWorker.ready
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  })
  
  // Save subscription to database
  await savePushSubscription(subscription)
  
  return subscription
}
```

### 7. In-App Notification Component

**File**: `components/notifications/medication-reminder-banner.tsx`

```typescript
'use client'

export function MedicationReminderBanner() {
  const [reminders, setReminders] = useState<MedicationReminder[]>([])
  
  useEffect(() => {
    // Fetch active reminders
    fetchActiveReminders()
    
    // Poll for new reminders every 30 seconds
    const interval = setInterval(fetchActiveReminders, 30000)
    return () => clearInterval(interval)
  }, [])
  
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {reminders.map(reminder => (
        <ReminderCard 
          key={reminder.id}
          reminder={reminder}
          onDismiss={handleDismiss}
          onTake={handleTake}
        />
      ))}
    </div>
  )
}
```

### 8. User Preferences UI

**File**: `app/(dashboard)/profile/notifications/page.tsx`

```typescript
export default function NotificationPreferencesPage() {
  return (
    <div className="space-y-6">
      <h1>Notification Preferences</h1>
      
      {/* Medication Reminders Section */}
      <Card>
        <CardHeader>
          <CardTitle>Medication Reminders</CardTitle>
        </CardHeader>
        <CardContent>
          <Switch label="Enable medication reminders" />
          <Select label="Remind me" options={['15 min before', 'At time', '15 min after']} />
          <MultiSelect label="Notification channels" options={['Browser', 'In-app', 'SMS', 'Email']} />
        </CardContent>
      </Card>
      
      {/* BP Follow-up Section */}
      <Card>
        <CardHeader>
          <CardTitle>BP Follow-up Reminders</CardTitle>
        </CardHeader>
        <CardContent>
          <Switch label="Remind me to check BP after medication" />
          <Select label="Delay" options={['1 hour', '1.5 hours', '2 hours']} />
        </CardContent>
      </Card>
      
      {/* Quiet Hours */}
      <Card>
        <CardHeader>
          <CardTitle>Quiet Hours</CardTitle>
        </CardHeader>
        <CardContent>
          <TimePicker label="Start" />
          <TimePicker label="End" />
        </CardContent>
      </Card>
    </div>
  )
}
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Create database tables (`medication_reminders`, `user_notification_preferences`)
- [ ] Implement `generateScheduledDoses` server action
- [ ] Create dose scheduling on medication create/update
- [ ] Build user notification preferences UI
- [ ] Add timezone support

### Phase 2: In-App Notifications (Week 2)
- [ ] Build `MedicationReminderBanner` component
- [ ] Create reminder polling system
- [ ] Implement "Mark as Taken" from reminder
- [ ] Add reminder dismissal/snooze
- [ ] Create reminder history page

### Phase 3: Browser Push Notifications (Week 3)
- [ ] Set up Service Worker
- [ ] Implement VAPID keys
- [ ] Create push subscription management
- [ ] Build notification click handlers
- [ ] Test cross-browser compatibility

### Phase 4: BP Follow-up Reminders (Week 4)
- [ ] Modify `recordDose` to create BP reminders
- [ ] Build BP reminder notification
- [ ] Add "Take BP Now" quick action
- [ ] Link BP reading to medication dose
- [ ] Create medication-BP correlation view

### Phase 5: Background Jobs & Advanced Features (Week 5)
- [ ] **Set up Supabase Edge Functions** (chosen over Vercel Cron for reliability)
  - [ ] Install Supabase CLI
  - [ ] Create Edge Function: `check-medication-reminders`
  - [ ] Set up pg_cron extension
  - [ ] Configure cron schedule (every 5 minutes)
  - [ ] Deploy Edge Function
- [ ] Implement reminder processing job
- [ ] Add missed dose detection
- [ ] Create daily/weekly digest emails
- [ ] Add SMS notifications (Termii integration)
- [ ] Performance optimization

### Phase 6: Testing & Polish (Week 6)
- [ ] End-to-end testing
- [ ] Timezone edge cases
- [ ] Quiet hours validation
- [ ] Accessibility audit
- [ ] Mobile responsiveness
- [ ] User documentation

---

## Technical Considerations

### Timezone Handling

**Challenge**: Users in different timezones need accurate scheduling

**Solution**:
- Store user timezone in `user_notification_preferences`
- Convert all `time_of_day` to UTC for storage
- Convert back to user timezone for display/notifications
- Use `date-fns-tz` library

```typescript
import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz'

function scheduleDoseInUserTimezone(
  date: Date,
  time: string, // "08:00"
  userTimezone: string
) {
  const localDateTime = `${date.toISOString().split('T')[0]}T${time}:00`
  return zonedTimeToUtc(localDateTime, userTimezone)
}
```

### Performance Optimization

**Challenge**: Checking reminders every 5 minutes for all users

**Solutions**:
- Use database indexes on `scheduled_at` and `status`
- Batch process reminders (max 100 per run)
- Use Redis for caching active reminders
- Implement exponential backoff for failed notifications

### Privacy & Compliance

**Considerations**:
- User must explicitly opt-in to notifications
- Store notification preferences separately
- Allow easy opt-out at any time
- Don't store sensitive medication data in notification metadata
- Comply with NDPA 2023 (Nigeria)

### Error Handling

**Scenarios**:
- User disables browser notifications → Fallback to in-app
- SMS/Email service down → Log error, retry later
- Dose already taken → Cancel reminder
- Medication deactivated → Cancel all pending reminders

---

## User Experience Flow

### Medication Reminder Flow

1. **Scheduled Time Approaches**
   - System checks for pending reminders every 5 minutes
   - Finds reminder scheduled for now (within 5-min window)

2. **Notification Sent**
   - Browser notification appears (if enabled)
   - In-app banner appears at bottom-right
   - SMS sent (if enabled and critical)

3. **User Interaction**
   - **"Mark as Taken"**: Records dose, dismisses reminder, triggers BP follow-up
   - **"Snooze"**: Reschedules reminder for 15 minutes later
   - **"Dismiss"**: Marks reminder as dismissed, doesn't record dose

4. **Missed Dose Handling**
   - If not taken within 30 minutes → Send follow-up reminder
   - If not taken within 2 hours → Mark as missed, send alert
   - Show missed doses in medications page

### BP Follow-up Flow

1. **User Marks Medication as Taken**
   - System records `taken_at` timestamp
   - Calculates BP reminder time (e.g., 1.5 hours later)

2. **BP Reminder Time Arrives**
   - Notification: "Time to check your BP after taking [Medication Name]"
   - In-app banner with quick "Log BP" button
   - Links to quick-log BP form with pre-filled context

3. **User Takes BP Reading**
   - BP reading is linked to medication dose (via metadata)
   - Shows in medication-BP correlation analytics
   - Reminder dismissed

---

## Database Queries Examples

### Get Pending Medication Reminders

```sql
SELECT 
  mr.*,
  ml.medication_name,
  ml.dosage,
  ml.time_of_day,
  unp.timezone
FROM medication_reminders mr
JOIN medication_logs ml ON ml.id = mr.medication_log_id
JOIN user_notification_preferences unp ON unp.user_id = mr.user_id
WHERE mr.status = 'pending'
  AND mr.scheduled_at BETWEEN NOW() - INTERVAL '5 minutes' AND NOW() + INTERVAL '5 minutes'
  AND ml.is_active = true
  AND (ml.end_date IS NULL OR ml.end_date > NOW())
ORDER BY mr.scheduled_at ASC;
```

### Get Missed Doses

```sql
SELECT 
  md.*,
  ml.medication_name,
  ml.dosage
FROM medication_doses md
JOIN medication_logs ml ON ml.id = md.medication_log_id
WHERE md.was_taken = false
  AND md.scheduled_time < NOW() - INTERVAL '30 minutes'
  AND md.scheduled_time > NOW() - INTERVAL '24 hours'
  AND ml.is_active = true
ORDER BY md.scheduled_time DESC;
```

---

## File Structure

```
app/
├── actions/
│   ├── medication-scheduling.ts      # Generate scheduled doses
│   ├── medication-reminders.ts       # Reminder CRUD operations
│   ├── notifications.ts              # Push subscription management
│   └── medication-logs.ts            # Modified: Add BP reminder trigger
│
├── (dashboard)/
│   ├── medications/
│   │   └── reminders/                # Reminder history page
│   └── profile/
│       └── notifications/            # Notification preferences page
│
├── api/
│   └── cron/
│       └── medication-reminders/     # Cron job endpoint
│
components/
├── notifications/
│   ├── medication-reminder-banner.tsx # In-app reminder UI
│   ├── bp-followup-banner.tsx        # BP reminder UI
│   └── notification-preferences.tsx  # Preferences form
│
lib/
├── notifications/
│   ├── medication-reminders.ts       # Reminder sending logic
│   ├── push-notifications.ts         # Web Push API wrapper
│   └── channels/
│       ├── browser.ts                # Browser notification
│       ├── in-app.ts                 # In-app notification
│       ├── sms.ts                    # SMS (Termii)
│       └── email.ts                  # Email (Resend)
│
├── scheduling/
│   └── dose-generator.ts             # Generate scheduled doses
│
public/
└── sw.js                              # Service Worker

supabase/
└── functions/
    └── check-medication-reminders/    # Edge Function cron job
```

---

## Success Metrics

### Medication Adherence
- **Target**: Increase adherence rate by 20%
- **Measure**: Compare `was_taken` rate before/after implementation

### BP Follow-up Compliance
- **Target**: 60% of medication doses have follow-up BP readings
- **Measure**: Count BP readings within 2 hours of medication dose

### User Engagement
- **Target**: 80% of users enable at least one notification channel
- **Measure**: Count users with `medication_reminders_enabled = true`

### Notification Effectiveness
- **Target**: 70% of reminders result in dose being taken
- **Measure**: `acknowledged_at` / `sent_at` ratio

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Browser notification permission denied | High | Fallback to in-app notifications |
| Timezone bugs causing wrong reminder times | High | Comprehensive timezone testing, use UTC internally |
| Background job failures | Medium | Retry logic, error logging, manual trigger option |
| SMS/Email service downtime | Low | Graceful degradation, queue for retry |
| Performance issues with many users | Medium | Database indexing, batch processing, caching |
| User notification fatigue | Medium | Quiet hours, smart scheduling, user preferences |

---

## Future Enhancements

1. **Smart Reminders**: ML-based optimal reminder timing per user
2. **Medication Interactions**: Warn about BP medication interactions
3. **Family/Caregiver Notifications**: Allow family to receive reminders
4. **Voice Reminders**: Integration with smart speakers (Alexa, Google Home)
5. **Medication Refill Reminders**: Alert when medication is running low
6. **Adherence Reports**: Weekly/monthly summaries for healthcare providers

---

## Questions to Resolve

1. **Default Delay for BP Follow-up**: 1 hour, 1.5 hours, or 2 hours?
   - **Recommendation**: 1.5 hours (default), user-configurable

2. **Missed Dose Threshold**: When to mark as "missed"?
   - **Recommendation**: 2 hours after scheduled time

3. **Notification Frequency**: How many reminders per missed dose?
   - **Recommendation**: Initial reminder, +1 at 30 min, +1 at 2 hours (max 3)

4. **SMS Costs**: Should SMS be premium feature or free?
   - **Recommendation**: Free for critical reminders, premium for all

5. **Quiet Hours Default**: What are reasonable defaults for Nigeria?
   - **Recommendation**: 10 PM - 7 AM (configurable)

---

## Next Steps

1. **Review & Approve Plan**: Get stakeholder sign-off
2. **Set Up Development Environment**: 
   - VAPID keys for Web Push
   - Termii API credentials
   - Resend API key
3. **Create Database Migrations**: Run schema changes
4. **Start Phase 1 Implementation**: Foundation work
5. **User Testing**: Beta test with 10-20 users before full rollout

---

**Estimated Timeline**: 6 weeks for full implementation
**Priority**: High (directly impacts medication adherence and health outcomes)
**Dependencies**: Termii SMS API, Resend Email API, Web Push API support

