import { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { GradientButton } from '@/components/ui/gradient-button'
import { GlassCard, GlassCardContent, GlassCardDescription, GlassCardHeader, GlassCardTitle } from '@/components/ui/glass-card'
import { 
  Heart, 
  Utensils, 
  Dumbbell, 
  Pill, 
  BarChart3, 
  Brain, 
  Bell, 
  Shield, 
  TrendingUp,
  CheckCircle,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Features',
  description: 'Discover all the powerful features of EaseMyBP - your comprehensive blood pressure tracking solution.',
}

const features = [
  {
    icon: Heart,
    title: 'Blood Pressure Tracking',
    description: 'Log your daily blood pressure readings with ease. Track systolic, diastolic, and pulse measurements.',
    highlights: [
      'Quick 30-second logging',
      'Visual trend charts',
      'BP classification (Normal, Elevated, Stage 1/2, Crisis)',
      'Export reports for your doctor',
    ],
    color: 'from-red-500 to-pink-600',
  },
  {
    icon: Utensils,
    title: 'Diet & Nutrition Logging',
    description: 'Track your meals and nutrition to identify dietary patterns that affect your blood pressure.',
    highlights: [
      'Meal type tracking (Breakfast, Lunch, Dinner, Snack)',
      'Sodium level monitoring',
      'Meal descriptions and notes',
      'Correlation analysis with BP readings',
    ],
    color: 'from-green-500 to-emerald-600',
  },
  {
    icon: Dumbbell,
    title: 'Exercise Tracking',
    description: 'Monitor your physical activities and see how exercise impacts your cardiovascular health.',
    highlights: [
      'Activity type and duration',
      'Intensity levels (Low, Moderate, High)',
      'Rest day tracking',
      'Exercise-BP correlation insights',
    ],
    color: 'from-purple-500 to-pink-600',
  },
  {
    icon: Pill,
    title: 'Medication Management',
    description: 'Comprehensive medication tracking with automatic scheduling and adherence monitoring.',
    highlights: [
      'Medication scheduling and reminders',
      'Dose tracking with one-tap logging',
      'Adherence analytics and color-coded insights',
      'Batch "Take All" functionality',
      'Automatic 30-day dose buffer',
    ],
    color: 'from-blue-500 to-cyan-600',
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'AI-powered insights and correlation analysis to understand your health patterns.',
    highlights: [
      'Trend analysis and predictions',
      'BP-Diet-Exercise-Medication correlations',
      'Week-over-week comparisons',
      '30-day BP projections',
      'Predictive insights engine',
    ],
    color: 'from-orange-500 to-red-600',
  },
  {
    icon: Brain,
    title: 'AI Health Assistant',
    description: 'Get personalized health insights powered by Claude 3.5 Sonnet AI.',
    highlights: [
      'Personalized health summaries',
      'Contextual health advice',
      'Pattern recognition and insights',
      'Natural language conversations',
    ],
    color: 'from-indigo-500 to-purple-600',
  },
  {
    icon: Bell,
    title: 'Smart Reminders',
    description: 'Never miss a reading or medication dose with intelligent reminder system.',
    highlights: [
      'Medication dose reminders',
      'BP logging prompts',
      'Contextual follow-up suggestions',
      'Customizable notification preferences',
    ],
    color: 'from-teal-500 to-cyan-600',
  },
  {
    icon: TrendingUp,
    title: 'Progress Tracking',
    description: 'Visualize your health journey with streaks, milestones, and achievement badges.',
    highlights: [
      'Daily logging streaks',
      'Milestone achievements (10 levels)',
      'Health score calculation',
      'Progress visualization',
    ],
    color: 'from-yellow-500 to-orange-600',
  },
]

const securityFeatures = [
  {
    icon: Shield,
    title: 'HIPAA Compliant',
    description: 'Fully compliant with healthcare privacy regulations',
  },
  {
    icon: Shield,
    title: 'Bank-Level Encryption',
    description: '256-bit encryption protects your data at rest and in transit',
  },
  {
    icon: Shield,
    title: '100% Private',
    description: 'Your data is never sold or shared with third parties',
  },
  {
    icon: Shield,
    title: 'Row Level Security',
    description: 'Advanced database security ensures data isolation',
  },
]

export default function FeaturesPage() {
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
              Powerful Features for{' '}
              <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">
                Better Health
              </span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
              Everything you need to track, understand, and improve your cardiovascular health
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <GradientButton size="lg" variant="primary" asChild>
                <Link href="/signup">
                  Start Free Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </GradientButton>
              <Button size="lg" variant="outline" asChild>
                <Link href="/how-it-works">Learn How It Works</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Features Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Comprehensive Health Tracking
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Track every aspect of your cardiovascular health in one place
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <GlassCard key={index} hover glow className="h-full">
                  <GlassCardHeader>
                    <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.color} shadow-lg`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <GlassCardTitle>{feature.title}</GlassCardTitle>
                    <GlassCardDescription>{feature.description}</GlassCardDescription>
                  </GlassCardHeader>
                  <GlassCardContent>
                    <ul className="space-y-2 text-sm">
                      {feature.highlights.map((highlight, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle className="mt-0.5 h-4 w-4 text-blue-600 flex-shrink-0" />
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </GlassCardContent>
                </GlassCard>
              )
            })}
          </div>
        </div>
      </section>

      {/* Security & Privacy */}
      <section className="border-t bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 py-20 dark:from-blue-950 dark:via-cyan-950 dark:to-teal-950">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Your Data is{' '}
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Safe & Secure
              </span>
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Industry-leading security measures protect your sensitive health information
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {securityFeatures.map((feature, index) => {
              const Icon = feature.icon
              return (
                <GlassCard key={index} hover className="text-center">
                  <GlassCardContent className="pt-6">
                    <div className="mb-4 flex justify-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <h3 className="mb-2 font-bold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </GlassCardContent>
                </GlassCard>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="mx-auto max-w-3xl space-y-8">
            <h2 className="text-4xl font-bold md:text-5xl">
              Ready to Take Control of Your Health?
            </h2>
            <p className="text-xl text-blue-50 md:text-2xl">
              Join thousands of users who are improving their cardiovascular health with EaseMyBP
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

