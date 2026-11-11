import { useEffect, useState } from 'react'
import type { Exercise, Lang } from './types'

// Откуда берутся гифки и картинки. По умолчанию — репозиторий на GitHub.
// Для продакшена скопируйте папки images/ и videos/ в public/ и задайте VITE_MEDIA_BASE=/
export const MEDIA_BASE: string =
  import.meta.env.VITE_MEDIA_BASE ?? 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/'

export const LANGS: { id: Lang; label: string }[] = [
  { id: 'ru', label: 'Русский' }, { id: 'en', label: 'English' }, { id: 'es', label: 'Español' },
  { id: 'it', label: 'Italiano' }, { id: 'tr', label: 'Türkçe' }, { id: 'zh', label: '中文' },
  { id: 'hi', label: 'हिन्दी' }, { id: 'pl', label: 'Polski' }, { id: 'ko', label: '한국어' }, { id: 'fr', label: 'Français' },
]

const BODY_PARTS_RU: Record<string, string> = {
  'upper arms': 'Плечо', 'lower arms': 'Предплечье', 'upper legs': 'Бёдра', 'lower legs': 'Голень',
  back: 'Спина', chest: 'Грудь', shoulders: 'Плечи', waist: 'Пресс и кор', cardio: 'Кардио', neck: 'Шея',
}
const EQUIPMENT_RU: Record<string, string> = {
  'body weight': 'Свой вес', dumbbell: 'Гантели', barbell: 'Штанга', cable: 'Блок', band: 'Лента',
  'resistance band': 'Эспандер', kettlebell: 'Гиря', 'stability ball': 'Фитбол', 'leverage machine': 'Тренажёр',
  'smith machine': 'Машина Смита', 'ez barbell': 'EZ-гриф', weighted: 'С отягощением', assisted: 'С помощью',
}
export const bodyPartLabel = (v: string) => BODY_PARTS_RU[v] ?? v
export const equipmentLabel = (v: string) => EQUIPMENT_RU[v] ?? v
export const mediaUrl = (path: string) => MEDIA_BASE + path

let indexPromise: Promise<Exercise[]> | null = null
const stepsPromises = new Map<Lang, Promise<Record<string, string[]>>>()

function loadJson<T>(url: string): Promise<T> {
  return fetch(url).then((r) => {
    if (!r.ok) throw new Error(`Не удалось загрузить ${url}`)
    return r.json() as Promise<T>
  })
}
const loadIndex = () => (indexPromise ??= loadJson<Exercise[]>('/data/index.json').catch((e) => { indexPromise = null; throw e }))
const loadSteps = (lang: Lang) => {
  let p = stepsPromises.get(lang)
  if (!p) {
    p = loadJson<Record<string, string[]>>(`/data/steps.${lang}.json`).catch((e) => { stepsPromises.delete(lang); throw e })
    stepsPromises.set(lang, p)
  }
  return p
}

export function useExercises() {
  const [list, setList] = useState<Exercise[] | null>(null)
  const [error, setError] = useState('')
  useEffect(() => {
    loadIndex().then(setList).catch((e: Error) => setError(e.message))
  }, [])
  return { list, error }
}

export function useSteps(lang: Lang) {
  const [steps, setSteps] = useState<Record<string, string[]> | null>(null)
  useEffect(() => {
    setSteps(null)
    loadSteps(lang).then(setSteps).catch(() => setSteps({}))
  }, [lang])
  return steps
}

const LANG_KEY = 'hf_lang'
export function useLang(): [Lang, (l: Lang) => void] {
  const [lang, setLang] = useState<Lang>(() => {
    const saved = localStorage.getItem(LANG_KEY) as Lang | null
    return saved && LANGS.some((l) => l.id === saved) ? saved : 'ru'
  })
  return [lang, (l) => { localStorage.setItem(LANG_KEY, l); setLang(l) }]
}
