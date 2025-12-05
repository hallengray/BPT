'use client'

/**
 * Enhanced Stat Card
 * 
 * Modern, futuristic stat card with:
 * - Glassmorphism design
 * - Gradient accents
 * - Animated hover effects
 * - Trend indicators
 * - Micro-interactions
 */

import { memo } from 'react'
import { TrendingDown, TrendingUp, Minus, Heart, Activity, TrendingUp as TrendingUpIcon, Target, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

type IconName = 'heart' | 'activity' | 'trending-up' | 'target' | 'zap'

interface EnhancedStatCardProps {
  title: string
  value: string
  subtitle?: string
  iconName: IconName
  trend?: 'up' | 'down' | 'stable'
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  className?: string
}

export const EnhancedStatCard = memo(function EnhancedStatCard({
  title,
  value,
  subtitle,
  iconName,
  trend,
  variant = 'default',
  className,
}: EnhancedStatCardProps) {
  // Map icon name to component
  const iconMap = {
    heart: Heart,
    activity: Activity,
    'trending-up': TrendingUpIcon,
    target: Target,
    zap: Zap,
  }
  
  const Icon = iconMap[iconName]
  // Variant-based styling
  const variantStyles = {
    default: {
      gradient: 'from-indigo-500/10 to-purple-500/10',
      iconBg: 'bg-gradient-to-br from-indigo-500 to-purple-600',
      glow: 'group-hover:shadow-indigo-500/20',
      border: 'border-indigo-200/50 dark:border-indigo-800/50',
    },
    success: {
      gradient: 'from-green-500/10 to-emerald-500/10',
      iconBg: 'bg-gradient-to-br from-green-500 to-emerald-600',
      glow: 'group-hover:shadow-green-500/20',
      border: 'border-green-200/50 dark:border-green-800/50',
    },
    warning: {
      gradient: 'from-amber-500/10 to-orange-500/10',
      iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600',
      glow: 'group-hover:shadow-amber-500/20',
      border: 'border-amber-200/50 dark:border-amber-800/50',
    },
    danger: {
      gradient: 'from-red-500/10 to-pink-500/10',
      iconBg: 'bg-gradient-to-br from-red-500 to-pink-600',
      glow: 'group-hover:shadow-red-500/20',
      border: 'border-red-200/50 dark:border-red-800/50',
    },
    info: {
      gradient: 'from-blue-500/10 to-cyan-500/10',
      iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-600',
      glow: 'group-hover:shadow-blue-500/20',
      border: 'border-blue-200/50 dark:border-blue-800/50',
    },
  }

  const styles = variantStyles[variant]

  // Trend styling
  const getTrendIcon = () => {
    if (!trend || trend === 'stable') {
      return <Minus className="h-3 w-3 text-muted-foreground" />
    }
    if (trend === 'up') {
      return <TrendingUp className="h-3 w-3 text-red-500" />
    }
    return <TrendingDown className="h-3 w-3 text-green-500" />
  }

  const getTrendLabel = () => {
    if (!trend || trend === 'stable') return 'Stable'
    if (trend === 'up') return 'Increasing'
    return 'Decreasing'
  }

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border backdrop-blur-xl transition-all duration-300',
        'bg-white/50 dark:bg-gray-900/50',
        styles.border,
        'hover:scale-[1.02] hover:shadow-xl',
        styles.glow,
        className
      )}
    >
      {/* Gradient Background */}
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-br opacity-50 transition-opacity group-hover:opacity-70',
          styles.gradient
        )}
      />

      {/* Shimmer Effect on Hover */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Content */}
      <div className="relative z-10 p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          <div
            className={cn(
              'rounded-xl p-2.5 shadow-lg transition-transform group-hover:scale-110',
              styles.iconBg
            )}
          >
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>

        {/* Value */}
        <div className="space-y-1">
          <div className="text-3xl font-bold tracking-tight">{value}</div>
          {subtitle && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              {trend && (
                <span className="flex items-center gap-1" title={getTrendLabel()}>
                  {getTrendIcon()}
                </span>
              )}
              <span>{subtitle}</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Accent Line */}
      <div
        className={cn(
          'absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity',
          styles.iconBg
        )}
      />
    </div>
  )
})

