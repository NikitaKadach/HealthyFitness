import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { api } from './store'
import type { User, WeightEntry } from './types'

// Раздел «Здоровье»: ИМТ, норма калорий и КБЖУ, дневник веса и калоража с графиком.

function age(birth: string): number {
  const d = new Date(birth)
  const now = new Date()
  let a = now.getFullYear() - d.getFullYear()
  if (now < new Date(now.getFullYear(), d.getMonth(), d.getDate())) a--
  return a
}

// Формула Миффлина — Сан Жеора
function bmr(sex: 'male' | 'female', weight: number, height: number, ageY: number): number {
  return Math.round(10 * weight + 6.25 * height - 5 * ageY + (sex === 'male' ? 5 : -161))
}

const ACTIVITIES = [
  { id: '1.2', label: 'Малоподвижный образ жизни' },
  { id: '1.375', label: 'Лёгкая активность (1–3 раза в неделю)' },
  { id: '1.55', label: 'Средняя активность (3–5 раза в неделю)' },
  { id: '1.725', label: 'Высокая активность (6–7 раза в неделю)' },
]

function bmiCategory(bmi: number): { label: string; tone: 'danger' | 'ok' | 'warn' } {
  if (bmi < 18.5) return { label: 'Недостаточная масса тела', tone: 'warn' }
  if (bmi < 25) return { label: 'Норма', tone: 'ok' }
  if (bmi < 30) return { label: 'Избыточная масса тела', tone: 'warn' }
  return { label: 'Ожирение — обсудите план с врачом', tone: 'danger' }
}

function Goal({ entries }: { entries: WeightEntry[] }) {
  const start = entries[0]
  const last = entries[entries.length - 1]
  const diff = Math.round((last.weight - start.weight) * 10) / 10
  const text = diff === 0 ? 'вес стабилен' : diff > 0 ? `+${diff} кг с ${start.date}` : `${diff} кг с ${start.date}`
  return <p className="hint">Динамика: {text}. Записей: {entries.length}.</p>
}

