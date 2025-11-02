# Agent Epsilon - Medication Tracking System

**Agent Name**: Agent Epsilon (EPSILON)  
**Mission**: Implement complete medication management with tracking, reminders, and adherence analytics  
**Priority**: HIGH  
**Estimated Time**: 3-4 hours  
**Status**: Ready for Execution

---

## 🎯 Mission Briefing

You are Agent Epsilon, responsible for building a comprehensive medication tracking system that allows users to:
1. Add and manage their medications
2. Track when doses are taken
3. View adherence statistics
4. See medication history
5. Correlate medication adherence with BP readings

---

## 📋 Critical Requirements

### Must Follow:
1. **Read and follow `.cursorrules`** - All coding standards and best practices
2. **Use existing patterns** from Agent Alpha/Beta/Gamma
3. **React 19 features**: `useActionState`, `useFormStatus`, `useOptimistic`
4. **TypeScript strict mode**: Zero `any` types
5. **Zod validation**: All forms and server actions
6. **RLS policies**: Secure all database tables
7. **WCAG 2.1 AA**: Accessibility compliance
8. **Mobile-first**: Responsive design
9. **Glass UI**: Use glassmorphism components from Agent Theta
10. **Zero errors**: TypeScript and linting must pass

### Quality Checks (MANDATORY):
```bash
# Run these after implementation:
npm run type-check  # Must show 0 errors
npm run lint        # Must show 0 errors
npm run build       # Must succeed
```

---

## 🗄️ Database Schema

### Task 1: Create Supabase Migration

**File**: Create via Supabase MCP

**Migration Name**: `create_medication_tables`

**SQL**:
```sql
-- Medications table
CREATE TABLE medication_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  medication_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('once_daily', 'twice_daily', 'three_times_daily', 'as_needed', 'weekly', 'other')),
  time_of_day TEXT[], -- Array like ['08:00', '20:00']
  notes TEXT,
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Medication doses (tracking when taken)
CREATE TABLE medication_doses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_log_id UUID REFERENCES medication_logs(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  scheduled_time TIMESTAMPTZ NOT NULL,
  taken_at TIMESTAMPTZ,
  was_taken BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE medication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_doses ENABLE ROW LEVEL SECURITY;

-- RLS Policies (optimized with select pattern)
CREATE POLICY "Users can manage their own medications"
  ON medication_logs FOR ALL
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can manage their own doses"
  ON medication_doses FOR ALL
  USING ((select auth.uid()) = user_id);

-- Indexes for performance
CREATE INDEX idx_medication_logs_user_id ON medication_logs(user_id);
CREATE INDEX idx_medication_logs_is_active ON medication_logs(user_id, is_active) WHERE is_active = true;
CREATE INDEX idx_medication_doses_user_id ON medication_doses(user_id);
CREATE INDEX idx_medication_doses_taken_at ON medication_doses(user_id, taken_at DESC);
CREATE INDEX idx_medication_doses_medication_id ON medication_doses(medication_log_id);

-- Trigger for updated_at
CREATE TRIGGER update_medication_logs_updated_at
  BEFORE UPDATE ON medication_logs
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

COMMENT ON TABLE medication_logs IS 'Stores user medication information and schedules';
COMMENT ON TABLE medication_doses IS 'Tracks individual medication doses and adherence';
```

**Use Supabase MCP**:
```typescript
@supabase apply-migration --name create_medication_tables --query [SQL_ABOVE]
```

---

## 📝 Validation Schemas

### Task 2: Create Zod Schemas

**File**: `lib/validations/medication-logs.ts`

```typescript
import { z } from 'zod'

export const medicationFormSchema = z.object({
  medicationName: z
    .string()
    .min(1, 'Medication name is required')
    .max(200, 'Medication name must be less than 200 characters'),
  dosage: z
    .string()
    .min(1, 'Dosage is required')
    .max(100, 'Dosage must be less than 100 characters')
    .regex(/^[\d\s\w.,-]+$/, 'Invalid dosage format'),
  frequency: z.enum(
    ['once_daily', 'twice_daily', 'three_times_daily', 'as_needed', 'weekly', 'other'],
    { errorMap: () => ({ message: 'Please select a valid frequency' }) }
  ),
  timeOfDay: z
    .array(z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format'))
    .min(1, 'At least one time is required')
    .max(4, 'Maximum 4 times per day'),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
})

export const doseTrackingSchema = z.object({
  medicationLogId: z.string().uuid(),
  wasTaken: z.boolean(),
  takenAt: z.string().datetime().optional(),
  notes: z.string().max(200, 'Notes must be less than 200 characters').optional(),
})

export type MedicationFormData = z.infer<typeof medicationFormSchema>
export type DoseTrackingData = z.infer<typeof doseTrackingSchema>
```

