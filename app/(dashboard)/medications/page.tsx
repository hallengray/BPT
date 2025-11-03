import { Metadata } from 'next'
import { Suspense } from 'react'
import { Pill, Plus } from 'lucide-react'
import { getMedications, getMedicationHistory } from '@/app/actions/medication-logs'
import { MedicationCard } from '@/components/medication/medication-card'
import { AdherenceChart } from '@/components/medication/adherence-chart'
import { MedicationForm } from '@/components/forms/medication-form'
import { GlassCard, GlassCardContent, GlassCardHeader } from '@/components/ui/glass-card'
import { GradientButton } from '@/components/ui/gradient-button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import type { Database } from '@/types/database.types'

type MedicationLog = Database['public']['Tables']['medication_logs']['Row']
type MedicationDose = Database['public']['Tables']['medication_doses']['Row']

interface MedicationWithStats extends MedicationLog {
  adherenceRate: number
  nextDoseTime?: string
  doses: MedicationDose[]
}

export const metadata: Metadata = {
  title: 'Medications',
  description: 'Manage your medications and track adherence',
}

async function MedicationsList() {
  const result = await getMedications(true)

  if (!result.success || !result.data) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
        <p className="text-sm text-red-800 dark:text-red-200">
          {result.error || 'Failed to load medications'}
        </p>
      </div>
    )
  }

  if (result.data.length === 0) {
    return (
      <GlassCard className="text-center">
        <GlassCardContent className="py-12">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
            <Pill className="h-8 w-8 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="mb-2 text-xl font-semibold">No Medications Yet</h3>
          <p className="mb-6 text-muted-foreground">
            Start tracking your medications to monitor adherence and improve health outcomes
          </p>
          <Dialog>
            <DialogTrigger asChild>
              <GradientButton variant="primary" size="lg">
                <Plus className="mr-2 h-5 w-5" />
                Add Your First Medication
              </GradientButton>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Medication</DialogTitle>
                <DialogDescription>
                  Enter your medication details and schedule
                </DialogDescription>
              </DialogHeader>
              <MedicationForm />
            </DialogContent>
          </Dialog>
        </GlassCardContent>
      </GlassCard>
    )
  }

  // Get adherence data for each medication
  const medicationsWithAdherence: MedicationWithStats[] = await Promise.all(
    result.data.map(async (med: MedicationLog) => {
      const history = await getMedicationHistory(med.id, 30)
      const doses = history.data || []
      const totalDoses = doses.length
      const takenDoses = doses.filter((d: MedicationDose) => d.was_taken).length
      const adherenceRate = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 0

      // Calculate next dose time
      let nextDoseTime: string | undefined
      if (med.time_of_day && med.time_of_day.length > 0) {
        const now = new Date()
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
        
        const upcomingTimes = med.time_of_day
          .filter((time: string) => time > currentTime)
          .sort()
        
        if (upcomingTimes.length > 0) {
          nextDoseTime = upcomingTimes[0]
        } else if (med.time_of_day.length > 0) {
          // Next dose is tomorrow at the first time
          nextDoseTime = `Tomorrow at ${med.time_of_day.sort()[0]}`
        }
      }

      return {
        ...med,
        adherenceRate,
        nextDoseTime,
        doses,
      }
    })
  )

  return (
    <div className="space-y-6">
      {/* Active Medications Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {medicationsWithAdherence.map((med: MedicationWithStats) => (
          <MedicationCard
            key={med.id}
            medication={med}
            adherenceRate={med.adherenceRate}
            nextDoseTime={med.nextDoseTime}
          />
        ))}
      </div>

      {/* Overall Adherence Statistics */}
      {medicationsWithAdherence.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Adherence Overview</h2>
          
          {medicationsWithAdherence.map((med: MedicationWithStats) => (
            <AdherenceChart
              key={med.id}
              doses={med.doses}
              days={30}
              medicationName={med.medication_name}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function MedicationsLoading() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <GlassCard key={i}>
            <GlassCardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="mt-2 h-4 w-1/2" />
            </GlassCardHeader>
            <GlassCardContent>
              <Skeleton className="h-24 w-full" />
            </GlassCardContent>
          </GlassCard>
        ))}
      </div>
    </div>
  )
}

export default function MedicationsPage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
            <Pill className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Medications</h1>
            <p className="text-muted-foreground">Track your medications and adherence</p>
          </div>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <GradientButton variant="primary" size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Add Medication
            </GradientButton>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Medication</DialogTitle>
              <DialogDescription>
                Enter your medication details and schedule
              </DialogDescription>
            </DialogHeader>
            <MedicationForm />
          </DialogContent>
        </Dialog>
      </div>

      {/* Medications List */}
      <Suspense fallback={<MedicationsLoading />}>
        <MedicationsList />
      </Suspense>

      {/* Health Disclaimer */}
      <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
        <h3 className="mb-2 font-semibold text-amber-900 dark:text-amber-100">
          Important Medication Safety
        </h3>
        <ul className="space-y-1 text-sm text-amber-800 dark:text-amber-200">
          <li>• This app is for tracking purposes only and does not replace medical advice</li>
          <li>• Never stop or change medications without consulting your healthcare provider</li>
          <li>• Store medications as directed on the label and keep out of reach of children</li>
          <li>• Report any side effects or concerns to your doctor immediately</li>
          <li>• Set reminders to help maintain consistent medication adherence</li>
        </ul>
      </div>
    </div>
  )
}

