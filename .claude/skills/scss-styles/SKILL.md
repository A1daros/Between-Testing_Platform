---
name: scss-styles
description: Правила стилів проєкту (SCSS Modules) — структура файлів, підключення variables/mixins, назви класів, кольори, типографіка, mobile-first брейкпоінти, порядок властивостей. Використовуй перед створенням або зміною будь-якого .scss файлу чи стилізацією компонента.
---

# Правила стилів (SCSS Modules)

## Структура

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

- Не використовуй inline-стилі (`style={{…}}`) і глобальний CSS для правил конкретного компонента. Виняток — динамічні значення, які обчислюються в рантаймі (наприклад, `style={{ width: `${progress}%` }}` для прогрес-бару).

## Назви класів

- camelCase: `.descriptionWrapper`, `.sectionTitle`. Без BEM (`__`, `--`) і без дефісів.
- Типові назви: `.page` (корінь секції), `.wrapper`/`.container`, `.title`/`.description`/`.button`, `.xxxWrapper`/`.xxxSection`/`.xxxCard`.
- Модифікатори пишуться окремими класами (`.answerSelected`). У TSX їх комбінують шаблонним рядком: `` className={`${styles.a} ${styles.b}`} ``. `clsx` не використовується.

## Значення

- Кольори тільки зі змінних (`$text-main`, `$text-secondary`, `$accent`, `$accent-hover`, `$surface-1/2`, `$green`, `$red`…). Без hex у модулях. Якщо потрібен новий колір, його спершу додають у `variables.scss`.
- Прозорість задається через `rgba($змінна, α)`: `rgba($accent, 0.15)`, `rgba($text-main, 0.4)`.
- Бордери й тіні: `$card-border`, `$form-border`, `$shadow`.
- Одиниці — `px`, відступи кратні 4 (найчастіше 8/12/16/24/32/40). `rem`/`em` і `var(--…)` не використовуються.
- `border-radius`: 8px за замовчуванням, 12px для великих карток, `50%` для кіл.

## Типографіка

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

## Адаптивність і layout

- Тільки mobile-first: базові стилі для мобільних, розширення через `@media (min-width: $breakpoint-s | $breakpoint-m | $breakpoint-l)` (768 / 1024 / 1200). Без `max-width`-медіа і без чисел замість змінних.
- `@media` вкладається всередину класу, а не виноситься в кінець файлу.
- Сторінка використовує `@include page-container`, секція всередині неї — `@include section-container`.
- Сторінки авторизації та форми профілю збираються з міксинів `auth-form.scss`: кожен клас робить один `@include`.

## Порядок усередині правила

layout (display/flex/grid/gap/padding/розміри) → кольори, бордер, радіус → `transition` → `@include` типографіки → стани (`&:hover`, `&:focus-visible`, `&:disabled`, `&:active`) → `@media`.

## Стани та анімації

- `transition` задається тільки для конкретних властивостей (`background-color 0.2s ease`), без `all`. Виняток — інпути в `auth-form.scss`. Один `transition` на правило.
- Hover акцентної кнопки: `background-color: $accent-hover`.
