import { Metadata } from 'next'
import Link from 'next/link'
import { SignupForm } from '@/components/forms/signup-form'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Heart } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Sign Up | Blood Pressure Tracker',
  description: 'Create your Blood Pressure Tracker account',
}

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 px-4 dark:from-blue-950 dark:to-green-950">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Heart className="h-6 w-6 text-primary" aria-hidden="true" />
          </div>
          <CardTitle className="text-2xl">Create your account</CardTitle>
          <CardDescription>
            Start tracking your blood pressure and improve your health
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignupForm />

          <div className="mt-4 text-center text-sm">
            <p className="text-muted-foreground">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                Sign in
              </Link>
            </p>
          </div>

          <div className="mt-6 text-center text-xs text-muted-foreground">
            <p>
              By signing up, you agree to our{' '}
              <Link
                href="/terms"
                className="underline hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link
                href="/privacy"
                className="underline hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                Privacy Policy
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

