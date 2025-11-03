import { Metadata } from 'next'
import { QuickLogContent } from './quick-log-content'
import { Activity } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Quick Log',
  description: 'Log your blood pressure, diet, exercise, and medications in one place',
}

export default function QuickLogPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Quick Log</h1>
            <p className="text-muted-foreground">
              Log your health data in one convenient place
            </p>
          </div>
        </div>
      </div>

      <QuickLogContent />

      <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
        <h3 className="mb-2 font-semibold text-amber-900 dark:text-amber-100">
          Important Health Information
        </h3>
        <ul className="space-y-1 text-sm text-amber-800 dark:text-amber-200">
          <li>• This app is for tracking purposes only and does not replace medical advice</li>
          <li>• Consult your healthcare provider for medical guidance</li>
          <li>• If you experience symptoms like chest pain or severe headache, seek immediate medical attention</li>
          <li>• Take medications as prescribed and never skip doses without consulting your doctor</li>
        </ul>
      </div>
    </div>
  )
}

