import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { WORKOUTS } from './data'
import { LANGS, bodyPartLabel, equipmentLabel, mediaUrl, useExercises, useLang, useSteps } from './exercises'
import { hasRules, risks, unchecked } from './safety'
import type { Exercise, Lang, Workout, WorkoutItem } from './types'

const PAGE = 40

function Thumb({ e, size = 44 }: { e: Exercise; size?: number }) {
  return <img className="thumb" src={mediaUrl(e.image)} width={size} height={size} loading="lazy" alt="" />
}

function Flag({ e, conditions }: { e: Exercise; conditions: string[] }) {
  const r = risks(e, conditions)
  return r.length ? <span className="flag" title={`Может не подойти: ${r.join(', ')}`}>Осторожно</span> : null
}

function Notice({ conditions }: { conditions: string[] }) {
  if (conditions.length === 0) return null
  const other = unchecked(conditions)
  return (
    <div className="notice" role="note">
      <p>
        {hasRules(conditions)
          ? 'Упражнения, которые могут не подойти по вашей анкете, скрыты или помечены «Осторожно». '
          : ''}
        Перед началом занятий согласуйте нагрузку с врачом.
      </p>
      {other.length > 0 && <p className="hint">Для этих пунктов анкеты приложение не проверяет упражнения: {other.join(', ')}.</p>}
    </div>
  )
}

function Info({ e, lang, conditions }: { e: Exercise; lang: Lang; conditions: string[] }) {
  const steps = useSteps(lang)
  const list = steps?.[e.id]
  const r = risks(e, conditions)
  return (
    <div className="info">
      {r.length > 0 && <p className="warn">Может быть противопоказано: {r.join(', ')}. Согласуйте с врачом.</p>}
      <p className="meta-line">Целевая мышца: {e.target}{e.secondary.length > 0 && <>. Также работают: {e.secondary.join(', ')}</>}</p>
      {!list ? <p className="hint">Загружаем описание…</p> : (
        <ol>{list.map((s, i) => <li key={i}>{s}</li>)}</ol>
      )}
      <p className="hint">Медиа © Gym visual</p>
    </div>
  )
}

function Detail({ e, lang, conditions }: { e: Exercise; lang: Lang; conditions: string[] }) {
  return (
    <div className="detail exercise-detail">
      <img className="gif" src={mediaUrl(e.gif)} width={180} height={180} alt={`Анимация: ${e.name}`} />
      <Info e={e} lang={lang} conditions={conditions} />
    </div>
  )
}

function PickCard({ e, conditions, lang, open, onToggle, children }: {
  e: Exercise; conditions: string[]; lang: Lang; open: boolean; onToggle: () => void; children?: ReactNode
}) {
  return (
    <li className={'pick' + (open ? ' open' : '')}>
      <img className="pick-img" src={mediaUrl(open ? e.gif : e.image)} alt={open ? `Анимация: ${e.name}` : ''} loading="lazy" />
      <div className="pick-body">
        <div className="pick-title">
          <span className="name">{e.name}</span>
          <Flag e={e} conditions={conditions} />
        </div>
        <span className="meta">{bodyPartLabel(e.bodyPart)}, {equipmentLabel(e.equipment).toLowerCase()}</span>
        {open && <Info e={e} lang={lang} conditions={conditions} />}
        <div className="pick-actions">
          <button className="link" aria-expanded={open} onClick={onToggle}>{open ? 'Скрыть описание' : 'Описание'}</button>
          {children}
        </div>
      </div>
    </li>
  )
}

