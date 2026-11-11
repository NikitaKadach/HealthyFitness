import Brand from './Brand'
import { useState } from 'react'
import Auth from './Auth'
import Consent from './Consent'
import Questionnaire from './Questionnaire'
import Legends from './Legends'
import { Builder, ExerciseList, WorkoutList } from './Workouts'
import { api } from './store'
import type { User, Workout } from './types'

type Tab = 'workouts' | 'exercises' | 'legends' | 'builder' | 'profile'
const TABS: { id: Exclude<Tab, 'builder'>; label: string }[] = [
  { id: 'workouts', label: 'Тренировки' },
  { id: 'exercises', label: 'Упражнения' },
  { id: 'legends', label: 'Золотая эра' },
  { id: 'profile', label: 'Анкета' },
]

export default function App() {
  const [user, setUser] = useState<User | null>(() => api.current())
  const [tab, setTab] = useState<Tab>('workouts')
  const [custom, setCustom] = useState<Workout[]>(() => {
    const u = api.current()
    return u ? api.workouts(u.id) : []
  })

  const update = (u: User) => { api.save(u); setUser(u) }
  const logout = () => { api.logout(); setUser(null); setTab('workouts') }
  const login = (u: User) => { setUser(u); setCustom(api.workouts(u.id)) }
  const saveCustom = (list: Workout[]) => { setCustom(list); if (user) api.saveWorkouts(user.id, list) }

  if (!user) return <Auth onAuth={login} />
  if (!user.consentAt) return <Consent onAccept={() => update({ ...user, consentAt: new Date().toISOString() })} onDecline={logout} />
  if (!user.profile) return <Questionnaire first onSave={(profile) => update({ ...user, profile })} />

  const conditions = user.profile.conditions

  return (
    <div className="shell">
      <header className="top">
        <Brand />
        <nav aria-label="Разделы">
          {TABS.map((t) => (
            <button key={t.id} className={'nav' + (tab === t.id || (t.id === 'workouts' && tab === 'builder') ? ' active' : '')} onClick={() => setTab(t.id)}>{t.label}</button>
          ))}
        </nav>
        <button className="link" onClick={logout}>Выйти</button>
      </header>
      <main className={'content' + (tab === 'builder' ? ' wide' : '')}>
        {tab === 'workouts' && (
          <WorkoutList custom={custom} conditions={conditions} onCreate={() => setTab('builder')} onDelete={(id) => saveCustom(custom.filter((w) => w.id !== id))} />
        )}
        {tab === 'exercises' && <ExerciseList conditions={conditions} />}
        {tab === 'legends' && <Legends />}
        {tab === 'builder' && (
          <Builder conditions={conditions} onCancel={() => setTab('workouts')} onSave={(w) => { saveCustom([w, ...custom]); setTab('workouts') }} />
        )}
        {tab === 'profile' && (
          <Questionnaire
            first={false}
            initial={user.profile}
            onSave={(profile) => update({ ...user, profile })}
            onRevoke={() => update({ ...user, consentAt: undefined, profile: undefined })}
          />
        )}
      </main>
    </div>
  )
}
