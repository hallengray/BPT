'use client'

import { formatDistanceToNow } from 'date-fns'
import { Heart, Utensils, Dumbbell, Pill, Clock } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { RecentLogs } from '@/app/actions/quick-log'
import { cn } from '@/lib/utils'

interface RecentLogsListProps {
  logs: RecentLogs
  activeTab: string
}

export function RecentLogsList({ logs, activeTab }: RecentLogsListProps) {
  const formatTimestamp = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
    } catch {
      return 'Recently'
    }
  }

  const getBPCategory = (systolic: number, diastolic: number) => {
    if (systolic >= 180 || diastolic >= 120) return { label: 'Crisis', color: 'destructive' }
    if (systolic >= 140 || diastolic >= 90) return { label: 'Stage 2', color: 'destructive' }
    if (systolic >= 130 || diastolic >= 80) return { label: 'Stage 1', color: 'warning' }
    if (systolic >= 120 && diastolic < 80) return { label: 'Elevated', color: 'warning' }
    return { label: 'Normal', color: 'success' }
  }

  // BP Logs
  if (activeTab === 'bp' && logs.bloodPressure.length > 0) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5 text-muted-foreground" />
            Recent BP Readings
          </CardTitle>
          <CardDescription>Your last {logs.bloodPressure.length} blood pressure readings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {logs.bloodPressure.map((reading) => {
              const category = getBPCategory(reading.systolic, reading.diastolic)
              return (
                <div
                  key={reading.id}
                  className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-950">
                      <Heart className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          {reading.systolic}/{reading.diastolic}
                        </span>
                        <span className="text-sm text-muted-foreground">mmHg</span>
                        <Badge
                          variant={
                            category.color === 'success'
                              ? 'default'
                              : category.color === 'warning'
                                ? 'secondary'
                                : 'destructive'
                          }
                          className={cn(
                            'text-xs',
                            category.color === 'success' &&
                              'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200'
                          )}
                        >
                          {category.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Pulse: {reading.pulse} bpm
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {formatTimestamp(reading.measured_at)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Diet Logs
  if (activeTab === 'diet' && logs.diet.length > 0) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5 text-muted-foreground" />
            Recent Meals
          </CardTitle>
          <CardDescription>Your last {logs.diet.length} diet logs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {logs.diet.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
                    <Utensils className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">
                        {log.meal_type}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm">
                      {log.description.length > 50
                        ? `${log.description.slice(0, 50)}...`
                        : log.description}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">
                    {formatTimestamp(log.logged_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Exercise Logs
  if (activeTab === 'exercise' && logs.exercise.length > 0) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5 text-muted-foreground" />
            Recent Workouts
          </CardTitle>
          <CardDescription>Your last {logs.exercise.length} exercise logs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {logs.exercise.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-950">
                    <Dumbbell className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="font-medium">{log.activity_type}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{log.duration_minutes} min</span>
                      {log.intensity && (
                        <>
                          <span>•</span>
                          <Badge
                            variant="outline"
                            className={cn(
                              'capitalize',
                              log.intensity === 'high' && 'border-orange-500 text-orange-700',
                              log.intensity === 'moderate' && 'border-yellow-500 text-yellow-700',
                              log.intensity === 'low' && 'border-blue-500 text-blue-700'
                            )}
                          >
                            {log.intensity}
                          </Badge>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">
                    {formatTimestamp(log.logged_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Medication Logs
  if (activeTab === 'medication' && logs.medications.length > 0) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5 text-muted-foreground" />
            Active Medications
          </CardTitle>
          <CardDescription>Your current {logs.medications.length} active medications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {logs.medications.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950">
                    <Pill className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium">{log.medication_name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{log.dosage}</span>
                      <span>•</span>
                      <Badge variant="outline" className="capitalize">
                        {log.frequency.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">
                    Added {formatTimestamp(log.created_at || log.start_date)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Empty state
  return (
    <Card className="mt-6">
      <CardContent className="flex flex-col items-center justify-center py-8 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          {activeTab === 'bp' && <Heart className="h-8 w-8 text-muted-foreground" />}
          {activeTab === 'diet' && <Utensils className="h-8 w-8 text-muted-foreground" />}
          {activeTab === 'exercise' && <Dumbbell className="h-8 w-8 text-muted-foreground" />}
          {activeTab === 'medication' && <Pill className="h-8 w-8 text-muted-foreground" />}
        </div>
        <p className="text-sm text-muted-foreground">
          No recent logs yet. Start logging to see your history here!
        </p>
      </CardContent>
    </Card>
  )
}


