import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { SmartRemindersWidget } from './smart-reminders-widget'
import { getUnifiedHealthData } from '@/app/actions/health-data'
import { Skeleton } from '@/components/ui/skeleton'

async function SmartRemindersContent() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const result = await getUnifiedHealthData()

  if (!result.success || !result.data) {
    return null
  }

  return <SmartRemindersWidget healthData={result.data} userId={user.id} />
}

function SmartRemindersLoading() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-24 w-full rounded-lg" />
    </div>
  )
}

export function SmartRemindersServer() {
  return (
    <Suspense fallback={<SmartRemindersLoading />}>
      <SmartRemindersContent />
    </Suspense>
  )
}




