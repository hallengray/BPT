'use client'

/**
 * Health Hero Section
 * 
 * Personalized, emotionally engaging hero section with:
 * - Time-based greetings
 * - Health score visualization
 * - Motivational messaging
 * - Quick action buttons
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Heart, Sparkles, TrendingUp, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GradientButton } from '@/components/ui/gradient-button'
import { cn } from '@/lib/utils'

interface HealthHeroSectionProps {
  userName?: string
  healthScore?: number // 0-100
  streak?: number
  lastReading?: {
    systolic: number
    diastolic: number
    classification: string
  }
}

export function HealthHeroSection({
  userName,
  healthScore = 75,
  streak = 0,
  lastReading,
}: HealthHeroSectionProps) {
  const [mounted, setMounted] = useState(false)
  const [greeting, setGreeting] = useState('Hello')

  useEffect(() => {
    setMounted(true)
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good Morning')
    else if (hour < 17) setGreeting('Good Afternoon')
    else setGreeting('Good Evening')
  }, [])

  // Health score color and message
  const getHealthScoreData = (score: number) => {
    if (score >= 85) {
      return {
        color: 'from-green-500 to-emerald-600',
        ringColor: 'stroke-green-500',
        bgGlow: 'bg-green-500/20',
        message: 'Excellent! Keep up the amazing work!',
        emoji: '🌟',
      }
    } else if (score >= 70) {
      return {
        color: 'from-blue-500 to-cyan-600',
        ringColor: 'stroke-blue-500',
        bgGlow: 'bg-blue-500/20',
        message: "You're doing great! Stay consistent!",
        emoji: '💪',
      }
    } else if (score >= 50) {
      return {
        color: 'from-amber-500 to-orange-600',
        ringColor: 'stroke-amber-500',
        bgGlow: 'bg-amber-500/20',
        message: "You're making progress! Keep going!",
        emoji: '🎯',
      }
    } else {
      return {
        color: 'from-red-500 to-pink-600',
        ringColor: 'stroke-red-500',
        bgGlow: 'bg-red-500/20',
        message: "Let's get back on track together!",
        emoji: '💙',
      }
    }
  }

  const scoreData = getHealthScoreData(healthScore)
  const circumference = 2 * Math.PI * 54 // radius = 54
  const strokeDashoffset = circumference - (healthScore / 100) * circumference

  if (!mounted) {
    return (
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 shadow-2xl">
        <div className="h-48" />
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 shadow-2xl">
      {/* Background Images with Overlay */}
      {/* Light Mode: Calming healthcare image */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20 dark:opacity-0 transition-opacity duration-500"
        style={{ 
          backgroundImage: 'url(/pexels-karola-g-4386466.jpg)',
          backgroundBlendMode: 'overlay'
        }}
      />
      {/* Dark Mode: Medical monitor image */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-0 dark:opacity-30 transition-opacity duration-500"
        style={{ 
          backgroundImage: 'url(/pexels-carloscruz-artegrafia-172084181-11198232.jpg)',
          backgroundBlendMode: 'overlay'
        }}
      />
      
      {/* Gradient Overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/80 via-purple-600/80 to-pink-600/80 dark:from-indigo-900/85 dark:via-purple-900/85 dark:to-pink-900/85" />
      
      {/* Animated Pattern Overlay */}
      <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      
      {/* Floating Orbs for depth */}
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />

      {/* Content */}
      <div className="relative z-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          {/* Left: Greeting & Message */}
          <div className="flex-1 space-y-4">
            {/* Greeting */}
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-yellow-300 animate-pulse" />
              <h1 className="text-3xl font-bold text-white md:text-4xl drop-shadow-lg">
                {greeting}
                {userName && `, ${userName}`}!
              </h1>
            </div>

            {/* Motivational Message */}
            <p className="text-lg text-white/95 max-w-2xl drop-shadow-md">
              {scoreData.emoji} {scoreData.message}
            </p>

            {/* Stats Row */}
            <div className="flex flex-wrap gap-4 pt-2">
              {streak > 0 && (
                <div className="flex items-center gap-2 rounded-full bg-white/25 backdrop-blur-md px-4 py-2 border border-white/30 shadow-lg hover:bg-white/30 transition-all">
                  <Activity className="h-4 w-4 text-white" />
                  <span className="text-sm font-semibold text-white drop-shadow">
                    {streak} Day Streak 🔥
                  </span>
                </div>
              )}
              {lastReading && (
                <div className="flex items-center gap-2 rounded-full bg-white/25 backdrop-blur-md px-4 py-2 border border-white/30 shadow-lg hover:bg-white/30 transition-all">
                  <Heart className="h-4 w-4 text-white" />
                  <span className="text-sm font-semibold text-white drop-shadow">
                    Latest: {lastReading.systolic}/{lastReading.diastolic} mmHg
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-4">
              <GradientButton
                asChild
                size="lg"
                className="bg-white hover:bg-white/90 text-purple-700 shadow-2xl hover:shadow-white/20 hover:scale-105 transition-all"
              >
                <Link href="/quick-log">
                  <Heart className="mr-2 h-5 w-5" />
                  Log Health Data
                </Link>
              </GradientButton>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white/40 bg-white/15 hover:bg-white/25 text-white backdrop-blur-md shadow-lg hover:scale-105 transition-all"
              >
                <Link href="/analytics">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  View Analytics
                </Link>
              </Button>
            </div>
          </div>

          {/* Right: Health Score Circle */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              {/* Glow Effect */}
              <div className={cn('absolute inset-0 rounded-full blur-3xl animate-pulse', scoreData.bgGlow)} style={{ animationDuration: '3s' }} />

              {/* Glass Circle Background */}
              <div className="absolute inset-0 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 shadow-2xl" />

              {/* Score Circle */}
              <div className="relative flex h-48 w-48 items-center justify-center">
                {/* Background Circle */}
                <svg className="absolute h-full w-full -rotate-90 transform">
                  <circle
                    cx="96"
                    cy="96"
                    r="54"
                    stroke="white"
                    strokeOpacity="0.25"
                    strokeWidth="14"
                    fill="none"
                  />
                  {/* Progress Circle */}
                  <circle
                    cx="96"
                    cy="96"
                    r="54"
                    className={scoreData.ringColor}
                    strokeWidth="14"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    style={{
                      transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
                      filter: 'drop-shadow(0 0 8px currentColor)',
                    }}
                  />
                </svg>

                {/* Score Text */}
                <div className="text-center">
                  <div className="text-5xl font-bold text-white drop-shadow-lg">{healthScore}</div>
                  <div className="text-sm font-medium text-white/90 drop-shadow">Health Score</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

