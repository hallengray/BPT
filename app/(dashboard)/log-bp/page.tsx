import { Metadata } from 'next'
import { BPReadingForm } from '@/components/forms/bp-reading-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Heart } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Log Blood Pressure | BP Tracker',
  description: 'Log your blood pressure reading',
}

export default function LogBPPage() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Heart className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Log Blood Pressure</h1>
            <p className="text-muted-foreground">
              Record your blood pressure reading
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Reading</CardTitle>
          <CardDescription>
            Enter your blood pressure, pulse, and any relevant notes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BPReadingForm />
        </CardContent>
      </Card>

      <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
        <h3 className="mb-2 font-semibold text-amber-900 dark:text-amber-100">
          Important Health Information
        </h3>
        <ul className="space-y-1 text-sm text-amber-800 dark:text-amber-200">
          <li>• This app is for tracking purposes only and does not replace medical advice</li>
          <li>• Consult your healthcare provider for medical guidance</li>
          <li>• If you experience symptoms like chest pain or severe headache, seek immediate medical attention</li>
        </ul>
      </div>
    </div>
  )
}


