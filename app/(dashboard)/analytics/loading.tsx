import { BarChart3 } from 'lucide-react'
import {
  GlassCard,
  GlassCardContent,
  GlassCardDescription,
  GlassCardHeader,
  GlassCardTitle,
} from '@/components/ui/glass-card'
import { ShimmerSkeleton } from '@/components/ui/shimmer-skeleton'

export default function AnalyticsLoading() {
  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-gradient-to-br from-orange-500 to-pink-500 p-3 shadow-lg">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Health Analytics</h1>
            <p className="text-muted-foreground">Loading your health insights...</p>
          </div>
        </div>
      </div>

      {/* Summary Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <GlassCard key={i}>
            <GlassCardContent className="p-6">
              <ShimmerSkeleton className="h-20 w-full" />
            </GlassCardContent>
          </GlassCard>
        ))}
      </div>

      {/* Insights Skeleton */}
      <GlassCard>
        <GlassCardHeader>
          <GlassCardTitle>Correlation Insights</GlassCardTitle>
          <GlassCardDescription>Analyzing your health patterns...</GlassCardDescription>
        </GlassCardHeader>
        <GlassCardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <ShimmerSkeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </GlassCardContent>
      </GlassCard>

      {/* Timeline Skeleton */}
      <GlassCard>
        <GlassCardHeader>
          <GlassCardTitle>Health Timeline</GlassCardTitle>
          <GlassCardDescription>Preparing your timeline visualization...</GlassCardDescription>
        </GlassCardHeader>
        <GlassCardContent>
          <ShimmerSkeleton className="h-[400px] w-full" />
        </GlassCardContent>
      </GlassCard>
    </div>
  )
}



