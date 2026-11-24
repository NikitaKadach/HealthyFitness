import { useEffect, useState, type FormEvent } from 'react'
import { api } from './store'
import type { CustomExercise } from './types'

const BODY_PARTS = ['back', 'chest', 'shoulders', 'upper arms', 'lower arms', 'upper legs', 'lower legs', 'waist', 'cardio']
const EQUIPMENT = ['body weight', 'dumbbell', 'barbell', 'cable', 'band', 'kettlebell', 'stability ball', 'leverage machine', 'smith machine', 'other']

export default function Admin() {
  const [list, setList] = useState<CustomExercise[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [bodyPart, setBodyPart] = useState(BODY_PARTS[0])
  const [equipment, setEquipment] = useState(EQUIPMENT[0])
  const [target, setTarget] = useState('')
  const [description, setDescription] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')

  const loadList = async () => {
    try {
      const items = await api.customExercises()
      setList(items)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить список упражнений')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadList()
  }, [])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError(''); setOk('')
    if (!name.trim()) return setError('Укажите название упражнения')
    if (!target.trim()) return setError('Укажите целевую мышцу')
    if (!description.trim()) return setError('Добавьте описание техники')
    if (!videoUrl.trim()) return setError('Добавьте ссылку на видео или загрузите файл')
    setBusy(true)
    try {
      const created = await api.createCustomExercise({
        name: name.trim(),
        bodyPart,
        equipment,
        target: target.trim(),
        description: description.trim(),
        videoUrl: videoUrl.trim(),
      })
      setList((prev) => [created, ...prev])
      setName(''); setTarget(''); setDescription(''); setVideoUrl('')
      setOk('Упражнение добавлено. Оно уже видно в разделе «Упражнения» у всех пользователей.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось добавить упражнение')
    } finally {
      setBusy(false)
    }
  }

  const onFile = async (f: File | null) => {
    if (!f) return
    if (f.size > 25 * 1024 * 1024) return setError('Файл больше 25 МБ — используйте ссылку на видео')
    setError(''); setOk('')
    setUploading(true)
    try {
      const url = await api.uploadExerciseVideo(f)
      setVideoUrl(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить файл')
    } finally {
      setUploading(false)
    }
  }

  const remove = async (id: string) => {
    setError(''); setOk('')
    try {
      await api.deleteCustomExercise(id)
      setList((prev) => prev.filter((e) => e.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось удалить упражнение')
    }
  }

  return (
    <section>
      <h1>База упражнений</h1>
      <p className="hint">Здесь администратор пополняет базу своими упражнениями: с собственным видео и описанием техники. Новые упражнения сразу появляются в общем каталоге.</p>

      <form className="panel wide" style={{ maxWidth: 'none', border: '1px solid var(--line)', borderRadius: 'var(--r)', padding: '1.25rem', background: 'var(--paper)', marginBottom: '1.5rem' }} onSubmit={submit}>
        <h2 style={{ marginTop: 0 }}>Новое упражнение</h2>
        <div className="grid">
          <label>Название
            <input value={name} maxLength={80} onChange={(e) => setName(e.target.value)} placeholder="Например: Диагональная планка" />
          </label>
          <label>Целевая мышца
            <input value={target} maxLength={80} onChange={(e) => setTarget(e.target.value)} placeholder="Например: косые мышцы живота" />
          </label>
          <label>Группа мышц
            <select value={bodyPart} onChange={(e) => setBodyPart(e.target.value)}>
              {BODY_PARTS.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </label>
          <label>Инвентарь
            <select value={equipment} onChange={(e) => setEquipment(e.target.value)}>
              {EQUIPMENT.map((q) => <option key={q} value={q}>{q}</option>)}
            </select>
          </label>
        </div>
        <label>Описание техники
          <textarea rows={4} maxLength={1000} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Пошагово: исходное положение, движение, дыхание, частые ошибки" />
        </label>
        <label>Видео — ссылка
          <input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://… (mp4/webm)" />
        </label>
        <label>…или загрузить файл на сервер (до 25 МБ)
          <input type="file" accept="video/*,.gif" disabled={uploading} onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
        </label>
        {uploading && <p className="hint">Загружаем видео на сервер…</p>}
        {videoUrl && !uploading && (
          <video className="ex-video" src={videoUrl} controls preload="metadata" />
        )}
        {error && <p className="msg error" role="alert">{error}</p>}
        {ok && <p className="msg" role="status">{ok}</p>}
        <button className="btn primary" type="submit" disabled={busy || uploading}>Добавить в базу</button>
      </form>

      <h2>Добавленные упражнения ({list.length})</h2>
      {loading ? <p className="hint">Загружаем список…</p> : list.length === 0 ? (
        <p className="hint">Своих упражнений пока нет — база состоит только из стандартного каталога.</p>
      ) : (
        <ul className="list">
          {list.map((ex) => (
            <li key={ex.id}>
              <div className="list-row" style={{ cursor: 'default' }}>
                <span className="name">{ex.name}</span>
                <span className="meta">{ex.bodyPart} · {ex.equipment}</span>
                <button className="link danger-link" onClick={() => remove(ex.id)}>Удалить</button>
              </div>
              <p className="detail" style={{ paddingBottom: '.6rem' }}>{ex.description}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
