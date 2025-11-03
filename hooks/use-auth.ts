'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useUser } from './use-user'

export function useAuth() {
  const { user, loading } = useUser()
  const router = useRouter()
  const supabase = createClient()

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      router.push('/')
      router.refresh()
    }
    return { error }
  }, [supabase, router])

  const isAuthenticated = !!user

  return {
    user,
    loading,
    isAuthenticated,
    signOut,
  }
}