function useFilters(list: Exercise[] | null, conditions: string[]) {
  const [query, setQuery] = useState('')
  const [part, setPart] = useState('')
  const [equip, setEquip] = useState('')
  const [showRisky, setShowRisky] = useState(false)
  const parts = useMemo(() => Array.from(new Set((list ?? []).map((e) => e.bodyPart))).sort(), [list])
  const equips = useMemo(() => Array.from(new Set((list ?? []).map((e) => e.equipment))).sort(), [list])
  const { filtered, hidden } = useMemo(() => {
    const q = query.trim().toLowerCase()
    const base = (list ?? []).filter((e) => (!part || e.bodyPart === part) && (!equip || e.equipment === equip) && (!q || e.name.toLowerCase().includes(q)))
    const safe = base.filter((e) => risks(e, conditions).length === 0)
    return { filtered: showRisky ? base : safe, hidden: base.length - safe.length }
  }, [list, query, part, equip, showRisky, conditions])
  return { query, setQuery, part, setPart, equip, setEquip, showRisky, setShowRisky, parts, equips, filtered, hidden }
}
type F = ReturnType<typeof useFilters>

function Filters({ f, conditions }: { f: F; conditions: string[] }) {
  return (
    <>
      <div className="filters">
        <input className="search" placeholder="Поиск по названию (на английском)" value={f.query} onChange={(e) => f.setQuery(e.target.value)} />
        <select value={f.part} onChange={(e) => f.setPart(e.target.value)} aria-label="Группа мышц">
          <option value="">Все группы мышц</option>
          {f.parts.map((p) => <option key={p} value={p}>{bodyPartLabel(p)}</option>)}
        </select>
        <select value={f.equip} onChange={(e) => f.setEquip(e.target.value)} aria-label="Инвентарь">
          <option value="">Любой инвентарь</option>
          {f.equips.map((p) => <option key={p} value={p}>{equipmentLabel(p)}</option>)}
        </select>
      </div>
      {hasRules(conditions) && (
        <label className="check small-check">
          <input type="checkbox" checked={f.showRisky} onChange={(e) => f.setShowRisky(e.target.checked)} />
          Показывать упражнения, которые могут не подойти{!f.showRisky && f.hidden > 0 ? ` (скрыто: ${f.hidden})` : ''}
        </label>
      )}
    </>
  )
}

