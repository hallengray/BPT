'use client'

import { useState, useMemo, useCallback } from 'react'
import { format, subDays, subMonths, subYears, startOfDay, endOfDay, startOfMonth, startOfYear, isAfter, isBefore, differenceInDays } from 'date-fns'
import { Calendar as CalendarIcon, ChevronDown, Clock, TrendingUp } from 'lucide-react'
import type { DateRange } from 'react-day-picker'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

/**
 * Preset date range definitions
 * Each preset provides a label, date range generator, and statistical context
 */
export interface DateRangePreset {
  /** Unique identifier for the preset */
  id: string
  /** Display label */
  label: string
  /** Short label for compact display */
  shortLabel: string
  /** Function to generate the date range */
  getRange: () => DateRange
  /** Description of statistical significance */
  description: string
  /** Minimum recommended data points for meaningful analysis */
  minDataPoints: number
  /** Icon color class */
  colorClass: string
}

/**
 * Standard date range presets with statistical context
 * Designed by statisticians for meaningful health data analysis
 */
export const DATE_RANGE_PRESETS: DateRangePreset[] = [
  {
    id: 'last7',
    label: 'Last 7 Days',
    shortLabel: '7D',
    getRange: () => ({
      from: startOfDay(subDays(new Date(), 6)),
      to: endOfDay(new Date()),
    }),
    description: 'Short-term trends, daily patterns',
    minDataPoints: 5,
    colorClass: 'text-blue-500',
  },
  {
    id: 'last14',
    label: 'Last 14 Days',
    shortLabel: '14D',
    getRange: () => ({
      from: startOfDay(subDays(new Date(), 13)),
      to: endOfDay(new Date()),
    }),
    description: 'Two-week trends, weekly patterns',
    minDataPoints: 10,
    colorClass: 'text-cyan-500',
  },
  {
    id: 'last30',
    label: 'Last 30 Days',
    shortLabel: '30D',
    getRange: () => ({
      from: startOfDay(subDays(new Date(), 29)),
      to: endOfDay(new Date()),
    }),
    description: 'Monthly trends, recommended for analysis',
    minDataPoints: 20,
    colorClass: 'text-teal-500',
  },
  {
    id: 'last60',
    label: 'Last 60 Days',
    shortLabel: '60D',
    getRange: () => ({
      from: startOfDay(subDays(new Date(), 59)),
      to: endOfDay(new Date()),
    }),
    description: 'Bi-monthly trends, lifestyle impact',
    minDataPoints: 40,
    colorClass: 'text-green-500',
  },
  {
    id: 'last90',
    label: 'Last 90 Days',
    shortLabel: '90D',
    getRange: () => ({
      from: startOfDay(subDays(new Date(), 89)),
      to: endOfDay(new Date()),
    }),
    description: 'Quarterly trends, treatment effectiveness',
    minDataPoints: 60,
    colorClass: 'text-emerald-500',
  },
  {
    id: 'last180',
    label: 'Last 6 Months',
    shortLabel: '6M',
    getRange: () => ({
      from: startOfDay(subMonths(new Date(), 6)),
      to: endOfDay(new Date()),
    }),
    description: 'Semi-annual trends, seasonal patterns',
    minDataPoints: 100,
    colorClass: 'text-orange-500',
  },
  {
    id: 'last365',
    label: 'Last Year',
    shortLabel: '1Y',
    getRange: () => ({
      from: startOfDay(subYears(new Date(), 1)),
      to: endOfDay(new Date()),
    }),
    description: 'Annual trends, long-term health trajectory',
    minDataPoints: 200,
    colorClass: 'text-purple-500',
  },
  {
    id: 'thisMonth',
    label: 'This Month',
    shortLabel: 'MTD',
    getRange: () => ({
      from: startOfMonth(new Date()),
      to: endOfDay(new Date()),
    }),
    description: 'Month to date progress',
    minDataPoints: 10,
    colorClass: 'text-pink-500',
  },
  {
    id: 'thisYear',
    label: 'This Year',
    shortLabel: 'YTD',
    getRange: () => ({
      from: startOfYear(new Date()),
      to: endOfDay(new Date()),
    }),
    description: 'Year to date comprehensive view',
    minDataPoints: 50,
    colorClass: 'text-rose-500',
  },
  {
    id: 'allTime',
    label: 'All Time',
    shortLabel: 'All',
    getRange: () => ({
      from: startOfDay(subYears(new Date(), 10)), // Effectively all time
      to: endOfDay(new Date()),
    }),
    description: 'Complete health history',
    minDataPoints: 0,
    colorClass: 'text-indigo-500',
  },
]

