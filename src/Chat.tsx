import { useEffect, useRef, useState, type FormEvent } from 'react'
import { api } from './store'
import type { ChatMessage, User } from './types'

const fmtTime = (iso: string) => new Date(iso).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

function Thread({ me, other }: { me: User; other: User }) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const logRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let active = true
    const load = () => {
      api.messages(other.id)
        .then((list) => { if (active) setMessages(list) })
        .catch(() => {})
    }
    load()
    const t = setInterval(load, 3000)
    return () => { active = false; clearInterval(t) }
  }, [me.id, other.id])

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight })
  }, [messages.length])

  const send = async (e: FormEvent) => {
    e.preventDefault()
    const t = text.trim()
    if (!t) return
    setError('')
    try {
      const msg = await api.sendMessage(other.id, t)
      setText('')
      setMessages((prev) => [...prev, msg])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось отправить сообщение')
    }
  }

  return (
    <div className="chat">
      <div className="chat-log" ref={logRef} aria-live="polite">
        {messages.length === 0 && <p className="chat-empty">Напишите первое сообщение — {other.name ?? other.email} ответит здесь.</p>}
        {messages.map((m) => (
          <div key={m.id} className={'bubble ' + (m.from === me.id ? 'mine' : 'theirs')}>
            {m.text}
            <span className="time">{fmtTime(m.createdAt)}</span>
          </div>
        ))}
      </div>
      {error && <p className="msg error" role="alert">{error}</p>}
      <form className="chat-form" onSubmit={send}>
        <input value={text} maxLength={1000} placeholder="Сообщение…" onChange={(e) => setText(e.target.value)} aria-label="Сообщение" />
        <button className="btn primary" type="submit">Отправить</button>
      </form>
    </div>
  )
}

export default function Chat({ user }: { user: User }) {
  const [candidates, setCandidates] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [otherId, setOtherId] = useState<string>('')

  useEffect(() => {
    api.contacts()
      .then(setCandidates)
      .catch(() => setCandidates([]))
      .finally(() => setLoading(false))
  }, [user.id])

  const other = candidates.find((u) => u.id === otherId) ?? candidates[0]

  if (loading) {
    return (
      <section>
        <h1>Чат</h1>
        <p className="hint">Загружаем контакты…</p>
      </section>
    )
  }

  if (candidates.length === 0) {
    return (
      <section>
        <h1>Чат</h1>
        <p className="hint">Пока нет собеседников: {user.role === 'therapist' ? 'в системе ещё нет пациентов' : 'физиотерапевт ещё не зарегистрирован'}.</p>
      </section>
    )
  }

  return (
    <section>
      <div className="head">
        <h1>Чат</h1>
        <label className="mini">{user.role === 'therapist' ? 'Пациент' : 'Физиотерапевт'}
          <select value={other?.id ?? ''} onChange={(e) => setOtherId(e.target.value)}>
            {candidates.map((u) => <option key={u.id} value={u.id}>{u.name ?? u.email}</option>)}
          </select>
        </label>
      </div>
      {other ? <Thread me={user} other={other} /> : null}
    </section>
  )
}
