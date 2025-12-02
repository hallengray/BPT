'use client'

import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import {
  GlassCard,
  GlassCardContent,
  GlassCardHeader,
  GlassCardTitle,
  GlassCardDescription,
} from '@/components/ui/glass-card'
import { format, subDays, eachDayOfInterval, startOfDay } from 'date-fns'
import { CheckCircle, XCircle, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Database } from '@/types/database.types'

type MedicationDose = Database['public']['Tables']['medication_doses']['Row']

interface AdherenceChartProps {
  doses: MedicationDose[]
  days?: number
  medicationName?: string
}

interface DayData {
  date: string
  taken: number
  missed: number
  total: number
  rate: number
}

export function AdherenceChart({ doses, days = 30, medicationName }: AdherenceChartProps) {
  const chartData = useMemo(() => {
    const endDate = new Date()
    const startDate = subDays(endDate, days - 1)
    const dateRange = eachDayOfInterval({ start: startDate, end: endDate })

    const data: DayData[] = dateRange.map((date) => {
      const dayStart = startOfDay(date)
      const dayEnd = new Date(dayStart)
      dayEnd.setHours(23, 59, 59, 999)

      const dayDoses = doses.filter((dose) => {
        const doseDate = new Date(dose.scheduled_time)
        return doseDate >= dayStart && doseDate <= dayEnd
      })

      const taken = dayDoses.filter((d) => d.was_taken).length
      const total = dayDoses.length
      const missed = total - taken
      const rate = total > 0 ? Math.round((taken / total) * 100) : 0

      return {
        date: format(date, 'MMM d'),
        taken,
        missed,
        total,
        rate,
      }
    })

    return data
  }, [doses, days])

  const stats = useMemo(() => {
    const totalDoses = doses.length
    const takenDoses = doses.filter((d) => d.was_taken).length
    const missedDoses = totalDoses - takenDoses
    const adherenceRate = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 0

    return {
      totalDoses,
      takenDoses,
      missedDoses,
      adherenceRate,
    }
  }, [doses])

  const getAdherenceColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600 dark:text-green-400'
    if (rate >= 60) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getBarColor = (rate: number) => {
    if (rate >= 80) return '#10b981' // green
    if (rate >= 60) return '#f59e0b' // yellow
    return '#ef4444' // red
  }

  return (
    <GlassCard>
      <GlassCardHeader>
        <GlassCardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          Adherence Statistics
        </GlassCardTitle>
        {medicationName && (
          <GlassCardDescription>{medicationName} - Last {days} days</GlassCardDescription>
        )}
      </GlassCardHeader>

      <GlassCardContent className="space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border bg-card p-4 text-center">
            <div className={cn('text-3xl font-bold', getAdherenceColor(stats.adherenceRate))}>
              {stats.adherenceRate}%
            </div>
            <p className="mt-1 text-sm text-muted-foreground">Adherence Rate</p>
          </div>

          <div className="rounded-lg border bg-card p-4 text-center">
            <div className="text-3xl font-bold text-foreground">{stats.totalDoses}</div>
            <p className="mt-1 text-sm text-muted-foreground">Total Doses</p>
          </div>

          <div className="rounded-lg border bg-green-50 p-4 text-center dark:bg-green-950">
            <div className="flex items-center justify-center gap-1 text-3xl font-bold text-green-600 dark:text-green-400">
              <CheckCircle className="h-6 w-6" />
              {stats.takenDoses}
            </div>
            <p className="mt-1 text-sm text-green-700 dark:text-green-300">Taken</p>
          </div>

          <div className="rounded-lg border bg-red-50 p-4 text-center dark:bg-red-950">
            <div className="flex items-center justify-center gap-1 text-3xl font-bold text-red-600 dark:text-red-400">
              <XCircle className="h-6 w-6" />
              {stats.missedDoses}
            </div>
            <p className="mt-1 text-sm text-red-700 dark:text-red-300">Missed</p>
          </div>
        </div>

        {/* Bar Chart */}
        {chartData.length > 0 && (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  className="text-xs"
                  tick={{ fill: 'currentColor' }}
                  tickLine={{ stroke: 'currentColor' }}
                />
                <YAxis
                  className="text-xs"
                  tick={{ fill: 'currentColor' }}
                  tickLine={{ stroke: 'currentColor' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Legend />
                <Bar
                  dataKey="taken"
                  name="Taken"
                  stackId="a"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="missed"
                  name="Missed"
                  stackId="a"
                  fill="#ef4444"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Adherence Rate Line */}
        {chartData.length > 0 && (
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  className="text-xs"
                  tick={{ fill: 'currentColor' }}
                  tickLine={{ stroke: 'currentColor' }}
                />
                <YAxis
                  domain={[0, 100]}
                  className="text-xs"
                  tick={{ fill: 'currentColor' }}
                  tickLine={{ stroke: 'currentColor' }}
                  label={{ value: 'Rate (%)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  formatter={(value: number) => [`${value}%`, 'Adherence Rate']}
                />
                <Bar dataKey="rate" name="Daily Adherence Rate" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.rate)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Empty State */}
        {chartData.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <TrendingUp className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">No Data Yet</h3>
            <p className="text-sm text-muted-foreground">
              Start tracking your medication doses to see adherence statistics
            </p>
          </div>
        )}

        {/* Guidelines */}
        <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-950">
          <h4 className="mb-2 font-semibold text-purple-900 dark:text-purple-100">
            Adherence Guidelines
          </h4>
          <ul className="space-y-1 text-sm text-purple-800 dark:text-purple-200">
            <li>• <span className="font-medium text-green-600 dark:text-green-400">Excellent (≥80%):</span> Keep up the great work!</li>
            <li>• <span className="font-medium text-yellow-600 dark:text-yellow-400">Good (60-79%):</span> Room for improvement</li>
            <li>• <span className="font-medium text-red-600 dark:text-red-400">Needs Attention (&lt;60%):</span> Consult your healthcare provider</li>
          </ul>
        </div>
      </GlassCardContent>
    </GlassCard>
  )
}







