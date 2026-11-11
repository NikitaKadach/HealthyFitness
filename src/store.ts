import type { User, Workout } from './types'

// Мок-слой вместо бэкенда: данные лежат в localStorage.
// При подключении сервера заменить тела функций на fetch-запросы, сигнатуры оставить.
const K = { users: 'hf_users', session: 'hf_session', workouts: (id: string) => `hf_workouts_${id}` }

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}
const write = (key: string, value: unknown) => localStorage.setItem(key, JSON.stringify(value))

async function hash(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

export const RESET_CODE = '123456' // демо-код восстановления

export const api = {
  current(): User | null {
    const id = localStorage.getItem(K.session)
    return read<User[]>(K.users, []).find((u) => u.id === id) ?? null
  },
  async register(email: string, password: string): Promise<User> {
    const users = read<User[]>(K.users, [])
    if (users.some((u) => u.email === email.toLowerCase())) throw new Error('Аккаунт с такой почтой уже есть')
    const user: User = { id: crypto.randomUUID(), email: email.toLowerCase(), hash: await hash(password) }
    write(K.users, [...users, user])
    localStorage.setItem(K.session, user.id)
    return user
  },
  async login(email: string, password: string): Promise<User> {
    const user = read<User[]>(K.users, []).find((u) => u.email === email.toLowerCase())
    if (!user || user.hash !== (await hash(password))) throw new Error('Неверная почта или пароль')
    localStorage.setItem(K.session, user.id)
    return user
  },
  logout() {
    localStorage.removeItem(K.session)
  },
  async resetPassword(email: string, code: string, password: string): Promise<void> {
    if (code !== RESET_CODE) throw new Error('Неверный код')
    const users = read<User[]>(K.users, [])
    const idx = users.findIndex((u) => u.email === email.toLowerCase())
    if (idx < 0) throw new Error('Аккаунт не найден')
    users[idx] = { ...users[idx], hash: await hash(password) }
    write(K.users, users)
  },
  save(user: User) {
    write(K.users, read<User[]>(K.users, []).map((u) => (u.id === user.id ? user : u)))
  },
  workouts(userId: string): Workout[] {
    return read<Workout[]>(K.workouts(userId), [])
  },
  saveWorkouts(userId: string, list: Workout[]) {
    write(K.workouts(userId), list)
  },
}
