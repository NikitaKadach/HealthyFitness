import { useState } from 'react'

interface Legend { slug: string; name: string; years: string; titles: string; note: string }

const LEGENDS: Legend[] = [
  { slug: 'steve-reeves', name: 'Стив Ривз', years: '1926–2000', titles: 'Mr. America 1947, Mr. Universe 1950', note: 'Эталон классических пропорций: широкие плечи, узкая талия. Позже сыграл Геракла в фильме 1958 года.' },
  { slug: 'reg-park', name: 'Рег Парк', years: '1928–2007', titles: 'Mr. Universe 1951, 1958, 1965', note: 'Ставил на силу и массу через тяжёлые базовые движения. Был наставником молодого Арнольда.' },
  { slug: 'bill-pearl', name: 'Билл Перл', years: '1930–2022', titles: 'Mr. America 1953, многократный Mr. Universe', note: 'Объединял массу с атлетичностью и десятилетиями делился своими методиками тренировок.' },
  { slug: 'larry-scott', name: 'Ларри Скотт', years: '1938–2014', titles: 'Первый Mr. Olympia: 1965 и 1966', note: 'Именно его именем названа скамья Скотта, на которой делают подъём на бицепс.' },
  { slug: 'sergio-oliva', name: 'Серхио Олива', years: '1941–2012', titles: 'Mr. Olympia 1967, 1968, 1969', note: 'Прозвище «Миф». Считался образцом мощи и пропорций своей эпохи.' },
  { slug: 'arnold-schwarzenegger', name: 'Арнольд Шварценеггер', years: 'род. 1947', titles: 'Mr. Olympia 1970–1975 и 1980', note: 'Семикратный Mr. Olympia, который сделал бодибилдинг массовым, а потом стал актёром.' },
  { slug: 'frank-zane', name: 'Фрэнк Зейн', years: 'род. 1942', titles: 'Mr. Olympia 1977, 1978, 1979', note: 'Выигрывал не массой, а симметрией и эстетикой. Образец «изящного» бодибилдинга.' },
  { slug: 'franco-columbu', name: 'Франко Колумбу', years: '1941–2019', titles: 'Mr. Olympia 1976 и 1981', note: 'Бодибилдер и силач с Сардинии: при небольшом росте поднимал очень серьёзные веса.' },
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
  return (
    <li className="legend">
      <div className="legend-media">
        {!broken && <img src={`/legends/${p.slug}.jpg`} alt={p.name} loading="lazy" onError={() => setBroken(true)} />}
        {broken && <Figure />}
      </div>
      <div className="legend-body">
        <h3>{p.name}</h3>
        <p className="meta">{p.years}</p>
        <p className="titles">{p.titles}</p>
        <p>{p.note}</p>
      </div>
    </li>
  )
}

export default function Legends() {
  return (
    <section>
      <h1>Золотая эра</h1>
      <p>Так называют период примерно с 1950-х до начала 1980-х, когда бодибилдинг строился на классических пропорциях, базовых упражнениях и работе в обычных залах.</p>
      <p className="hint">Их тренировки были очень объёмными. Для реабилитации и при травмах ориентируйтесь на свою анкету и врача, а не на эти программы.</p>
      <ul className="legends">{LEGENDS.map((p) => <Card key={p.slug} p={p} />)}</ul>
    </section>
  )
}
