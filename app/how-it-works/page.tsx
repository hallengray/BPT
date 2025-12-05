import { Metadata } from 'next'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { GradientButton } from '@/components/ui/gradient-button'
import { CheckCircle, ArrowRight, Heart } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'How It Works',
  description: 'Learn how EaseMyBP helps you track and improve your blood pressure in three simple steps.',
}

const steps = [
  {
    number: 1,
    title: 'Track Daily',
    description: 'Log your blood pressure readings, meals, and exercise activities with our intuitive interface',
    image: '/pexels-shkrabaanthony-7345456.jpg',
    imageAlt: 'Healthcare professional measuring blood pressure - step 1 of tracking process',
    features: [
      'Quick 30-second logging',
      'Track BP, diet & exercise',
      'Set reminders & goals',
      'Medication tracking',
    ],
    color: 'from-blue-500 to-cyan-600',
  },
  {
    number: 2,
    title: 'Get AI Insights',
    description: 'Our AI analyzes your data to identify patterns and provide personalized recommendations',
    image: '/pexels-medpoint-24-236639941-12203710.jpg',
    imageAlt: 'Person using blood pressure monitoring technology - AI-powered health insights',
    features: [
      'Trend analysis & predictions',
      'Lifestyle correlations',
      'Personalized tips',
      'AI chat assistant',
    ],
    color: 'from-purple-500 to-pink-600',
  },
  {
    number: 3,
    title: 'Stay Healthy',
    description: 'Monitor your progress, celebrate milestones, and achieve your health goals',
    image: '/pexels-yaroslav-shuraev-8089105.jpg',
    imageAlt: 'Healthcare consultation - monitoring progress and achieving health goals',
    features: [
      'Visual progress tracking',
      'Achievement streaks',
      'Long-term health insights',
      'Export reports for doctor',
    ],
    color: 'from-green-500 to-emerald-600',
  },
]

export default function HowItWorksPage() {
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
              How{' '}
              <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">
                EaseMyBP
              </span>{' '}
              Works
            </h1>
            <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
              Start your journey to better cardiovascular health in three simple steps
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <GradientButton size="lg" variant="primary" asChild>
                <Link href="/signup">
                  Start Free Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </GradientButton>
              <Button size="lg" variant="outline" asChild>
                <Link href="/features">View All Features</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="space-y-24">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className={`flex flex-col gap-12 lg:flex-row lg:items-center ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                {/* Image */}
                <div className="flex-1">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10">
                    <Image
                      src={step.image}
                      alt={step.imageAlt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 space-y-6">
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br text-2xl font-bold text-white shadow-lg`}
                      style={{
                        background: `linear-gradient(to bottom right, var(--tw-gradient-stops))`,
                      }}
                    >
                      {step.number}
                    </div>
                    <h2 className="text-3xl font-bold md:text-4xl">{step.title}</h2>
                  </div>

                  <p className="text-lg text-muted-foreground">{step.description}</p>

                  <ul className="space-y-3">
                    {step.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle className="mt-0.5 h-5 w-5 text-blue-600 flex-shrink-0" />
                        <span className="text-base">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Getting Started Section */}
      <section className="border-t bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 py-20 dark:from-blue-950 dark:via-cyan-950 dark:to-teal-950">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Ready to Get Started?
            </h2>
            <p className="mb-8 text-lg text-muted-foreground">
              Join thousands of users who are taking control of their cardiovascular health
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <GradientButton size="lg" variant="primary" asChild>
                <Link href="/signup">
                  <Heart className="mr-2 h-5 w-5" />
                  Create Free Account
                </Link>
              </GradientButton>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">Sign In to Existing Account</Link>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>100% free now</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>HIPAA compliant</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

