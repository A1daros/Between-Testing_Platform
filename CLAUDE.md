# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Спілкуйся з користувачем українською мовою.

## Команди

- `npm run dev` — dev-сервер Vite
- `npm run build` — `tsc -b && vite build` (перевірка типів входить у збірку)
- `npm run lint` — ESLint (flat config, `eslint.config.js`)
- `npm run preview` — локальний перегляд production-збірки

Тест-раннер не налаштований.

Обов'язкові змінні середовища (`.env` / `.env.local`): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`. Опційна: `VITE_SENTRY_DSN` (без неї звіти про помилки не надсилаються).

## Архітектура

BETWEEN — сайт англомовної школи та платформа тестування за рівнями CEFR (A1–B2). SPA на React 19 + TypeScript + Vite, SCSS Modules, React Router v7. Деплой на Vercel: `vercel.json` переписує всі шляхи на `index.html`. Увесь бекенд — Supabase (Postgres + Auth + Storage + RLS), власного сервера немає.

- **Точка входу / маршрутизація.** `src/main.tsx` обгортає `App` в `AuthProvider`. `src/App.tsx` оголошує всі маршрути через константи `ROUTES` із `src/constants/routes.ts`. Адмін-підмаршрути лежать у `ADMIN_ROUTES` і рахуються відносно `/admin/*`.
  - Публічні маршрути: головна, «про школу», placement test, умови користування й політика конфіденційності (`modules/legal`, тексти — чернетка в `src/data/legal.data.ts` з плейсхолдерами для юриста), сторінки авторизації.
  - Решта маршрутів закрита `routes/ProtectedRoute`, адмінка — ще й `routes/AdminRoute`.
  - Адмін-модуль вантажиться ліниво (lazy), обгорнутий в `ErrorBoundary` (`ChunkError`) + `Suspense`.
- **Авторизація.** `context/AuthProvider.tsx` зберігає сесію Supabase, користувача та рядок із `profiles`. У цьому рядку є роль, за якою перевіряється доступ до адмінки. Отримувати ці дані слід через `hooks/useAuth.ts`.
- **Доступ до даних.** Усі запити до Supabase зібрані в `src/services/*.ts`, по одному файлу на домен: tests (зокрема створення/редагування/видалення), questions, answers, results, resultAnswers, placement, profile, auth, programs, teachers, levels тощо. Усі вони використовують єдиний клієнт із `src/lib/supabase.ts` і хелпери `unwrap` / `unwrapCount` із `services/helpers.ts`. Типи рядків БД — у `src/types/database.ts`.
- **Серверна логіка.** Уся чутлива логіка — в RPC-функціях Postgres. Клієнт ніколи не отримує `is_correct` разом із питаннями.
  - `get_placement_questions`, `calculate_placement_level` — placement test. Рівень рахується на сервері, результат не зберігається.
  - Спроби (`quiz_attempts`, `test_attempt_grants`): `get_quiz_attempt`, `start_quiz_attempt`, `save_quiz_progress`, `submit_quiz_attempt` (підрахунок балу, запис `results` + `result_answers`, безпечний повтор), `register_audio_play`. Дві спроби на тест; час, чернетка відповідей і лічильник аудіо живуть на сервері. Адмін: `get_student_attempts`, `grant_extra_attempt`.
  - `get_correct_answers` — правильні відповіді для адміна або учня, який використав усі спроби й не має незавершеної.
  - `save_test`, `delete_test` — створення/редагування/видалення тесту з частинами, питаннями й відповідями (адмінка).
  - Тригер на `auth.users` створює рядок у `profiles` з метаданих `signUp` (`name`, `surname`, `display_name`).
  - Доступ обмежується через RLS, а не лише в UI. Storage: бакети `avatars`, `teachers` і приватний `test-audio` (аудіо listening-частин, signed URL).
  - `get_admin_results` — сторінка результатів в адмінці (пошук, сортування, пагінація).
  - Тригери на `test_parts`, `questions`, `answers` оновлюють `tests.content_updated_at`. Бал спроби після редагування тесту не перераховується; спроби, зроблені до зміни, позначаються в UI як «Тест змінено».
  - Тригер на оновлення `auth.users.email` синхронізує `profiles.email`, а тригер на `auth.users.email_confirmed_at` — `profiles.email_confirmed_at`. `set_profile_status` не схвалює непідтверджену пошту.
  - Edge-функції (Deno) лежать у `supabase/functions`: `send-contact-email` (форма зв'язку), `notify-profile-status` (лист адміну, коли заявник підтвердив пошту, і листи про рішення щодо заявки; викликається Database Webhook на `profiles`) і `delete-student` (видалення акаунта учня адміном: результати лишаються без прив'язки до людини). Налаштування `.vscode` вмикають Deno лише для `supabase/functions`.
