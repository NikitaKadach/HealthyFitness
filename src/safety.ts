import type { Exercise } from './types'

// Грубое правило: какие группы мышц (body_part в датасете) могут быть
// противопоказаны при ограничении. Это не медицинская оценка.
const BY_PART: Record<string, string[]> = {
  'Травма колена': ['upper legs', 'lower legs'],
  'Боль в коленях': ['upper legs', 'lower legs'],
  'Травма голеностопа': ['lower legs', 'cardio'],
  'Травма плеча': ['shoulders', 'chest', 'upper arms'],
  'Боль в плече': ['shoulders', 'chest', 'upper arms'],
  'Травма позвоночника': ['back', 'waist'],
  'Операция на позвоночнике': ['back', 'waist'],
  'Боль в пояснице': ['back', 'waist'],
  'Боль в шее': ['neck', 'shoulders'],
  'Головные боли напряжения': ['neck'],
  'Операция на брюшной полости': ['waist'],
  'Заболевания сердца': ['cardio'],
  'Операция на сердце': ['cardio', 'chest'],
  'Бронхиальная астма': ['cardio'],
  'Гипертония': ['cardio'],
}

/** Ограничения пользователя, из-за которых это упражнение может не подойти. */
export const risks = (e: Exercise, conditions: string[]): string[] =>
  conditions.filter((c) => BY_PART[c]?.includes(e.bodyPart))

/** Есть ли у пользователя ограничения, по которым приложение умеет проверять упражнения. */
export const hasRules = (conditions: string[]): boolean => conditions.some((c) => BY_PART[c])

/** Ограничения, которые приложение проверить не может. */
export const unchecked = (conditions: string[]): string[] => conditions.filter((c) => !BY_PART[c])
