'use client'

/**
 * Health Overview Component
 * 
 * Consolidated component combining health summaries and personalized advice
 * Modern tabbed interface with quick insights
 */

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Heart, Utensils, Dumbbell, Pill, Sparkles, Loader2, AlertCircle, TrendingUp, Calendar, Activity } from 'lucide-react'
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from '@/components/ui/glass-card'
import { GradientButton } from '@/components/ui/gradient-button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getPersonalizedAdvice, generateHealthSummary } from '@/app/actions/ai-assistant'
import type { AdviceFocus, SummaryPeriod } from '@/types'
import { cn } from '@/lib/utils'

const focusOptions: Array<{ value: AdviceFocus; label: string; icon: React.ReactNode; color: string }> = [
  { value: 'overall', label: 'Overall', icon: <Sparkles className="h-4 w-4" />, color: 'text-purple-600 dark:text-purple-400' },
  { value: 'blood_pressure', label: 'Blood Pressure', icon: <Heart className="h-4 w-4" />, color: 'text-red-600 dark:text-red-400' },
  { value: 'diet', label: 'Diet', icon: <Utensils className="h-4 w-4" />, color: 'text-green-600 dark:text-green-400' },
  { value: 'exercise', label: 'Exercise', icon: <Dumbbell className="h-4 w-4" />, color: 'text-purple-600 dark:text-purple-400' },
  { value: 'medication', label: 'Medication', icon: <Pill className="h-4 w-4" />, color: 'text-blue-600 dark:text-blue-400' },
]

const periodOptions: Array<{ value: SummaryPeriod; label: string; icon: React.ReactNode }> = [
  { value: 'daily', label: 'Today', icon: <Calendar className="h-4 w-4" /> },
  { value: 'weekly', label: 'This Week', icon: <TrendingUp className="h-4 w-4" /> },
  { value: 'monthly', label: 'This Month', icon: <Activity className="h-4 w-4" /> },
]

export function HealthOverview() {
  const [activeTab, setActiveTab] = useState<'advice' | 'summary'>('advice')
  
  // Advice state
  const [focus, setFocus] = useState<AdviceFocus>('overall')
  const [advice, setAdvice] = useState<string | null>(null)
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(false)
  const [adviceError, setAdviceError] = useState<string | null>(null)
  
  // Summary state
  const [period, setPeriod] = useState<SummaryPeriod>('daily')
  const [summary, setSummary] = useState<string | null>(null)
  const [isLoadingSummary, setIsLoadingSummary] = useState(false)
  const [summaryError, setSummaryError] = useState<string | null>(null)
  const [summaryDate, setSummaryDate] = useState<string | null>(null)

  const handleGetAdvice = async () => {
    setAdviceError(null)
    setIsLoadingAdvice(true)

    try {
      const result = await getPersonalizedAdvice(focus, 30)

      if (result.success && result.data) {
        setAdvice(result.data.advice)
      } else {
        setAdviceError(result.error || 'Failed to generate advice')
      }
    } catch (err) {
      console.error('Advice generation error:', err)
      setAdviceError('An unexpected error occurred')
    } finally {
      setIsLoadingAdvice(false)
    }
  }

  const handleGenerateSummary = async () => {
    setSummaryError(null)
    setIsLoadingSummary(true)

    try {
      const result = await generateHealthSummary(period)

      if (result.success && result.data) {
        setSummary(result.data.summary)
        setSummaryDate(result.data.date)
      } else {
        setSummaryError(result.error || 'Failed to generate summary')
      }
    } catch (err) {
      console.error('Summary generation error:', err)
      setSummaryError('An unexpected error occurred')
    } finally {
      setIsLoadingSummary(false)
    }
  }

  const selectedFocus = focusOptions.find((opt) => opt.value === focus)
  const selectedPeriod = periodOptions.find((opt) => opt.value === period)

  return (
    <div className="sticky top-8 space-y-6">
      <GlassCard hover glow className="overflow-hidden">
        <GlassCardHeader>
          <GlassCardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Health Insights
          </GlassCardTitle>
          <p className="text-sm text-muted-foreground">
            AI-powered advice and summaries
          </p>
        </GlassCardHeader>

        <GlassCardContent className="space-y-4">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'advice' | 'summary')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="advice">
                <Sparkles className="h-4 w-4 mr-2" />
                Advice
              </TabsTrigger>
              <TabsTrigger value="summary">
                <TrendingUp className="h-4 w-4 mr-2" />
                Summary
              </TabsTrigger>
            </TabsList>

            {/* Advice Tab */}
            <TabsContent value="advice" className="space-y-4 mt-4">
              {adviceError && (
                <Alert variant="destructive" className="animate-fade-in">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{adviceError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="focus">Focus Area</Label>
                <Select value={focus} onValueChange={(value) => setFocus(value as AdviceFocus)}>
                  <SelectTrigger id="focus">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {focusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <span className={option.color}>{option.icon}</span>
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {advice ? (
                <div className="space-y-4 animate-fade-in">
                  <div className={cn("flex items-center gap-2 rounded-lg px-3 py-2 bg-gradient-to-r from-primary/10 to-primary/5", selectedFocus?.color)}>
                    {selectedFocus?.icon}
                    <span className="text-sm font-medium">{selectedFocus?.label}</span>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto pr-2 space-y-2">
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {advice}
                      </div>
                    </div>
                  </div>
                  <GradientButton
                    variant="secondary"
                    size="sm"
                    onClick={handleGetAdvice}
                    disabled={isLoadingAdvice}
                    className="w-full"
                  >
                    {isLoadingAdvice ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      'Get New Advice'
                    )}
                  </GradientButton>
                </div>
              ) : (
                <GradientButton
                  variant="primary"
                  onClick={handleGetAdvice}
                  disabled={isLoadingAdvice}
                  className="w-full"
                >
                  {isLoadingAdvice ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Get Advice
                    </>
                  )}
                </GradientButton>
              )}
            </TabsContent>

            {/* Summary Tab */}
            <TabsContent value="summary" className="space-y-4 mt-4">
              {summaryError && (
                <Alert variant="destructive" className="animate-fade-in">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{summaryError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="period">Time Period</Label>
                <Select value={period} onValueChange={(value) => setPeriod(value as SummaryPeriod)}>
                  <SelectTrigger id="period">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {periodOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          {option.icon}
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {summary ? (
                <div className="space-y-4 animate-fade-in">
                  {summaryDate && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                      {selectedPeriod?.icon}
                      <span>{summaryDate}</span>
                    </div>
                  )}
                  <div className="max-h-[400px] overflow-y-auto pr-2 space-y-2">
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {summary}
                      </div>
                    </div>
                  </div>
                  <GradientButton
                    variant="secondary"
                    size="sm"
                    onClick={handleGenerateSummary}
                    disabled={isLoadingSummary}
                    className="w-full"
                  >
                    {isLoadingSummary ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      'Regenerate'
                    )}
                  </GradientButton>
                </div>
              ) : (
                <GradientButton
                  variant="primary"
                  onClick={handleGenerateSummary}
                  disabled={isLoadingSummary}
                  className="w-full"
                >
                  {isLoadingSummary ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="h-4 w-4" />
                      Generate Summary
                    </>
                  )}
                </GradientButton>
              )}
            </TabsContent>
          </Tabs>
        </GlassCardContent>
      </GlassCard>
    </div>
  )
}

