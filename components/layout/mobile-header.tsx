'use client'

import Link from 'next/link'
import Image from 'next/image'
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
import { LogOut, User as UserIcon, Settings, CreditCard, HeartPulse } from 'lucide-react'
import { Protest_Revolution } from 'next/font/google'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/theme-toggle'

const protest = Protest_Revolution({ subsets: ['latin'], weight: '400', variable: '--font-protest-revolution' })

interface MobileHeaderProps {
  user: User
  signOutAction: () => Promise<void>
}

export function MobileHeader({ user, signOutAction }: MobileHeaderProps) {
  const [logoError, setLogoError] = useState(false)

  // Get user initials for avatar
  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase()
  }

  return (
    <header className="sticky top-0 z-50 w-full md:hidden bg-gradient-to-r from-amber-50/95 via-sky-50/95 to-amber-50/95 dark:from-amber-950/95 dark:via-sky-950/95 dark:to-amber-950/95 backdrop-blur-xl border-b border-amber-500/20 shadow-lg">
      <div className="flex h-16 items-center justify-between px-4">
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
            'font-bold text-lg bg-gradient-to-r from-amber-600 via-amber-500 to-sky-500 bg-clip-text text-transparent',
            protest.variable,
            'protest-revolution-regular'
          )}>
            EaseMyBP
          </span>
        </Link>

        {/* Right: Theme Toggle & Account */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          
          <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-10 w-10 rounded-full hover:bg-white/10 dark:hover:bg-white/5 transition-colors"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-sky-500 text-white text-xs font-semibold shadow-md">
                {getInitials(user.email || 'U')}
              </div>
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

