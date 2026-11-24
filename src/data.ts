import type { Workout } from './types'

export const GOLDEN_WORKOUT: Workout = {
  id: 'w-golden',
  title: 'Золотая эра: классика',
  description: 'Базовые движения в духе тренировок 1960–70-х: жим, присед, тяга, подтягивания, бицепс и плечи. Нагрузка серьёзная: начинайте с лёгких весов и не гонитесь за объёмом.',
  items: [
    { exerciseId: '0025', sets: 4, reps: 8 }, { exerciseId: '0043', sets: 4, reps: 8 },
    { exerciseId: '0032', sets: 3, reps: 6 }, { exerciseId: '0652', sets: 3, reps: 8 },
    { exerciseId: '0294', sets: 3, reps: 10 }, { exerciseId: '0334', sets: 3, reps: 12 } ],
}

export const WORKOUTS: Workout[] = [
  { id: 'w-core', title: 'Мышечный корсет', items: [
    { exerciseId: '0276', sets: 3, reps: 10 }, { exerciseId: '1422', sets: 3, reps: 12 },
    { exerciseId: '3013', sets: 3, reps: 12 }, { exerciseId: '3561', sets: 3, reps: 10 } ] },
  { id: 'w-full', title: 'Всё тело, 30 минут', items: [
    { exerciseId: '0659', sets: 3, reps: 10 }, { exerciseId: '3470', sets: 3, reps: 10 },
    { exerciseId: '3158', sets: 3, reps: 12 }, { exerciseId: '1373', sets: 3, reps: 15 } ] },
  { id: 'w-shoulder', title: 'Плечи и осанка', items: [
    { exerciseId: '1271', sets: 2, reps: 8 }, { exerciseId: '1405', sets: 2, reps: 8 },
    { exerciseId: '0405', sets: 3, reps: 10 } ] },
  GOLDEN_WORKOUT,
]


export const CONDITIONS: { group: string; items: string[] }[] = [
  { group: 'Хронические заболевания', items: ['Гипертония', 'Сахарный диабет', 'Заболевания сердца', 'Бронхиальная астма', 'Заболевания щитовидной железы'] },
  { group: 'Травмы', items: ['Травма колена', 'Травма плеча', 'Травма голеностопа', 'Перелом (в прошлом)', 'Травма позвоночника'] },
  { group: 'Операции', items: ['Операция на позвоночнике', 'Операция на суставе', 'Операция на брюшной полости', 'Операция на сердце'] },
  { group: 'Болевые синдромы', items: ['Боль в пояснице', 'Боль в шее', 'Боль в плече', 'Боль в коленях', 'Головные боли напряжения'] },
]

export const GOALS = [
  'Реабилитация после травмы',
  'Укрепление мышечного корсета',
  'Снижение боли',
  'Общая физическая форма',
  'Снижение веса',
]
