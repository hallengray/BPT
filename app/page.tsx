import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { GradientButton } from '@/components/ui/gradient-button'
import { GlassCard, GlassCardContent, GlassCardDescription, GlassCardHeader, GlassCardTitle } from '@/components/ui/glass-card'
import { Heart, TrendingUp, Sparkles, Shield, Lock, CheckCircle, ArrowRight, Users, BarChart3, Zap, Star, Quote } from 'lucide-react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b glass">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/generated-image.png"
              alt="EaseMyBP Logo"
              width={40}
              height={40}
              className="object-contain"
            />
            <span className="text-xl font-bold">EaseMyBP</span>
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button variant="ghost" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <GradientButton variant="primary" asChild>
              <Link href="/signup">Get Started</Link>
            </GradientButton>
          </div>
        </div>
      </header>
      {/* Hero Section - Split Layout */}
      <section className="relative min-h-[90vh] overflow-hidden bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-blue-950 dark:via-cyan-950 dark:to-teal-950">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(14,165,233,0.1),transparent_50%)]" />
        
        <div className="container relative z-10 mx-auto px-4 py-12 lg:py-20">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left: Content */}
            <div className="space-y-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                <Sparkles className="h-4 w-4" />
                <span>AI-Powered Health Tracking</span>
              </div>
              
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                  Take Control of Your{' '}
                  <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">
                    Blood Pressure
                  </span>
                </h1>
                <p className="text-lg text-muted-foreground sm:text-xl lg:text-2xl">
                  Track, understand, and improve your cardiovascular health with AI-powered insights and personalized recommendations.
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <GradientButton size="lg" variant="primary" asChild className="text-base">
                  <Link href="/signup">
                    <Heart className="mr-2 h-5 w-5" />
                    Start Free Today
                  </Link>
                </GradientButton>
                <Button size="lg" variant="outline" asChild className="glass hover-lift text-base">
                  <Link href="/login">
                    Sign In
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap items-center gap-6 pt-4">
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                    <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-semibold">HIPAA Compliant</p>
                    <p className="text-xs text-muted-foreground">Secure & Private</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-semibold">50,000+ Users</p>
                    <p className="text-xs text-muted-foreground">Trusted Worldwide</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                    <Star className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="font-semibold">100% Free</p>
                    <p className="text-xs text-muted-foreground">No Credit Card</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Hero Image */}
            <div className="relative animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10">
                <Image
                  src="/pexels-carloscruz-artegrafia-172084181-11198232.jpg"
                  alt="Medical monitoring equipment showing vital signs - professional healthcare technology"
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
              
              {/* Floating stat cards */}
              <div className="absolute -bottom-6 -left-6 glass rounded-2xl p-4 shadow-lg animate-float">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">120/80</p>
                    <p className="text-xs text-muted-foreground">Optimal Range</p>
                  </div>
                </div>
              </div>
              
              <div className="absolute -right-6 -top-6 glass rounded-2xl p-4 shadow-lg animate-float" style={{ animationDelay: '1s' }}>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">AI Insights</p>
                    <p className="text-xs text-muted-foreground">Personalized</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features / How It Works Section - Combined */}
      <section id="how-it-works" className="relative border-t bg-white py-20 dark:bg-gray-950 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl lg:text-5xl">
              Everything You Need to{' '}
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Manage Your Health
              </span>
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Start your journey to better cardiovascular health with comprehensive tracking and AI-powered insights
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
            {/* Feature 1 - Track Daily */}
            <div className="relative animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="absolute -left-4 -top-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 text-xl font-bold text-white shadow-lg z-10">
                1
              </div>
              <GlassCard hover glow className="h-full pt-8">
                <GlassCardHeader>
                  <div className="mb-4 flex justify-center">
                    <div className="relative h-48 w-full overflow-hidden rounded-xl">
                      <Image
                        src="/pexels-shkrabaanthony-7345456.jpg"
                        alt="Healthcare professional measuring blood pressure - step 1 of tracking process"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                  </div>
                  <GlassCardTitle className="text-center">Track Daily</GlassCardTitle>
                  <GlassCardDescription className="text-center">
                    Log your blood pressure readings, meals, and exercise activities with our intuitive interface
                  </GlassCardDescription>
                </GlassCardHeader>
                <GlassCardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 text-blue-600" />
                      <span>Quick 30-second logging</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 text-blue-600" />
                      <span>Track BP, diet & exercise</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 text-blue-600" />
                      <span>Set reminders & goals</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 text-blue-600" />
                      <span>Medication tracking</span>
                    </li>
                  </ul>
                </GlassCardContent>
              </GlassCard>
            </div>

            {/* Feature 2 - Get AI Insights */}
            <div className="relative animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="absolute -left-4 -top-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-600 text-xl font-bold text-white shadow-lg z-10">
                2
              </div>
              <GlassCard hover glow className="h-full pt-8">
                <GlassCardHeader>
                  <div className="mb-4 flex justify-center">
                    <div className="relative h-48 w-full overflow-hidden rounded-xl">
                      <Image
                        src="/pexels-medpoint-24-236639941-12203710.jpg"
                        alt="Person using blood pressure monitoring technology - AI-powered health insights"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                  </div>
                  <GlassCardTitle className="text-center">Get AI Insights</GlassCardTitle>
                  <GlassCardDescription className="text-center">
                    Our AI analyzes your data to identify patterns and provide personalized recommendations
                  </GlassCardDescription>
                </GlassCardHeader>
                <GlassCardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 text-purple-600" />
                      <span>Trend analysis & predictions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 text-purple-600" />
                      <span>Lifestyle correlations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 text-purple-600" />
                      <span>Personalized tips</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 text-purple-600" />
                      <span>AI chat assistant</span>
                    </li>
                  </ul>
                </GlassCardContent>
              </GlassCard>
            </div>

            {/* Feature 3 - Stay Healthy */}
            <div className="relative animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="absolute -left-4 -top-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-xl font-bold text-white shadow-lg z-10">
                3
              </div>
              <GlassCard hover glow className="h-full pt-8">
                <GlassCardHeader>
                  <div className="mb-4 flex justify-center">
                    <div className="relative h-48 w-full overflow-hidden rounded-xl">
                      <Image
                        src="/pexels-yaroslav-shuraev-8089105.jpg"
                        alt="Healthcare consultation - monitoring progress and achieving health goals"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                  </div>
                  <GlassCardTitle className="text-center">Stay Healthy</GlassCardTitle>
                  <GlassCardDescription className="text-center">
                    Monitor your progress, celebrate milestones, and achieve your health goals
                  </GlassCardDescription>
                </GlassCardHeader>
                <GlassCardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 text-green-600" />
                      <span>Visual progress tracking</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 text-green-600" />
                      <span>Achievement streaks</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 text-green-600" />
                      <span>Long-term health insights</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 text-green-600" />
                      <span>Export reports for doctor</span>
                    </li>
                  </ul>
                </GlassCardContent>
              </GlassCard>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Testimonials Section */}
      <section className="relative border-t bg-white py-20 dark:bg-gray-950 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl lg:text-5xl">
              Trusted by{' '}
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Thousands
              </span>
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              See what our users are saying about their health journey
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Testimonial 1 */}
            <GlassCard hover className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <GlassCardContent className="pt-6">
                <div className="mb-4 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <Quote className="mb-4 h-8 w-8 text-muted-foreground/20" />
                <p className="mb-6 text-sm italic text-muted-foreground">
                  &quot;This app has been a game-changer for managing my blood pressure. The AI insights helped me identify patterns I never noticed before.&quot;
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 text-lg font-bold text-white">
                    SM
                  </div>
                  <div>
                    <p className="font-semibold">Sarah M.</p>
                    <p className="text-xs text-muted-foreground">Using for 6 months</p>
                  </div>
                </div>
              </GlassCardContent>
            </GlassCard>

            {/* Testimonial 2 */}
            <GlassCard hover className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <GlassCardContent className="pt-6">
                <div className="mb-4 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <Quote className="mb-4 h-8 w-8 text-muted-foreground/20" />
                <p className="mb-6 text-sm italic text-muted-foreground">
                  &quot;Simple, intuitive, and incredibly helpful. My doctor was impressed with the detailed reports I could share from the app.&quot;
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-lg font-bold text-white">
                    JD
                  </div>
                  <div>
                    <p className="font-semibold">James D.</p>
                    <p className="text-xs text-muted-foreground">Using for 1 year</p>
                  </div>
                </div>
              </GlassCardContent>
            </GlassCard>

            {/* Testimonial 3 */}
            <GlassCard hover className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <GlassCardContent className="pt-6">
                <div className="mb-4 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <Quote className="mb-4 h-8 w-8 text-muted-foreground/20" />
                <p className="mb-6 text-sm italic text-muted-foreground">
                  &quot;The medication reminders and tracking features are fantastic. I never miss a dose anymore, and my BP has improved significantly.&quot;
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-600 text-lg font-bold text-white">
                    LK
                  </div>
                  <div>
                    <p className="font-semibold">Linda K.</p>
                    <p className="text-xs text-muted-foreground">Using for 8 months</p>
                  </div>
                </div>
              </GlassCardContent>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Trust & Security Section */}
      <section className="relative border-t bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 py-20 dark:from-blue-950 dark:via-cyan-950 dark:to-teal-950 lg:py-32">
        <div className="absolute inset-0 opacity-10">
          <Image
            src="/pexels-karola-g-4386466.jpg"
            alt="Healthcare background"
            fill
            className="object-cover"
          />
        </div>
        
        <div className="container relative z-10 mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl lg:text-5xl">
              Your Health Data is{' '}
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Safe & Secure
              </span>
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              We take your privacy seriously with industry-leading security measures
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <GlassCard hover className="text-center animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <GlassCardContent className="pt-6">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="mb-2 font-bold">HIPAA Compliant</h3>
                <p className="text-sm text-muted-foreground">
                  Fully compliant with healthcare privacy regulations
                </p>
              </GlassCardContent>
            </GlassCard>

            <GlassCard hover className="text-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <GlassCardContent className="pt-6">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg">
                    <Lock className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="mb-2 font-bold">Bank-Level Encryption</h3>
                <p className="text-sm text-muted-foreground">
                  256-bit encryption protects your data at rest and in transit
                </p>
              </GlassCardContent>
            </GlassCard>

            <GlassCard hover className="text-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <GlassCardContent className="pt-6">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
                    <CheckCircle className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="mb-2 font-bold">100% Private</h3>
                <p className="text-sm text-muted-foreground">
                  Your data is never sold or shared with third parties
                </p>
              </GlassCardContent>
            </GlassCard>

            <GlassCard hover className="text-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <GlassCardContent className="pt-6">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 shadow-lg">
                    <Zap className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="mb-2 font-bold">Regular Audits</h3>
                <p className="text-sm text-muted-foreground">
                  Independent security audits ensure ongoing protection
                </p>
              </GlassCardContent>
            </GlassCard>
          </div>

          {/* Medical Disclaimer */}
          <div className="mt-16 glass rounded-2xl p-6 text-center">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Medical Disclaimer:</strong> This application is for informational and educational purposes only. 
              It is not intended to be a substitute for professional medical advice, diagnosis, or treatment. 
              Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative border-t bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 py-20 text-white lg:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]" />
        
        <div className="container relative z-10 mx-auto px-4 text-center">
          <div className="mx-auto max-w-3xl space-y-8">
            <h2 className="text-4xl font-bold md:text-5xl lg:text-6xl">
              Start Your Health Journey Today
            </h2>
            <p className="text-xl text-blue-50 md:text-2xl">
              Join 50,000+ users who are taking control of their blood pressure and improving their cardiovascular health
            </p>
            
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" variant="secondary" asChild className="text-base font-semibold">
                <Link href="/signup">
                  <Heart className="mr-2 h-5 w-5" />
                  Get Started Free
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-white bg-white/10 text-white hover:bg-white/20 text-base">
                <Link href="/login">
                  Sign In
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-8 pt-8 text-sm text-blue-50">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <span>100% free now</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="glass border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="mb-4 flex items-center gap-2">
                <Image
                  src="/generated-image.png"
                  alt="EaseMyBP Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                />
                <span className="text-xl font-bold">EaseMyBP</span>
              </div>
              <p className="mb-4 text-sm text-muted-foreground">
                Take control of your cardiovascular health with AI-powered insights and personalized recommendations.
              </p>
              <div className="flex gap-4">
                <Button size="sm" variant="ghost" className="h-10 w-10 rounded-full p-0">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </Button>
                <Button size="sm" variant="ghost" className="h-10 w-10 rounded-full p-0">
                  <span className="sr-only">GitHub</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </Button>
                <Button size="sm" variant="ghost" className="h-10 w-10 rounded-full p-0">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                  </svg>
                </Button>
              </div>
            </div>

            {/* Product */}
            <div>
              <h3 className="mb-4 font-semibold">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/features" className="hover:text-foreground transition-colors">Features</Link></li>
                <li><Link href="/how-it-works" className="hover:text-foreground transition-colors">How It Works</Link></li>
                <li><Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
                <li><Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="mb-4 font-semibold">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-foreground transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="mb-4 font-semibold">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
                <li><Link href="/cookie-policy" className="hover:text-foreground transition-colors">Cookie Policy</Link></li>
                <li><Link href="/accessibility" className="hover:text-foreground transition-colors">Accessibility</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t pt-8 text-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} EaseMyBP. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
