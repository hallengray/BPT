'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Activity, Heart, LayoutDashboard, Pill, BarChart3, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard, color: 'from-blue-500 to-blue-600' },
  { href: '/log-bp', label: 'BP', icon: Heart, color: 'from-red-500 to-pink-600' },
  { href: '/log-diet-exercise', label: 'Lifestyle', icon: Activity, color: 'from-green-500 to-teal-600' },
  { href: '/medications', label: 'Meds', icon: Pill, color: 'from-purple-500 to-purple-600' },
  { href: '/analytics', label: 'Stats', icon: BarChart3, color: 'from-orange-500 to-orange-600' },
  { href: '/ai-assistant', label: 'AI', icon: Sparkles, color: 'from-pink-500 to-rose-600' },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border shadow-2xl md:hidden safe-area-bottom">
      <div className="grid h-20 grid-cols-6 gap-1 p-2 bg-gradient-to-t from-background/50 to-transparent">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center space-y-1 rounded-xl transition-all relative',
                'active:scale-95',
                isActive 
                  ? 'bg-white/20 dark:bg-white/10' 
                  : 'hover:bg-white/10 dark:hover:bg-white/5'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              {isActive && (
                <>
                  <div 
                    className={cn('absolute inset-0 rounded-xl bg-gradient-to-br opacity-10', item.color)} 
                  />
                  <div 
                    className={cn('absolute top-1 left-1/2 -translate-x-1/2 h-1 w-8 rounded-full bg-gradient-to-r', item.color)} 
                  />
                </>
              )}
              <div className={cn(
                'relative flex h-8 w-8 items-center justify-center rounded-lg transition-all',
                isActive && 'bg-gradient-to-br shadow-md',
                isActive && item.color
              )}>
                <Icon className={cn(
                  'h-5 w-5 transition-colors',
                  isActive ? 'text-white' : 'text-muted-foreground'
                )} />
              </div>
              <span className={cn(
                'text-[10px] font-medium transition-colors',
                isActive ? 'text-foreground' : 'text-muted-foreground'
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