---

## ⚡ Server Actions

### Task 3: Implement Server Actions

**File**: `app/actions/medication-logs.ts`

```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { medicationFormSchema, doseTrackingSchema } from '@/lib/validations/medication-logs'
import type { Database } from '@/types/database.types'

type MedicationLog = Database['public']['Tables']['medication_logs']['Row']
type MedicationDose = Database['public']['Tables']['medication_doses']['Row']

type ActionResponse<T = null> = {
  success: boolean
  data?: T
  error?: string
}

export async function createMedication(
  _prevState: ActionResponse<MedicationLog> | null,
  formData: FormData
): Promise<ActionResponse<MedicationLog>> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      success: false,
      error: 'You must be logged in to add a medication',
    }
  }

  const validatedFields = medicationFormSchema.safeParse({
    medicationName: formData.get('medicationName'),
    dosage: formData.get('dosage'),
    frequency: formData.get('frequency'),
    timeOfDay: JSON.parse(formData.get('timeOfDay') as string),
    notes: formData.get('notes') || undefined,
    startDate: formData.get('startDate'),
    endDate: formData.get('endDate') || undefined,
  })

  if (!validatedFields.success) {
    return {
      success: false,
      error: validatedFields.error.errors[0].message,
    }
  }

  const { medicationName, dosage, frequency, timeOfDay, notes, startDate, endDate } =
    validatedFields.data

  const { data, error } = await supabase
    .from('medication_logs')
    .insert({
      user_id: user.id,
      medication_name: medicationName,
      dosage,
      frequency,
      time_of_day: timeOfDay,
      notes: notes || null,
      start_date: startDate,
      end_date: endDate || null,
      is_active: true,
    })
    .select()
    .single()

  if (error) {
    console.error('Medication creation error:', error)
    return {
      success: false,
      error: 'Failed to add medication. Please try again.',
    }
  }

  revalidatePath('/medications')
  revalidatePath('/dashboard')

  return {
    success: true,
    data,
  }
}

export async function getMedications(activeOnly: boolean = true) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated', data: [] }
  }

  let query = supabase
    .from('medication_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (activeOnly) {
    query = query.eq('is_active', true)
  }

  const { data, error } = await query

  if (error) {
    return { success: false, error: error.message, data: [] }
  }

  return { success: true, data: data || [] }
}

export async function updateMedication(
  id: string,
  updates: Partial<MedicationLog>
): Promise<ActionResponse<MedicationLog>> {
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

  const { data, error } = await supabase
    .from('medication_logs')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return {
      success: false,
      error: 'Failed to update medication',
    }
  }

  revalidatePath('/medications')
  revalidatePath('/dashboard')

  return {
    success: true,
    data,
  }
}

export async function deactivateMedication(id: string): Promise<ActionResponse> {
  return updateMedication(id, { is_active: false })
}

export async function recordDose(
  _prevState: ActionResponse<MedicationDose> | null,
  formData: FormData
): Promise<ActionResponse<MedicationDose>> {
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

  const validatedFields = doseTrackingSchema.safeParse({
    medicationLogId: formData.get('medicationLogId'),
    wasTaken: formData.get('wasTaken') === 'true',
    takenAt: formData.get('takenAt') || new Date().toISOString(),
    notes: formData.get('notes') || undefined,
  })

  if (!validatedFields.success) {
    return {
      success: false,
      error: validatedFields.error.errors[0].message,
    }
  }

  const { medicationLogId, wasTaken, takenAt, notes } = validatedFields.data

  const { data, error } = await supabase
    .from('medication_doses')
    .insert({
      medication_log_id: medicationLogId,
      user_id: user.id,
      scheduled_time: takenAt,
      taken_at: wasTaken ? takenAt : null,
      was_taken: wasTaken,
      notes: notes || null,
    })
    .select()
    .single()

  if (error) {
    console.error('Dose tracking error:', error)
    return {
      success: false,
      error: 'Failed to record dose. Please try again.',
    }
  }

  revalidatePath('/medications')
  revalidatePath('/dashboard')

  return {
    success: true,
    data,
  }
}

export async function getMedicationHistory(medicationId: string, days: number = 30) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated', data: [] }
  }

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data, error } = await supabase
    .from('medication_doses')
    .select('*')
    .eq('user_id', user.id)
    .eq('medication_log_id', medicationId)
    .gte('scheduled_time', startDate.toISOString())
    .order('scheduled_time', { ascending: false })

  if (error) {
    return { success: false, error: error.message, data: [] }
  }

  return { success: true, data: data || [] }
}

export async function getAdherenceStats(medicationId: string, days: number = 30) {
  const history = await getMedicationHistory(medicationId, days)

  if (!history.success || !history.data) {
    return { success: false, adherenceRate: 0, totalDoses: 0, takenDoses: 0 }
  }

  const totalDoses = history.data.length
  const takenDoses = history.data.filter((dose) => dose.was_taken).length
  const adherenceRate = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 0

  return {
    success: true,
    adherenceRate,
    totalDoses,
    takenDoses,
    missedDoses: totalDoses - takenDoses,
  }
}
```

