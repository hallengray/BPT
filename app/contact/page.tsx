import { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { GradientButton } from '@/components/ui/gradient-button'
import { GlassCard, GlassCardContent, GlassCardDescription, GlassCardHeader, GlassCardTitle } from '@/components/ui/glass-card'
import { Mail, MessageSquare, Heart } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with the EaseMyBP team. We\'re here to help with questions, feedback, or support.',
}

export default function ContactPage() {
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
              Get in{' '}
              <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">
                Touch
              </span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
              Have questions, feedback, or need support? We&apos;re here to help.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="grid gap-8 md:grid-cols-2">
              <GlassCard hover>
                <GlassCardHeader>
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg">
                    <Mail className="h-8 w-8 text-white" />
                  </div>
                  <GlassCardTitle>Email Support</GlassCardTitle>
                  <GlassCardDescription>
                    Send us an email and we&apos;ll get back to you as soon as possible
                  </GlassCardDescription>
                </GlassCardHeader>
                <GlassCardContent>
                  <a
                    href="mailto:support@easemybp.com"
                    className="text-lg font-semibold text-blue-600 hover:underline dark:text-blue-400"
                  >
                    support@easemybp.com
                  </a>
                  <p className="mt-2 text-sm text-muted-foreground">
                    We typically respond within 24-48 hours
                  </p>
                </GlassCardContent>
              </GlassCard>

              <GlassCard hover>
                <GlassCardHeader>
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
                    <MessageSquare className="h-8 w-8 text-white" />
                  </div>
                  <GlassCardTitle>Feedback & Suggestions</GlassCardTitle>
                  <GlassCardDescription>
                    Share your ideas and help us improve EaseMyBP
                  </GlassCardDescription>
                </GlassCardHeader>
                <GlassCardContent>
                  <a
                    href="mailto:feedback@easemybp.com"
                    className="text-lg font-semibold text-green-600 hover:underline dark:text-green-400"
                  >
                    feedback@easemybp.com
                  </a>
                  <p className="mt-2 text-sm text-muted-foreground">
                    We love hearing from our users
                  </p>
                </GlassCardContent>
              </GlassCard>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="border-t bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 py-20 dark:from-blue-950 dark:via-cyan-950 dark:to-teal-950">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-8 text-center text-3xl font-bold md:text-4xl">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {[
                {
                  question: 'How do I get started?',
                  answer: 'Simply create a free account by clicking "Get Started" in the top navigation. No credit card required. Once you\'re signed up, you can start logging your blood pressure readings immediately.',
                },
                {
                  question: 'Is my health data secure?',
                  answer: 'Yes, absolutely. We use bank-level encryption (256-bit) and follow HIPAA-compliant security practices. Your data is never sold or shared with third parties. We take your privacy seriously.',
                },
                {
                  question: 'Can I export my data?',
                  answer: 'Yes! You can export comprehensive reports of your health data to share with your healthcare provider. This feature is available in your dashboard.',
                },
                {
                  question: 'Is EaseMyBP really free?',
                  answer: 'Yes, EaseMyBP is currently free to use. We believe everyone should have access to tools that help them manage their health. There are no hidden fees, and you can start tracking your health today without a credit card. Paid plans with premium features are coming soon, but core functionality will remain free.',
                },
                {
                  question: 'What if I have technical issues?',
                  answer: 'If you encounter any technical problems, please email us at support@easemybp.com with details about the issue. We\'ll help you resolve it as quickly as possible.',
                },
              ].map((faq, index) => (
                <GlassCard key={index} hover>
                  <GlassCardHeader>
                    <GlassCardTitle className="text-lg">{faq.question}</GlassCardTitle>
                  </GlassCardHeader>
                  <GlassCardContent>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </GlassCardContent>
                </GlassCard>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="mx-auto max-w-3xl space-y-8">
            <h2 className="text-4xl font-bold md:text-5xl">
              Ready to Start Your Health Journey?
            </h2>
            <p className="text-xl text-blue-50 md:text-2xl">
              Join thousands of users who are taking control of their cardiovascular health
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

