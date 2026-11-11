export type Sex = 'male' | 'female'
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
  hash: string
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
}
export interface WorkoutItem { exerciseId: string; sets: number; reps: number }
export interface Workout { id: string; title: string; description?: string; items: WorkoutItem[]; custom?: boolean }
export type Lang = 'ru' | 'en' | 'es' | 'it' | 'tr' | 'zh' | 'hi' | 'pl' | 'ko' | 'fr'
