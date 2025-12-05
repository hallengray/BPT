'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, TrendingUp, Sparkles, PenSquare, History } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { 
    href: '/dashboard', 
    label: 'Home', 
    icon: LayoutDashboard, 
    color: 'from-blue-500 to-blue-600' 
  },
  { 
    href: '/analytics', 
    label: 'Stats', 
    icon: TrendingUp, 
    color: 'from-green-500 to-emerald-600' 
  },
  { 
    href: '/ai-assistant', 
    label: 'AI', 
    icon: Sparkles, 
    color: 'from-pink-500 to-rose-600',
    isCenter: true 
  },
  { 
    href: '/quick-log', 
    label: 'Log', 
    icon: PenSquare, 
    color: 'from-purple-500 to-purple-600' 
  },
  { 
    href: '/history', 
    label: 'History', 
    icon: History, 
    color: 'from-indigo-500 to-indigo-600' 
  },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-gradient-to-t from-amber-50/95 via-sky-50/95 to-amber-50/90 dark:from-amber-950/95 dark:via-sky-950/95 dark:to-amber-950/90 backdrop-blur-xl border-t border-amber-500/20 shadow-2xl"
      aria-label="Mobile navigation"
    >
      <div className="relative flex h-20 items-center justify-around px-2 pb-safe">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || 
            (pathname.startsWith(item.href) && item.href !== '/dashboard')

          if (item.isCenter) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative flex flex-col items-center justify-center transition-transform',
                  'active:scale-95',
                  '-mt-8'
                )}
                aria-current={isActive ? 'page' : undefined}
                aria-label={item.label}
              >
                <div 
                  className={cn(
                    'flex h-16 w-16 items-center justify-center rounded-full shadow-2xl',
                    'bg-gradient-to-br transition-all',
                    item.color,
                    isActive ? 'ring-4 ring-white dark:ring-gray-950 scale-105' : 'scale-100'
                  )}
                >
                  <Icon className="h-7 w-7 text-white" />
                </div>
                <span 
                  className={cn(
                    'mt-1 text-[10px] font-medium transition-colors',
                    isActive ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {item.label}
                </span>
              </Link>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center space-y-1 rounded-xl px-3 py-2 transition-all relative min-w-[64px]',
                'active:scale-95',
                isActive 
                  ? 'text-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
              aria-current={isActive ? 'page' : undefined}
              aria-label={item.label}
            >
              {isActive && (
                <div 
                  className={cn(
                    'absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full bg-gradient-to-r',
                    item.color
                  )} 
                />
              )}
              <div className={cn(
                'relative flex h-7 w-7 items-center justify-center rounded-lg transition-all'
              )}>
                <Icon className={cn(
                  'h-6 w-6 transition-colors',
                  isActive && 'scale-110'
                )} />
              </div>
              <span className={cn(
                'text-[10px] font-medium transition-colors'
              )}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
