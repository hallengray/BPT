'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LayoutDashboard, TrendingUp, Sparkles, PenSquare, LogOut, User as UserIcon, Settings, CreditCard, ChevronDown, HeartPulse } from 'lucide-react'
import { Protest_Revolution } from 'next/font/google'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/theme-toggle'

interface DashboardNavProps {
  user: User
  signOutAction: () => Promise<void>
}

const protest = Protest_Revolution({ subsets: ['latin'], weight: '400', variable: '--font-protest-revolution' })

const navItems = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard, color: 'text-blue-600' },
  { href: '/analytics', label: 'Progress', icon: TrendingUp, color: 'text-green-600' },
  { href: '/ai-assistant', label: 'AI Assistant', icon: Sparkles, color: 'text-pink-600' },
  { href: '/quick-log', label: 'Quick Log', icon: PenSquare, color: 'text-purple-600' },
]

export function DashboardNav({ user, signOutAction }: DashboardNavProps) {
  const pathname = usePathname()
  const [logoError, setLogoError] = useState(false)

  // Get user initials for avatar
  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase()
  }

  return (
    <header className="sticky top-0 z-50 w-full hidden md:block bg-gradient-to-r from-amber-50/95 via-sky-50/95 to-amber-50/95 dark:from-amber-950/95 dark:via-sky-950/95 dark:to-amber-950/95 backdrop-blur-xl border-b border-amber-500/20 shadow-lg">
      <div className="container flex h-16 items-center gap-6 px-6">
        {/* Left: Logo + Brand */}
        <Link href="/dashboard" className="flex items-center space-x-2.5 group">
          <div className="relative h-10 w-10 rounded-lg overflow-hidden shadow-md group-hover:shadow-lg transition-all duration-200 group-hover:scale-105 flex items-center justify-center">
            {!logoError ? (
              <Image
                src="/generated-image.png"
                alt="EaseMyBP Logo"
                width={40}
                height={40}
                className="object-contain"
                priority
                onError={() => setLogoError(true)}
              />
            ) : (
              <div className="w-full h-full rounded-lg bg-gradient-to-br from-amber-400 via-amber-500 to-sky-400 p-1.5 flex items-center justify-center">
                <HeartPulse className="h-5 w-5 text-white" />
              </div>
            )}
          </div>
          <span className={cn(
            'hidden sm:inline-block font-bold text-lg bg-gradient-to-r from-amber-600 via-amber-500 to-sky-500 bg-clip-text text-transparent',
            protest.variable,
            'protest-revolution-regular'
          )}>
            EaseMyBP
          </span>
        </Link>

        {/* Center: Navigation */}
        <nav className="hidden md:flex flex-1 items-center justify-center space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/dashboard')
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all relative',
                  'hover:bg-white/10 dark:hover:bg-white/5',
                  isActive 
                    ? 'bg-white/20 dark:bg-white/10 text-foreground shadow-sm' 
                    : 'text-foreground/70 hover:text-foreground'
                )}
              >
                <Icon className={cn('h-4 w-4', isActive && item.color)} />
                <span>{item.label}</span>
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 via-sky-500 to-amber-500 rounded-full" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Right: Account */}
        <div className="ml-auto flex items-center space-x-3">
          {/* Theme Toggle */}
          <ThemeToggle />
          
          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="flex items-center gap-2 hover:bg-white/10 dark:hover:bg-white/5 transition-colors"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-sky-500 text-white text-xs font-semibold shadow-md">
                  {getInitials(user.email || 'U')}
                </div>
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-sm font-medium">{user.email?.split('@')[0]}</span>
                  <span className="text-xs text-muted-foreground">Account</span>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-background/95 backdrop-blur-xl border border-border shadow-lg">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">My Account</p>
                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="cursor-pointer">
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/profile" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Billing</span>
                <span className="ml-auto text-xs text-muted-foreground">Soon</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <form action={signOutAction} className="w-full">
                  <button type="submit" className="flex w-full items-center text-red-600 dark:text-red-400">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </form>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

