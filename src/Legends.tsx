import { useState } from 'react'

interface LegendMove { name: string; sets: string }
interface Legend { slug: string; name: string; years: string; titles: string; note: string; workout: LegendMove[] }

// Программы приведены в популярных изданиях об эпохе («Золотая эра»).
// Это объёмы для профессиональных атлетов — не руководство к действию.
const LEGENDS: Legend[] = [
  {
    slug: 'steve-reeves', name: 'Стив Ривз', years: '1926–2000', titles: 'Mr. America 1947, Mr. Universe 1950',
    note: 'Эталон классических пропорций: широкие плечи, узкая талия. Позже сыграл Геракла в фильме 1958 года.',
    workout: [
      { name: 'Приседания со штангой', sets: '3×8–10' },
      { name: 'Жим ногами / выпады', sets: '3×10' },
      { name: 'Жим штанги лёжа', sets: '3×8' },
      { name: 'Тяга штанги в наклоне', sets: '3×8' },
      { name: 'Подъём штанги на бицепс', sets: '3×8–10' },
      { name: 'Подъёмы ног в висе', sets: '3×15' },
    ],
  },
  {
    slug: 'reg-park', name: 'Рег Парк', years: '1928–2007', titles: 'Mr. Universe 1951, 1958, 1965',
    note: 'Ставил на силу и массу через тяжёлые базовые движения. Был наставником молодого Арнольда.',
    workout: [
      { name: 'Приседания', sets: '5×5' },
      { name: 'Жим лёжа', sets: '5×5' },
      { name: 'Становая тяга', sets: '5×5' },
      { name: 'Жим стоя (армейский)', sets: '4×6' },
      { name: 'Тяга штанги к поясу', sets: '4×8' },
    ],
  },
  {
    slug: 'bill-pearl', name: 'Билл Перл', years: '1930–2022', titles: 'Mr. America 1953, многократный Mr. Universe',
    note: 'Объединял массу с атлетичностью и десятилетиями делился своими методиками тренировок.',
    workout: [
      { name: 'Жим ногами', sets: '4×12' },
      { name: 'Разгибания ног', sets: '4×12' },
      { name: 'Жим штанги лёжа узким хватом', sets: '4×10' },
      { name: 'Отжимания на брусьях', sets: '4×10–12' },
      { name: 'Разводка гантелей лёжа', sets: '3×12' },
      { name: 'Планка', sets: '3×60 сек' },
    ],
  },
  {
    slug: 'larry-scott', name: 'Ларри Скотт', years: '1938–2014', titles: 'Первый Mr. Olympia: 1965 и 1966',
    note: 'Именно его именем названа скамья Скотта, на которой делают подъём на бицепс.',
    workout: [
      { name: 'Подъём на бицепс на скамье Скотта', sets: '4×8' },
      { name: 'Молотки с гантелями', sets: '3×10' },
      { name: 'Жим гантелей сидя', sets: '4×8' },
      { name: 'Махи гантелями в стороны', sets: '4×12' },
      { name: 'Французский жим', sets: '3×10' },
    ],
  },
  {
    slug: 'sergio-oliva', name: 'Серхио Олива', years: '1941–2012', titles: 'Mr. Olympia 1967, 1968, 1969',
    note: 'Прозвище «Миф». Считался образцом мощи и пропорций своей эпохи.',
    workout: [
      { name: 'Жим ногами', sets: '4×15' },
      { name: 'Сгибания ног лёжа', sets: '4×12' },
      { name: 'Икры стоя', sets: '5×15' },
      { name: 'Скручивания', sets: '4×25' },
      { name: 'Боковые наклоны с гантелей', sets: '4×15' },
    ],
  },
  {
    slug: 'arnold-schwarzenegger', name: 'Арнольд Шварценеггер', years: 'род. 1947', titles: 'Mr. Olympia 1970–1975 и 1980',
    note: 'Семикратный Mr. Olympia, который сделал бодибилдинг массовым, а потом стал актёром.',
    workout: [
      { name: 'Подтягивания широким хватом', sets: '4×10' },
      { name: 'Тяга штанги в наклоне', sets: '4×10' },
      { name: 'Тяга вертикального блока', sets: '4×10' },
      { name: 'Тяга горизонтального блока', sets: '4×10' },
      { name: 'Становая тяга на прямых ногах', sets: '4×10' },
      { name: 'Подъёмы на бицепс со штангой', sets: '4×10' },
    ],
  },
  {
    slug: 'frank-zane', name: 'Фрэнк Зейн', years: 'род. 1942', titles: 'Mr. Olympia 1977, 1978, 1979',
    note: 'Выигрывал не массой, а симметрией и эстетикой. Образец «изящного» бодибилдинга.',
    workout: [
      { name: 'Наклоны с штангой (гуд-морнинг)', sets: '3×10' },
      { name: 'Подтягивания', sets: '4×10' },
      { name: 'Жим штанги лёжа', sets: '4×8' },
      { name: 'Отжимания на брусьях', sets: '3×10' },
      { name: 'Приседания со штангой', sets: '4×10' },
      { name: 'Подъёмы на икры', sets: '5×15' },
    ],
  },
  {
    slug: 'franco-columbu', name: 'Франко Колумбу', years: '1941–2019', titles: 'Mr. Olympia 1976 и 1981',
    note: 'Бодибилдер и силач с Сардинии: при небольшом росте поднимал очень серьёзные веса.',
    workout: [
      { name: 'Становая тяга', sets: '5×3–5' },
      { name: 'Приседания', sets: '5×5' },
      { name: 'Жим лёжа', sets: '4×6' },
      { name: 'Тяга к подбородку', sets: '4×6' },
      { name: 'Подъёмы на бицепс со штангой', sets: '4×8' },
    ],
  },
]

