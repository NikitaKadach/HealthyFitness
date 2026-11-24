import Brand from './Brand'
import { useEffect, useState } from 'react'
import Auth from './Auth'
import Consent from './Consent'
import Questionnaire from './Questionnaire'
import Legends from './Legends'
import Health from './Health'
import Chat from './Chat'
import Therapist from './Therapist'
import Admin from './Admin'
import { Builder, ExerciseList, WorkoutList } from './Workouts'
import { api, getToken } from './store'
import { useTheme } from './theme'
import type { Profile, Role, User, Workout } from './types'

type Tab = 'workouts' | 'exercises' | 'legends' | 'health' | 'chat' | 'profile' | 'builder' | 'patients' | 'admin'
const TABS: { id: Tab; label: string; roles: Role[] }[] = [
  { id: 'workouts', label: 'Тренировки', roles: ['patient'] },
  { id: 'exercises', label: 'Упражнения', roles: ['patient', 'therapist', 'admin'] },
  { id: 'legends', label: 'Золотая эра', roles: ['patient', 'therapist', 'admin'] },
  { id: 'health', label: 'Здоровье', roles: ['patient'] },
  { id: 'chat', label: 'Чат', roles: ['patient', 'therapist'] },
  { id: 'patients', label: 'Мои пациенты', roles: ['therapist'] },
  { id: 'admin', label: 'База упражнений', roles: ['admin'] },
  { id: 'profile', label: 'Анкета', roles: ['patient', 'therapist', 'admin'] },
]
const DEFAULT_TAB: Record<Role, Tab> = { patient: 'workouts', therapist: 'patients', admin: 'admin' }
const allowed = (tab: Tab, role: Role) => TABS.some((t) => t.id === tab && t.roles.includes(role))

const ROLE_LABEL: Record<Role, string> = { patient: 'Пациент', therapist: 'Физиотерапевт', admin: 'Админ' }

function ThemeToggle() {
  const [theme, toggle] = useTheme()
  return (
    <button className="theme-toggle" onClick={toggle} title={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'} aria-label="Переключить тему">
      {theme === 'dark' ? '☀' : '☾'}
    </button>
  )
}

export default function App() {
  const [user, setUser] = useState<User | null>(null)
  const [booting, setBooting] = useState<boolean>(() => Boolean(getToken()))
  const [tab, setTab] = useState<Tab>('workouts')
  const [custom, setCustom] = useState<Workout[]>([])

  useEffect(() => {
    if (!getToken()) {
      setBooting(false)
      return
    }
    api.me()
      .then(async (u) => {
        if (u) {
          setUser(u)
          setTab(DEFAULT_TAB[u.role])
          const list = await api.workouts().catch(() => [])
          setCustom(list)
        }
      })
      .finally(() => setBooting(false))
  }, [])

  useEffect(() => {
    if (user && !allowed(tab, user.role)) setTab(DEFAULT_TAB[user.role])
  }, [user, tab])

  const logout = () => {
    api.logout()
    setUser(null)
    setCustom([])
    setTab('workouts')
  }

  const login = async (u: User) => {
    setUser(u)
    setTab(DEFAULT_TAB[u.role])
    const list = await api.workouts().catch(() => [])
    setCustom(list)
  }

  const acceptConsent = async () => {
    const updated = await api.acceptConsent()
    setUser(updated)
  }

  const revokeConsent = async () => {
    const updated = await api.revokeConsent()
    setUser(updated)
  }

  const saveProfile = async (profile: Profile) => {
    const updated = await api.saveProfile(profile)
    setUser(updated)
  }

  const createWorkout = async (w: Workout) => {
    const created = await api.createWorkout(w)
    setCustom((prev) => [created, ...prev])
    setTab('workouts')
  }

  const deleteWorkout = async (id: string) => {
    await api.deleteWorkout(id)
    setCustom((prev) => prev.filter((w) => w.id !== id))
  }

  if (booting) {
    return (
      <main className="auth">
        <Brand large />
        <p className="hint">Загружаем профиль…</p>
      </main>
    )
  }

  if (!user) return <Auth onAuth={login} />
  if (!user.consentAt) return <Consent onAccept={acceptConsent} onDecline={logout} />
  if (!user.profile && user.role === 'patient') return <Questionnaire first onSave={saveProfile} />

  const conditions = user.profile?.conditions ?? []

  return (
    <div className="shell">
      <header className="top">
        <Brand />
        <nav aria-label="Разделы">
          {TABS.filter((t) => t.roles.includes(user.role)).map((t) => (
            <button key={t.id} className={'nav' + (tab === t.id || (t.id === 'workouts' && tab === 'builder') ? ' active' : '')} onClick={() => setTab(t.id)}>{t.label}</button>
          ))}
        </nav>
        <span className="user-chip">
          <span className="role-badge">{ROLE_LABEL[user.role]}</span>
          <ThemeToggle />
          <button className="link" onClick={logout}>Выйти</button>
        </span>
      </header>
      <main className={'content' + (tab === 'builder' || tab === 'patients' || tab === 'admin' ? ' wide' : '')}>
        {tab === 'workouts' && (
          <WorkoutList user={user} custom={custom} conditions={conditions} onCreate={() => setTab('builder')} onDelete={deleteWorkout} />
        )}
        {tab === 'exercises' && <ExerciseList isAdmin={user.role === 'admin'} conditions={conditions} />}
        {tab === 'legends' && <Legends />}
        {tab === 'health' && user.profile && <Health user={user} />}
        {tab === 'chat' && <Chat user={user} />}
        {tab === 'patients' && <Therapist therapist={user} />}
        {tab === 'admin' && <Admin />}
        {tab === 'builder' && (
          <Builder conditions={conditions} onCancel={() => setTab('workouts')} onSave={createWorkout} />
        )}
        {tab === 'profile' && (
          <Questionnaire
            first={false}
            initial={user.profile}
            onSave={saveProfile}
            onRevoke={user.role === 'patient' ? revokeConsent : undefined}
          />
        )}
      </main>
    </div>
  )
}