---

## 🎨 UI Components

### Task 4: Create Form Component

**File**: `components/forms/medication-form.tsx`

Use:
- React 19 `useActionState` and `useFormStatus`
- Glass card styling from Agent Theta
- Zod validation
- Time picker for dose times
- Frequency selector
- Date pickers for start/end dates

**Key Features**:
- Multiple time slots (for multiple daily doses)
- Frequency dropdown
- Dosage input with validation
- Notes textarea
- Success/error feedback with toast

---

### Task 5: Create Medication Card

**File**: `components/medication/medication-card.tsx`

**Features**:
- Glass card with gradient accent
- Medication name and dosage
- Next dose time
- "Mark as Taken" quick action button
- Adherence percentage with color coding:
  - Green (>80%)
  - Yellow (60-80%)
  - Red (<60%)
- Edit/Delete actions

---

### Task 6: Create Adherence Chart

**File**: `components/medication/adherence-chart.tsx`

Use Recharts to show:
- 30-day adherence calendar
- Bar chart showing taken vs missed
- Percentage display with animated counter

---

## 📄 Medications Page

### Task 7: Create Main Page

**File**: `app/(dashboard)/medications/page.tsx`

**Layout**:
```
┌─────────────────────────────────────────┐
│ Medications                             │
│ [+ Add Medication Button]               │
├─────────────────────────────────────────┤
│ Active Medications (Glass Cards)        │
│ ┌───────────────────────────────────┐  │
│ │ Medication Name | Dosage          │  │
│ │ Next: 8:00 AM | Adherence: 85%   │  │
│ │ [✓ Mark as Taken] [Edit] [Stop]  │  │
│ └───────────────────────────────────┘  │
├─────────────────────────────────────────┤
│ Adherence Statistics                    │
│ [Charts showing adherence trends]       │
├─────────────────────────────────────────┤
│ History (Last 30 Days)                  │
│ [List of all doses with status]         │
└─────────────────────────────────────────┘
```

**Features**:
- Empty state for new users
- Loading skeletons
- Optimistic UI updates
- Success/error toasts

---

## 🔗 Integration Points

### Update Types

**File**: `types/index.ts`

Add:
```typescript
export type MedicationLog = Database['public']['Tables']['medication_logs']['Row']
export type MedicationDose = Database['public']['Tables']['medication_doses']['Row']

export interface MedicationWithAdherence extends MedicationLog {
  adherenceRate: number
  nextDoseTime?: string
}
```

### Update Navigation

Navigation is already updated by Agent Theta with:
- Desktop: "Medications" link with pill icon (purple)
- Mobile: "Meds" tab with pill icon

---

## ✅ Completion Checklist

Before submitting your completion report:

- [ ] Database migration applied successfully
- [ ] All TypeScript types generated and imported
- [ ] Zod schemas created and tested
- [ ] All server actions implemented
- [ ] Medication form component complete
- [ ] Medication card component complete
- [ ] Adherence chart component complete
- [ ] Medications page complete with all sections
- [ ] Loading states implemented
- [ ] Empty states designed
- [ ] Error handling comprehensive
- [ ] Success feedback with toasts
- [ ] Mobile responsive (tested)
- [ ] Accessibility compliant (WCAG 2.1 AA)
- [ ] `npm run type-check` passes (0 errors)
- [ ] `npm run lint` passes (0 errors)
- [ ] `npm run build` succeeds
- [ ] Manual testing complete
- [ ] Completion report written

---

## 📊 Completion Report Template

**File**: `AGENT_EPSILON_COMPLETION_REPORT.md`

Include:
1. Executive Summary
2. Deliverables Completed (with file list)
3. Database Schema Applied
4. Quality Metrics (TypeScript/Lint results)
5. Testing Results
6. Known Issues (if any)
7. Integration Notes for other agents
8. Screenshots/Examples
9. Next Steps

---

## 🚀 Ready to Execute

Agent Epsilon, you are cleared for implementation!

**Remember**:
- Follow `.cursorrules` strictly
- Use existing patterns from other agents
- Glass UI components from Agent Theta
- Zero tolerance for TypeScript/lint errors
- Comprehensive error handling
- Beautiful, accessible UI
- Complete documentation

**Good luck! 🎯**

