'use client'

import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import {
  ComposedChart,
  Line,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Activity, Utensils, Pill, Heart } from 'lucide-react'
import type { TimelineEvent } from '@/types'
import { cn } from '@/lib/utils'

interface HealthTimelineProps {
  events: TimelineEvent[]
  className?: string
}

interface ChartDataPoint {
  timestamp: string
  date: string
  systolic?: number
  diastolic?: number
  pulse?: number
  exercise?: number
  diet?: number
  medication?: number
  eventType?: string
  eventData?: TimelineEvent
}

export function HealthTimeline({ events, className }: HealthTimelineProps) {
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(
    new Set(['bp', 'diet', 'exercise', 'medication'])
  )

  const chartData = useMemo(() => {
    if (!events || events.length === 0) return []

    // Group events by hour for better visualization
    const dataMap = new Map<string, ChartDataPoint>()

    events.forEach((event) => {
      const date = new Date(event.timestamp)
      // Round to nearest hour for grouping
      date.setMinutes(0, 0, 0)
      const key = date.toISOString()

      if (!dataMap.has(key)) {
        dataMap.set(key, {
          timestamp: key,
          date: format(date, 'MMM dd HH:mm'),
        })
      }

      const point = dataMap.get(key)!

      switch (event.type) {
        case 'bp':
          if ('systolic' in event.data) {
            point.systolic = event.data.systolic
            point.diastolic = event.data.diastolic
            point.pulse = event.data.pulse
          }
          break
        case 'exercise':
          if ('duration_minutes' in event.data) {
            point.exercise = (point.exercise || 0) + event.data.duration_minutes
          }
          break
        case 'diet':
          point.diet = (point.diet || 0) + 1
          break
        case 'medication':
          if ('was_taken' in event.data && event.data.was_taken) {
            point.medication = (point.medication || 0) + 1
          }
          break
      }
    })

    return Array.from(dataMap.values()).sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )
  }, [events])

  const toggleType = (type: string) => {
    const newSelected = new Set(selectedTypes)
    if (newSelected.has(type)) {
      newSelected.delete(type)
    } else {
      newSelected.add(type)
    }
    setSelectedTypes(newSelected)
  }

  if (!events || events.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center text-muted-foreground">
        <div className="text-center">
          <Heart className="mx-auto mb-2 h-12 w-12 opacity-50" />
          <p>No health data to display</p>
          <p className="text-sm">Start logging to see your timeline</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => toggleType('bp')}
          className={cn(
            'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all',
            selectedTypes.has('bp')
              ? 'bg-red-500/20 text-red-600 dark:text-red-400'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          )}
          aria-pressed={selectedTypes.has('bp')}
          aria-label="Toggle blood pressure data"
        >
          <Heart className="h-4 w-4" />
          Blood Pressure
        </button>

        <button
          onClick={() => toggleType('exercise')}
          className={cn(
            'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all',
            selectedTypes.has('exercise')
              ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          )}
          aria-pressed={selectedTypes.has('exercise')}
          aria-label="Toggle exercise data"
        >
          <Activity className="h-4 w-4" />
          Exercise
        </button>

        <button
          onClick={() => toggleType('diet')}
          className={cn(
            'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all',
            selectedTypes.has('diet')
              ? 'bg-green-500/20 text-green-600 dark:text-green-400'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          )}
          aria-pressed={selectedTypes.has('diet')}
          aria-label="Toggle diet data"
        >
          <Utensils className="h-4 w-4" />
          Diet
        </button>

        <button
          onClick={() => toggleType('medication')}
          className={cn(
            'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all',
            selectedTypes.has('medication')
              ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          )}
          aria-pressed={selectedTypes.has('medication')}
          aria-label="Toggle medication data"
        >
          <Pill className="h-4 w-4" />
          Medication
        </button>
      </div>

      {/* Timeline Chart */}
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="date"
            className="text-xs"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            yAxisId="left"
            className="text-xs"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            label={{
              value: 'BP / Pulse',
              angle: -90,
              position: 'insideLeft',
              style: { fill: 'hsl(var(--muted-foreground))' },
            }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            className="text-xs"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            label={{
              value: 'Activity',
              angle: 90,
              position: 'insideRight',
              style: { fill: 'hsl(var(--muted-foreground))' },
            }}
          />
          <Tooltip
            content={<CustomTooltip />}
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
          />
          <Legend />

          {/* Blood Pressure Lines */}
          {selectedTypes.has('bp') && (
            <>
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="systolic"
                stroke="hsl(0 84% 60%)"
                strokeWidth={2}
                name="Systolic"
                dot={{ fill: 'hsl(0 84% 60%)', r: 4 }}
                connectNulls
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="diastolic"
                stroke="hsl(0 72% 51%)"
                strokeWidth={2}
                name="Diastolic"
                dot={{ fill: 'hsl(0 72% 51%)', r: 4 }}
                connectNulls
              />
            </>
          )}

          {/* Exercise Scatter */}
          {selectedTypes.has('exercise') && (
            <Scatter
              yAxisId="right"
              dataKey="exercise"
              fill="hsl(217 91% 60%)"
              name="Exercise (min)"
              shape="circle"
            />
          )}

          {/* Diet Scatter */}
          {selectedTypes.has('diet') && (
            <Scatter
              yAxisId="right"
              dataKey="diet"
              fill="hsl(142 76% 36%)"
              name="Meals"
              shape="triangle"
            />
          )}

          {/* Medication Scatter */}
          {selectedTypes.has('medication') && (
            <Scatter
              yAxisId="right"
              dataKey="medication"
              fill="hsl(280 89% 60%)"
              name="Medications"
              shape="diamond"
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>

      {/* Legend Info */}
      <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground md:grid-cols-4">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-red-500" />
          <span>Blood Pressure</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-blue-500" />
          <span>Exercise Minutes</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-green-500" />
          <span>Meal Count</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-purple-500" />
          <span>Doses Taken</span>
        </div>
      </div>
    </div>
  )
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    name: string
    value: number
    dataKey: string
    color: string
  }>
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null
  }

  return (
    <div className="glass-card rounded-lg p-3 shadow-lg">
      <p className="mb-2 font-semibold">{label}</p>
      <div className="space-y-1">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-4 text-sm">
            <span className="flex items-center gap-2">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              {entry.name}:
            </span>
            <span className="font-medium">
              {entry.dataKey === 'systolic' || entry.dataKey === 'diastolic'
                ? `${entry.value} mmHg`
                : entry.dataKey === 'pulse'
                  ? `${entry.value} bpm`
                  : entry.dataKey === 'exercise'
                    ? `${entry.value} min`
                    : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