function Figure() {
  return (
    <svg viewBox="0 0 100 120" className="figure" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M30 52 L13 44 L19 22" />
        <path d="M70 52 L87 44 L81 22" />
        <path d="M42 92 L40 114" />
        <path d="M58 92 L60 114" />
      </g>
      <circle cx="50" cy="22" r="11" fill="currentColor" />
      <path d="M30 42 H70 L62 94 H38 Z" fill="currentColor" />
    </svg>
  )
}

function Card({ p }: { p: Legend }) {
  const [broken, setBroken] = useState(false)
  const [open, setOpen] = useState(false)
  return (
    <li>
      <button className="legend" style={{ width: '100%' }} aria-expanded={open} onClick={() => setOpen(!open)}>
        <div className="legend-media">
          {!broken && <img src={`/legends/${p.slug}.jpg`} alt={p.name} loading="lazy" onError={() => setBroken(true)} />}
          {broken && <Figure />}
        </div>
        <div className="legend-body">
          <h3>{p.name}</h3>
          <p className="meta">{p.years}</p>
          <p className="titles">{p.titles}</p>
          <p>{p.note}</p>
          {open && (
            <div className="legend-workout">
              <p className="warn">Программа профессионального атлета — не повторять без опыта и врача!</p>
              <table>
                <tbody>
                  {p.workout.map((m) => (
                    <tr key={m.name}><td>{m.name}</td><td>{m.sets}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="hint" style={{ marginTop: '.4rem' }}>{open ? 'Скрыть программу ↑' : 'Показать программу тренировок ↓'}</p>
        </div>
      </button>
    </li>
  )
}

export default function Legends() {
  return (
    <section>
      <h1>Золотая эра</h1>
      <p>Так называют период примерно с 1950-х до начала 1980-х, когда бодибилдинг строился на классических пропорциях, базовых упражнениях и работе в обычных залах.</p>
      <div className="notice" role="note">
        <p>Нажмите на карточку легенды, чтобы увидеть программу, по которой он тренировался. Эти объёмы рассчитаны на профессиональных атлетов: для реабилитации и при травмах ориентируйтесь на свою анкету и врача, а не на эти программы.</p>
      </div>
      <ul className="legends">{LEGENDS.map((p) => <Card key={p.slug} p={p} />)}</ul>
    </section>
  )
}