export function ExerciseList({ conditions }: { conditions: string[] }) {
  const { list, error } = useExercises()
  const [lang, setLang] = useLang()
  const f = useFilters(list, conditions)
  const [open, setOpen] = useState<string | null>(null)
  const [shown, setShown] = useState(PAGE)
  useEffect(() => setShown(PAGE), [f.query, f.part, f.equip, f.showRisky])

  if (error) return <p className="msg error" role="alert">{error}. Проверьте, что папка public/data на месте.</p>
  if (!list) return <p className="hint">Загружаем упражнения…</p>
  const page = f.filtered.slice(0, shown)

  return (
    <section>
      <div className="head">
        <h1>Упражнения</h1>
        <label className="mini">Язык описания
          <select value={lang} onChange={(e) => setLang(e.target.value as Lang)}>
            {LANGS.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
          </select>
        </label>
      </div>
      <Notice conditions={conditions} />
      <Filters f={f} conditions={conditions} />
      <p className="hint">Найдено: {f.filtered.length}</p>
      {f.filtered.length === 0 && <p className="hint">Ничего не найдено. Сбросьте фильтры или измените запрос.</p>}
      <ul className="list">
        {page.map((e) => (
          <li key={e.id}>
            <button className="list-row" aria-expanded={open === e.id} onClick={() => setOpen(open === e.id ? null : e.id)}>
              <Thumb e={e} />
              <span className="name">{e.name}</span>
              <Flag e={e} conditions={conditions} />
              <span className="meta">{bodyPartLabel(e.bodyPart)}, {equipmentLabel(e.equipment).toLowerCase()}</span>
            </button>
            {open === e.id && <Detail e={e} lang={lang} conditions={conditions} />}
          </li>
        ))}
      </ul>
      {shown < f.filtered.length && <button className="btn" onClick={() => setShown(shown + PAGE)}>Показать ещё</button>}
    </section>
  )
}

export function WorkoutList({ custom, conditions, onDelete, onCreate }: { custom: Workout[]; conditions: string[]; onDelete: (id: string) => void; onCreate: () => void }) {
  const { list } = useExercises()
  const [lang] = useLang()
  const [open, setOpen] = useState<string | null>(null)
  const [openEx, setOpenEx] = useState<string | null>(null)
  const byId = useMemo(() => new Map((list ?? []).map((e) => [e.id, e])), [list])
  const all = [...custom, ...WORKOUTS]
  const flagged = (w: Workout) => w.items.filter((it) => { const e = byId.get(it.exerciseId); return e && risks(e, conditions).length > 0 }).length
  return (
    <section>
      <div className="head">
        <h1>Тренировки</h1>
        <button className="btn primary" onClick={onCreate}>Создать тренировку</button>
      </div>
      <Notice conditions={conditions} />
      <ul className="list">
        {all.map((w) => {
          const n = flagged(w)
          return (
            <li key={w.id}>
              <button className="list-row" aria-expanded={open === w.id} onClick={() => setOpen(open === w.id ? null : w.id)}>
                <span className="name">{w.title}</span>
                {n > 0 && <span className="flag">Осторожно: {n}</span>}
                <span className="meta">{w.items.length} упр.{w.custom ? ', моя' : ''}</span>
              </button>
              {open === w.id && (
                <div className="detail">
                  {w.description && <p className="desc">{w.description}</p>}
                  {!list ? <p className="hint">Загружаем упражнения…</p> : (
                    <ul className="sub">
                      {w.items.map((it, i) => {
                        const e = byId.get(it.exerciseId)
                        const key = `${w.id}-${i}`
                        return (
                          <li key={key}>
                            <button className="list-row small" aria-expanded={openEx === key} onClick={() => setOpenEx(openEx === key ? null : key)}>
                              {e && <Thumb e={e} size={36} />}
                              <span className="name">{e?.name ?? 'Упражнение удалено'}</span>
                              {e && <Flag e={e} conditions={conditions} />}
                              <span className="meta">{it.sets}×{it.reps}</span>
                            </button>
                            {e && openEx === key && <Detail e={e} lang={lang} conditions={conditions} />}
                          </li>
                        )
                      })}
                    </ul>
                  )}
                  {w.custom && <button className="link danger-link" onClick={() => onDelete(w.id)}>Удалить тренировку</button>}
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export function Builder({ conditions, onSave, onCancel }: { conditions: string[]; onSave: (w: Workout) => void; onCancel: () => void }) {
  const { list, error } = useExercises()
  const f = useFilters(list, conditions)
  const [lang] = useLang()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [view, setView] = useState<string | null>(null)
  const [items, setItems] = useState<WorkoutItem[]>([])
  const [msg, setMsg] = useState('')
  const [ack, setAck] = useState(false)
  const [shown, setShown] = useState(PAGE)
  const box = useRef<HTMLDivElement>(null)
  const byId = useMemo(() => new Map((list ?? []).map((e) => [e.id, e])), [list])
  const inWorkout = useMemo(() => new Set(items.map((i) => i.exerciseId)), [items])

  useEffect(() => { setShown(PAGE); box.current?.scrollTo({ top: 0 }) }, [f.query, f.part, f.equip, f.showRisky])
  useEffect(() => { setAck(false) }, [items])

  const onScroll = () => {
    const el = box.current
    if (el && el.scrollTop + el.clientHeight >= el.scrollHeight - 240) setShown((s) => Math.min(s + PAGE, f.filtered.length))
  }
  const add = (id: string) => { setItems([...items, { exerciseId: id, sets: 3, reps: 10 }]); setMsg('') }
  const patch = (i: number, p: Partial<WorkoutItem>) => setItems(items.map((it, k) => (k === i ? { ...it, ...p } : it)))
  const move = (i: number, d: -1 | 1) => {
    const j = i + d
    if (j < 0 || j >= items.length) return
    const next = [...items]
    ;[next[i], next[j]] = [next[j], next[i]]
    setItems(next)
  }
  const num = (v: string) => Math.min(99, Math.max(1, Math.floor(Number(v)) || 1))

  function save() {
    if (!title.trim()) return setMsg('Дайте тренировке название')
    if (items.length === 0) return setMsg('Добавьте хотя бы одно упражнение')
    const risky = items.map((i) => byId.get(i.exerciseId)).filter((e): e is Exercise => !!e && risks(e, conditions).length > 0)
    if (risky.length > 0 && !ack) {
      setAck(true)
      return setMsg(`Эти упражнения могут не подойти по вашей анкете: ${risky.map((e) => e.name).join(', ')}. Нажмите «Сохранить тренировку» ещё раз, чтобы подтвердить, или уберите их.`)
    }
    onSave({ id: crypto.randomUUID(), title: title.trim(), description: description.trim() || undefined, items, custom: true })
  }

  return (
    <section>
      <h1>Новая тренировка</h1>
      <Notice conditions={conditions} />
      {error ? <p className="msg error" role="alert">{error}</p> : !list ? <p className="hint">Загружаем упражнения…</p> : (
        <div className="builder">
          <div className="pane">
            <h2>Все упражнения</h2>
            <Filters f={f} conditions={conditions} />
            <p className="hint">Найдено: {f.filtered.length}. Листайте список вниз.</p>
            <div className="picker" ref={box} onScroll={onScroll} tabIndex={0} aria-label="Список упражнений">
              {f.filtered.length === 0 && <p className="hint pad">Ничего не найдено. Измените запрос или фильтры.</p>}
              <ul className="list flush">
                {f.filtered.slice(0, shown).map((e) => (
                  <PickCard key={e.id} e={e} conditions={conditions} lang={lang} open={view === 'p' + e.id} onToggle={() => setView(view === 'p' + e.id ? null : 'p' + e.id)}>
                    <button className="btn" disabled={inWorkout.has(e.id)} onClick={() => add(e.id)}>{inWorkout.has(e.id) ? 'Добавлено' : 'Добавить'}</button>
                  </PickCard>
                ))}
              </ul>
            </div>
          </div>

          <div className="pane sticky">
            <h2>Тренировка</h2>
            <label>Название
              <input value={title} maxLength={60} onChange={(e) => setTitle(e.target.value)} placeholder="Например: Утро для спины" />
            </label>
            <label>Описание
              <textarea rows={3} value={description} maxLength={500} onChange={(e) => setDescription(e.target.value)} placeholder="Для чего эта тренировка и как часто её выполнять" />
            </label>
            {items.length === 0 ? (
              <p className="hint">Пока пусто. Нажмите «Добавить» у упражнения в списке слева.</p>
            ) : (
              <ul className="list">
                {items.map((it, i) => {
                  const e = byId.get(it.exerciseId)
                  if (!e) return null
                  return (
                    <PickCard key={it.exerciseId} e={e} conditions={conditions} lang={lang} open={view === 's' + e.id} onToggle={() => setView(view === 's' + e.id ? null : 's' + e.id)}>
                      <label className="mini">Подходы
                        <input inputMode="numeric" value={it.sets} onChange={(ev) => patch(i, { sets: num(ev.target.value) })} />
                      </label>
                      <label className="mini">Повторы
                        <input inputMode="numeric" value={it.reps} onChange={(ev) => patch(i, { reps: num(ev.target.value) })} />
                      </label>
                      <span className="tools">
                        <button className="icon" aria-label="Выше" onClick={() => move(i, -1)} disabled={i === 0}>↑</button>
                        <button className="icon" aria-label="Ниже" onClick={() => move(i, 1)} disabled={i === items.length - 1}>↓</button>
                        <button className="icon" aria-label="Убрать" onClick={() => setItems(items.filter((_, k) => k !== i))}>×</button>
                      </span>
                    </PickCard>
                  )
                })}
              </ul>
            )}
            {msg && <p className={'msg' + (ack ? ' warn' : ' error')} role="alert">{msg}</p>}
            <div className="row">
              <button className="btn primary" onClick={save}>Сохранить тренировку</button>
              <button className="btn" onClick={onCancel}>Отмена</button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
