import { Pill } from 'lucide-react'
import { GlassCard, GlassCardContent, GlassCardHeader } from '@/components/ui/glass-card'
import { Skeleton } from '@/components/ui/skeleton'

export default function MedicationsLoading() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
            <Pill className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Medications</h1>
            <p className="text-muted-foreground">Track your medications and adherence</p>
          </div>
        </div>
        <Skeleton className="h-11 w-48" />
      </div>

      {/* Loading Skeletons */}
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <GlassCard key={i}>
              <GlassCardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="mt-2 h-4 w-1/2" />
              </GlassCardHeader>
              <GlassCardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-10 w-full" />
              </GlassCardContent>
            </GlassCard>
          ))}
        </div>

        {/* Chart Loading */}
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <GlassCard>
            <GlassCardHeader>
              <Skeleton className="h-6 w-1/3" />
            </GlassCardHeader>
            <GlassCardContent>
              <Skeleton className="h-[300px] w-full" />
            </GlassCardContent>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}

