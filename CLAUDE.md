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
  - Доступ обмежується через RLS, а не лише в UI. Storage: бакети `avatars`, `teachers` і приватний `test-audio` (аудіо listening-частин, signed URL).
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

- Схема, RPC-функції, тригер профілю, RLS-політики, гранти й бакети лежать у `supabase/migrations/` (базова міграція — знімок хмари через `supabase db pull`). Код RPC читай там, а не вгадуй.
- Правила міграцій, RPC, RLS і грантів, а також пастки наявної схеми описані в skill `supabase-migrations` (`.claude/skills/supabase-migrations/SKILL.md`). Завантажуй його перед будь-якою роботою зі схемою чи RPC.
- Дані таблиць у репозиторії не зберігаються: репозиторій публічний, а дамп тестів містив би ключі відповідей. Поточні дані в хмарі тестові; на запуску проєкт стартує з чистої бази (див. «Запуск у новому проєкті»).
- Будь-яку зміну схеми оформлюй як SQL-файл міграції в репозиторії, а не лише як інструкцію «зроби в дашборді». Застосовує міграції користувач.
- Після будь-якої зміни схеми онови `src/types/database.ts`.
- Для кожної нової таблиці й бакета вмикай RLS і задавай явні політики. Авторизація не може спиратися лише на перевірки в UI.

## Edge-функція

`supabase/functions/send-contact-email` працює на Deno, а не на Node: використовуй Deno-імпорти й не змішуй її з конфігурацією Vite/TS.

## Стан проєкту та пріоритети

Мета проєкту — скоротити витрати часу викладачів на ручну перевірку тестів. Основна функціональність готова й працює в продакшені на Vercel, але сайт ще не запущений публічно: індексацію вимкнено (`noindex` в `index.html`), власного домену немає, Supabase і Vercel на безкоштовних планах. Ціль — довести проєкт до комерційного запуску.

Зроблено: схема БД у міграціях; `save_test` оновлює тест на місці й не видаляє результати; реєстрація зі схваленням адміном (`profiles.status`, RLS, екран `/awaiting-approval`, дії в адмінці Students); аудіо для listening-частин (приватний бакет `test-audio`, плеєр із лімітом 2 прослуховування) і reading-текст у `TestForm`. Дрібниці: `og-cover.jpg`, CTA в кінці placement test веде в Instagram (`SCHOOL_INSTAGRAM_URL`), адмінка перекладена українською.

Заплановані задачі (у порядку пріоритету):
1. **Спроби та ключ відповідей** — після першої спроби учень бачить ключ (`get_correct_answers`) і може перездавати без обмежень. Потрібне рішення замовниці: ліміт спроб, позначка першої спроби або ключ лише в межах конкретного результату.
2. **Серверна сесія тесту** — таймер, ліміт прослуховувань і прогрес живуть лише в браузері й скидаються при оновленні сторінки; `ResultPage` тримається на `location.state`.
3. **SEO перед зняттям `noindex`** — title/description/canonical на кожну сторінку (React 19 без залежностей), `noindex` для службових сторінок, маршрут 404, битий `/contacts` у футері, подвійний `<main>`, порожні h1, англійські рядки в квізі, JSON-LD школи.
4. **Технічний борг** — запити до Supabase всередині `onAuthStateChange` в `AuthProvider` (ризик зависання, подвійне завантаження профілю); `profiles.email` не синхронізується після зміни пошти; `save_test` не створює `submodule_quiz`, `submit_quiz` не перевіряє тип тесту; список результатів в адмінці без пагінації; немає email-сповіщень про схвалення й нові заявки.

### Запуск у новому проєкті

На запуску замовниця створює нові платні проєкти Supabase і Vercel з чистою базою:
- Застосувати міграції (`supabase link` + `supabase db push`). Те, що з них піднімається порожня база, ще не перевірено (`supabase db reset` локально, потрібен Docker).
- Внести довідники: `levels` (A1–B2) обов'язкові для placement test, форми тесту й фільтра за рівнем; також програми, формати й викладачі лендингу. Placement test створюється лише напряму в БД: форма в адмінці робить тільки `final_test`.
- Призначити першого адміна вручну: `update public.profiles set role = 'admin', status = 'approved' where email = '…';`
- Поза репозиторієм: Site URL і Redirect URLs в Auth, SMTP/Resend, секрети й деплой edge-функції (`RESEND_API_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `CONTACT_TO_EMAIL`), нові `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` у Vercel, фото викладачів у бакеті `teachers` (через дашборд), `preconnect` на новий Supabase-домен в `index.html`.

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
