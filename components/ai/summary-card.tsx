'use client'

/**
 * Summary Card Component
 * 
 * Displays health summaries (daily, weekly, monthly) with glass UI
 * Includes loading states and error handling
 */

import { useState } from 'react'
import { Calendar, TrendingUp, Loader2, AlertCircle } from 'lucide-react'
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from '@/components/ui/glass-card'
import { GradientButton } from '@/components/ui/gradient-button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { generateHealthSummary } from '@/app/actions/ai-assistant'
import type { SummaryPeriod } from '@/types'

interface SummaryCardProps {
  period: SummaryPeriod
  title: string
  description: string
  icon?: React.ReactNode
}

export function SummaryCard({
  period,
  title,
  description,
  icon,
}: SummaryCardProps) {
  const [summary, setSummary] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generatedDate, setGeneratedDate] = useState<string | null>(null)

  const handleGenerateSummary = async () => {
    setError(null)
    setIsLoading(true)

    try {
      const result = await generateHealthSummary(period)

      if (result.success && result.data) {
        setSummary(result.data.summary)
        setGeneratedDate(result.data.date)
      } else {
        setError(result.error || 'Failed to generate summary')
      }
    } catch (err) {
      console.error('Summary generation error:', err)
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <GlassCard hover glow>
      <GlassCardHeader>
        <GlassCardTitle className="flex items-center gap-2 text-xl">
          {icon || <TrendingUp className="h-5 w-5 text-primary" />}
          {title}
        </GlassCardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </GlassCardHeader>

      <GlassCardContent className="space-y-4">
        {error && (
          <Alert variant="destructive" className="animate-fade-in">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {summary ? (
          <div className="space-y-4 animate-fade-in">
            {generatedDate && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{generatedDate}</span>
              </div>
            )}
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {summary}
              </div>
            </div>
            <GradientButton
              variant="secondary"
              size="sm"
              onClick={handleGenerateSummary}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Regenerate Summary'
              )}
            </GradientButton>
          </div>
        ) : (
          <GradientButton
            variant="primary"
            onClick={handleGenerateSummary}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating {title}...
              </>
            ) : (
              `Generate ${title}`
            )}
          </GradientButton>
        )}
      </GlassCardContent>
    </GlassCard>
  )
}

