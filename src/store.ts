import type { Assignment, ChatMessage, CustomExercise, PatientComment, Profile, Role, User, WeightEntry, Workout } from './types'

export const API_BASE: string = 'http://localhost:5000'

const TOKEN_KEY = 'hf_token'
export const RESET_CODE = '123456'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers = new Headers(init.headers)
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers })

  if (res.status === 401) {
    setToken(null)
  }

  if (!res.ok) {
    let msg = `Ошибка сервера (${res.status})`
    try {
      const data = await res.json()
      if (data && typeof data.error === 'string') msg = data.error
    } catch {
      const txt = await res.text().catch(() => '')
      if (txt) msg = txt
    }
    throw new Error(msg)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export const api = {
  // --- Аутентификация и текущий пользователь ---
  async me(): Promise<User | null> {
    if (!getToken()) return null
    try {
      return await request<User>('/api/users/me')
    } catch {
      setToken(null)
      return null
    }
  },

  async register(email: string, password: string, role: Role = 'patient', name?: string): Promise<User> {
    const data = await request<{ token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, role, name: name?.trim() || undefined }),
    })
    setToken(data.token)
    return data.user
  },

  async login(email: string, password: string): Promise<User> {
    const data = await request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    setToken(data.token)
    return data.user
  },

  logout() {
    setToken(null)
  },

  async resetPassword(email: string, code: string, password: string): Promise<void> {
    await request<void>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, code, password }),
    })
  },

  // --- Согласие и анкета (профиль) ---
  async acceptConsent(): Promise<User> {
    return request<User>('/api/users/me/consent', { method: 'POST' })
  },

  async revokeConsent(): Promise<User> {
    return request<User>('/api/users/me/consent', { method: 'DELETE' })
  },

  async saveProfile(profile: Profile): Promise<User> {
    return request<User>('/api/users/me/profile', {
      method: 'PUT',
      body: JSON.stringify(profile),
    })
  },

  // --- Пользователи, пациенты и контакты ---
  async patients(): Promise<User[]> {
    return request<User[]>('/api/patients')
  },

  async contacts(): Promise<User[]> {
    return request<User[]>('/api/users/contacts')
  },

  async allUsers(): Promise<User[]> {
    return request<User[]>('/api/users')
  },

  async setUserRole(userId: string, role: Role): Promise<User> {
    return request<User>(`/api/users/${encodeURIComponent(userId)}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    })
  },

  // --- Тренировки ---
  async workouts(): Promise<Workout[]> {
    return request<Workout[]>('/api/workouts')
  },

  async createWorkout(workout: Omit<Workout, 'id'> | Workout): Promise<Workout> {
    return request<Workout>('/api/workouts', {
      method: 'POST',
      body: JSON.stringify(workout),
    })
  },

  async deleteWorkout(id: string): Promise<void> {
    await request<void>(`/api/workouts/${encodeURIComponent(id)}`, { method: 'DELETE' })
  },

  // --- Свои упражнения (админка) ---
  async customExercises(): Promise<CustomExercise[]> {
    return request<CustomExercise[]>('/api/custom-exercises')
  },

  async createCustomExercise(payload: {
    name: string
    bodyPart: string
    equipment: string
    target: string
    description: string
    videoUrl: string
  }): Promise<CustomExercise> {
    return request<CustomExercise>('/api/custom-exercises', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  async uploadExerciseVideo(file: File): Promise<string> {
    const fd = new FormData()
    fd.append('file', file)
    const data = await request<{ url: string }>('/api/custom-exercises/video', {
      method: 'POST',
      body: fd,
    })
    return data.url
  },

  async deleteCustomExercise(id: string): Promise<void> {
    await request<void>(`/api/custom-exercises/${encodeURIComponent(id)}`, { method: 'DELETE' })
  },

  // --- Назначения физиотерапевта ---
  async assignments(patientId?: string): Promise<Assignment[]> {
    const qs = patientId ? `?patientId=${encodeURIComponent(patientId)}` : ''
    return request<Assignment[]>(`/api/assignments${qs}`)
  },

  async assign(payload: { patientId: string; workout: Workout; comment?: string }): Promise<Assignment> {
    return request<Assignment>('/api/assignments', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  async unassign(id: string): Promise<void> {
    await request<void>(`/api/assignments/${encodeURIComponent(id)}`, { method: 'DELETE' })
  },

  // --- Комментарии физиотерапевта ---
  async comments(patientId: string): Promise<PatientComment[]> {
    return request<PatientComment[]>(`/api/patients/${encodeURIComponent(patientId)}/comments`)
  },

  async addComment(patientId: string, text: string): Promise<PatientComment> {
    return request<PatientComment>(`/api/patients/${encodeURIComponent(patientId)}/comments`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    })
  },

  async deleteComment(id: string): Promise<void> {
    await request<void>(`/api/comments/${encodeURIComponent(id)}`, { method: 'DELETE' })
  },

  // --- Чат ---
  async messages(otherId: string): Promise<ChatMessage[]> {
    return request<ChatMessage[]>(`/api/chat/${encodeURIComponent(otherId)}`)
  },

  async sendMessage(to: string, text: string): Promise<ChatMessage> {
    return request<ChatMessage>('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ to, text }),
    })
  },

  // --- Дневник веса и калоража ---
  async weights(): Promise<WeightEntry[]> {
    return request<WeightEntry[]>('/api/weights')
  },

  async addWeight(entry: WeightEntry): Promise<WeightEntry> {
    return request<WeightEntry>('/api/weights', {
      method: 'POST',
      body: JSON.stringify(entry),
    })
  },

  async removeWeight(date: string): Promise<void> {
    await request<void>(`/api/weights/${encodeURIComponent(date)}`, { method: 'DELETE' })
  },
}
