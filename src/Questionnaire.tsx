import Brand from './Brand'
import { useState, type FormEvent } from 'react'
import { CONDITIONS, GOALS } from './data'
import type { Profile, Sex } from './types'

export default function Questionnaire({ initial, first, onSave, onRevoke }: {
  initial?: Profile
  first: boolean
  onSave: (p: Profile) => void
  onRevoke?: () => void
}) {
  const [height, setHeight] = useState(initial ? String(initial.height) : '')
  const [weight, setWeight] = useState(initial ? String(initial.weight) : '')
  const [sex, setSex] = useState<Sex | ''>(initial?.sex ?? '')
  const [birth, setBirth] = useState(initial?.birth ?? '')
  const [conditions, setConditions] = useState<string[]>(initial?.conditions ?? [])
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [goal, setGoal] = useState(initial?.goal ?? '')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saved, setSaved] = useState(false)

  const toggle = (c: string) =>
    setConditions((cur) => (cur.includes(c) ? cur.filter((x) => x !== c) : [...cur, c]))

  function submit(e: FormEvent) {
    e.preventDefault()
    const err: Record<string, string> = {}
    const h = Number(height), w = Number(weight)
    if (!(h >= 100 && h <= 250)) err.height = 'Рост от 100 до 250 см'
    if (!(w >= 30 && w <= 300)) err.weight = 'Вес от 30 до 300 кг'
    if (!sex) err.sex = 'Выберите пол'
    if (!birth || new Date(birth) > new Date() || new Date(birth).getFullYear() < 1900) err.birth = 'Укажите корректную дату'
    if (!goal) err.goal = 'Выберите цель'
    setErrors(err)
    if (Object.keys(err).length) return
    onSave({ height: h, weight: w, sex: sex as Sex, birth, conditions, notes: notes.trim(), goal })
    setSaved(true)
  }

  return (
    <main className={first ? 'auth' : ''}>
      {first && <Brand large />}
      <form className="panel wide" onSubmit={submit} noValidate>
        <h1>{first ? 'Расскажите о себе' : 'Анкета здоровья'}</h1>
        {first && <p>Анкета обязательна: без неё мы не сможем подобрать безопасные тренировки.</p>}

        <fieldset>
          <legend>Основное</legend>
          <div className="grid">
            <label>Рост, см
              <input inputMode="numeric" value={height} onChange={(e) => setHeight(e.target.value)} />
              {errors.height && <span className="field-error">{errors.height}</span>}
            </label>
            <label>Вес, кг
              <input inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} />
              {errors.weight && <span className="field-error">{errors.weight}</span>}
            </label>
            <label>Пол
              <select value={sex} onChange={(e) => setSex(e.target.value as Sex | '')}>
                <option value="">Выберите</option>
                <option value="female">Женский</option>
                <option value="male">Мужской</option>
              </select>
              {errors.sex && <span className="field-error">{errors.sex}</span>}
            </label>
            <label>Дата рождения
              <input type="date" value={birth} max={new Date().toISOString().slice(0, 10)} onChange={(e) => setBirth(e.target.value)} />
              {errors.birth && <span className="field-error">{errors.birth}</span>}
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend>Заболевания, травмы, операции, боли</legend>
          <p className="hint">Отметьте всё, что относится к вам. Если ничего нет — оставьте пустым.</p>
          {CONDITIONS.map((g) => (
            <div key={g.group} className="group">
              <div className="group-title">{g.group}</div>
              <div className="chips">
                {g.items.map((c) => (
                  <button type="button" key={c} className={'chip' + (conditions.includes(c) ? ' on' : '')} aria-pressed={conditions.includes(c)} onClick={() => toggle(c)}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </fieldset>

        <fieldset>
          <legend>Жалобы и пожелания</legend>
          <label>
            <textarea rows={4} value={notes} maxLength={1000} placeholder="Например: болит поясница после долгого сидения, хочу заниматься дома" onChange={(e) => setNotes(e.target.value)} />
          </label>
        </fieldset>

        <fieldset>
          <legend>Цель программы</legend>
          <div className="chips">
            {GOALS.map((g) => (
              <button type="button" key={g} className={'chip' + (goal === g ? ' on' : '')} aria-pressed={goal === g} onClick={() => setGoal(g)}>{g}</button>
            ))}
          </div>
          {errors.goal && <span className="field-error">{errors.goal}</span>}
        </fieldset>

        <div className="row">
          <button className="btn primary">{first ? 'Сохранить и продолжить' : 'Сохранить изменения'}</button>
          {saved && !first && <span className="msg" role="status">Сохранено</span>}
        </div>

        {!first && onRevoke && (
          <div className="danger-zone">
            <p className="hint">Отзыв согласия удалит анкету. Чтобы пользоваться приложением дальше, согласие придётся дать заново.</p>
            <button type="button" className="btn danger" onClick={onRevoke}>Отозвать согласие и удалить анкету</button>
          </div>
        )}
      </form>
    </main>
  )
}
