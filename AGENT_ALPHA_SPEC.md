# Agent Alpha - Authentication System Specification

**Lead**: Authentication & User Management
**Priority**: CRITICAL (Blocking for other agents)
**Estimated Time**: 2-3 hours

## 🎯 Objectives

Build a complete, secure authentication system using Supabase Auth with Next.js 15 Server Actions and React 19 features.

## 📚 Technical Requirements

### Architecture Patterns (from .cursorrules)

1. **Server Actions for Auth**: All mutations via Server Actions
2. **React 19 Features**: Use `useFormStatus()`, `useActionState()`
3. **Zod Validation**: Strict input validation
4. **Error Handling**: User-friendly error messages
5. **Accessibility**: WCAG 2.1 AA compliant forms

### File Structure

```
app/
├── (auth)/
│   ├── login/
│   │   └── page.tsx          # Login page (Server Component)
│   ├── signup/
│   │   └── page.tsx          # Signup page (Server Component)
│   └── forgot-password/
│       └── page.tsx          # Password reset page
app/actions/
└── auth.ts                   # Server Actions for auth
lib/validations/
└── auth.ts                   # Zod schemas
components/forms/
├── login-form.tsx            # Client Component with useFormStatus
├── signup-form.tsx           # Client Component with useFormStatus
└── forgot-password-form.tsx  # Client Component
hooks/
├── use-user.ts               # Get current user hook
└── use-auth.ts               # Auth utilities hook
```

## 🔨 Implementation Details

### 1. Zod Validation Schemas (`lib/validations/auth.ts`)

```typescript
import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
```

### 2. Server Actions (`app/actions/auth.ts`)

```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { loginSchema, signupSchema, forgotPasswordSchema } from '@/lib/validations/auth'

type ActionResponse<T = null> = {
  success: boolean
  data?: T
  error?: string
}

export async function login(formData: FormData): Promise<ActionResponse> {
  const supabase = await createClient()

  // Validate input
  const validatedFields = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!validatedFields.success) {
    return {
      success: false,
      error: validatedFields.error.errors[0].message,
    }
  }

  const { email, password } = validatedFields.data

  // Attempt login
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return {
      success: false,
      error: 'Invalid email or password',
    }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData): Promise<ActionResponse> {
  const supabase = await createClient()

  // Validate input
  const validatedFields = signupSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    fullName: formData.get('fullName'),
    confirmPassword: formData.get('confirmPassword'),
  })

  if (!validatedFields.success) {
    return {
      success: false,
      error: validatedFields.error.errors[0].message,
    }
  }

  const { email, password, fullName } = validatedFields.data

  // Create user
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })

  if (error) {
    return {
      success: false,
      error: error.message,
    }
  }

  return {
    success: true,
    data: null,
  }
}

export async function signOut(): Promise<ActionResponse> {
  const supabase = await createClient()
  
  const { error } = await supabase.auth.signOut()

  if (error) {
    return {
      success: false,
      error: error.message,
    }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function forgotPassword(formData: FormData): Promise<ActionResponse> {
  const supabase = await createClient()

  const validatedFields = forgotPasswordSchema.safeParse({
    email: formData.get('email'),
  })

  if (!validatedFields.success) {
    return {
      success: false,
      error: validatedFields.error.errors[0].message,
    }
  }

  const { email } = validatedFields.data

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
  })

  if (error) {
    return {
      success: false,
      error: error.message,
    }
  }

  return {
    success: true,
    data: null,
  }
}
```

### 3. Login Form Component (`components/forms/login-form.tsx`)

```typescript
'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { login } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <Button type="submit" className="w-full" size="lg" disabled={pending}>
      {pending ? 'Signing in...' : 'Sign In'}
    </Button>
  )
}

export function LoginForm() {
  const [state, formAction] = useActionState(login, { success: false })

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
          autoComplete="email"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
          autoComplete="current-password"
        />
      </div>

      <SubmitButton />
    </form>
  )
}
```

### 4. Login Page (`app/(auth)/login/page.tsx`)

```typescript
import { Metadata } from 'next'
import Link from 'next/link'
import { LoginForm } from '@/components/forms/login-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Heart } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your Blood Pressure Tracker account',
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 px-4 dark:from-blue-950 dark:to-green-950">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Heart className="h-6 w-6 text-primary" />
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
              className="text-primary hover:underline"
            >
              Forgot your password?
            </Link>
            <p className="text-muted-foreground">
              Don't have an account?{' '}
              <Link href="/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

### 5. Custom Hooks (`hooks/use-user.ts`)

```typescript
'use client'

import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Get initial user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  return { user, loading }
}
```

## ✅ Acceptance Criteria

- [ ] Users can sign up with email/password
- [ ] Email validation works correctly
- [ ] Password strength requirements enforced
- [ ] Users can log in with credentials
- [ ] Error messages are user-friendly
- [ ] Loading states show during submission
- [ ] Forgot password flow works
- [ ] Users are redirected to dashboard after login
- [ ] Form fields have proper autocomplete attributes
- [ ] All forms are keyboard accessible
- [ ] Focus management works correctly
- [ ] ARIA labels present on all inputs
- [ ] TypeScript compiles without errors
- [ ] No console errors in browser

## 🧪 Testing Checklist

1. **Sign Up Flow**
   - [ ] Valid email and strong password
   - [ ] Invalid email format
   - [ ] Weak password
   - [ ] Passwords don't match
   - [ ] Email already exists

2. **Login Flow**
   - [ ] Valid credentials
   - [ ] Invalid email
   - [ ] Wrong password
   - [ ] Empty fields

3. **Forgot Password**
   - [ ] Valid email receives reset link
   - [ ] Invalid email shows error

4. **Accessibility**
   - [ ] Tab through all fields
   - [ ] Submit with Enter key
   - [ ] Screen reader announces errors

## 📦 Deliverables

1. All auth pages functional
2. Server Actions working
3. Forms validated
4. Custom hooks implemented
5. Error handling complete
6. Accessibility verified

## 🔗 Dependencies for Other Agents

**Exports for Agent Beta & Gamma:**
- `useUser()` hook - Get current user
- Auth Server Actions - For sign out functionality
- Auth state management - For protected routes

## 📝 Notes

- Follow `.cursorrules` strictly
- Use React 19 `useActionState` and `useFormStatus`
- All Server Actions must return typed responses
- Implement proper error boundaries
- Add loading skeletons where appropriate
- Test on mobile and desktop
- Ensure dark mode compatibility

**Questions? Ping @mark in the coordination channel**

