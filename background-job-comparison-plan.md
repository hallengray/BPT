---
title: "Background Job System Comparison: Supabase Edge Functions vs Vercel Cron"
status: planning
owner: Femi
created: 2025-11-04
context: Production app deployed on Vercel
---

# Background Job System Comparison: Supabase Edge Functions vs Vercel Cron

## Executive Summary

You need a reliable background job system to check and send medication reminders every 5 minutes. This document compares **Supabase Edge Functions** vs **Vercel Cron Jobs** for your use case, considering your current Vercel production deployment.

---

## Current Context

- ✅ **Production**: App deployed on Vercel
- ✅ **Database**: Supabase (PostgreSQL)
- ✅ **Backend**: Next.js 15 Server Actions
- ✅ **Region**: Nigeria (Africa/Lagos timezone)
- ✅ **Use Case**: Medication reminders every 5 minutes

---

## Option 1: Supabase Edge Functions

### Overview
Supabase Edge Functions are Deno-based serverless functions that can be triggered via HTTP or scheduled with Supabase Cron (pg_cron extension).

### Architecture

```
┌─────────────────┐
│  Supabase Cron  │ (pg_cron extension)
│  (Every 5 min)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Edge Function   │ (Deno runtime)
│ check-reminders  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Supabase DB    │ (Same database)
│  (Read/Write)   │
└─────────────────┘
```

### Implementation Approach

**1. Create Edge Function**
```typescript
// supabase/functions/check-medication-reminders/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )
  
  // Check pending reminders
  const { data: reminders } = await supabase
    .from('medication_reminders')
    .select('*')
    .eq('status', 'pending')
    .gte('scheduled_at', new Date(Date.now() - 5 * 60 * 1000).toISOString())
    .lte('scheduled_at', new Date(Date.now() + 5 * 60 * 1000).toISOString())
  
  // Process reminders...
  
  return new Response(JSON.stringify({ processed: reminders.length }))
})
```

**2. Schedule with pg_cron**
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

### Pros

✅ **Same Infrastructure**: Uses your existing Supabase project
✅ **Low Latency**: Edge Function and database in same network (no external API calls)
✅ **No Additional Service**: No need for separate cron service
✅ **Direct Database Access**: Can use service role key for admin operations
✅ **Cost-Effective**: Included in Supabase Pro plan ($25/month)
✅ **Timezone Support**: Can use PostgreSQL timezone functions
✅ **Reliable**: pg_cron is battle-tested PostgreSQL extension
✅ **Scalable**: Auto-scales with Supabase infrastructure
✅ **Monitoring**: Built into Supabase dashboard
✅ **No Cold Starts**: Edge Functions stay warm for scheduled jobs

### Cons

❌ **Vendor Lock-in**: Tied to Supabase platform
❌ **Deno Runtime**: Different from your Node.js/Next.js codebase
❌ **Learning Curve**: Need to learn Deno APIs
❌ **Deployment**: Separate deployment process from Vercel
❌ **Debugging**: Different debugging tools than Vercel
❌ **Limited Free Tier**: 500K invocations/month (may need Pro plan)
❌ **Function Size Limit**: 50MB deployment size limit

### Cost Analysis

**Supabase Pricing (for Edge Functions)**:
- **Free Tier**: 500K invocations/month
- **Pro Plan**: $25/month (2M invocations/month)
- **Team Plan**: $599/month (10M invocations/month)

**Your Use Case**:
- 5-minute intervals = 12 runs/hour = 288 runs/day = 8,640 runs/month
- Each run processes ~10-50 reminders = ~86K-432K invocations/month
- **Verdict**: Free tier might work, Pro plan recommended for production

---

## Option 2: Vercel Cron Jobs

### Overview
Vercel Cron Jobs are serverless functions that run on a schedule, defined in `vercel.json` or via Vercel dashboard.

### Architecture

```
┌─────────────────┐
│  Vercel Cron    │ (Vercel scheduler)
│  (Every 5 min)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  API Route      │ (Next.js API route)
│  /api/cron/...  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Supabase DB    │ (External API call)
│  (Read/Write)   │
└─────────────────┘
```

### Implementation Approach

**1. Create API Route**
```typescript
// app/api/cron/medication-reminders/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const supabase = await createClient()
  
  // Check pending reminders
  const { data: reminders } = await supabase
    .from('medication_reminders')
    .select('*')
    .eq('status', 'pending')
    .gte('scheduled_at', new Date(Date.now() - 5 * 60 * 1000).toISOString())
    .lte('scheduled_at', new Date(Date.now() + 5 * 60 * 1000).toISOString())
  
  // Process reminders...
  
  return NextResponse.json({ processed: reminders.length })
}
```

