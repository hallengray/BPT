import * as React from 'react'
import { cn } from '@/lib/utils'

export interface FloatingActionButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode
}

const FloatingActionButton = React.forwardRef<
  HTMLButtonElement,
  FloatingActionButtonProps
>(({ className, icon, children, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        'fixed bottom-20 right-6 z-50 md:bottom-6',
        'flex h-14 w-14 items-center justify-center',
        'rounded-full shadow-lg',
        'gradient-primary text-white',
        'hover-lift hover-glow',
        'transition-all duration-200',
        'active:scale-90',
        'animate-scale-in',
        className
      )}
      {...props}
    >
      {icon || children}
    </button>
  )
})
FloatingActionButton.displayName = 'FloatingActionButton'

export { FloatingActionButton }

