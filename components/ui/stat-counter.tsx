'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface StatCounterProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  duration?: number
  suffix?: string
  prefix?: string
}

const StatCounter = React.forwardRef<HTMLDivElement, StatCounterProps>(
  ({ className, value, duration = 1000, suffix = '', prefix = '', ...props }, ref) => {
    const [count, setCount] = React.useState(0)

    React.useEffect(() => {
      let startTime: number
      let animationFrame: number

      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp
        const progress = timestamp - startTime

        if (progress < duration) {
          setCount(Math.floor((progress / duration) * value))
          animationFrame = requestAnimationFrame(animate)
        } else {
          setCount(value)
        }
      }

      animationFrame = requestAnimationFrame(animate)

      return () => cancelAnimationFrame(animationFrame)
    }, [value, duration])

    return (
      <div ref={ref} className={cn('tabular-nums', className)} {...props}>
        {prefix}
        {count}
        {suffix}
      </div>
    )
  }
)
StatCounter.displayName = 'StatCounter'

export { StatCounter }

