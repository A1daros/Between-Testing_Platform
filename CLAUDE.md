# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Спілкуйся з користувачем українською мовою.

## Команди

- `npm run dev` — dev-сервер Vite
- `npm run build` — `tsc -b && vite build` (перевірка типів входить у збірку)
- `npm run lint` — ESLint (flat config, `eslint.config.js`)
- `npm run preview` — локальний перегляд production-збірки

Тест-раннер не налаштований.

Обов'язкові змінні середовища (`.env` / `.env.local`): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.

## Архітектура

BETWEEN — сайт англомовної школи та платформа тестування за рівнями CEFR (A1–B2). SPA на React 19 + TypeScript + Vite, SCSS Modules, React Router v7. Деплой на Vercel: `vercel.json` переписує всі шляхи на `index.html`. Увесь бекенд — Supabase (Postgres + Auth + Storage + RLS), власного сервера немає.

- **Точка входу / маршрутизація.** `src/main.tsx` обгортає `App` в `AuthProvider`. `src/App.tsx` оголошує всі маршрути через константи `ROUTES` із `src/constants/routes.ts`. Адмін-підмаршрути лежать у `ADMIN_ROUTES` і рахуються відносно `/admin/*`.
  - Публічні маршрути: головна, «про школу», placement test, сторінки авторизації.
  - Решта маршрутів закрита `routes/ProtectedRoute`, адмінка — ще й `routes/AdminRoute`.
  - Адмін-модуль вантажиться ліниво (lazy), обгорнутий в `ErrorBoundary` (`ChunkError`) + `Suspense`.
- **Авторизація.** `context/AuthProvider.tsx` зберігає сесію Supabase, користувача та рядок із `profiles`. У цьому рядку є роль, за якою перевіряється доступ до адмінки. Отримувати ці дані слід через `hooks/useAuth.ts`.
- **Доступ до даних.** Усі запити до Supabase зібрані в `src/services/*.ts`, по одному файлу на домен: tests, questions, answers, results, resultAnswers, profile, programs, teachers, levels тощо. Усі вони використовують єдиний клієнт із `src/lib/supabase.ts`. Типи рядків БД — у `src/types/database.ts`.
- **Серверна логіка.** Уся чутлива логіка — в RPC-функціях Postgres. Клієнт ніколи не отримує `is_correct` разом із питаннями.
  - `get_placement_questions`, `calculate_placement_level` — placement test. Рівень рахується на сервері, результат не зберігається.
  - `submit_quiz` — перевірка відповідей, підрахунок балу, запис `results` + `result_answers`.
  - `get_correct_answers` — правильні відповіді для розбору результатів і редагування тесту.
  - `save_test`, `delete_test` — створення/редагування/видалення тесту з частинами, питаннями й відповідями (адмінка).
  - Тригер на `auth.users` створює рядок у `profiles` з метаданих `signUp` (`name`, `surname`, `display_name`).
  - Доступ обмежується через RLS, а не лише в UI. Storage: бакет `avatars`.
  - Єдина edge-функція — `supabase/functions/send-contact-email` (Deno). Налаштування `.vscode` вмикають Deno лише для цього шляху.
- **Модель контенту.** levels → submodules → tests (`placement_test` / `submodule_quiz` / `final_test`) → test_parts → questions → answers. Результати зберігаються в `results` + `result_answers`. Програми/формати для лендингу та викладачі вантажаться із Supabase (див. `services/programs.ts`, `services/teachers.ts`). Статичний маркетинговий контент лежить у `src/data`.
- **UI-модулі.** `src/modules/<feature>/` (home, tests, quiz, results, profile, authentication, admin, about-school, shared), стилі `.module.scss` лежать поруч із компонентами.
  - Спільний layout — у `modules/shared/components/Layuot`. Назва папки саме така, з опечаткою «Layuot».
  - Логіка стану квізу й таймера — у `hooks/useQuiz.ts` та `hooks/useCountdown.ts`.
  - Спільні SCSS-змінні та міксини — у `src/styles`.

## Стилі

Правила SCSS (структура, класи, значення, типографіка, адаптивність, порядок властивостей) описані в skill `scss-styles` (`.claude/skills/scss-styles/SKILL.md`). Завантажуй його перед будь-якою роботою зі стилями.

## Конвенції коду

