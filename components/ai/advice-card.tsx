'use client'

/**
 * Advice Card Component
 * 
 * Displays personalized health advice based on user data
 * Includes focus area selection and loading states
 */

import { useState } from 'react'
import { Heart, Utensils, Dumbbell, Pill, Sparkles, Loader2, AlertCircle } from 'lucide-react'
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from '@/components/ui/glass-card'
import { GradientButton } from '@/components/ui/gradient-button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getPersonalizedAdvice } from '@/app/actions/ai-assistant'
import type { AdviceFocus } from '@/types'

const focusOptions: Array<{ value: AdviceFocus; label: string; icon: React.ReactNode }> = [
  { value: 'overall', label: 'Overall Health', icon: <Sparkles className="h-4 w-4" /> },
  { value: 'blood_pressure', label: 'Blood Pressure', icon: <Heart className="h-4 w-4" /> },
  { value: 'diet', label: 'Diet & Nutrition', icon: <Utensils className="h-4 w-4" /> },
  { value: 'exercise', label: 'Exercise & Fitness', icon: <Dumbbell className="h-4 w-4" /> },
  { value: 'medication', label: 'Medication', icon: <Pill className="h-4 w-4" /> },
]

export function AdviceCard() {
  const [focus, setFocus] = useState<AdviceFocus>('overall')
  const [advice, setAdvice] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [focusLabel, setFocusLabel] = useState<string | null>(null)

  const handleGetAdvice = async () => {
    setError(null)
    setIsLoading(true)

    try {
      const result = await getPersonalizedAdvice(focus, 30)

      if (result.success && result.data) {
        setAdvice(result.data.advice)
        setFocusLabel(result.data.focus)
      } else {
        setError(result.error || 'Failed to generate advice')
      }
    } catch (err) {
      console.error('Advice generation error:', err)
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const selectedOption = focusOptions.find((opt) => opt.value === focus)

  return (
    <GlassCard hover glow>
      <GlassCardHeader>
        <GlassCardTitle className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          Personalized Health Advice
        </GlassCardTitle>
        <p className="text-sm text-muted-foreground">
          Get AI-powered recommendations based on your health data
        </p>
      </GlassCardHeader>

      <GlassCardContent className="space-y-4">
        {error && (
          <Alert variant="destructive" className="animate-fade-in">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Focus Selection */}
        <div className="space-y-2">
          <Label htmlFor="focus">Focus Area</Label>
          <Select value={focus} onValueChange={(value) => setFocus(value as AdviceFocus)}>
            <SelectTrigger id="focus" className="glass">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {focusOptions.map((option) => (
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

        {/* Advice Display */}
        {advice ? (
          <div className="space-y-4 animate-fade-in">
            {focusLabel && (
              <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2">
                {selectedOption?.icon}
                <span className="text-sm font-medium">{focusLabel}</span>
              </div>
            )}
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {advice}
              </div>
            </div>
            <GradientButton
              variant="secondary"
              size="sm"
              onClick={handleGetAdvice}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
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
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating Advice...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Get Personalized Advice
              </>
            )}
          </GradientButton>
        )}
      </GlassCardContent>
    </GlassCard>
  )
}

