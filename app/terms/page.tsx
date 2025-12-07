import { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { GradientButton } from '@/components/ui/gradient-button'
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from '@/components/ui/glass-card'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'EaseMyBP Terms of Service - Read our terms and conditions for using the application.',
}

export default function TermsPage() {
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

      {/* Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl space-y-8">
            <div>
              <h1 className="mb-4 text-4xl font-bold">Terms of Service</h1>
              <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>

            <GlassCard>
              <GlassCardHeader>
                <GlassCardTitle>1. Acceptance of Terms</GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent className="prose prose-sm dark:prose-invert max-w-none">
                <p>
                  By accessing or using EaseMyBP, you agree to be bound by these Terms of Service and all 
                  applicable laws and regulations. If you do not agree with any of these terms, you are 
                  prohibited from using or accessing this application.
                </p>
              </GlassCardContent>
            </GlassCard>

            <GlassCard>
              <GlassCardHeader>
                <GlassCardTitle>2. Medical Disclaimer</GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent className="prose prose-sm dark:prose-invert max-w-none">
                <p>
                  <strong>EaseMyBP is for informational and educational purposes only.</strong> It is not 
                  intended to be a substitute for professional medical advice, diagnosis, or treatment.
                </p>
                <p className="mt-4">
                  Always seek the advice of your physician or other qualified health provider with any 
                  questions you may have regarding a medical condition. Never disregard professional medical 
                  advice or delay in seeking it because of something you have read or seen in this application.
                </p>
                <p className="mt-4">
                  If you think you may have a medical emergency, call your doctor or emergency services 
                  immediately. EaseMyBP does not recommend or endorse any specific tests, physicians, products, 
                  procedures, opinions, or other information.
                </p>
              </GlassCardContent>
            </GlassCard>

            <GlassCard>
              <GlassCardHeader>
                <GlassCardTitle>3. Use License</GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent className="prose prose-sm dark:prose-invert max-w-none">
                <p>
                  Permission is granted to temporarily use EaseMyBP for personal, non-commercial purposes. 
                  This is the grant of a license, not a transfer of title, and under this license you may not:
                </p>
                <ul>
                  <li>Modify or copy the materials</li>
                  <li>Use the materials for any commercial purpose</li>
                  <li>Attempt to reverse engineer any software contained in EaseMyBP</li>
                  <li>Remove any copyright or other proprietary notations from the materials</li>
                  <li>Transfer the materials to another person or &quot;mirror&quot; the materials on any other server</li>
                </ul>
              </GlassCardContent>
            </GlassCard>

            <GlassCard>
              <GlassCardHeader>
                <GlassCardTitle>4. User Accounts</GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent className="prose prose-sm dark:prose-invert max-w-none">
                <p>When you create an account with EaseMyBP, you agree to:</p>
                <ul>
                  <li>Provide accurate, current, and complete information</li>
                  <li>Maintain and promptly update your account information</li>
                  <li>Maintain the security of your password</li>
                  <li>Accept responsibility for all activities under your account</li>
                  <li>Notify us immediately of any unauthorized use</li>
                </ul>
              </GlassCardContent>
            </GlassCard>

            <GlassCard>
              <GlassCardHeader>
                <GlassCardTitle>5. User Content</GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent className="prose prose-sm dark:prose-invert max-w-none">
                <p>
                  You are responsible for all content you submit to EaseMyBP. You agree not to submit content that:
                </p>
                <ul>
                  <li>Is illegal, harmful, or violates any laws</li>
                  <li>Infringes on the rights of others</li>
                  <li>Contains viruses or malicious code</li>
                  <li>Is false, misleading, or deceptive</li>
                  <li>Violates privacy or confidentiality</li>
                </ul>
                <p className="mt-4">
                  You retain ownership of your health data. By using EaseMyBP, you grant us a license to 
                  use, store, and process your data to provide the service.
                </p>
              </GlassCardContent>
            </GlassCard>

            <GlassCard>
              <GlassCardHeader>
                <GlassCardTitle>6. Service Availability</GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent className="prose prose-sm dark:prose-invert max-w-none">
                <p>
                  We strive to provide reliable service but do not guarantee uninterrupted or error-free 
                  operation. We reserve the right to:
                </p>
                <ul>
                  <li>Modify or discontinue the service at any time</li>
                  <li>Perform maintenance that may temporarily interrupt service</li>
                  <li>Limit access to prevent abuse or ensure security</li>
                </ul>
              </GlassCardContent>
            </GlassCard>

            <GlassCard>
              <GlassCardHeader>
                <GlassCardTitle>7. Limitation of Liability</GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent className="prose prose-sm dark:prose-invert max-w-none">
                <p>
                  In no event shall EaseMyBP or its suppliers be liable for any damages (including, without 
                  limitation, damages for loss of data or profit, or due to business interruption) arising out 
                  of the use or inability to use EaseMyBP, even if we have been notified of the possibility of 
                  such damage.
                </p>
              </GlassCardContent>
            </GlassCard>

            <GlassCard>
              <GlassCardHeader>
                <GlassCardTitle>8. Indemnification</GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent className="prose prose-sm dark:prose-invert max-w-none">
                <p>
                  You agree to indemnify and hold harmless EaseMyBP, its officers, directors, employees, and 
                  agents from any claims, damages, losses, liabilities, and expenses (including legal fees) 
                  arising from your use of the service or violation of these terms.
                </p>
              </GlassCardContent>
            </GlassCard>

            <GlassCard>
              <GlassCardHeader>
                <GlassCardTitle>9. Termination</GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent className="prose prose-sm dark:prose-invert max-w-none">
                <p>
                  We may terminate or suspend your account immediately, without prior notice, for conduct that 
                  we believe violates these Terms of Service or is harmful to other users, us, or third parties.
                </p>
                <p className="mt-4">
                  You may delete your account at any time through your account settings. Upon termination, 
                  your right to use the service will immediately cease.
                </p>
              </GlassCardContent>
            </GlassCard>

            <GlassCard>
              <GlassCardHeader>
                <GlassCardTitle>10. Changes to Terms</GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent className="prose prose-sm dark:prose-invert max-w-none">
                <p>
                  We reserve the right to modify these terms at any time. We will notify users of material 
                  changes via email or in-app notification. Continued use of EaseMyBP after changes constitutes 
                  acceptance of the new terms.
                </p>
              </GlassCardContent>
            </GlassCard>

            <GlassCard>
              <GlassCardHeader>
                <GlassCardTitle>11. Contact Information</GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent className="prose prose-sm dark:prose-invert max-w-none">
                <p>
                  If you have questions about these Terms of Service, please contact us at:
                </p>
                <p>
                  <strong>Email:</strong> <a href="mailto:legal@easemybp.com" className="text-blue-600 hover:underline dark:text-blue-400">legal@easemybp.com</a>
                </p>
              </GlassCardContent>
            </GlassCard>
          </div>
        </div>
      </section>
    </div>
  )
}