- **Модель контенту.** levels → submodules → tests (`placement_test` / `submodule_quiz` / `final_test`) → test_parts → questions → answers. Результати зберігаються в `results` + `result_answers`. Програми/формати для лендингу та викладачі вантажаться із Supabase (див. `services/programs.ts`, `services/teachers.ts`). Статичний маркетинговий контент лежить у `src/data`.
- **UI-модулі.** `src/modules/<feature>/` (home, tests, quiz, results, profile, authentication, admin, about-school, legal, not-found, shared), стилі `.module.scss` лежать поруч із компонентами.
  - Іменування: папка модуля — kebab-case; головна сторінка модуля лежить у його корені, додаткові сторінки — у підпапках PascalCase (`tests/PlacementTest`, `results/MyResults`, `authentication/Login`); дрібні компоненти сторінки — у `components/<PascalCase>/`. Кожна папка компонента має `index.ts`.
  - Спільні компоненти — у `modules/shared/components`: `Loader`, `ErrorState` (помилка сторінки з кнопкою повтору), `Alert` (картка помилки/успіху), `FormField` / `FormTextarea` / `PasswordFields` (поля з плаваючим лейблом), `Modal` (Escape, фокус), `AnswerList` / `QuizProgress` / `QuizNavigation` (спільні для квізу й placement test), `OutdatedBadge`, `ScrollToTop`, `ChunkError`, `SectionHeader` (мітка `BETWEEN / X` + заголовок + опис; `as='h1'` для заголовка сторінки).
  - Адмінка: сторінки (`Overview`, `Tests`, `Tests/CreateTest`, `Tests/EditTest`, `Results`, `Results/ResultDetails`, `Students`, `Students/StudentDetails`) лежать у корені `modules/admin`, layout із сайдбаром — `AdminLayout`, спільні компоненти адмінки (`Table`, `Pagination`, `SearchInput`, `StatCard`) — у `modules/admin/components`. Типи, потрібні лише адмінці, — у `modules/admin/types`.
  - Спільний layout (Header, Footer) — у `modules/shared/components/Layout`.
  - Логіка стану квізу й таймера — у `hooks/useQuiz.ts` та `hooks/useCountdown.ts`.
  - Завантаження даних у сторінках — через `hooks/useAsyncData.ts` (loading / error / reload / setData, скасування при розмонтуванні); функцію завантаження передавай стабільною (модульна функція або `useCallback`). Також є `useDebouncedValue` і `useEscapeKey`.
  - Спільні SCSS-змінні та міксини — у `src/styles`.

## Стилі

Стиль — пост-модерн мінімалізм (монохром + брендовий червоний `$brand`, тонкі лінії, великі display-числа, мітки `BETWEEN / X`). Правила SCSS (візуальна мова, структура, кнопки, значення, типографіка, адаптивність, порядок властивостей) описані в skill `scss-styles` (`.claude/skills/scss-styles/SKILL.md`). Завантажуй його перед будь-якою роботою зі стилями.

## Конвенції коду

