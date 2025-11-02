import { ShimmerSkeleton } from '@/components/ui/shimmer-skeleton'

export default function Loading() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <ShimmerSkeleton className="h-12 w-64" />
        <ShimmerSkeleton className="h-4 w-96" />
      </div>

      {/* Content Grid Skeleton */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Chat Interface Skeleton */}
        <ShimmerSkeleton className="h-[600px] rounded-lg" />

        {/* Right Column Skeleton */}
        <div className="space-y-6">
          <ShimmerSkeleton className="h-[280px] rounded-lg" />
          <ShimmerSkeleton className="h-[200px] rounded-lg" />
          <ShimmerSkeleton className="h-[200px] rounded-lg" />
          <ShimmerSkeleton className="h-[200px] rounded-lg" />
        </div>
      </div>
    </div>
  )
}

