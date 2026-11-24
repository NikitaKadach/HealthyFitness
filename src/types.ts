export type Sex = 'male' | 'female'
export type Role = 'patient' | 'therapist' | 'admin'
export interface Profile {
  height: number
  weight: number
  sex: Sex
  birth: string
  conditions: string[]
  notes: string
  goal: string
}
export interface User {
  id: string
  email: string
  role: Role
  name?: string
  consentAt?: string
  profile?: Profile
}
export interface Exercise {
  id: string
  name: string
  bodyPart: string
  equipment: string
  target: string
  secondary: string[]
  image: string
  gif: string
  description?: string
  video?: string
  custom?: boolean
}
export interface CustomExercise {
  id: string
  name: string
  bodyPart: string
  equipment: string
  target: string
  description: string
  videoUrl: string
  createdBy: string
  createdAt: string
}
export interface WorkoutItem { exerciseId: string; sets: number; reps: number }
export interface Workout { id: string; title: string; description?: string; items: WorkoutItem[]; custom?: boolean }
export interface Assignment {
  id: string
  patientId: string
  therapistId: string
  workout: Workout
  comment?: string
  createdAt: string
}
export interface PatientComment {
  id: string
  patientId: string
  authorId: string
  text: string
  createdAt: string
}
export interface ChatMessage {
  id: string
  from: string
  to: string
  text: string
  createdAt: string
}
export interface WeightEntry {
  date: string
  weight: number
  kcal?: number
}
export type Lang = 'ru' | 'en' | 'es' | 'it' | 'tr' | 'zh' | 'hi' | 'pl' | 'ko' | 'fr'
