import { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { GradientButton } from '@/components/ui/gradient-button'
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from '@/components/ui/glass-card'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'EaseMyBP Privacy Policy - Learn how we protect and handle your health data.',
}

export default function PrivacyPage() {
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
              <h1 className="mb-4 text-4xl font-bold">Privacy Policy</h1>
              <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>

            <GlassCard>
              <GlassCardHeader>
                <GlassCardTitle>1. Introduction</GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent className="prose prose-sm dark:prose-invert max-w-none">
                <p>
                  EaseMyBP (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. 
                  This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you 
                  use our blood pressure tracking application.
                </p>
                <p>
                  By using EaseMyBP, you agree to the collection and use of information in accordance with this policy. 
                  We take your health data privacy seriously and follow healthcare industry best practices.
                </p>
              </GlassCardContent>
            </GlassCard>

            <GlassCard>
              <GlassCardHeader>
                <GlassCardTitle>2. Information We Collect</GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent className="prose prose-sm dark:prose-invert max-w-none">
                <h3 className="font-semibold">2.1 Health Data</h3>
                <p>We collect the following health-related information:</p>
                <ul>
                  <li>Blood pressure readings (systolic, diastolic, pulse)</li>
                  <li>Diet and nutrition logs</li>
                  <li>Exercise and activity data</li>
                  <li>Medication information and adherence records</li>
                  <li>Notes and observations you choose to record</li>
                </ul>

                <h3 className="font-semibold mt-4">2.2 Account Information</h3>
                <ul>
                  <li>Email address (for account creation and authentication)</li>
                  <li>Password (encrypted and never stored in plain text)</li>
                  <li>Profile information you choose to provide</li>
                </ul>

                <h3 className="font-semibold mt-4">2.3 Technical Data</h3>
                <ul>
                  <li>Device information and browser type</li>
                  <li>IP address (for security and analytics)</li>
                  <li>Usage patterns and app interactions</li>
                </ul>
              </GlassCardContent>
            </GlassCard>

            <GlassCard>
              <GlassCardHeader>
                <GlassCardTitle>3. How We Use Your Information</GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent className="prose prose-sm dark:prose-invert max-w-none">
                <p>We use your information to:</p>
                <ul>
                  <li>Provide and maintain the EaseMyBP service</li>
                  <li>Generate health insights and analytics</li>
                  <li>Send you reminders and notifications (if enabled)</li>
                  <li>Improve our application and user experience</li>
                  <li>Ensure security and prevent fraud</li>
                  <li>Comply with legal obligations</li>
                </ul>
                <p className="mt-4">
                  <strong>We never sell your health data or personal information to third parties.</strong>
                </p>
              </GlassCardContent>
            </GlassCard>

            <GlassCard>
              <GlassCardHeader>
                <GlassCardTitle>4. Data Security</GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent className="prose prose-sm dark:prose-invert max-w-none">
                <p>We implement industry-leading security measures:</p>
                <ul>
                  <li><strong>Encryption:</strong> 256-bit encryption for data at rest and in transit</li>
                  <li><strong>Row Level Security:</strong> Database-level access controls ensure data isolation</li>
                  <li><strong>HIPAA Compliance:</strong> We follow healthcare privacy regulations</li>
                  <li><strong>Regular Audits:</strong> Security assessments and vulnerability testing</li>
                  <li><strong>Access Controls:</strong> Limited access to authorized personnel only</li>
                </ul>
              </GlassCardContent>
            </GlassCard>

            <GlassCard>
              <GlassCardHeader>
                <GlassCardTitle>5. Data Sharing and Disclosure</GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent className="prose prose-sm dark:prose-invert max-w-none">
                <p>We do not sell, trade, or rent your personal information. We may share data only in these circumstances:</p>
                <ul>
                  <li><strong>With Your Consent:</strong> When you explicitly authorize sharing (e.g., exporting reports)</li>
                  <li><strong>Service Providers:</strong> Trusted third parties who assist in operating our service (under strict confidentiality agreements)</li>
                  <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                  <li><strong>Business Transfers:</strong> In connection with a merger or acquisition (with user notification)</li>
                </ul>
              </GlassCardContent>
            </GlassCard>

            <GlassCard>
              <GlassCardHeader>
                <GlassCardTitle>6. Your Rights</GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent className="prose prose-sm dark:prose-invert max-w-none">
                <p>You have the right to:</p>
                <ul>
                  <li><strong>Access:</strong> Request a copy of your personal data</li>
                  <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                  <li><strong>Deletion:</strong> Request deletion of your account and data</li>
                  <li><strong>Export:</strong> Export your health data in a portable format</li>
                  <li><strong>Opt-Out:</strong> Unsubscribe from non-essential communications</li>
                </ul>
                <p className="mt-4">
                  To exercise these rights, contact us at <a href="mailto:privacy@easemybp.com" className="text-blue-600 hover:underline dark:text-blue-400">privacy@easemybp.com</a>
                </p>
              </GlassCardContent>
            </GlassCard>

            <GlassCard>
              <GlassCardHeader>
                <GlassCardTitle>7. Data Retention</GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent className="prose prose-sm dark:prose-invert max-w-none">
                <p>
                  We retain your health data for as long as your account is active. If you delete your account, 
                  we will delete your personal data within 30 days, except where we are required to retain it 
                  for legal or regulatory purposes.
                </p>
              </GlassCardContent>
            </GlassCard>

            <GlassCard>
              <GlassCardHeader>
                <GlassCardTitle>8. Children&apos;s Privacy</GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent className="prose prose-sm dark:prose-invert max-w-none">
                <p>
                  EaseMyBP is not intended for users under the age of 13. We do not knowingly collect 
                  personal information from children. If you believe we have collected information from a child, 
                  please contact us immediately.
                </p>
              </GlassCardContent>
            </GlassCard>

            <GlassCard>
              <GlassCardHeader>
                <GlassCardTitle>9. Changes to This Policy</GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent className="prose prose-sm dark:prose-invert max-w-none">
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of any changes by 
                  posting the new policy on this page and updating the &quot;Last updated&quot; date. 
                  Significant changes will be communicated via email or in-app notification.
                </p>
              </GlassCardContent>
            </GlassCard>

            <GlassCard>
              <GlassCardHeader>
                <GlassCardTitle>10. Contact Us</GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent className="prose prose-sm dark:prose-invert max-w-none">
                <p>
                  If you have questions about this Privacy Policy, please contact us at:
                </p>
                <p>
                  <strong>Email:</strong> <a href="mailto:privacy@easemybp.com" className="text-blue-600 hover:underline dark:text-blue-400">privacy@easemybp.com</a>
                </p>
              </GlassCardContent>
            </GlassCard>
          </div>
        </div>
      </section>
    </div>
  )
}


