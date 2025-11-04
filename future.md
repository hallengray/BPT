---
title: "Uh... Doctor? — Nigeria rollout plan"
status: planned
region: NG
compliance: NDPA 2023
prescriptions: "Doctor-signed PDF (option 2b)"
owner: Femi
created: 2025-11-04
---

## Scope
Target: Nigeria first (NDPA 2023 compliant). Add AI care guidance after BP submission, patient→doctor handoff, and a secure doctor dashboard (patients, readings, notes, PDF prescriptions, appointments, follow-ups, messaging), with notifications and audit logs on Next.js 15 + Supabase.

## Phased Rollout
- Phase 1 (2–3 weeks): AI guidance, doctor onboarding/verification, patient→doctor handoff, doctor dashboard (patients/readings/notes), PDF Rx, basic appointments, notifications, audit logs.
- Phase 2 (2–3 weeks): Messaging threads, follow-up automation, real-time updates, multi-language, offline/PWA, analytics.
- Phase 3 (optional): Televisit links, partner integrations (e.g., mPharma/Helium Health), payments.

## Data Model (Supabase)
All tables with RLS:
- profiles (existing): add `role` enum ['user','doctor','admin'], `phone`, `country`='NG'
- doctors: `id (uuid pk)=auth.uid()`, `full_name`, `license_no`, `reg_body`='MDCN', `practice_addr`, `verified boolean`, `signature_image_url`
- doctor_patients: `doctor_id`, `patient_id`, `status` ('active','pending','ended'), unique pair
- readings (existing): linked via `user_id`
- care_plans: `id`, `patient_id`, `reading_id`, `ai_summary`, `risk_level`, `actions_json`, `created_by` ('ai'|'doctor')
- prescriptions: `id`, `patient_id`, `doctor_id`, `pdf_url`, `diagnosis`, `notes`, `status`('draft','signed','revoked'), `signed_at`
- prescription_items: `id`, `prescription_id`, `drug_name`, `strength`, `sig`, `qty`, `duration`
- appointments: `id`, `patient_id`, `doctor_id`, `start_at`, `end_at`, `mode`('in_person','phone','video'), `location`, `status`('pending','confirmed','completed','cancelled')
- messages: `id`, `thread_id`, `sender_id`, `sender_role`, `body`, `created_at`
- threads: `id`, `patient_id`, `doctor_id`, `status`
- audit_logs: `id`, `actor_id`, `actor_role`, `action`, `entity`, `entity_id`, `metadata jsonb`, `created_at`

Indexes: foreign keys and `created_at`. Storage buckets (private): `prescriptions/`, `signatures/`.

## RLS (essentials)
- Users access their own rows (`auth.uid() = id`).
- Readings/care_plans/prescriptions/appointments/messages:
  - patient sees own
  - doctor sees where linked via `doctor_patients` (`status='active'`)
- Admins unrestricted via `auth.jwt() ->> 'role' = 'admin'`.

```sql
create policy "patient_reads_own_readings" on readings for select
  using (user_id = auth.uid());

create policy "doctor_reads_assigned_patient_readings" on readings for select
  using (exists (
    select 1 from doctor_patients dp
    where dp.patient_id = readings.user_id
      and dp.doctor_id = auth.uid()
      and dp.status = 'active'
  ));
```

## Server Actions (Next.js 15)
All mutations via Server Actions with Zod, returning `{ success: boolean; data?: T; error?: string }`, rate-limited.
- app/actions/care-plans.ts: `generateCarePlan(readingId)`, `upsertCarePlan(form)`
- app/actions/doctor.ts: `requestDoctorReview(readingId)`, `onboardDoctor(form)`, `verifyDoctor(adminOnly)`
- app/actions/prescriptions.ts: `createPrescription(draft)`, `signPrescription(id)`, `revokePrescription(id)`
- app/actions/appointments.ts: `createAppointment(form)`, `updateAppointment(id, form)`, `cancelAppointment(id)`
- app/actions/messages.ts: `startThread(patientId, doctorId)`, `sendMessage(threadId, body)`
- app/actions/notifications.ts: `notifyDoctor(event)`, `notifyPatient(event)`

```typescript
'use server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

export async function createAppointment(formData: FormData) {
  try {
    const input = appointmentSchema.parse(Object.fromEntries(formData))
    const supabase = await createClient()
    // ... insert, revalidate, notify ...
    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' }
  }
}
```

