# HealthyFitness API

База: `http://localhost:5168`. Все эндпоинты, кроме `/api/auth/*`, требуют заголовок `Authorization: Bearer <token>`.
Ошибки приходят как `{ "error": "текст" }`. JSON — camelCase, как в `src/types.ts`.

| Метод и путь | Роль | Что делает |
|---|---|---|
| POST /api/auth/register `{email,password,role?,name?}` | — | регистрация (роль — только patient), возвращает `{token,user}` |
| POST /api/auth/login `{email,password}` | — | вход, возвращает `{token,user}` |
| POST /api/auth/reset-password `{email,code,password}` | — | демо-сброс пароля (только Development, код 123456) |
| GET /api/users/me | все | текущий пользователь с профилем |
| PUT /api/users/me/profile `ProfileDto` | все | сохранить анкету (после согласия) |
| POST /api/users/me/consent | все | принять согласие |
| DELETE /api/users/me/consent | все | отозвать согласие (анкета удаляется) |
| DELETE /api/users/me | все | удалить аккаунт и все данные |
| GET /api/users/contacts | patient, therapist | собеседники для чата |
| GET /api/patients | therapist | пациенты с анкетами |
| GET /api/users | admin | все пользователи |
| PUT /api/users/{id}/role `{role}` | admin | сменить роль |
| GET / POST /api/workouts, DELETE /api/workouts/{id} | все | свои тренировки |
| GET /api/custom-exercises | все | упражнения админа |
| POST /api/custom-exercises, DELETE /api/custom-exercises/{id} | admin | добавить / удалить упражнение |
| POST /api/custom-exercises/video (multipart `file`) | admin | загрузить видео, возвращает `{url}` |
| GET /api/assignments?patientId= | patient, therapist | назначения (пациент — только свои) |
| POST /api/assignments `{patientId,workout,comment?}` | therapist | назначить тренировку |
| DELETE /api/assignments/{id} | therapist | отменить (только своё назначение) |
| GET / POST /api/patients/{id}/comments, DELETE /api/comments/{id} | therapist | внутренние комментарии |
| GET /api/chat/{otherId}, POST /api/chat `{to,text}` | patient, therapist | чат пациент ↔ физиотерапевт |
| GET /api/weights, POST /api/weights `{date,weight,kcal?}`, DELETE /api/weights/{date} | patient | дневник веса |
