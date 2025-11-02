import { cn } from '@/lib/utils'

function ShimmerSkeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-gradient-to-r from-muted via-muted/50 to-muted',
        'bg-[length:200%_100%]',
        'animate-shimmer',
        className
      )}
      style={{
        backgroundImage:
          'linear-gradient(90deg, hsl(var(--muted)) 0%, hsl(var(--muted) / 0.5) 50%, hsl(var(--muted)) 100%)',
      }}
      {...props}
    />
  )
}

export { ShimmerSkeleton }

