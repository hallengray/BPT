'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BPReadingForm } from '@/components/forms/bp-reading-form'
import { DietLogForm } from '@/components/forms/diet-log-form'
import { ExerciseLogForm } from '@/components/forms/exercise-log-form'
import { MedicationForm } from '@/components/forms/medication-form'
import { RecentLogsList } from '@/components/quick-log/recent-logs-list'
import { Heart, Utensils, Dumbbell, Pill } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getRecentLogs } from '@/app/actions/quick-log'
import type { RecentLogs } from '@/app/actions/quick-log'

export function QuickLogContent() {
  const [activeTab, setActiveTab] = useState('bp')
  const [recentLogs, setRecentLogs] = useState<RecentLogs>({
    bloodPressure: [],
    diet: [],
    exercise: [],
    medications: [],
  })
  const [isLoading, setIsLoading] = useState(true)

  // Fetch recent logs on mount and when tab changes
  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true)
      const result = await getRecentLogs()
      if (result.success && result.data) {
        setRecentLogs(result.data)
      }
      setIsLoading(false)
    }
    fetchLogs()
  }, [])

  // Refresh logs after successful form submission
  const handleLogSuccess = async () => {
    const result = await getRecentLogs()
    if (result.success && result.data) {
      setRecentLogs(result.data)
    }
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-4 h-auto p-1 gap-1 bg-muted/50">
        <TabsTrigger 
          value="bp" 
          className={cn(
            "flex items-center gap-2 data-[state=active]:bg-red-50 dark:data-[state=active]:bg-red-950/30",
            "data-[state=active]:text-red-700 dark:data-[state=active]:text-red-400",
            "data-[state=active]:border-red-200 dark:data-[state=active]:border-red-800"
          )}
        >
          <Heart className="h-4 w-4" />
          <span className="hidden sm:inline">Blood Pressure</span>
          <span className="sm:hidden">BP</span>
        </TabsTrigger>
        <TabsTrigger 
          value="diet" 
          className={cn(
            "flex items-center gap-2 data-[state=active]:bg-green-50 dark:data-[state=active]:bg-green-950/30",
            "data-[state=active]:text-green-700 dark:data-[state=active]:text-green-400",
            "data-[state=active]:border-green-200 dark:data-[state=active]:border-green-800"
          )}
        >
          <Utensils className="h-4 w-4" />
          <span className="hidden sm:inline">Diet</span>
          <span className="sm:hidden">Diet</span>
        </TabsTrigger>
        <TabsTrigger 
          value="exercise" 
          className={cn(
            "flex items-center gap-2 data-[state=active]:bg-purple-50 dark:data-[state=active]:bg-purple-950/30",
            "data-[state=active]:text-purple-700 dark:data-[state=active]:text-purple-400",
            "data-[state=active]:border-purple-200 dark:data-[state=active]:border-purple-800"
          )}
        >
          <Dumbbell className="h-4 w-4" />
          <span className="hidden sm:inline">Exercise</span>
          <span className="sm:hidden">Exercise</span>
        </TabsTrigger>
        <TabsTrigger 
          value="medication" 
          className={cn(
            "flex items-center gap-2 data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-blue-950/30",
            "data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-400",
            "data-[state=active]:border-blue-200 dark:data-[state=active]:border-blue-800"
          )}
        >
          <Pill className="h-4 w-4" />
          <span className="hidden sm:inline">Medication</span>
          <span className="sm:hidden">Meds</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="bp" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Blood Pressure Reading
            </CardTitle>
            <CardDescription>
              Record your blood pressure, pulse, and any relevant notes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BPReadingForm onSuccess={handleLogSuccess} />
          </CardContent>
        </Card>
        
        {!isLoading && <RecentLogsList logs={recentLogs} activeTab={activeTab} />}
      </TabsContent>

      <TabsContent value="diet" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Utensils className="h-5 w-5 text-green-500" />
              Diet Log
            </CardTitle>
            <CardDescription>
              Track what you ate and when
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DietLogForm onSuccess={handleLogSuccess} />
          </CardContent>
        </Card>
        
        {!isLoading && <RecentLogsList logs={recentLogs} activeTab={activeTab} />}
      </TabsContent>

      <TabsContent value="exercise" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-purple-500" />
              Exercise Log
            </CardTitle>
            <CardDescription>
              Record your physical activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ExerciseLogForm onSuccess={handleLogSuccess} />
          </CardContent>
        </Card>
        
        {!isLoading && <RecentLogsList logs={recentLogs} activeTab={activeTab} />}
      </TabsContent>

      <TabsContent value="medication" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5 text-blue-500" />
              Medication
            </CardTitle>
            <CardDescription>
              Add a new medication to your list
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MedicationForm onSuccess={handleLogSuccess} />
          </CardContent>
        </Card>
        
        {!isLoading && <RecentLogsList logs={recentLogs} activeTab={activeTab} />}
      </TabsContent>
    </Tabs>
  )
}

