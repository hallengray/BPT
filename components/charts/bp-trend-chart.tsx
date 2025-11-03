'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'
import type { BloodPressureReading } from '@/types'

interface BPTrendChartProps {
  data: BloodPressureReading[]
}

export function BPTrendChart({ data }: BPTrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center text-muted-foreground">
        No data to display
      </div>
    )
  }

  const chartData = data.map((reading) => ({
    date: format(new Date(reading.measured_at), 'MMM dd'),
    systolic: reading.systolic,
    diastolic: reading.diastolic,
    pulse: reading.pulse,
  }))

  return (
    <div className="w-full" style={{ minHeight: '400px' }}>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="date"
          className="text-xs"
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
        />
        <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="systolic"
          stroke="hsl(var(--chart-1))"
          strokeWidth={2}
          name="Systolic"
          dot={{ fill: 'hsl(var(--chart-1))' }}
        />
        <Line
          type="monotone"
          dataKey="diastolic"
          stroke="hsl(var(--chart-2))"
          strokeWidth={2}
          name="Diastolic"
          dot={{ fill: 'hsl(var(--chart-2))' }}
        />
        <Line
          type="monotone"
          dataKey="pulse"
          stroke="hsl(var(--chart-3))"
          strokeWidth={2}
          name="Pulse"
          dot={{ fill: 'hsl(var(--chart-3))' }}
        />
      </LineChart>
    </ResponsiveContainer>
    </div>
  )
}



