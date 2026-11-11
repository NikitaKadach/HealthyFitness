# Healthy Fitness (frontend)

React + TypeScript + Vite. Без бэкенда: пользователи и тренировки хранятся в localStorage (`src/store.ts`).

    npm install
    npm run dev      # разработка
    npm run build    # проверка типов + сборка

Демо-код восстановления пароля: 123456.
Для подключения сервера замените тела функций в `src/store.ts` на запросы к API.

## Упражнения

Данные взяты из https://github.com/hasaneyldrm/exercises-dataset (1324 упражнения, описания на 10 языках).
Из исходного 17 МБ JSON сделаны лёгкие файлы в `public/data/`: `index.json` (список) и `steps.<язык>.json` (описания, грузятся по выбранному языку).

Гифки и превью по умолчанию берутся с GitHub (`src/exercises.ts`, `MEDIA_BASE`). Для продакшена:
скопируйте папки `images/` и `videos/` из репозитория в `public/` и создайте файл `.env` со строкой `VITE_MEDIA_BASE=/`.
Медиа © Gym visual: сохраняйте подпись и проверьте условия лицензии (NOTICE.md в репозитории).

## Оформление

Шрифт (Rubik) подключены через `@fontsource` и раздаются с вашего сайта, запросов к Google Fonts нет.
Цвета и шрифты меняются в переменных `:root` в начале `src/styles.css`.

Раздел «Золотая эра»: текстовые карточки с кратким описанием. Фото кладите в `public/legends/<имя>.jpg`
(имена файлов: steve-reeves, reg-park, bill-pearl, larry-scott, sergio-oliva, arnold-schwarzenegger, frank-zane, franco-columbu).
Без файла показывается рисованный силуэт.
