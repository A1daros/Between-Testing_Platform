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
- **Доступ до даних.** Усі запити до Supabase зібрані в `src/services/*.ts`, по одному файлу на домен: tests, questions, answers, results, resultAnswers, profile, programs, teachers, levels тощо. Усі вони використовують єдиний клієнт із `src/lib/supabase.ts`. Компоненти й хуки викликають сервіси, а не клієнт напряму. Типи рядків БД — у `src/types/database.ts`.
- **Серверна логіка.**
  - Рівень за placement test рахує Postgres RPC `calculate_placement_level` (викликається з `services/placement.ts`). Результати анонімного placement test не зберігаються.
  - Доступ обмежується через RLS, а не лише в UI.
  - Єдина edge-функція — `supabase/functions/send-contact-email` (Deno). Налаштування `.vscode` вмикають Deno лише для цього шляху.
- **Модель контенту.** levels → submodules → tests (`placement_test` / `submodule_quiz` / `final_test`) → test_parts → questions → answers. Результати зберігаються в `results` + `result_answers`. Програми/формати для лендингу та викладачі вантажаться із Supabase (див. `services/programs.ts`, `services/teachers.ts`). Статичний маркетинговий контент лежить у `src/data`.
- **UI-модулі.** `src/modules/<feature>/` (home, tests, quiz, results, profile, authentication, admin, about-school, shared), стилі `.module.scss` лежать поруч із компонентами.
  - Спільний layout — у `modules/shared/components/Layuot`. Назва папки саме така, з опечаткою «Layuot».
  - Логіка стану квізу й таймера — у `hooks/useQuiz.ts` та `hooks/useCountdown.ts`.
  - Спільні SCSS-змінні та міксини — у `src/styles`.

## Примітки

- Мова сайту — українська (`<html lang="uk">`). Останні коміти змінювали логіку мови для публічних і захищених маршрутів.
- `public/sitemap.xml` оновлюється вручну. Його треба доповнювати, коли з'являються нові публічні маршрути.
- `dist/` — артефакт збірки, ігнорується git. Не редагуй його.

## Стилі (SCSS)

### Структура
- Один `X.module.scss` на компонент, поруч із `X.tsx`. Імпорт: `import styles from './X.module.scss'`.
- Глобальні стилі (reset, `html/body/#root`, layout застосунку) — тільки в `src/styles/App.module.scss`. `:global` у модулях не використовується.
- Спільні файли в `src/styles`:
  - `variables.scss` — кольори, бордери, тіні, брейкпоінти **і типографічні міксини**;
  - `mixins.scss` — `page-container`, `section-container`;
  - `mixins/auth-form.scss` — міксини форм (wrapper, container, input, кнопки, картки помилки та успіху).
- Підключення тільки через `@use` з відносним шляхом, без розширення, `as *`. `@import` не використовується. `@use` не реекспортує змінні, тому `variables` треба підключати явно навіть разом із `mixins`:
  ```scss
  @use '../../../../styles/variables' as *;
  @use '../../../../styles/mixins' as *;
  ```

### Назви класів
- camelCase: `.descriptionWrapper`, `.sectionTitle`. Без BEM (`__`, `--`) і без дефісів.
- Типові назви: `.page` (корінь секції), `.wrapper`/`.container`, `.title`/`.description`/`.button`, `.xxxWrapper`/`.xxxSection`/`.xxxCard`.
- Модифікатори пишуться окремими класами (`.answerSelected`). У TSX їх комбінують шаблонним рядком: `` className={`${styles.a} ${styles.b}`} ``. `clsx` не використовується.

### Значення
- Кольори тільки зі змінних (`$text-main`, `$text-secondary`, `$accent`, `$accent-hover`, `$surface-1/2`, `$green`, `$red`…). Без hex у модулях. Якщо потрібен новий колір, його спершу додають у `variables.scss`.
- Прозорість задається через `rgba($змінна, α)`: `rgba($accent, 0.15)`, `rgba($text-main, 0.4)`.
- Бордери й тіні: `$card-border`, `$form-border`, `$shadow`.
- Одиниці — `px`, відступи кратні 4 (найчастіше 8/12/16/24/32/40). `rem`/`em` і `var(--…)` не використовуються.
- `border-radius`: 8px за замовчуванням, 12px для великих карток, `50%` для кіл.

### Типографіка
- Шрифт задається тільки міксинами з `variables.scss`: `h1-font`…`h4-font` (і `-mobile` версії), `body-font`, `buttons`, `uppercase`, `small-text`, `input-text`. `font-size`/`font-weight` вручну не пишуться.
- Виняток: гліфи-іконки (стрілки, `×`) і декоративні числа (бейдж рівня). Їм дозволено ручний `font-size`.
- Заголовки пишуться mobile-first:
  ```scss
  .title {
    margin: 0;
    color: $text-main;

    @include h2-font-mobile;

    @media (min-width: $breakpoint-s) {
      @include h2-font;
    }
  }
  ```

### Адаптивність і layout
- Тільки mobile-first: базові стилі для мобільних, розширення через `@media (min-width: $breakpoint-s | $breakpoint-m | $breakpoint-l)` (768 / 1024 / 1200). Без `max-width`-медіа і без чисел замість змінних.
- `@media` вкладається всередину класу, а не виноситься в кінець файлу.
- Сторінка використовує `@include page-container`, секція всередині неї — `@include section-container`.
- Сторінки авторизації та форми профілю збираються з міксинів `auth-form.scss`: кожен клас робить один `@include`.

### Порядок усередині правила
layout (display/flex/grid/gap/padding/розміри) → кольори, бордер, радіус → `transition` → `@include` типографіки → стани (`&:hover`, `&:focus-visible`, `&:disabled`, `&:active`) → `@media`.

### Стани та анімації
- `transition` задається тільки для конкретних властивостей (`background-color 0.2s ease`), без `all`. Виняток — інпути в `auth-form.scss`. Один `transition` на правило.
- Hover акцентної кнопки: `background-color: $accent-hover`.
