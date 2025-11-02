'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
import { Activity, Heart, LayoutDashboard, LogOut, Pill, BarChart3, Sparkles, User as UserIcon, Settings, CreditCard, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DashboardNavProps {
  user: User
  signOutAction: () => Promise<void>
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'text-blue-600' },
  { href: '/log-bp', label: 'Log BP', icon: Heart, color: 'text-red-600' },
  { href: '/log-diet-exercise', label: 'Lifestyle', icon: Activity, color: 'text-green-600' },
  { href: '/medications', label: 'Medications', icon: Pill, color: 'text-purple-600' },
  { href: '/analytics', label: 'Analytics', icon: BarChart3, color: 'text-orange-600' },
  { href: '/ai-assistant', label: 'AI Assistant', icon: Sparkles, color: 'text-pink-600' },
]

export function DashboardNav({ user, signOutAction }: DashboardNavProps) {
  const pathname = usePathname()

  // Get user initials for avatar
  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase()
  }

  return (
    <header className="sticky top-0 z-50 w-full glass border-b border-white/20 shadow-lg">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex items-center">
          <Link href="/dashboard" className="mr-8 flex items-center space-x-2 group">
            <div className="rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 p-1.5 shadow-md group-hover:shadow-lg transition-shadow">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <span className="hidden font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent sm:inline-block">
              BP Tracker
            </span>
          </Link>
          <nav className="hidden items-center space-x-1 md:flex">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
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
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full" />
                  )}
                </Link>
              )
            })}
          </nav>
        </div>
        
        <div className="ml-auto flex items-center space-x-3">
          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="flex items-center gap-2 hover:bg-white/10 dark:hover:bg-white/5 transition-colors"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-semibold shadow-md">
                  {getInitials(user.email || 'U')}
                </div>
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-sm font-medium">{user.email?.split('@')[0]}</span>
                  <span className="text-xs text-muted-foreground">Account</span>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 glass-card">
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

