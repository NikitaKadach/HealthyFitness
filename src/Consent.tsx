import Brand from './Brand'
import { useState } from 'react'

export default function Consent({ onAccept, onDecline }: { onAccept: () => void; onDecline: () => void }) {
  const [personal, setPersonal] = useState(false)
  const [medical, setMedical] = useState(false)
  return (
    <main className="auth">
      <Brand large />
      <section className="panel wide">
        <h1>Согласие на обработку данных</h1>
        <p>Чтобы подобрать безопасные упражнения, нам нужны ваши данные. Прочитайте, как мы с ними обращаемся.</p>
        <ul className="plain">
          <li><b>Что собираем.</b> Почта, рост, вес, пол, дата рождения, сведения о заболеваниях, травмах и операциях, описание жалоб.</li>
          <li><b>Зачем.</b> Только для подбора и проверки тренировок. Не передаём третьим лицам и не используем для рекламы.</li>
          <li><b>Ваши права.</b> Вы можете в любой момент посмотреть, изменить и удалить данные, а также отозвать согласие в разделе «Анкета».</li>
          <li><b>Особая категория.</b> Сведения о здоровье — это специальные персональные данные, поэтому согласие на них отдельное.</li>
        </ul>
        <label className="check">
          <input type="checkbox" checked={personal} onChange={(e) => setPersonal(e.target.checked)} />
          Я согласен на обработку персональных данных
        </label>
        <label className="check">
          <input type="checkbox" checked={medical} onChange={(e) => setMedical(e.target.checked)} />
          Я согласен на обработку медицинской информации о моём здоровье
        </label>
        <div className="row">
          <button className="btn primary" disabled={!personal || !medical} onClick={onAccept}>Принять и продолжить</button>
          <button className="btn" onClick={onDecline}>Выйти</button>
        </div>
      </section>
    </main>
  )
}