## AI Care Guidance ("Uh... Doctor?")
- Trigger: after reading submission.
- Provider: server-side LLM (e.g., Azure OpenAI West Europe) with logging disabled; redact PII; store only the result.
- Output: severity (normal/elevated/stage 1/2/crisis), actionable plan (diet, activity, follow-up), when to seek urgent care.
- Safety rails: if ≥ 180/120 or red-flag symptoms + high risk, show emergency banner, bypass chat, recommend immediate care.

## Patient→Doctor Handoff
- CTA on AI result: "Request a doctor review". Creates `doctor_patients(pending)` and notifies on-call/selected doctor.
- Consent modal: share readings, demographics, phone; NDPA-compliant consent logged in `audit_logs`.

## Doctor Dashboard (App Router)
Routes:
- `app/(dashboard)/doctor/page.tsx` — overview (today's appts, tasks, alerts)
- `app/(dashboard)/doctor/patients/page.tsx` — list
- `app/(dashboard)/doctor/patients/[id]/page.tsx` — profile, readings (Recharts), care plans, messages
- `app/(dashboard)/doctor/patients/[id]/prescribe/page.tsx` — Rx form + preview + sign
- `app/(dashboard)/doctor/appointments/page.tsx` — calendar list

Server components by default; client islands only when needed; Suspense for streaming.

## Prescriptions (PDF, option 2b)
- Server-rendered PDF (pdf-lib or @react-pdf/renderer) with clinic header, doctor name, MDCN license, patient, date, meds, signature, QR, watermark.
- Signing: use stored doctor signature image + cryptographic hash of document; store PDF in private bucket; serve via signed URL.
- Delivery: email + SMS link; links expire in 7 days; regenerate on demand.

## Appointments & Messaging
- Appointments: TZ Africa/Lagos; email ICS + SMS via Termii; statuses with reschedule flow.
- Messaging: one thread per doctor–patient pair; text only initially; typing indicators later.

## Notifications (Nigeria)
- Email (Resend) + SMS (Termii). Templates in `lib/notifications/*`. Opt‑in, rate limits, retries, dead‑letter log.

## Access Control & Middleware
- Protect `/(dashboard)/doctor` by `role === 'doctor'`; protect admin verify route by `admin`.
- `profiles.role` set at signup/onboarding; server checks via `auth.jwt()` or join to `profiles`.

## Compliance (NDPA Nigeria)
- Lawful basis: consent + vital interests (urgent flags).
- Data residency: Supabase region EU‑West/SA with adequate safeguards; DPAs with vendors; no LLM training.
- Rights: export/delete on request; retention policy (e.g., 2 years unless consent renews).
- Audit: write to `audit_logs` for every access/mutation; admin viewer page.

## Performance, UX, Accessibility
- React 19: `useActionState`, `useFormStatus`, streaming.
- Low bandwidth: defer charts, compress PDFs, SMS fallbacks, skeletons.
- WCAG 2.1 AA: semantic forms, ARIA labels, focus management, color contrast.

## File Map (key additions)
- `app/actions/{care-plans,doctor,prescriptions,appointments,messages,notifications}.ts`
- `app/(dashboard)/doctor/**` (pages above)
- `components/forms/{PrescriptionForm,AppointmentForm}.tsx`
- `components/charts/{PatientBPChart}.tsx`
- `lib/ai/care-plan.ts`
- `lib/notifications/{email.ts,sms.ts}`
- `lib/validations/{carePlan.ts,prescription.ts,appointment.ts,doctor.ts}`
- `lib/middleware/roles.ts`

## Acceptance Criteria (Phase 1)
- After reading, AI summary renders within 2s with severity and next steps.
- Patient can request doctor review; doctor sees assignment in dashboard.
- Doctor can generate and sign a PDF Rx; patient receives link via email+SMS.
- Appointments can be created with SMS confirmation.
- All actions produce audit logs; RLS verified for users and doctors.

## Implementation Todos (Phase 1)
1. Add new tables and RLS policies for doctors, care, Rx, appts, messages
2. Implement roles, auth checks, and protect doctor routes in middleware
3. Build AI care plan action and server-side provider with safety rails
4. Add post-reading AI UI with request doctor review flow
5. Create doctor dashboard pages (list, detail, prescribe, appointments)
6. Implement PDF Rx creation, signing, storage, and secure delivery
7. Implement appointment creation, ICS email, and SMS confirmations
8. Integrate Resend email and Termii SMS notification helpers
9. Add audit logging on all actions and admin viewer page
10. Audit accessibility, low bandwidth, and streaming performance

## Risks & Mitigations
- Doctor verification: manual admin approval of MDCN license at launch.
- Connectivity: SMS confirmations and lightweight pages.
- Safety: hard triage thresholds; always show emergency disclaimer.

