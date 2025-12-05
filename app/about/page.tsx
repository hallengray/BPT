import { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { GradientButton } from '@/components/ui/gradient-button'
import { GlassCard, GlassCardContent, GlassCardDescription, GlassCardHeader, GlassCardTitle } from '@/components/ui/glass-card'
import { Heart, Shield, Users, Target, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about EaseMyBP and our mission to make cardiovascular health tracking accessible to everyone.',
}

const values = [
  {
    icon: Heart,
    title: 'Health First',
    description: 'Your well-being is our top priority. We build features that genuinely help improve your cardiovascular health.',
    color: 'from-red-500 to-pink-600',
  },
  {
    icon: Shield,
    title: 'Privacy & Security',
    description: 'Your health data is sacred. We use industry-leading encryption and never sell your information.',
    color: 'from-blue-500 to-cyan-600',
  },
  {
    icon: Users,
    title: 'Accessibility',
    description: 'Healthcare tools should be available to everyone. That&apos;s why EaseMyBP is currently free to use.',
    color: 'from-green-500 to-emerald-600',
  },
  {
    icon: Target,
    title: 'Evidence-Based',
    description: 'Our features are built on medical best practices and validated health tracking methodologies.',
    color: 'from-purple-500 to-pink-600',
  },
]

export default function AboutPage() {
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
              About{' '}
              <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">
                EaseMyBP
              </span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
              Empowering people to take control of their cardiovascular health through technology
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl space-y-12">
            <div className="text-center">
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">Our Mission</h2>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                EaseMyBP was created with a simple goal: make blood pressure tracking accessible, 
                intuitive, and effective for everyone. We believe that understanding your health data 
                is the first step toward better cardiovascular wellness.
              </p>
            </div>

            <GlassCard hover>
              <GlassCardContent className="pt-6">
                <h3 className="mb-4 text-2xl font-bold">What We Do</h3>
                <p className="mb-4 text-muted-foreground">
                  EaseMyBP is a comprehensive blood pressure tracking application that helps you:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-600" />
                    <span>Track your daily blood pressure readings with ease</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-600" />
                    <span>Monitor diet, exercise, and medication patterns</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-600" />
                    <span>Get AI-powered insights into your health trends</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-600" />
                    <span>Share comprehensive reports with your healthcare provider</span>
                  </li>
                </ul>
              </GlassCardContent>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="border-t bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 py-20 dark:from-blue-950 dark:via-cyan-950 dark:to-teal-950">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Our Values</h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              The principles that guide everything we build
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <GlassCard key={index} hover className="h-full">
                  <GlassCardHeader>
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg">
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <GlassCardTitle>{value.title}</GlassCardTitle>
                    <GlassCardDescription>{value.description}</GlassCardDescription>
                  </GlassCardHeader>
                </GlassCard>
              )
            })}
          </div>
        </div>
      </section>

      {/* Medical Disclaimer */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <GlassCard>
              <GlassCardHeader>
                <GlassCardTitle>Important Medical Disclaimer</GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent>
                <p className="text-muted-foreground">
                  <strong className="text-foreground">EaseMyBP is for informational and educational purposes only.</strong> 
                  It is not intended to be a substitute for professional medical advice, diagnosis, or treatment. 
                  Always seek the advice of your physician or other qualified health provider with any questions 
                  you may have regarding a medical condition. Never disregard professional medical advice or delay 
                  in seeking it because of something you have read or seen in this application.
                </p>
                <p className="mt-4 text-muted-foreground">
                  If you think you may have a medical emergency, call your doctor or emergency services immediately. 
                  EaseMyBP does not recommend or endorse any specific tests, physicians, products, procedures, opinions, 
                  or other information that may be mentioned in the application.
                </p>
              </GlassCardContent>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="mx-auto max-w-3xl space-y-8">
            <h2 className="text-4xl font-bold md:text-5xl">
              Join Us on This Journey
            </h2>
            <p className="text-xl text-blue-50 md:text-2xl">
              Start tracking your health today and take control of your cardiovascular wellness
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" variant="secondary" asChild className="text-base font-semibold">
                <Link href="/signup">
                  <Heart className="mr-2 h-5 w-5" />
                  Get Started Free
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-white bg-white/10 text-white hover:bg-white/20 text-base">
                <Link href="/contact">
                  Contact Us
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

