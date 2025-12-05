import { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { GradientButton } from '@/components/ui/gradient-button'
import { GlassCard, GlassCardContent, GlassCardDescription, GlassCardHeader, GlassCardTitle } from '@/components/ui/glass-card'
import { CheckCircle, Heart } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Accessibility',
  description: 'EaseMyBP Accessibility Statement - Our commitment to making health tracking accessible to everyone.',
}

const accessibilityFeatures = [
  {
    title: 'Keyboard Navigation',
    description: 'All features can be accessed using only a keyboard. Tab through interactive elements, use Enter/Space to activate buttons, and Escape to close dialogs.',
  },
  {
    title: 'Screen Reader Support',
    description: 'Full compatibility with screen readers including JAWS, NVDA, VoiceOver, and TalkBack. All content is properly labeled with ARIA attributes.',
  },
  {
    title: 'Color Contrast',
    description: 'Text meets WCAG 2.1 AA standards with minimum 4.5:1 contrast ratio for normal text and 3:1 for large text.',
  },
  {
    title: 'Focus Indicators',
    description: 'Clear, visible focus indicators on all interactive elements help users navigate and understand their current position.',
  },
  {
    title: 'Semantic HTML',
    description: 'Proper heading hierarchy, landmark regions, and semantic elements ensure content structure is clear and navigable.',
  },
  {
    title: 'Alternative Text',
    description: 'All images include descriptive alternative text for users who cannot see visual content.',
  },
  {
    title: 'Form Labels',
    description: 'All form fields have associated labels and error messages are clearly announced to assistive technologies.',
  },
  {
    title: 'Responsive Design',
    description: 'Works seamlessly across devices and screen sizes, from mobile phones to large desktop displays.',
  },
]

export default function AccessibilityPage() {
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
              Accessibility{' '}
              <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">
                Commitment
              </span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
              EaseMyBP is committed to making health tracking accessible to everyone, regardless of ability
            </p>
          </div>
        </div>
      </section>

      {/* Commitment Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl space-y-8">
            <GlassCard>
              <GlassCardHeader>
                <GlassCardTitle>Our Commitment</GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent className="prose prose-sm dark:prose-invert max-w-none">
                <p>
                  At EaseMyBP, we believe that everyone should have equal access to tools that help them 
                  manage their health. We are committed to ensuring our application is accessible to people 
                  with disabilities and complies with the Web Content Accessibility Guidelines (WCAG) 2.1 
                  Level AA standards.
                </p>
                <p className="mt-4">
                  We continuously work to improve the accessibility of our application and welcome feedback 
                  from users about accessibility issues.
                </p>
              </GlassCardContent>
            </GlassCard>

            <div>
              <h2 className="mb-8 text-center text-3xl font-bold md:text-4xl">
                Accessibility Features
              </h2>
              <div className="grid gap-6 md:grid-cols-2">
                {accessibilityFeatures.map((feature, index) => (
                  <GlassCard key={index} hover>
                    <GlassCardHeader>
                      <GlassCardTitle className="text-lg">{feature.title}</GlassCardTitle>
                      <GlassCardDescription>{feature.description}</GlassCardDescription>
                    </GlassCardHeader>
                  </GlassCard>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Standards Section */}
      <section className="border-t bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 py-20 dark:from-blue-950 dark:via-cyan-950 dark:to-teal-950">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-8 text-center text-3xl font-bold md:text-4xl">
              Conformance Status
            </h2>
            <GlassCard>
              <GlassCardContent className="pt-6">
                <p className="mb-4">
                  EaseMyBP aims to conform to WCAG 2.1 Level AA standards. This means our application:
                </p>
                <ul className="space-y-2">
                  {[
                    'Is perceivable - Information and UI components are presentable in ways users can perceive',
                    'Is operable - UI components and navigation are functional',
                    'Is understandable - Information and UI operation are clear',
                    'Is robust - Content can be interpreted reliably by assistive technologies',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-5 w-5 text-green-600 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </GlassCardContent>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Feedback Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <GlassCard>
              <GlassCardHeader>
                <GlassCardTitle>Report Accessibility Issues</GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent className="prose prose-sm dark:prose-invert max-w-none">
                <p>
                  We are committed to making EaseMyBP accessible to everyone. If you encounter any 
                  accessibility barriers or have suggestions for improvement, please contact us:
                </p>
                <p className="mt-4">
                  <strong>Email:</strong> <a href="mailto:accessibility@easemybp.com" className="text-blue-600 hover:underline dark:text-blue-400">accessibility@easemybp.com</a>
                </p>
                <p className="mt-4">
                  When reporting an issue, please include:
                </p>
                <ul>
                  <li>The page or feature where you encountered the issue</li>
                  <li>A description of the accessibility barrier</li>
                  <li>Your device and browser information (if relevant)</li>
                  <li>Any assistive technology you are using</li>
                </ul>
                <p className="mt-4">
                  We will review your feedback and work to address accessibility issues promptly.
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
              Start Your Health Journey Today
            </h2>
            <p className="text-xl text-blue-50 md:text-2xl">
              EaseMyBP is designed to be accessible to everyone
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

