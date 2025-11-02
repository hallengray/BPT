import type { Database, Tables, TablesInsert, TablesUpdate } from './database.types'

export type { Database, Tables, TablesInsert, TablesUpdate }

// Blood Pressure Reading Types
export type BloodPressureReading = Tables<'blood_pressure_readings'>
export type BloodPressureReadingInsert = TablesInsert<'blood_pressure_readings'>
export type BloodPressureReadingUpdate = TablesUpdate<'blood_pressure_readings'>

// Diet Log Types
export type DietLog = Tables<'diet_logs'>
export type DietLogInsert = TablesInsert<'diet_logs'>
export type DietLogUpdate = TablesUpdate<'diet_logs'>

// Exercise Log Types
export type ExerciseLog = Tables<'exercise_logs'>
export type ExerciseLogInsert = TablesInsert<'exercise_logs'>
export type ExerciseLogUpdate = TablesUpdate<'exercise_logs'>

// Profile Types
export type Profile = Tables<'profiles'>
export type ProfileInsert = TablesInsert<'profiles'>
export type ProfileUpdate = TablesUpdate<'profiles'>

// Meal Types
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other'

// Exercise Intensity
export type ExerciseIntensity = 'low' | 'moderate' | 'high'

// BP Classification
export type BPClassification = 'normal' | 'elevated' | 'high_stage_1' | 'high_stage_2' | 'hypertensive_crisis'

// Helper function to classify blood pressure
export function classifyBloodPressure(systolic: number, diastolic: number): BPClassification {
  if (systolic >= 180 || diastolic >= 120) {
    return 'hypertensive_crisis'
  } else if (systolic >= 140 || diastolic >= 90) {
    return 'high_stage_2'
  } else if (systolic >= 130 || diastolic >= 80) {
    return 'high_stage_1'
  } else if (systolic >= 120 && diastolic < 80) {
    return 'elevated'
  } else {
    return 'normal'
  }
}

// Helper function to get BP classification color
export function getBPClassificationColor(classification: BPClassification): string {
  switch (classification) {
    case 'normal':
      return 'text-green-600 dark:text-green-500'
    case 'elevated':
      return 'text-yellow-600 dark:text-yellow-500'
    case 'high_stage_1':
      return 'text-orange-600 dark:text-orange-500'
    case 'high_stage_2':
      return 'text-red-600 dark:text-red-500'
    case 'hypertensive_crisis':
      return 'text-red-700 dark:text-red-600'
  }
}

// Helper function to get BP classification label
export function getBPClassificationLabel(classification: BPClassification): string {
  switch (classification) {
    case 'normal':
      return 'Normal'
    case 'elevated':
      return 'Elevated'
    case 'high_stage_1':
      return 'High (Stage 1)'
    case 'high_stage_2':
      return 'High (Stage 2)'
    case 'hypertensive_crisis':
      return 'Hypertensive Crisis'
  }
}

// AI Assistant Types
export type MessageRole = 'system' | 'user' | 'assistant'

export interface ChatMessage {
  role: MessageRole
  content: string
  timestamp?: string
}

export interface ChatConversation {
  id: string
  messages: ChatMessage[]
  createdAt: string
  updatedAt: string
}

export type SummaryPeriod = 'daily' | 'weekly' | 'monthly'

export interface HealthSummary {
  id: string
  period: SummaryPeriod
  date: string
  summary: string
  createdAt: string
}

export type AdviceFocus = 'blood_pressure' | 'diet' | 'exercise' | 'medication' | 'overall'

export interface PersonalizedAdvice {
  focus: AdviceFocus
  advice: string
  generatedAt: string
}

// Medication Types
export type MedicationLog = Tables<'medication_logs'>
export type MedicationLogInsert = TablesInsert<'medication_logs'>
export type MedicationLogUpdate = TablesUpdate<'medication_logs'>

export type MedicationDose = Tables<'medication_doses'>
export type MedicationDoseInsert = TablesInsert<'medication_doses'>
export type MedicationDoseUpdate = TablesUpdate<'medication_doses'>

export interface MedicationWithAdherence extends MedicationLog {
  adherenceRate: number
  nextDoseTime?: string
}

// Medication Frequency Types
export type MedicationFrequency = 'once_daily' | 'twice_daily' | 'three_times_daily' | 'as_needed' | 'weekly' | 'other'

// Analytics Types
export interface UnifiedHealthData {
  bloodPressure: BloodPressureReading[]
  diet: DietLog[]
  exercise: ExerciseLog[]
  medications: MedicationLog[]
  medicationDoses: MedicationDose[]
}

export interface TimelineEvent {
  id: string
  type: 'bp' | 'diet' | 'exercise' | 'medication'
  timestamp: string
  data: BloodPressureReading | DietLog | ExerciseLog | MedicationDose
}

export interface CorrelationInsight {
  type: 'positive' | 'negative' | 'neutral'
  title: string
  description: string
  confidence: 'high' | 'medium' | 'low'
  metric?: number
}

