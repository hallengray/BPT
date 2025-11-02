import { Suspense } from 'react'
import { Metadata } from 'next'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { DietLogForm } from '@/components/forms/diet-log-form'
import { ExerciseLogForm } from '@/components/forms/exercise-log-form'
import { Skeleton } from '@/components/ui/skeleton'
import { getDietLogs } from '@/app/actions/diet-logs'
import { getExerciseLogs } from '@/app/actions/exercise-logs'
import { formatDateTime } from '@/lib/utils'
import { Utensils, Dumbbell } from 'lucide-react'
import type { DietLog, ExerciseLog } from '@/types'

export const metadata: Metadata = {
  title: 'Log Diet & Exercise | Blood Pressure Tracker',
  description: 'Track your meals and physical activities',
}

async function RecentDietLogs() {
  const { data: logs } = await getDietLogs(5)

  if (!logs || logs.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground">
        No diet logs yet. Start by logging your first meal!
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {(logs as DietLog[]).map((log) => (
        <div key={log.id} className="rounded-lg border p-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="font-medium capitalize">{log.meal_type}</p>
              <p className="text-sm text-muted-foreground">{log.description}</p>
              {log.notes && (
                <p className="mt-1 text-xs text-muted-foreground italic">
                  {log.notes}
                </p>
              )}
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
              {formatDateTime(log.logged_at)}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

async function RecentExerciseLogs() {
  const { data: logs } = await getExerciseLogs(5)

  if (!logs || logs.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground">
        No exercise logs yet. Start by logging your first activity!
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {(logs as ExerciseLog[]).map((log) => (
        <div key={log.id} className="rounded-lg border p-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="font-medium">{log.activity_type}</p>
              <p className="text-sm text-muted-foreground">
                {log.duration_minutes} minutes
                {log.intensity && ` • ${log.intensity} intensity`}
              </p>
              {log.notes && (
                <p className="mt-1 text-xs text-muted-foreground italic">
                  {log.notes}
                </p>
              )}
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
              {formatDateTime(log.logged_at)}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function LogDietExercisePage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Log Diet & Exercise</h1>
        <p className="text-muted-foreground">
          Track your meals and physical activities
        </p>
      </div>

      <Tabs defaultValue="diet" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="diet" className="flex items-center gap-2">
            <Utensils className="h-4 w-4" />
            Diet
          </TabsTrigger>
          <TabsTrigger value="exercise" className="flex items-center gap-2">
            <Dumbbell className="h-4 w-4" />
            Exercise
          </TabsTrigger>
        </TabsList>

        <TabsContent value="diet" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Log a Meal</CardTitle>
                <CardDescription>Record what you ate and when</CardDescription>
              </CardHeader>
              <CardContent>
                <DietLogForm />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Diet Logs</CardTitle>
                <CardDescription>Your latest meal entries</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                  <RecentDietLogs />
                </Suspense>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="exercise" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Log Exercise</CardTitle>
                <CardDescription>
                  Record your physical activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ExerciseLogForm />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Exercise Logs</CardTitle>
                <CardDescription>Your latest activities</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                  <RecentExerciseLogs />
                </Suspense>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