**2. Configure in vercel.json**
```json
{
  "crons": [
    {
      "path": "/api/cron/medication-reminders",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

**3. Set Environment Variable**
```bash
CRON_SECRET=your-secret-key-here
```

### Pros

✅ **Unified Deployment**: Same codebase, same deployment process
✅ **Familiar Stack**: Uses Next.js API routes (TypeScript, Node.js)
✅ **Easy Debugging**: Same tools as rest of app (Vercel logs, etc.)
✅ **Version Control**: Cron config in `vercel.json` (tracked in git)
✅ **No Learning Curve**: Same Next.js patterns you already use
✅ **Integrated Monitoring**: Vercel Analytics and logs
✅ **Free Tier Available**: Hobby plan includes cron jobs
✅ **Simple Setup**: Just add route + vercel.json config

### Cons

❌ **External API Call**: Must call Supabase API (slight latency)
❌ **Cold Starts**: API routes may have cold start delays
❌ **Function Timeout**: 10s (Hobby), 60s (Pro) - may be tight for batch processing
❌ **Rate Limits**: Vercel has function execution limits
❌ **Cost at Scale**: Can get expensive with high volume
❌ **Less Reliable**: Depends on Vercel's cron scheduler (less control)
❌ **No Guaranteed Execution**: Vercel cron is "best effort" (may skip runs)

### Cost Analysis

**Vercel Pricing (for Cron Jobs)**:
- **Hobby Plan**: Free (includes cron, but limited)
- **Pro Plan**: $20/month per user (unlimited cron jobs)
- **Enterprise**: Custom pricing

**Your Use Case**:
- 5-minute intervals = 12 runs/hour = 288 runs/day
- Each run = 1 function execution
- **Verdict**: Hobby plan should work, but Pro recommended for reliability

**Potential Issues**:
- If processing 50+ reminders per run, may hit timeout limits
- Need to batch process or use background jobs

---

## Detailed Comparison Matrix

| Factor | Supabase Edge Functions | Vercel Cron Jobs | Winner |
|--------|-------------------------|-------------------|--------|
| **Setup Complexity** | Medium (Deno + pg_cron) | Low (Next.js route) | 🟢 Vercel |
| **Deployment** | Separate (Supabase CLI) | Unified (Vercel) | 🟢 Vercel |
| **Code Consistency** | Different runtime (Deno) | Same (Next.js) | 🟢 Vercel |
| **Database Access** | Direct (same network) | API call (external) | 🟢 Supabase |
| **Latency** | Very low (~10-50ms) | Medium (~100-300ms) | 🟢 Supabase |
| **Reliability** | High (pg_cron) | Medium (Vercel scheduler) | 🟢 Supabase |
| **Cold Starts** | Minimal | Possible | 🟢 Supabase |
| **Timeout Limits** | 60s (default) | 10s (Hobby), 60s (Pro) | 🟡 Tie |
| **Monitoring** | Supabase dashboard | Vercel dashboard | 🟡 Tie |
| **Cost (Low Volume)** | Free tier sufficient | Free tier sufficient | 🟡 Tie |
| **Cost (High Volume)** | $25/month (Pro) | $20/month (Pro) | 🟢 Vercel |
| **Scalability** | Auto-scales | Auto-scales | 🟡 Tie |
| **Timezone Support** | PostgreSQL functions | JavaScript Date | 🟢 Supabase |
| **Error Handling** | Deno error handling | Next.js error handling | 🟢 Vercel |
| **Debugging** | Supabase logs | Vercel logs (familiar) | 🟢 Vercel |
| **Vendor Lock-in** | High (Supabase) | Medium (Vercel) | 🟢 Vercel |

---

## Recommendation: **Supabase Edge Functions** ✅

### Why Supabase Edge Functions?

**1. Better for Your Use Case**
- **Critical Health Reminders**: Need maximum reliability (pg_cron is more reliable)
- **Low Latency**: Direct database access = faster processing
- **Same Infrastructure**: Already using Supabase, keeps everything together
- **Timezone Handling**: PostgreSQL timezone functions are more accurate

**2. Production Reliability**
- pg_cron is a proven PostgreSQL extension (used by many production systems)
- Vercel cron is "best effort" - may skip runs under load
- For medication reminders, you need guaranteed execution

**3. Cost Efficiency**
- Free tier likely sufficient for your volume
- Pro plan ($25/month) if you need more
- No additional services needed

**4. Performance**
- No external API calls (direct database access)
- Lower latency = faster reminder processing
- Better for batch operations

### When to Choose Vercel Cron Instead

Choose Vercel Cron if:
- ✅ You want everything in one codebase (simpler mental model)
- ✅ You prioritize development speed over reliability
- ✅ You're comfortable with "best effort" scheduling
- ✅ You want to avoid learning Deno
- ✅ Your reminder volume is very low (<100/day)

---

## Hybrid Approach (Best of Both Worlds)

### Option 3: Vercel Cron + Supabase Edge Function

**Architecture**:
```
Vercel Cron (every 5 min)
    ↓
