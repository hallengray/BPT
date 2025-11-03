import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { User as UserIcon, Mail, Calendar, Shield } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Profile',
  description: 'Your account profile and settings',
}

export default async function ProfilePage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Fetch profile data
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const createdAt = user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }) : 'N/A'

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account information
        </p>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            Account Information
          </CardTitle>
          <CardDescription>
            Your personal account details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email */}
          <div className="flex items-center gap-4 p-4 rounded-lg bg-background/50">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
              <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-base font-semibold">{user.email}</p>
            </div>
          </div>

          {/* Display Name */}
          <div className="flex items-center gap-4 p-4 rounded-lg bg-background/50">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
              <UserIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">Display Name</p>
              <p className="text-base font-semibold">
                {(profile as { full_name?: string } | null)?.full_name || user.email?.split('@')[0] || 'User'}
              </p>
            </div>
          </div>

          {/* Account Created */}
          <div className="flex items-center gap-4 p-4 rounded-lg bg-background/50">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">Member Since</p>
              <p className="text-base font-semibold">{createdAt}</p>
            </div>
          </div>

          {/* Account Status */}
          <div className="flex items-center gap-4 p-4 rounded-lg bg-background/50">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
              <Shield className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">Account Status</p>
              <p className="text-base font-semibold text-green-600 dark:text-green-400">
                Active
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

