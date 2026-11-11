import Brand from './Brand'
import { useState, type FormEvent } from 'react'
import { api, RESET_CODE } from './store'
import type { User } from './types'

type Mode = 'login' | 'register' | 'recover'
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Auth({ onAuth }: { onAuth: (u: User) => void }) {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeat, setRepeat] = useState('')
  const [code, setCode] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState(false)

  const go = (m: Mode) => { setMode(m); setError(''); setInfo(''); setCodeSent(false); setPassword(''); setRepeat(''); setCode('') }

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError(''); setInfo('')
    if (!EMAIL_RE.test(email)) return setError('Введите корректную почту')
    if (mode === 'recover' && !codeSent) {
      setCodeSent(true)
      return setInfo(`Код отправлен на ${email}. В демо-версии используйте ${RESET_CODE}.`)
    }
    if (password.length < 8) return setError('Пароль — не короче 8 символов')
    if (mode !== 'login' && password !== repeat) return setError('Пароли не совпадают')
    setBusy(true)
    try {
      if (mode === 'login') onAuth(await api.login(email, password))
      else if (mode === 'register') onAuth(await api.register(email, password))
      else {
        await api.resetPassword(email, code, password)
        go('login')
        setInfo('Пароль изменён. Войдите с новым паролем.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Что-то пошло не так')
    } finally {
      setBusy(false)
    }
  }

  const title = { login: 'Вход', register: 'Регистрация', recover: 'Восстановление пароля' }[mode]

  return (
    <main className="auth">
      <Brand large />
      <p className="tagline">Движение, которое подходит именно вам</p>
      <form className="panel" onSubmit={submit} noValidate>
        <h1>{title}</h1>
        <label>Почта
          <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={mode === 'recover' && codeSent} />
        </label>
        {mode === 'recover' && codeSent && (
          <label>Код из письма
            <input inputMode="numeric" value={code} onChange={(e) => setCode(e.target.value)} />
          </label>
        )}
        {(mode !== 'recover' || codeSent) && (
          <label>{mode === 'recover' ? 'Новый пароль' : 'Пароль'}
            <input type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
        )}
        {mode !== 'login' && (mode === 'register' || codeSent) && (
          <label>Повторите пароль
            <input type="password" autoComplete="new-password" value={repeat} onChange={(e) => setRepeat(e.target.value)} />
          </label>
        )}
        {error && <p className="msg error" role="alert">{error}</p>}
        {info && <p className="msg" role="status">{info}</p>}
        <button className="btn primary" disabled={busy}>
          {mode === 'login' ? 'Войти' : mode === 'register' ? 'Создать аккаунт' : codeSent ? 'Сменить пароль' : 'Получить код'}
        </button>
        <div className="links">
          {mode === 'login' && <>
            <button type="button" className="link" onClick={() => go('register')}>Создать аккаунт</button>
            <button type="button" className="link" onClick={() => go('recover')}>Забыли пароль?</button>
          </>}
          {mode !== 'login' && <button type="button" className="link" onClick={() => go('login')}>Назад ко входу</button>}
        </div>
      </form>
    </main>
  )
}
