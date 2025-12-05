import { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { GradientButton } from '@/components/ui/gradient-button'
import { GlassCard, GlassCardContent, GlassCardDescription, GlassCardHeader, GlassCardTitle } from '@/components/ui/glass-card'
import { CheckCircle, Heart, ArrowRight, Shield } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'EaseMyBP is currently free. No credit card required. Start tracking your health today. Paid plans coming soon.',
}

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b glass">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold">EaseMyBP</span>
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <GradientButton variant="primary" asChild>
              <Link href="/signup">Get Started</Link>
            </GradientButton>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative border-b bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 py-16 dark:from-blue-950 dark:via-cyan-950 dark:to-teal-950">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Simple, Transparent{' '}
              <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">
                Pricing
              </span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
              EaseMyBP is currently free to use. Start tracking your health today with no credit card required. Paid plans coming soon.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Card */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <GlassCard hover glow className="border-2 border-blue-500/20">
              <GlassCardHeader className="text-center">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg">
                    <Heart className="h-10 w-10 text-white" />
                  </div>
                </div>
                <GlassCardTitle className="text-3xl md:text-4xl">Free Plan</GlassCardTitle>
                <div className="my-6">
                  <span className="text-5xl font-bold">$0</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <GlassCardDescription className="text-base">
                  Everything you need to track and improve your cardiovascular health. Available now at no cost.
                </GlassCardDescription>
              </GlassCardHeader>
              <GlassCardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">What&apos;s Included:</h3>
                  <ul className="space-y-3">
                    {[
                      'Unlimited blood pressure readings',
                      'Diet and exercise tracking',
                      'Medication management and reminders',
                      'AI-powered health insights',
                      'Advanced analytics and correlations',
                      'Progress tracking and streaks',
                      'Export reports for your doctor',
                      'Smart reminders and notifications',
                      'Dark mode support',
                      'Mobile-responsive design',
                      'HIPAA-compliant security',
                      '24/7 data access',
                    ].map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle className="mt-0.5 h-5 w-5 text-green-600 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-lg border border-blue-500/20 bg-blue-50/50 p-4 dark:bg-blue-950/20">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm">Your Privacy Matters</p>
                      <p className="text-sm text-muted-foreground">
                        We never sell your data. Your health information is encrypted and secure, 
                        protected by industry-leading security measures.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <GradientButton size="lg" variant="primary" className="w-full" asChild>
                    <Link href="/signup">
                      <Heart className="mr-2 h-5 w-5" />
                      Get Started Free
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </GradientButton>
                  <p className="mt-4 text-center text-sm text-muted-foreground">
                    No credit card required • No hidden fees • Start tracking today
                  </p>
                </div>
              </GlassCardContent>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Coming Soon Section */}
      <section className="border-t bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 py-20 dark:from-blue-950 dark:via-cyan-950 dark:to-teal-950">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Paid Plans Coming Soon
            </h2>
            <p className="mb-8 text-lg text-muted-foreground">
              We&apos;re working on premium features that will offer even more advanced health insights, 
              priority support, and enhanced analytics. Stay tuned for updates!
            </p>
            <GlassCard hover className="border-2 border-purple-500/20">
              <GlassCardContent className="pt-6">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
                    <Heart className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="mb-2 text-xl font-semibold">What to Expect</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  Premium plans will include advanced features while keeping the core functionality free and accessible to everyone.
                </p>
                <div className="mt-6 space-y-2 text-left">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Current Free Plan:</strong> All core features remain free
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Future Premium Plans:</strong> Enhanced analytics, priority support, and advanced AI insights
                  </p>
                </div>
              </GlassCardContent>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Current Benefits Section */}
      <section className="border-t py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Why Start Now?
            </h2>
            <p className="mb-8 text-lg text-muted-foreground">
              Get started today and begin tracking your health. Your data will always be yours, 
              and existing users will be notified when premium plans become available.
            </p>
            <div className="grid gap-6 md:grid-cols-3">
              <GlassCard hover className="text-center">
                <GlassCardContent className="pt-6">
                  <h3 className="mb-2 font-semibold">No Commitment</h3>
                  <p className="text-sm text-muted-foreground">
                    Start tracking immediately with no credit card or commitment required
                  </p>
                </GlassCardContent>
              </GlassCard>
              <GlassCard hover className="text-center">
                <GlassCardContent className="pt-6">
                  <h3 className="mb-2 font-semibold">Your Data Stays Yours</h3>
                  <p className="text-sm text-muted-foreground">
                    We never sell your data. Your health information is private and secure
                  </p>
                </GlassCardContent>
              </GlassCard>
              <GlassCard hover className="text-center">
                <GlassCardContent className="pt-6">
                  <h3 className="mb-2 font-semibold">Early Access</h3>
                  <p className="text-sm text-muted-foreground">
                    Existing users will get early access and special offers when premium plans launch
                  </p>
                </GlassCardContent>
              </GlassCard>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="mx-auto max-w-3xl space-y-8">
            <h2 className="text-4xl font-bold md:text-5xl">
              Start Your Health Journey Today
            </h2>
            <p className="text-xl text-blue-50 md:text-2xl">
              Join 50,000+ users who are taking control of their blood pressure
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" variant="secondary" asChild className="text-base font-semibold">
                <Link href="/signup">
                  <Heart className="mr-2 h-5 w-5" />
                  Get Started Free
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-white bg-white/10 text-white hover:bg-white/20 text-base">
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

