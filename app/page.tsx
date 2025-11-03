import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { GradientButton } from '@/components/ui/gradient-button'
import { GlassCard, GlassCardContent, GlassCardDescription, GlassCardHeader, GlassCardTitle } from '@/components/ui/glass-card'
import { Activity, Heart, TrendingUp, Sparkles, Brain } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative flex flex-1 items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 px-4 py-24 dark:from-blue-950 dark:via-purple-950 dark:to-pink-950">
        {/* Animated background gradient mesh */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-pink-400/20 dark:from-blue-600/10 dark:via-purple-600/10 dark:to-pink-600/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
        
        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <div className="mb-8 flex justify-center animate-fade-in">
            <div className="relative h-32 w-32 rounded-full bg-gradient-to-br from-amber-500/20 to-sky-500/20 p-2 shadow-lg animate-pulse-glow">
              <div className="relative h-full w-full rounded-full bg-white/90 dark:bg-gray-900/90 p-4 flex items-center justify-center">
                <Image
                  src="/generated-image.png"
                  alt="EaseMyBP Logo"
                  width={96}
                  height={96}
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl animate-fade-in bg-gradient-to-r from-amber-600 via-amber-500 to-sky-500 bg-clip-text text-transparent">
            EaseMyBP
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground sm:text-xl animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Take control of your health with AI-powered insights. Track your blood pressure, monitor your diet, log your exercise, and get personalized recommendations.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <GradientButton size="lg" variant="primary" asChild>
              <Link href="/signup">
                <Sparkles className="mr-2 h-5 w-5" />
                Get Started Free
              </Link>
            </GradientButton>
            <Button size="lg" variant="outline" asChild className="glass hover-lift">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
          
          {/* Stats badges */}
          <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="glass rounded-full px-4 py-2">
              <span className="font-semibold text-primary">AI-Powered</span> Insights
            </div>
            <div className="glass rounded-full px-4 py-2">
              <span className="font-semibold text-primary">HIPAA</span> Compliant
            </div>
            <div className="glass rounded-full px-4 py-2">
              <span className="font-semibold text-primary">100%</span> Free
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative border-t bg-gradient-to-b from-background to-muted/20 px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Everything You Need to{' '}
              <span className="bg-gradient-to-r from-amber-600 to-sky-500 bg-clip-text text-transparent">
                Stay Healthy
              </span>
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Comprehensive health tracking with intelligent insights powered by AI
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            <GlassCard hover glow className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <GlassCardHeader>
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                  <Activity className="h-7 w-7 text-white" />
                </div>
                <GlassCardTitle>Blood Pressure Tracking</GlassCardTitle>
                <GlassCardDescription>
                  Log your daily readings and visualize trends with beautiful charts
                </GlassCardDescription>
              </GlassCardHeader>
              <GlassCardContent>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-primary">✓</span>
                    <span>Track systolic, diastolic, and pulse</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-primary">✓</span>
                    <span>View historical data with interactive charts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-primary">✓</span>
                    <span>Set personalized health goals</span>
                  </li>
                </ul>
              </GlassCardContent>
            </GlassCard>

            <GlassCard hover glow className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <GlassCardHeader>
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-teal-600 shadow-lg">
                  <TrendingUp className="h-7 w-7 text-white" />
                </div>
                <GlassCardTitle>Lifestyle Tracking</GlassCardTitle>
                <GlassCardDescription>
                  Monitor diet and exercise to understand their impact on your BP
                </GlassCardDescription>
              </GlassCardHeader>
              <GlassCardContent>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-green-600">✓</span>
                    <span>Log meals and nutrition details</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-green-600">✓</span>
                    <span>Track physical activities and intensity</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-green-600">✓</span>
                    <span>See correlations with BP readings</span>
                  </li>
                </ul>
              </GlassCardContent>
            </GlassCard>

            <GlassCard hover glow className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <GlassCardHeader>
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 shadow-lg">
                  <Brain className="h-7 w-7 text-white" />
                </div>
                <GlassCardTitle>AI Health Assistant</GlassCardTitle>
                <GlassCardDescription>
                  Get personalized insights and recommendations powered by AI
                </GlassCardDescription>
              </GlassCardHeader>
              <GlassCardContent>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-pink-600">✓</span>
                    <span>AI-powered health insights</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-pink-600">✓</span>
                    <span>Personalized recommendations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-pink-600">✓</span>
                    <span>Correlation analytics and trends</span>
                  </li>
                </ul>
              </GlassCardContent>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="glass border-t py-12 text-center">
        <div className="mx-auto max-w-4xl px-4">
          <div className="mb-6 flex justify-center">
            <Heart className="h-8 w-8 text-primary" />
          </div>
          <p className="text-sm font-medium">EaseMyBP © {new Date().getFullYear()}</p>
          <p className="mt-4 text-xs text-muted-foreground">
            <strong>Medical Disclaimer:</strong> This application is for informational and educational purposes only. 
            It is not intended to be a substitute for professional medical advice, diagnosis, or treatment. 
            Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
          </p>
          <div className="mt-6 flex justify-center gap-6 text-xs text-muted-foreground">
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Service</span>
            <span>•</span>
            <span>Contact</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