export interface DateRangeSelectorProps {
  /** Currently selected date range */
  value: DateRange | undefined
  /** Callback when date range changes */
  onChange: (range: DateRange | undefined) => void
  /** Currently selected preset ID */
  selectedPreset?: string
  /** Callback when preset changes */
  onPresetChange?: (presetId: string | undefined) => void
  /** Additional CSS classes */
  className?: string
  /** Whether to show the comparison toggle */
  showComparisonToggle?: boolean
  /** Whether comparison mode is enabled */
  comparisonEnabled?: boolean
  /** Callback when comparison mode changes */
  onComparisonToggle?: (enabled: boolean) => void
  /** Comparison date range */
  comparisonRange?: DateRange | undefined
  /** Callback when comparison range changes */
  onComparisonRangeChange?: (range: DateRange | undefined) => void
  /** Disabled state */
  disabled?: boolean
  /** Minimum selectable date */
  minDate?: Date
  /** Maximum selectable date */
  maxDate?: Date
}

export function DateRangeSelector({
  value,
  onChange,
  selectedPreset,
  onPresetChange,
  className,
  showComparisonToggle = false,
  comparisonEnabled = false,
  onComparisonToggle,
  comparisonRange,
  onComparisonRangeChange,
  disabled = false,
  minDate,
  maxDate = new Date(),
}: DateRangeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isCustomMode, setIsCustomMode] = useState(false)

  // Calculate the number of days in the selected range
  const dayCount = useMemo(() => {
    if (!value?.from || !value?.to) return 0
    return differenceInDays(value.to, value.from) + 1
  }, [value])

  // Get the active preset based on current selection
  const activePreset = useMemo(() => {
    if (selectedPreset) {
      return DATE_RANGE_PRESETS.find(p => p.id === selectedPreset)
    }
    return undefined
  }, [selectedPreset])

  // Handle preset selection
  const handlePresetSelect = useCallback((preset: DateRangePreset) => {
    const range = preset.getRange()
    onChange(range)
    onPresetChange?.(preset.id)
    setIsCustomMode(false)
    setIsOpen(false)
  }, [onChange, onPresetChange])

  // Handle custom date selection
  const handleCustomSelect = useCallback((range: DateRange | undefined) => {
    onChange(range)
    onPresetChange?.(undefined)
    setIsCustomMode(true)
  }, [onChange, onPresetChange])

  // Format the display text
  const displayText = useMemo(() => {
    if (!value?.from) return 'Select date range'
    
    if (activePreset && !isCustomMode) {
      return activePreset.label
    }
    
    if (value.to) {
      return `${format(value.from, 'MMM d, yyyy')} - ${format(value.to, 'MMM d, yyyy')}`
    }
    
    return format(value.from, 'MMM d, yyyy')
  }, [value, activePreset, isCustomMode])

  // Generate comparison range based on primary range
  const suggestedComparisonRange = useMemo((): DateRange | undefined => {
    if (!value?.from || !value?.to) return undefined
    
    const days = differenceInDays(value.to, value.from)
    const comparisonEnd = subDays(value.from, 1)
    const comparisonStart = subDays(comparisonEnd, days)
    
    return {
      from: startOfDay(comparisonStart),
      to: endOfDay(comparisonEnd),
    }
  }, [value])

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {/* Main Date Range Selector */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className={cn(
              'w-full justify-between text-left font-normal',
              !value && 'text-muted-foreground'
            )}
          >
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <span>{displayText}</span>
              {dayCount > 0 && (
                <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  {dayCount} days
                </span>
              )}
            </div>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex">
            {/* Preset Panel */}
            <div className="border-r p-3">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Quick Select</span>
              </div>
              <div className="flex flex-col gap-1">
                {DATE_RANGE_PRESETS.slice(0, 7).map((preset) => (
                  <Button
                    key={preset.id}
                    variant={selectedPreset === preset.id && !isCustomMode ? 'secondary' : 'ghost'}
                    size="sm"
                    className={cn(
                      'justify-start text-left',
                      selectedPreset === preset.id && !isCustomMode && 'bg-accent'
                    )}
                    onClick={() => handlePresetSelect(preset)}
                  >
                    <span className={cn('mr-2 h-2 w-2 rounded-full', preset.colorClass.replace('text-', 'bg-'))} />
                    {preset.label}
                  </Button>
                ))}
              </div>
              <div className="mt-3 border-t pt-3">
                <div className="flex flex-col gap-1">
                  {DATE_RANGE_PRESETS.slice(7).map((preset) => (
                    <Button
                      key={preset.id}
                      variant={selectedPreset === preset.id && !isCustomMode ? 'secondary' : 'ghost'}
                      size="sm"
                      className={cn(
                        'justify-start text-left',
                        selectedPreset === preset.id && !isCustomMode && 'bg-accent'
                      )}
                      onClick={() => handlePresetSelect(preset)}
                    >
                      <span className={cn('mr-2 h-2 w-2 rounded-full', preset.colorClass.replace('text-', 'bg-'))} />
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Calendar Panel */}
            <div className="p-3">
              <div className="mb-2 text-sm font-medium text-muted-foreground">
                Custom Range
              </div>
              <Calendar
                mode="range"
                selected={value}
                onSelect={handleCustomSelect}
                numberOfMonths={2}
                disabled={(date) => {
                  if (minDate && isBefore(date, minDate)) return true
                  if (maxDate && isAfter(date, maxDate)) return true
                  return false
                }}
                defaultMonth={value?.from}
              />
              {activePreset && !isCustomMode && (
                <div className="mt-3 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    <span className="font-medium">{activePreset.description}</span>
                  </div>
                  <p className="mt-1">
                    Recommended: {activePreset.minDataPoints}+ data points for meaningful analysis
                  </p>
                </div>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Comparison Toggle */}
      {showComparisonToggle && value?.from && value?.to && (
        <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={comparisonEnabled}
              onChange={(e) => {
                onComparisonToggle?.(e.target.checked)
                if (e.target.checked && !comparisonRange && suggestedComparisonRange) {
                  onComparisonRangeChange?.(suggestedComparisonRange)
                }
              }}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-sm font-medium">Compare with previous period</span>
          </label>
          
          {comparisonEnabled && comparisonRange?.from && comparisonRange?.to && (
            <span className="ml-auto text-xs text-muted-foreground">
              vs {format(comparisonRange.from, 'MMM d')} - {format(comparisonRange.to, 'MMM d, yyyy')}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Compact date range selector for inline use
 */
export function CompactDateRangeSelector({
  onChange,
  selectedPreset,
  onPresetChange,
  className,
}: Pick<DateRangeSelectorProps, 'value' | 'onChange' | 'selectedPreset' | 'onPresetChange' | 'className'>) {
  const handlePresetSelect = useCallback((preset: DateRangePreset) => {
    const range = preset.getRange()
    onChange(range)
    onPresetChange?.(preset.id)
  }, [onChange, onPresetChange])

  return (
    <div className={cn('flex flex-wrap gap-1', className)}>
      {DATE_RANGE_PRESETS.slice(0, 5).map((preset) => (
        <Button
          key={preset.id}
          variant={selectedPreset === preset.id ? 'default' : 'outline'}
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={() => handlePresetSelect(preset)}
        >
          {preset.shortLabel}
        </Button>
      ))}
    </div>
  )
}

