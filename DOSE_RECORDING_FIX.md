# Dose Recording Fix - UPDATE vs INSERT

## Problem Identified

The `recordDose` server action was using **INSERT** to create new dose entries instead of **UPDATE** to mark existing scheduled doses as taken. This created duplicate dose records and made adherence tracking inaccurate.

## Root Cause

When medications are created, the system automatically generates scheduled doses for the next 30 days (via `generateScheduledDoses`). When users log a dose, the system should **UPDATE** these existing scheduled doses by setting:
- `was_taken` = true/false
- `taken_at` = timestamp
- `notes` = optional notes

Instead, the old implementation was **INSERTING** new dose records, creating duplicates.

## Solution

### 1. Update Validation Schema
Change `doseTrackingSchema` to expect `doseId` instead of `medicationLogId`:

```typescript
// lib/validations/medication-logs.ts
export const doseTrackingSchema = z.object({
  doseId: z.string().uuid('Dose ID is required'),  // Changed from medicationLogId
  wasTaken: z.boolean(),
  takenAt: z.string().datetime().optional(),
  notes: z.string().max(200, 'Notes must be less than 200 characters').optional(),
})
```

### 2. Update recordDose Function
Change from INSERT to UPDATE operation:

```typescript
// app/actions/medication-logs.ts
export async function recordDose(
  _prevState: ActionResponse<MedicationDose> | null,
  formData: FormData
): Promise<ActionResponse<MedicationDose>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'You must be logged in' }
  }

  const validatedFields = doseTrackingSchema.safeParse({
    doseId: formData.get('doseId'),  // Changed from medicationLogId
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

  const { doseId, wasTaken, takenAt, notes } = validatedFields.data

  // UPDATE the existing scheduled dose record (NOT INSERT)
  const { data, error } = await supabase
    .from('medication_doses')
    .update({
      was_taken: wasTaken,
      taken_at: wasTaken ? (takenAt || new Date().toISOString()) : null,
      notes: notes || null,
    } as never)
    .eq('id', doseId)  // Find by dose ID
    .eq('user_id', user.id)  // Security: ensure user owns this dose
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
  revalidatePath('/quick-log')

  return {
    success: true,
    data,
  }
}
```

### 3. Update All Callers
Update components to pass `doseId` instead of `medicationLogId`:

#### dose-quick-log.tsx
```typescript
const formData = new FormData()
formData.append('doseId', dose.id)  // Changed from medication_log_id
formData.append('wasTaken', wasTaken.toString())
formData.append('takenAt', new Date().toISOString())
```

#### take-all-button.tsx
```typescript
doses.map(async (dose) => {
  const formData = new FormData()
  formData.append('doseId', dose.id)  // Changed from medication_log_id
  formData.append('wasTaken', 'true')
  formData.append('takenAt', new Date().toISOString())
  
  return recordDose(null, formData)
})
```

## Benefits

1. **No Duplicate Records**: Updates existing scheduled doses instead of creating new ones
2. **Accurate Adherence Tracking**: Adherence calculations work correctly with scheduled doses
3. **Data Integrity**: Maintains the relationship between scheduled doses and actual doses taken
4. **Proper Audit Trail**: Can see when doses were scheduled vs when they were actually taken

## Database Impact

- **Before**: Multiple dose records per medication per day (scheduled + taken)
- **After**: One dose record per medication per time slot (scheduled, then marked as taken)

## Testing

To verify the fix works:
1. Create a medication with scheduled doses
2. Check `medication_doses` table - should see scheduled doses with `was_taken = null`
3. Log a dose via quick-log or dose-quick-log component
4. Check `medication_doses` table - same record should now have `was_taken = true` and `taken_at` timestamp
5. Verify no duplicate records were created

## Notes

- The `medication-card.tsx` component uses `recordDose` for "as-needed" medications
- For as-needed medications, INSERT is still correct since there are no pre-scheduled doses
- The current implementation handles this correctly by checking if a dose exists first




