import { Suspense } from 'react'
import { Metadata } from 'next'
import { Sparkles, Calendar, TrendingUp, BarChart3 } from 'lucide-react'
import { ChatInterface } from '@/components/ai/chat-interface'
import { SummaryCard } from '@/components/ai/summary-card'
import { AdviceCard } from '@/components/ai/advice-card'
import { ShimmerSkeleton } from '@/components/ui/shimmer-skeleton'

export const metadata: Metadata = {
  title: 'AI Health Assistant | Blood Pressure Tracker',
  description: 'Get personalized health insights and advice powered by AI',
}

function PageSkeleton() {
  return (
    <div className="space-y-6">
      <ShimmerSkeleton className="h-12 w-64" />
      <div className="grid gap-6 lg:grid-cols-2">
        <ShimmerSkeleton className="h-[600px]" />
        <div className="space-y-6">
          <ShimmerSkeleton className="h-[280px]" />
          <ShimmerSkeleton className="h-[280px]" />
        </div>
      </div>
    </div>
  )
}

export default function AIAssistantPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 p-3 shadow-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">AI Health Assistant</h1>
              <p className="text-muted-foreground">
                Get personalized insights and advice powered by Claude 3.5 Sonnet
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column - Chat Interface */}
          <div className="space-y-6">
            <ChatInterface />
          </div>

          {/* Right Column - Summaries and Advice */}
          <div className="space-y-6">
            {/* Personalized Advice */}
            <AdviceCard />

            {/* Health Summaries */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Health Summaries</h2>
              
              <div className="grid gap-4">
                <SummaryCard
                  period="daily"
                  title="Daily Summary"
                  description="Get insights from today's health data"
                  icon={<Calendar className="h-5 w-5 text-blue-500" />}
                />
                
                <SummaryCard
                  period="weekly"
                  title="Weekly Summary"
                  description="Review your progress over the past week"
                  icon={<TrendingUp className="h-5 w-5 text-green-500" />}
                />
                
                <SummaryCard
                  period="monthly"
                  title="Monthly Summary"
                  description="Comprehensive analysis of the past month"
                  icon={<BarChart3 className="h-5 w-5 text-purple-500" />}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="glass-card rounded-lg p-4">
          <p className="text-xs text-muted-foreground">
            <strong>Important:</strong> This AI assistant provides general health information and insights based on your data. 
            It is not a substitute for professional medical advice, diagnosis, or treatment. 
            Always consult with a qualified healthcare provider for medical decisions and concerns.
          </p>
        </div>
      </div>
    </Suspense>
  )
}

