import { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { GradientButton } from '@/components/ui/gradient-button'
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from '@/components/ui/glass-card'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'EaseMyBP Cookie Policy - Learn about how we use cookies and similar technologies.',
}

export default function CookiePolicyPage() {
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
              <h1 className="mb-4 text-4xl font-bold">Cookie Policy</h1>
              <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>

            <GlassCard>
              <GlassCardHeader>
                <GlassCardTitle>1. What Are Cookies?</GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent className="prose prose-sm dark:prose-invert max-w-none">
                <p>
                  Cookies are small text files that are placed on your device when you visit a website. 
                  They are widely used to make websites work more efficiently and provide information to 
                  the website owners.
                </p>
                <p className="mt-4">
                  EaseMyBP uses cookies and similar technologies to enhance your experience, analyze usage, 
                  and ensure the security of our application.
                </p>
              </GlassCardContent>
            </GlassCard>

            <GlassCard>
              <GlassCardHeader>
                <GlassCardTitle>2. How We Use Cookies</GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent className="prose prose-sm dark:prose-invert max-w-none">
                <p>We use cookies for the following purposes:</p>
                
                <h3 className="font-semibold mt-4">2.1 Essential Cookies</h3>
                <p>
                  These cookies are necessary for the website to function properly. They enable core 
                  functionality such as security, authentication, and session management.
                </p>
                <ul>
                  <li>Authentication tokens for secure login</li>
                  <li>Session management</li>
                  <li>Security and fraud prevention</li>
                </ul>

                <h3 className="font-semibold mt-4">2.2 Functional Cookies</h3>
                <p>
                  These cookies allow the website to remember choices you make and provide enhanced, 
                  personalized features.
                </p>
                <ul>
                  <li>Theme preferences (dark/light mode)</li>
                  <li>Language preferences</li>
                  <li>User interface settings</li>
                </ul>

                <h3 className="font-semibold mt-4">2.3 Analytics Cookies</h3>
                <p>
                  These cookies help us understand how visitors interact with our website by collecting 
                  and reporting information anonymously.
                </p>
                <ul>
                  <li>Page views and navigation patterns</li>
                  <li>Feature usage statistics</li>
                  <li>Performance metrics</li>
                </ul>
              </GlassCardContent>
            </GlassCard>

            <GlassCard>
              <GlassCardHeader>
                <GlassCardTitle>3. Third-Party Cookies</GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent className="prose prose-sm dark:prose-invert max-w-none">
                <p>
                  We may use third-party services that set cookies on your device. These services help us 
                  provide and improve our application. We do not allow third parties to use cookies for 
                  advertising or tracking purposes.
                </p>
                <p className="mt-4">
                  Third-party services we use include:
                </p>
                <ul>
                  <li>Authentication providers (Supabase)</li>
                  <li>Analytics services (for app improvement)</li>
                  <li>Error tracking services (for bug detection)</li>
                </ul>
              </GlassCardContent>
            </GlassCard>

            <GlassCard>
              <GlassCardHeader>
                <GlassCardTitle>4. Managing Cookies</GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent className="prose prose-sm dark:prose-invert max-w-none">
                <p>
                  You can control and manage cookies in various ways. Please keep in mind that removing 
                  or blocking cookies can impact your user experience and parts of our website may no 
                  longer be fully accessible.
                </p>
                
                <h3 className="font-semibold mt-4">Browser Settings</h3>
                <p>
                  Most browsers allow you to refuse or accept cookies. You can also delete cookies that 
                  have already been set. The methods for doing so vary from browser to browser:
                </p>
                <ul>
                  <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies</li>
                  <li><strong>Firefox:</strong> Options → Privacy & Security → Cookies</li>
                  <li><strong>Safari:</strong> Preferences → Privacy → Cookies</li>
                  <li><strong>Edge:</strong> Settings → Privacy, search, and services → Cookies</li>
                </ul>

                <h3 className="font-semibold mt-4">App Settings</h3>
                <p>
                  You can manage certain cookie preferences through your account settings in the EaseMyBP 
                  application.
                </p>
              </GlassCardContent>
            </GlassCard>

            <GlassCard>
              <GlassCardHeader>
                <GlassCardTitle>5. Do Not Track Signals</GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent className="prose prose-sm dark:prose-invert max-w-none">
                <p>
                  Some browsers include a &quot;Do Not Track&quot; (DNT) feature that signals to websites 
                  you visit that you do not want to have your online activity tracked. Currently, there is 
                  no standard for how DNT signals should be interpreted. EaseMyBP does not currently respond 
                  to DNT signals.
                </p>
              </GlassCardContent>
            </GlassCard>

            <GlassCard>
              <GlassCardHeader>
                <GlassCardTitle>6. Updates to This Policy</GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent className="prose prose-sm dark:prose-invert max-w-none">
                <p>
                  We may update this Cookie Policy from time to time to reflect changes in our practices 
                  or for other operational, legal, or regulatory reasons. We will notify you of any material 
                  changes by posting the new policy on this page.
                </p>
              </GlassCardContent>
            </GlassCard>

            <GlassCard>
              <GlassCardHeader>
                <GlassCardTitle>7. Contact Us</GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent className="prose prose-sm dark:prose-invert max-w-none">
                <p>
                  If you have questions about our use of cookies, please contact us at:
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


