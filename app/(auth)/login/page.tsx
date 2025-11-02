import { Metadata } from 'next'
import Link from 'next/link'
import { LoginForm } from '@/components/forms/login-form'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Heart } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Sign In | Blood Pressure Tracker',
  description: 'Sign in to your Blood Pressure Tracker account',
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 px-4 dark:from-blue-950 dark:to-green-950">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Heart className="h-6 w-6 text-primary" aria-hidden="true" />
          </div>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>
            Sign in to your account to continue tracking your health
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />

          <div className="mt-4 space-y-2 text-center text-sm">
            <Link
              href="/forgot-password"
              className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Forgot your password?
            </Link>
            <p className="text-muted-foreground">
              Don't have an account?{' '}
              <Link
                href="/signup"
                className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                Sign up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

