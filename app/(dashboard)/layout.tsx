import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardNav } from '@/components/layout/dashboard-nav'
import { MobileHeader } from '@/components/layout/mobile-header'
import { MobileNav } from '@/components/layout/mobile-nav'

async function signOutAction() {
  'use server'
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}

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
      <DashboardNav user={user} signOutAction={signOutAction} />
      <MobileHeader user={user} signOutAction={signOutAction} />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <MobileNav />
    </div>
  )
}