- **Мова.** Увесь текст інтерфейсу — українською. Код, ідентифікатори, коментарі та повідомлення комітів — англійською. Сайт має `<html lang="uk">`.
- **Дані.** Компоненти й хуки не імпортують клієнт Supabase напряму: додай або розшир функцію в `src/services/<domain>.ts` (авторизація — `services/auth.ts`, форма зв'язку — `services/contact.ts`). Виняток — `context/AuthProvider.tsx`, який підписується на `onAuthStateChange`.
- **Помилки для користувача.** Повідомлення Supabase англійською не показуються в UI: помилки Auth перекладає `utils/getAuthErrorMessage.ts` (за `error.code`), для решти компонент показує власний український текст. Текст помилки, яку вже кинув сервіс українською, бери через `utils/getErrorMessage.ts`; перевірка пароля — `utils/validatePassword.ts`.
- **Помилки сервісів.** Сервіси кидають помилку (`throw`), якщо Supabase повертає `error`. Помилки обробляються в хуках або компонентах.
- **Моніторинг.** `console.error` у клієнті не використовується. Неочікувану перехоплену помилку передавай у `utils/captureError.ts` (Sentry); очікувані помилки форм (неправильний пароль тощо) не звітуються. Налаштування — `lib/sentry.ts`: у звіти не мають потрапляти персональні дані й токени з URL.
- **Типи.** Типи рядків БД беруться з `src/types/database.ts`. Не оголошуй їх заново в компонентах.
- **Маршрути.** Не прописуй шляхи вручну, використовуй `ROUTES` / `ADMIN_ROUTES`. Шлях із параметрами — через `generatePath(ROUTES.quiz, { testId })`; абсолютний шлях адмінки — через `getAdminPath(ADMIN_ROUTES.testEdit, { testId })` (`utils/getAdminPath.ts`).
- **Форматування.** Дати — `utils/formatDate.ts` (локаль `uk-UA`), відмінювання з числом — `utils/pluralize.ts`, двозначні номери (`01`) — `utils/padNumber.ts`, назви типів тестів — `constants/testTypes.ts`. Контакти школи — `constants/school.ts`.
- **Компоненти.** Функціональні компоненти з іменованим типом пропсів (`type XProps = { … }`, як у наявному коді). Один компонент на файл, у відповідній папці `src/modules/<feature>/`.
- **Новий публічний маршрут.** Додай його в `ROUTES` і `App.tsx`, а також у `public/sitemap.xml` (оновлюється вручну).
- **Мета-теги сторінки.** Кожна сторінка викликає `usePageMeta` (`hooks/usePageMeta.ts`) на початку компонента: `title` без бренду, `description` і `path` для публічних сторінок, `noindex: true` для службових і закритих. Хук оновлює теги з `index.html`, а не рендерить нові, тож не вставляй `<title>`/`<meta>` у JSX.

## База даних

- Схема, RPC-функції, тригер профілю, RLS-політики, гранти й бакети лежать у `supabase/migrations/` (базова міграція — знімок хмари через `supabase db pull`). Код RPC читай там, а не вгадуй.
- Правила міграцій, RPC, RLS і грантів, а також пастки наявної схеми описані в skill `supabase-migrations` (`.claude/skills/supabase-migrations/SKILL.md`). Завантажуй його перед будь-якою роботою зі схемою чи RPC.
- Дані таблиць у репозиторії не зберігаються: репозиторій публічний, а дамп тестів містив би ключі відповідей. Поточні дані в хмарі тестові; на запуску проєкт стартує з чистої бази (див. «Запуск у новому проєкті»).
- Будь-яку зміну схеми оформлюй як SQL-файл міграції в репозиторії, а не лише як інструкцію «зроби в дашборді». Застосовує міграції користувач.
- Після будь-якої зміни схеми онови `src/types/database.ts`.
- Для кожної нової таблиці й бакета вмикай RLS і задавай явні політики. Авторизація не може спиратися лише на перевірки в UI.

## Edge-функції

Функції в `supabase/functions/*` працюють на Deno, а не на Node: використовуй Deno-імпорти й не змішуй їх із конфігурацією Vite/TS. Кожна має власний `deno.json` і секцію в `supabase/config.toml`.

## Стан проєкту та пріоритети

Мета проєкту — скоротити витрати часу викладачів на ручну перевірку тестів. Основна функціональність готова й працює в продакшені на Vercel, але сайт ще не запущений публічно: індексацію вимкнено (`noindex` в `index.html`), власного домену немає, Supabase і Vercel на безкоштовних планах. Ціль — довести проєкт до комерційного запуску.

Зроблено: спроби на сервері (ліміт 2, ключ після останньої, час і прогрес переживають оновлення сторінки), видалення акаунта адміном з анонімізацією результатів, фіксація згоди (`profiles.terms_accepted_at`, `terms_version`, версія — `constants/legal.ts`); схема БД у міграціях; `save_test` оновлює тест на місці й не видаляє результати; реєстрація зі схваленням адміном (`profiles.status`, RLS, екран `/awaiting-approval`, дії в адмінці Students); аудіо для listening-частин (приватний бакет `test-audio`, плеєр із лімітом 2 прослуховування) і reading-текст у `TestForm`. SEO: `usePageMeta` на всіх сторінках, сторінка 404, JSON-LD школи в `index.html`, один `<main>` на сторінку, h1 і англійські рядки на сторінках учня. Дрібниці: `og-cover.jpg`, CTA в кінці placement test веде в Instagram (`SCHOOL_INSTAGRAM_URL`), адмінка перекладена українською.

Заплановані задачі (у порядку пріоритету):
1. **Сторінка результату** — `ResultPage` тримається на `location.state`.
2. **Технічний борг** — `save_test` не створює `submodule_quiz`: у клієнті немає жодного UI для субмодулів, тож це окрема фіча, яку треба погодити із замовницею. Решту пунктів закрито (синхронний `onAuthStateChange`, синхронізація `profiles.email`, перевірка типу тесту в `submit_quiz`, пагінація результатів, email-сповіщення).

### Запуск у новому проєкті

На запуску замовниця створює нові платні проєкти Supabase і Vercel з чистою базою:
- Застосувати міграції (`supabase link` + `supabase db push`). Те, що з них піднімається порожня база, ще не перевірено (`supabase db reset` локально, потрібен Docker).
- Внести довідники: `levels` (A1–B2) обов'язкові для placement test, форми тесту й фільтра за рівнем; також програми, формати й викладачі лендингу. Placement test створюється лише напряму в БД: форма в адмінці робить тільки `final_test`.
- Заповнити плейсхолдери в `src/data/legal.data.ts` (власник, реквізити, дата, строки зберігання) після погодження текстів із юристом.
- Призначити першого адміна вручну: `update public.profiles set role = 'admin', status = 'approved' where email = '…';`
- Поза репозиторієм: деплой `delete-student`; Site URL і Redirect URLs в Auth, SMTP/Resend, секрети й деплой edge-функцій (`RESEND_API_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `CONTACT_TO_EMAIL`; для `notify-profile-status` ще `WEBHOOK_SECRET`, `SITE_URL`, опційно `NOTIFY_FROM_EMAIL`), Database Webhook на `public.profiles` (INSERT, UPDATE) → `notify-profile-status` із заголовком `x-webhook-secret`, нові `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` у Vercel, фото викладачів у бакеті `teachers` (через дашборд), `preconnect` на новий Supabase-домен в `index.html`, новий Supabase-домен у CSP (`vercel.json`), проєкт Sentry і `VITE_SENTRY_DSN` у Vercel.
- Увімкнути підтвердження email в Auth: без нього новий акаунт одразу вважається підтвердженим.
### Перехід на власний домен

Адреса `between-testing-platform.vercel.app` зашита в: `index.html` (`og:url`, `og:image`, JSON-LD), `src/constants/seo.ts` (`SITE_URL`: canonical і `og:url`), `public/robots.txt`, `public/sitemap.xml`, `README.md`, а також `allowedOrigins` у `supabase/functions/send-contact-email/index.ts` і `supabase/functions/delete-student/index.ts` (без оновлення форма зв'язку й видалення акаунта перестануть працювати) і секрет `SITE_URL` функції `notify-profile-status` (посилання в листах). Поза репозиторієм: Site URL і Redirect URLs у Supabase Auth, верифікація домену в Resend (зараз листи йдуть з `onboarding@resend.dev`, тому реєстрація працює лише для пошти власника акаунта). Після запуску відкрити індексацію: `SITE_INDEXABLE = true` у `src/constants/seo.ts` **і** прибрати `<meta name="robots">` з `index.html` (Google не рендерить сторінки, що мають `noindex` у початковому HTML). Службові та закриті сторінки лишаться `noindex` через `usePageMeta`.

## Чого не робити

- Не використовуй service-role ключ Supabase чи інші секрети в клієнтському коді. У фронтенді дозволені лише `VITE_SUPABASE_URL` та `VITE_SUPABASE_ANON_KEY`.
- Не додавай `.env` / `.env.local` у git.
- Не додавай нові залежності без попереднього узгодження.
- Не редагуй `dist/` (артефакт збірки, ігнорується git).

## Перед завершенням завдання

Тестів немає, тож єдині автоматичні перевірки — `npm run build` (включає `tsc -b`) та `npm run lint`. Запусти обидві й виправ помилки, перш ніж звітувати про завершення.
