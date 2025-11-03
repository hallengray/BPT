import { Suspense } from 'react'
import { Metadata } from 'next'
import { ChatInterface } from '@/components/ai/chat-interface'
import { HealthOverview } from '@/components/ai/health-overview'
import { ShimmerSkeleton } from '@/components/ui/shimmer-skeleton'
import Image from 'next/image'
import { MessageCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Oní - AI Health Assistant',
  description: 'Get personalized health insights and advice powered by AI',
}

function PageSkeleton() {
  return (
    <div className="space-y-6">
      <ShimmerSkeleton className="h-32 w-full" />
      <ShimmerSkeleton className="h-[600px] w-full" />
    </div>
  )
}

export default function AIAssistantPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-sky-50/30 to-amber-50/30 dark:from-amber-950/10 dark:via-sky-950/10 dark:to-amber-950/10">
        <div className="container mx-auto max-w-7xl px-4 py-8 space-y-8">
          {/* Hero Section */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-amber-600 to-sky-600 dark:from-amber-700 dark:via-amber-800 dark:to-sky-700 p-8 md:p-12 shadow-2xl">
            <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]" />
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-8">
              <div className="relative h-24 w-24 md:h-32 md:w-32 rounded-3xl overflow-hidden shadow-2xl ring-4 ring-white/20">
                <Image 
                  src="/generated-image (1).png" 
                  alt="Oní AI Assistant"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
                  Meet Oní
                </h1>
                <p className="text-lg md:text-xl text-white/90 mb-4">
                  Your AI Health Assistant
                </p>
                <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm">
                    <MessageCircle className="h-4 w-4 text-white" />
                    <span className="text-sm font-medium text-white">24/7 Health Insights</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm">
                    <span className="text-sm font-medium text-white">Personalized Advice</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Chat Interface - 2 columns on large screens */}
            <div className="lg:col-span-2">
              <ChatInterface />
            </div>

            {/* Health Overview Sidebar - 1 column */}
            <div className="lg:col-span-1">
              <HealthOverview />
            </div>
          </div>

          {/* Disclaimer */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50/50 backdrop-blur-sm p-6 dark:border-amber-800 dark:bg-amber-950/30">
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong className="text-amber-900 dark:text-amber-100">Important:</strong> Oní provides general health information and insights based on your data. 
              This AI assistant is not a substitute for professional medical advice, diagnosis, or treatment. 
              Always consult with a qualified healthcare provider for medical decisions and concerns.
            </p>
          </div>
        </div>
      </div>
    </Suspense>
  )
}