- **Мова.** Увесь текст інтерфейсу — українською. Код, ідентифікатори, коментарі та повідомлення комітів — англійською. Сайт має `<html lang="uk">`.
- **Дані.** Компоненти й хуки не імпортують клієнт Supabase напряму: додай або розшир функцію в `src/services/<domain>.ts`. Наявні винятки, які ще не перенесені: сторінки `modules/authentication/*` і `ContactUs.tsx` викликають `supabase` напряму. Новий код так не пишеться.
- **Помилки сервісів.** Сервіси кидають помилку (`throw`), якщо Supabase повертає `error`. Помилки обробляються в хуках або компонентах.
- **Типи.** Типи рядків БД беруться з `src/types/database.ts`. Не оголошуй їх заново в компонентах.
- **Маршрути.** Не прописуй шляхи вручну, використовуй `ROUTES` / `ADMIN_ROUTES`. У частині компонентів ще лишилися рядки на кшталт `navigate('/')`. Якщо редагуєш такий компонент, заміни їх на константи.
- **Компоненти.** Функціональні компоненти з іменованим типом пропсів (`type XProps = { … }`, як у наявному коді). Один компонент на файл, у відповідній папці `src/modules/<feature>/`.
- **Новий публічний маршрут.** Додай його в `ROUTES` і `App.tsx`, а також у `public/sitemap.xml` (оновлюється вручну).

## База даних

- Схема, RPC-функції, тригер профілю, RLS-політики й бакети зараз існують **лише в хмарі Supabase**: у репозиторії немає `supabase/migrations/`. Код RPC не видно, тож не роби припущень про їхню реалізацію — попроси користувача показати SQL або вивантажити схему.
- Ціль — тримати всю схему в `supabase/migrations/`, а контент (тести, програми, викладачі; без персональних даних учнів) у `supabase/seed.sql`, щоб сайт можна було відтворити з нуля.
- Будь-яку зміну схеми оформлюй як SQL-файл міграції в репозиторії, а не лише як інструкцію «зроби в дашборді». Застосовує міграції користувач.
- Після будь-якої зміни схеми онови `src/types/database.ts`.
- Для кожної нової таблиці й бакета вмикай RLS і задавай явні політики. Авторизація не може спиратися лише на перевірки в UI.

## Edge-функція

`supabase/functions/send-contact-email` працює на Deno, а не на Node: використовуй Deno-імпорти й не змішуй її з конфігурацією Vite/TS.

## Стан проєкту та пріоритети

Мета проєкту — скоротити витрати часу викладачів на ручну перевірку тестів. Основна функціональність готова й працює в продакшені на Vercel, але сайт ще не запущений публічно: індексацію вимкнено (`noindex` в `index.html`), власного домену немає, Supabase і Vercel на безкоштовних планах. Ціль — довести проєкт до комерційного запуску.

Заплановані задачі (у порядку пріоритету):
1. **Бекап БД у репозиторій** — міграції + seed (див. «База даних»).
2. **Реєстрація зі схваленням адміном** — статус у `profiles` (pending/approved/rejected), обмеження доступу до тестів через RLS (не лише в `ProtectedRoute`), екран очікування, список на схвалення в адмінці.
3. **Аудіо для listening-тестів** — бакет Supabase Storage, поле з шляхом до аудіо, завантаження в `TestForm`, плеєр у `QuizPage`, розширення `save_test`. Разом із цим — поле для reading-тексту (`questions.description`) у `TestForm`: зараз його можна внести лише напряму в БД.
4. **Дрібниці** — `og:image` вказує на неіснуючий `og-cover.jpg` (у `public/` лежить `.webp`); кнопка в кінці placement test досі веде на `/register`, тоді як інші CTA ведуть в Instagram; адмінка частково англійською.

### Перехід на власний домен

Адреса `between-testing-platform.vercel.app` зашита в: `index.html` (`og:url`, `og:image`), `public/robots.txt`, `public/sitemap.xml`, `README.md`, а також `allowedOrigins` у `supabase/functions/send-contact-email/index.ts` (без оновлення форма зв'язку перестане працювати). Поза репозиторієм: Site URL і Redirect URLs у Supabase Auth, верифікація домену в Resend (зараз листи йдуть з `onboarding@resend.dev`, тому реєстрація працює лише для пошти власника акаунта). Після запуску прибрати `noindex`.

## Чого не робити

- Не використовуй service-role ключ Supabase чи інші секрети в клієнтському коді. У фронтенді дозволені лише `VITE_SUPABASE_URL` та `VITE_SUPABASE_ANON_KEY`.
- Не додавай `.env` / `.env.local` у git.
- Не додавай нові залежності без попереднього узгодження.
- Не редагуй `dist/` (артефакт збірки, ігнорується git).
- Не «виправляй» написання шляху `Layuot` попутно з іншими задачами. Перейменування — окрема зміна.

## Перед завершенням завдання

Тестів немає, тож єдині автоматичні перевірки — `npm run build` (включає `tsc -b`) та `npm run lint`. Запусти обидві й виправ помилки, перш ніж звітувати про завершення.