function Chart({ entries }: { entries: WeightEntry[] }) {
  const W = 640, H = 220, P = { l: 44, r: 16, t: 14, b: 26 }
  const withKcal = entries.some((e) => e.kcal)
  const weights = entries.map((e) => e.weight)
  const kcals = withKcal ? entries.filter((e) => e.kcal).map((e) => e.kcal!) : []
  const wMin = Math.min(...weights), wMax = Math.max(...weights)
  const kMin = kcals.length ? Math.min(...kcals) : 0
  const kMax = kcals.length ? Math.max(...kcals) : 1
  const x = (i: number) => P.l + (entries.length === 1 ? (W - P.l - P.r) / 2 : (i / (entries.length - 1)) * (W - P.l - P.r))
  const yW = (w: number) => P.t + (1 - (w - wMin) / (wMax - wMin || 1)) * (H - P.t - P.b)
  const yK = (k: number) => P.t + (1 - (k - kMin) / (kMax - kMin || 1)) * (H - P.t - P.b)
  const path = entries.map((e, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${yW(e.weight).toFixed(1)}`).join(' ')
  const kPath = withKcal
    ? entries.filter((e) => e.kcal).map((e, i) => `${i === 0 ? 'M' : 'L'}${x(entries.indexOf(e)).toFixed(1)},${yK(e.kcal!).toFixed(1)}`).join(' ')
    : ''
  return (
    <div className="chart-wrap">
      <h2>Динамика веса{withKcal ? ' и калоража' : ''}</h2>
      <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="График изменения веса">
        <line className="axis" x1={P.l} y1={H - P.b} x2={W - P.r} y2={H - P.b} />
        <line className="axis" x1={P.l} y1={P.t} x2={P.l} y2={H - P.b} />
        <text x={P.l - 6} y={yW(wMax) + 3} textAnchor="end">{wMax}</text>
        <text x={P.l - 6} y={yW(wMin) + 3} textAnchor="end">{wMin}</text>
        <text x={P.l} y={H - 8}>{entries[0].date}</text>
        <text x={W - P.r} y={H - 8} textAnchor="end">{entries[entries.length - 1].date}</text>
        {withKcal && kcals.length > 0 && <text x={W - P.r} y={yK(kMax) + 3} textAnchor="end">{kMax} ккал</text>}
        {withKcal && kcals.length > 1 && <path className="line-kcal" d={kPath} />}
        <path className="line-weight" d={path} />
        {entries.map((e, i) => <circle key={e.date} className="dot" cx={x(i)} cy={yW(e.weight)} r="4"><title>{e.date}: {e.weight} кг{e.kcal ? `, ${e.kcal} ккал` : ''}</title></circle>)}
      </svg>
      <p className="legend-inline">
        <span><i style={{ background: 'var(--accent)' }} />вес, кг</span>
        {withKcal && <span><i style={{ background: 'var(--orange)' }} />калораж, ккал (пунктир)</span>}
      </p>
    </div>
  )
}

export default function Health({ user }: { user: User }) {
  const profile = user.profile!
  const [activity, setActivity] = useState('1.375')
  const [entries, setEntries] = useState<WeightEntry[]>([])
  useEffect(() => {
    api.weights().then(setEntries).catch(() => {})
  }, [user.id])
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [weight, setWeight] = useState('')
  const [kcal, setKcal] = useState('')
  const [error, setError] = useState('')

  const ageY = age(profile.birth)
  const bmi = profile.weight / Math.pow(profile.height / 100, 2)
  const cat = bmiCategory(bmi)
  const base = bmr(profile.sex, profile.weight, profile.height, ageY)
  const tdee = Math.round(base * Number(activity))
  // Цель из анкеты: похудение — дефицит 15%, набор — профицит 10%
  const goalText = profile.goal.toLowerCase()
  const deficit = goalText.includes('сниж') || goalText.includes('похуд') || goalText.includes('вес')
  const target = deficit ? Math.round(tdee * 0.85) : goalText.includes('масс') || goalText.includes('сил') ? Math.round(tdee * 1.1) : tdee
  // КБЖУ: белок 2 г/кг, жир 25% энергии, остальное — углеводы
  const proteinG = Math.round(profile.weight * 2)
  const fatG = Math.round((target * 0.25) / 9)
  const carbG = Math.round((target - proteinG * 4 - fatG * 9) / 4)

  const addEntry = async (e: FormEvent) => {
    e.preventDefault()
    const w = Number(weight)
    const k = kcal ? Number(kcal) : undefined
    if (!(w >= 30 && w <= 300)) return setError('Вес от 30 до 300 кг')
    if (k !== undefined && !(k >= 500 && k <= 8000)) return setError('Калораж от 500 до 8000 ккал')
    if (!date) return setError('Укажите дату')
    setError('')
    try {
      await api.addWeight({ date, weight: w, kcal: k })
      setEntries(await api.weights())
      setWeight(''); setKcal('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сохранить запись')
    }
  }

  const stats = useMemo(() => entries, [entries])

  return (
    <section>
      <h1>Здоровье</h1>
      <p className="hint">Расчёты ориентировочные и не заменяют консультацию врача или физиотерапевта.</p>

      <h2>Индекс массы тела</h2>
      <div className="cards">
        <div className="card">
          <p className="card-label">ИМТ</p>
          <p className="card-value accent">{bmi.toFixed(1)}</p>
          <p className="card-sub">{profile.height} см · {profile.weight} кг</p>
        </div>
        <div className="card">
          <p className="card-label">Оценка</p>
          <p className="card-value" style={{ fontSize: '1.05rem', lineHeight: 1.3 }}>{cat.label}</p>
          {cat.tone !== 'ok' && <p className="card-sub">Обсудите план нагрузки и питания с физиотерапевтом в чате.</p>}
        </div>
      </div>

      <h2>Калории и КБЖУ</h2>
      <label className="mini" style={{ marginBottom: '.75rem' }}>Уровень активности
        <select value={activity} onChange={(e) => setActivity(e.target.value)} style={{ flex: 1 }}>
          {ACTIVITIES.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
        </select>
      </label>
      <div className="cards">
        <div className="card">
          <p className="card-label">Метаболизм в покое</p>
          <p className="card-value">{base}</p>
          <p className="card-sub">ккал/день</p>
        </div>
        <div className="card">
          <p className="card-label">Поддержание веса</p>
          <p className="card-value">{tdee}</p>
          <p className="card-sub">ккал/день</p>
        </div>
        <div className="card">
          <p className="card-label">Целевой калораж</p>
          <p className="card-value accent">{target}</p>
          <p className="card-sub">ккал/день{deficit ? ' · с дефицитом' : ''}</p>
        </div>
      </div>
      <div className="cards">
        <div className="card"><p className="card-label">Белки</p><p className="card-value">{proteinG}<span style={{ fontSize: '.9rem' }}> г</span></p><p className="card-sub">{proteinG * 4} ккал</p></div>
        <div className="card"><p className="card-label">Жиры</p><p className="card-value">{fatG}<span style={{ fontSize: '.9rem' }}> г</span></p><p className="card-sub">{fatG * 9} ккал</p></div>
        <div className="card"><p className="card-label">Углеводы</p><p className="card-value">{carbG}<span style={{ fontSize: '.9rem' }}> г</span></p><p className="card-sub">{carbG * 4} ккал</p></div>
      </div>

      <h2>Дневник веса и калоража</h2>
      <form className="row" onSubmit={addEntry} style={{ marginBottom: '1rem' }}>
        <label className="mini">Дата
          <input type="date" value={date} max={new Date().toISOString().slice(0, 10)} onChange={(e) => setDate(e.target.value)} />
        </label>
        <label className="mini">Вес, кг
          <input inputMode="decimal" value={weight} placeholder="72.5" onChange={(e) => setWeight(e.target.value)} />
        </label>
        <label className="mini">Ккал (необяз.)
          <input inputMode="numeric" value={kcal} placeholder="2000" onChange={(e) => setKcal(e.target.value)} />
        </label>
        <button className="btn primary" type="submit">Записать</button>
      </form>
      {error && <p className="msg error" role="alert">{error}</p>}
      {stats.length === 0 ? (
        <p className="hint">Пока нет записей. Добавьте первый замер веса — здесь появится график прогресса.</p>
      ) : (
        <>
          <Goal entries={stats} />
          <Chart entries={stats} />
          <ul className="list">
            {[...stats].reverse().map((e) => (
              <li key={e.date}>
                <div className="list-row" style={{ cursor: 'default' }}>
                  <span className="name">{e.date}</span>
                  <span className="meta">{e.weight} кг{e.kcal ? ` · ${e.kcal} ккал` : ''}</span>
                  <button className="link danger-link" onClick={async () => { await api.removeWeight(e.date); setEntries(await api.weights()) }}>Удалить</button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}