Calls Supabase Edge Function (HTTP)
    ↓
Edge Function processes reminders
    ↓
Direct database access
```

**Benefits**:
- ✅ Unified deployment (Vercel)
- ✅ Direct database access (Supabase)
- ✅ Familiar Next.js code
- ✅ Reliable execution

**Implementation**:
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

**Why This Works**:
- Vercel cron triggers (familiar)
- Edge Function does heavy lifting (direct DB access)
- Best of both worlds

---

## Implementation Plan: Supabase Edge Functions

### Phase 1: Setup (Day 1)

1. **Install Supabase CLI**
   ```bash
   npm install -g supabase
   ```

2. **Initialize Supabase in Project**
   ```bash
   supabase init
   ```

3. **Link to Supabase Project**
   ```bash
   supabase link --project-ref your-project-ref
   ```

4. **Create Edge Function**
   ```bash
   supabase functions new check-medication-reminders
   ```

### Phase 2: Development (Days 2-3)

1. **Write Edge Function Code**
   - Check pending reminders
   - Send notifications
   - Update reminder status
   - Handle errors

2. **Set Up pg_cron**
   - Enable extension
   - Create cron job
   - Test execution

3. **Environment Variables**
   - Service role key
   - Notification API keys (Termii, Resend)

### Phase 3: Testing (Day 4)

1. **Local Testing**
   ```bash
   supabase functions serve check-medication-reminders
   ```

2. **Test Cron Job**
   - Manually trigger
   - Verify execution
   - Check logs

3. **Production Testing**
   - Deploy to Supabase
   - Monitor first few runs
   - Verify reminders sent

### Phase 4: Deployment (Day 5)

1. **Deploy Edge Function**
   ```bash
   supabase functions deploy check-medication-reminders
   ```

2. **Set Environment Secrets**
   ```bash
   supabase secrets set TERMII_API_KEY=xxx
   supabase secrets set RESEND_API_KEY=xxx
   ```

3. **Verify Cron Job**
   - Check Supabase dashboard
   - Monitor execution logs
   - Test end-to-end

---

## Monitoring & Maintenance

### Supabase Edge Functions

**Monitoring**:
- Supabase Dashboard → Edge Functions → Logs
- Real-time execution logs
- Error tracking
- Performance metrics

**Alerts**:
- Set up Supabase webhooks for failures
- Email notifications on errors
- Integration with monitoring tools (optional)

**Maintenance**:
- Update function code via CLI
- Monitor execution times
- Check database query performance

### Vercel Cron Jobs

**Monitoring**:
- Vercel Dashboard → Functions → Logs
- Execution history
- Error logs
- Performance metrics

**Alerts**:
- Vercel email notifications
- Integration with monitoring tools
- Custom webhooks (Pro plan)

---

## Migration Path

### If Starting with Vercel Cron

**Easy Migration to Supabase**:
1. Keep Vercel cron as trigger
2. Move processing logic to Edge Function
3. Gradually migrate to pg_cron
4. Remove Vercel cron once stable

### If Starting with Supabase

**No Migration Needed**: Direct implementation

---

## Final Recommendation

### **Go with Supabase Edge Functions** ✅

**Reasons**:
1. ✅ **Reliability**: Critical for health reminders
2. ✅ **Performance**: Direct database access
3. ✅ **Cost**: Free tier likely sufficient
4. ✅ **Infrastructure**: Already using Supabase
5. ✅ **Timezone**: Better timezone handling

**Trade-offs**:
- ⚠️ Need to learn Deno (minimal learning curve)
- ⚠️ Separate deployment process (but simple)
- ⚠️ Different debugging tools (but Supabase dashboard is good)

**Alternative**: If you want to stay in Vercel ecosystem, use **Hybrid Approach** (Vercel Cron → Supabase Edge Function)

---

## Decision Matrix

| Your Priority | Recommended Option |
|--------------|-------------------|
| **Maximum Reliability** | Supabase Edge Functions |
| **Simplest Setup** | Vercel Cron Jobs |
| **Best Performance** | Supabase Edge Functions |
| **Unified Codebase** | Vercel Cron Jobs |
| **Lowest Cost** | Both (free tier) |
| **Easiest Debugging** | Vercel Cron Jobs |
| **Production-Grade** | Supabase Edge Functions |

---

## Next Steps

1. **Review This Plan**: Confirm decision
2. **Set Up Supabase CLI**: Install and configure
3. **Create Edge Function**: Start with basic structure
4. **Test Locally**: Verify functionality
5. **Deploy to Production**: Monitor first runs
6. **Set Up Monitoring**: Configure alerts

---

**Estimated Setup Time**: 1-2 days
**Complexity**: Medium (learning Deno)
**Long-term Maintenance**: Low (stable system)


