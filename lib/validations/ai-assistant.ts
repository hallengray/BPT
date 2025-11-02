/**
 * Validation schemas for AI Assistant features
 * 
 * All user inputs are validated using Zod to ensure type safety
 * and prevent invalid data from reaching the AI API.
 */

import { z } from 'zod'

/**
 * Chat message validation schema
 */
export const chatMessageSchema = z.object({
  message: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(2000, 'Message is too long (max 2000 characters)')
    .trim(),
  conversationHistory: z
    .array(
      z.object({
        role: z.enum(['system', 'user', 'assistant']),
        content: z.string(),
      })
    )
    .optional()
    .default([]),
})

export type ChatMessageInput = z.infer<typeof chatMessageSchema>

/**
 * Summary request validation schema
 */
export const summaryRequestSchema = z.object({
  period: z.enum(['daily', 'weekly', 'monthly'], {
    required_error: 'Period is required',
    invalid_type_error: 'Period must be daily, weekly, or monthly',
  }),
  date: z
    .string()
    .datetime()
    .optional()
    .describe('Optional date to generate summary for (defaults to current date)'),
})

export type SummaryRequestInput = z.infer<typeof summaryRequestSchema>

/**
 * Health question validation schema
 */
export const healthQuestionSchema = z.object({
  question: z
    .string()
    .min(5, 'Question is too short (min 5 characters)')
    .max(500, 'Question is too long (max 500 characters)')
    .trim(),
  includeUserData: z
    .boolean()
    .optional()
    .default(true)
    .describe('Whether to include user health data for personalized answers'),
})

export type HealthQuestionInput = z.infer<typeof healthQuestionSchema>

/**
 * Personalized advice request validation schema
 */
export const adviceRequestSchema = z.object({
  focus: z
    .enum(['blood_pressure', 'diet', 'exercise', 'medication', 'overall'], {
      required_error: 'Focus area is required',
    })
    .describe('The health aspect to focus advice on'),
  daysToAnalyze: z
    .number()
    .int()
    .min(7, 'Must analyze at least 7 days')
    .max(90, 'Cannot analyze more than 90 days')
    .optional()
    .default(30),
})

export type AdviceRequestInput = z.infer<typeof adviceRequestSchema>

