import { useEffect, useState, type FormEvent } from 'react'
import { WORKOUTS } from './data'
import { api } from './store'
import type { Assignment, PatientComment, User, Workout } from './types'

const fmt = (iso: string) => new Date(iso).toLocaleString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })

function AssignForm({ customWorkouts, patientId, onAssigned }: { customWorkouts: Workout[]; patientId: string; onAssigned: (a: Assignment) => void }) {
  const library = [...customWorkouts, ...WORKOUTS]
  const [workoutId, setWorkoutId] = useState(library[0]?.id ?? '')
  const [comment, setComment] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const workout = library.find((w) => w.id === workoutId)

  useEffect(() => {
    if (!library.some((w) => w.id === workoutId) && library[0]) {
      setWorkoutId(library[0].id)
    }
  }, [customWorkouts.length])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!workout) return
    setError('')
    setBusy(true)
    try {
      const created = await api.assign({
        patientId,
        workout,
        comment: comment.trim() || undefined,
      })
      setComment('')
      onAssigned(created)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось назначить тренировку')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="panel" style={{ maxWidth: 'none', border: '1px solid var(--line)', borderRadius: 'var(--r)', padding: '1rem', background: 'var(--paper)' }} onSubmit={submit}>
      <h2 style={{ margin: 0 }}>Назначить тренировку</h2>
      <label>Тренировка
        <select value={workoutId} onChange={(e) => setWorkoutId(e.target.value)}>
          {customWorkouts.length > 0 && <optgroup label="Мои тренировки">{customWorkouts.map((w) => <option key={w.id} value={w.id}>{w.title}</option>)}</optgroup>}
          <optgroup label="Готовые программы">{WORKOUTS.map((w) => <option key={w.id} value={w.id}>{w.title}</option>)}</optgroup>
        </select>
      </label>
      <label>Комментарий пациенту (необязательно)
        <textarea rows={2} maxLength={500} value={comment} placeholder="Например: начните с 2 подходов, следите за пульсом" onChange={(e) => setComment(e.target.value)} />
      </label>
      {error && <p className="msg error" role="alert">{error}</p>}
      <button className="btn primary" type="submit" disabled={!workout || busy}>Назначить</button>
    </form>
  )
}

function PatientView({ customWorkouts, patient }: { customWorkouts: Workout[]; patient: User }) {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [comments, setComments] = useState<PatientComment[]>([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    Promise.all([api.assignments(patient.id), api.comments(patient.id)])
      .then(([aList, cList]) => {
        if (!active) return
        setAssignments(aList)
        setComments(cList)
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : 'Не удалось загрузить данные пациента')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [patient.id])

  const addComment = async (e: FormEvent) => {
    e.preventDefault()
    const t = text.trim()
    if (!t) return
    setError('')
    try {
      const created = await api.addComment(patient.id, t)
      setComments((prev) => [...prev, created])
      setText('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось добавить комментарий')
    }
  }

  const removeAssignment = async (id: string) => {
    setError('')
    try {
      await api.unassign(id)
      setAssignments((prev) => prev.filter((a) => a.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось отменить назначение')
    }
  }

  const removeComment = async (id: string) => {
    setError('')
    try {
      await api.deleteComment(id)
      setComments((prev) => prev.filter((c) => c.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось удалить комментарий')
    }
  }

  const p = patient.profile

  return (
    <div className="patient-view">
      <div className="head">
        <h1 style={{ fontSize: '1.5rem' }}>{patient.name ?? patient.email}</h1>
        <a className="link" href={`mailto:${patient.email}`}>{patient.email}</a>
      </div>

      <div className="notice" role="note">
        <p><strong>Анкета</strong>{p ? '' : ' не заполнена пациентом'}</p>
        {p && (
          <>
            <p>{p.sex === 'male' ? 'Мужской' : 'Женский'} пол · {p.height} см · {p.weight} кг · род. {p.birth}</p>
            <p>Цель: {p.goal || 'не указана'}</p>
            {p.conditions.length > 0 && <p>Противопоказания и особенности: {p.conditions.join('; ')}</p>}
            {p.notes && <p>Жалобы и пожелания: {p.notes}</p>}
          </>
        )}
      </div>

      <AssignForm
        customWorkouts={customWorkouts}
        patientId={patient.id}
        onAssigned={(a) => setAssignments((prev) => [a, ...prev])}
      />

      {error && <p className="msg error" role="alert">{error}</p>}

      <div>
        <h2>Назначенные тренировки</h2>
        {loading ? <p className="hint">Загружаем…</p> : assignments.length === 0 ? (
          <p className="hint">Пациенту пока ничего не назначено.</p>
        ) : (
          <ul className="list">
            {assignments.map((a) => (
              <li key={a.id}>
                <div className="list-row" style={{ cursor: 'default' }}>
                  <span className="name">{a.workout.title}</span>
                  <span className="meta">{a.workout.items.length} упр. · {fmt(a.createdAt)}</span>
                  <button className="link danger-link" onClick={() => removeAssignment(a.id)}>Отменить</button>
                </div>
                {a.comment && <p className="detail" style={{ paddingBottom: '.6rem' }}>Комментарий: {a.comment}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2>Комментарии</h2>
        <form className="row" style={{ marginBottom: '.75rem' }} onSubmit={addComment}>
          <input style={{ flex: 1 }} value={text} maxLength={500} placeholder="Новый комментарий (виден только вам)" onChange={(e) => setText(e.target.value)} />
          <button className="btn" type="submit">Добавить</button>
        </form>
        {loading ? <p className="hint">Загружаем…</p> : comments.length === 0 ? (
          <p className="hint">Комментариев нет. Здесь удобно фиксировать наблюдения по пациенту.</p>
        ) : (
          comments.map((c) => (
            <div className="comment-item" key={c.id}>
              <p className="desc" style={{ margin: 0 }}>{c.text}</p>
              <div className="meta">
                <span>{fmt(c.createdAt)}</span>
                <button className="link danger-link" onClick={() => removeComment(c.id)}>Удалить</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default function Therapist({ therapist: _therapist }: { therapist: User }) {
  const [patients, setPatients] = useState<User[]>([])
  const [customWorkouts, setCustomWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedId, setSelectedId] = useState<string>('')

  useEffect(() => {
    Promise.all([api.patients(), api.workouts()])
      .then(([pList, wList]) => {
        setPatients(pList)
        setCustomWorkouts(wList)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Не удалось загрузить список пациентов'))
      .finally(() => setLoading(false))
  }, [])

  const patient = patients.find((u) => u.id === selectedId) ?? patients[0]

  return (
    <section>
      <h1>Мои пациенты</h1>
      {error && <p className="msg error" role="alert">{error}</p>}
      {loading ? (
        <p className="hint">Загружаем пациентов…</p>
      ) : patients.length === 0 ? (
        <p className="hint">В системе пока нет пациентов. Как только кто-то зарегистрируется с ролью «Пациент», он появится в этом списке.</p>
      ) : (
        <div className="two-col">
          <aside className="side-list">
            <ul className="list">
              {patients.map((u) => (
                <li key={u.id}>
                  <button className={'list-row' + (patient?.id === u.id ? ' active' : '')} onClick={() => setSelectedId(u.id)}>
                    <span className="name">{u.name ?? u.email}</span>
                    <span className="meta">{u.profile ? 'анкета ✓' : 'анкета —'}</span>
                  </button>
                </li>
              ))}
            </ul>
          </aside>
          {patient && <PatientView customWorkouts={customWorkouts} patient={patient} />}
        </div>
      )}
    </section>
  )
}
