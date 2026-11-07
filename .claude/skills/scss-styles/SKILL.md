---
name: scss-styles
description: Правила стилів проєкту (SCSS Modules) — стиль пост-модерн мінімалізм, структура файлів, підключення variables/mixins, кольори, кнопки, типографіка, mobile-first брейкпоінти, порядок властивостей. Використовуй перед створенням або зміною будь-якого .scss файлу чи стилізацією компонента.
---

# Правила стилів (SCSS Modules)

## Візуальна мова

Пост-модерн мінімалізм: білий фон, майже чорний текст (`$ink`) і **один** акцент — брендовий червоний (`$brand`), який використовується точково (мітки, номери, активний стан, код рівня, прогрес), ніколи не як заливка великих площ (виняток — CTA `button-brand` на темному блоці).

- Тонкі лінії (`$border`) замість карток і тіней. Списки — рядки через лінії з номером `01`.
- Великі display-числа й заголовки поруч із дрібними uppercase-мітками `BETWEEN / X` (`section-label`).
- Сітки з лініями: контейнер `border-top` + `border-left`, клітинки `border-right` + `border-bottom`.
- Тіні: лише `$shadow-hard` (hover основної кнопки, модалка) і `$shadow` для висувних панелей.
- Еталон — квіз, placement test і головна.

## Структура

- Один `X.module.scss` на компонент, поруч із `X.tsx`. Імпорт: `import styles from './X.module.scss'`.
- Глобальні стилі (reset, `body`, `:focus-visible`, `prefers-reduced-motion`, layout застосунку) — тільки в `src/styles/App.module.scss`. `:global` у модулях не використовується.
- Спільні файли в `src/styles`:
  - `variables.scss` — кольори, бордер, радіус, тіні, крива `$ease`, брейкпоінти **і типографічні міксини**;
  - `mixins.scss` — `page-container`, `section-container`, `section-label`, `page-title`, `section-title`, `section-description`, кнопки (`button-primary`, `button-secondary`, `button-brand`), `tag`, `focus-ring`;
  - `mixins/form.scss` — міксини форм (wrapper, container, input, кнопки, картки помилки та успіху, `form-section*` для профілю);
  - `mixins/admin-form.scss` — поля форм адмінки.
- Заголовок секції або сторінки (мітка + заголовок + опис) — компонент `SectionHeader` (`modules/shared/components`), для сторінки `as='h1'`.
- Підключення тільки через `@use` з відносним шляхом, без розширення, `as *`. `@import` не використовується. `@use` не реекспортує змінні, тому `variables` треба підключати явно навіть разом із `mixins`:

  ```scss
  @use '../../../../styles/variables' as *;
  @use '../../../../styles/mixins' as *;
  ```

- Не використовуй inline-стилі (`style={{…}}`) і глобальний CSS для правил конкретного компонента. Виняток — динамічні значення, які обчислюються в рантаймі (наприклад, ширина прогрес-бару).

## Назви класів

- camelCase: `.descriptionWrapper`, `.sectionTitle`. Без BEM (`__`, `--`) і без дефісів.
- Типові назви: `.page` (корінь секції), `.wrapper`/`.container`, `.title`/`.description`/`.button`, `.xxxWrapper`/`.xxxSection`/`.xxxCard`.
- Модифікатори пишуться окремими класами (`.answerSelected`). У TSX їх комбінують шаблонним рядком. `clsx` не використовується.

## Значення

- Кольори тільки зі змінних: `$ink`/`$ink-hover` (заливки, основні кнопки), `$text-main`, `$text-secondary`, `$text-muted` (декоративні номери), `$text-inverse`, `$background`, `$surface` (теплий світлий фон), `$line`, `$brand`/`$brand-hover`, `$success`, `$error`. Без hex у модулях. Новий колір спершу додають у `variables.scss`.
- Прозорість — через `rgba($змінна, α)`.
- Бордер — `$border` (або `2px solid $ink` для акцентної лінії-розділювача).
- Одиниці — `px`, відступи кратні 4. Виняток — лінії 1–2px. `rem`/`em` і `var(--…)` не використовуються.
- `border-radius: $radius` (4px) скрізь, `50%` для кіл.

## Кнопки

- Тільки міксини з `mixins.scss`: `button-primary` (чорна, hover — зсув і `$shadow-hard`), `button-secondary` (контур, hover — заливка), `button-brand` (червона, лише на темному фоні). Текстових посилань-кнопок зі стрілками не робимо: другорядна дія — це `button-secondary`. Власні стилі кнопок у модулях не пишуться.
- Тексти кнопок — uppercase (задає міксин).

## Типографіка

- Шрифт — `'Montserrat Variable'` (пакет `@fontsource-variable/montserrat`) і задається тільки міксинами з `variables.scss`: `display-font`, `h1-font`…`h4-font` (і `-mobile` версії), `body-font` (16/26, 400), `body-small` (14/22, 500), `buttons`, `uppercase`, `small-text`, `input-text`. `font-size`/`font-weight` вручну не пишуться.
- Виняток: гліфи-іконки (стрілки, `×`) і декоративні великі елементи (код рівня в результаті placement, `404`, словесний знак у футері).
- Числа, що змінюються (бал, таймер, лічильники), — з `font-variant-numeric: tabular-nums`.
- Довгий текст обмежується `max-width: 680px` (`section-description`).
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
- `@media` вкладається всередину класу.
- Хедер, контент і футер використовують один `@include page-container`, щоб усе стояло на одних вертикалях. Секція всередині сторінки — `@include section-container`.
- Сторінки авторизації та форми профілю збираються з міксинів `form.scss`. Поле з плаваючим лейблом, картки помилки/успіху та стан помилки сторінки вже є компонентами (`FormField`, `FormTextarea`, `Alert`, `ErrorState`).

## Порядок усередині правила

layout (display/flex/grid/gap/padding/розміри) → кольори, бордер, радіус → `transition` → `@include` типографіки → стани (`&:hover`, `&:focus-visible`, `&:disabled`, `&:active`) → `@media`.

## Стани та анімації

- `transition` — тільки для конкретних властивостей, з кривою `$ease`: `0.15s` для кольору, `0.25s` для руху. Без `all` (виняток — інпути в `form.scss`).
- Hover — зміна кольору на `$brand`, зсув стрілки або рядка на 4px. Без `scale` і «підстрибування» карток.
- Фокус — глобальний `:focus-visible` з `App.module.scss`; локально перевизначати лише за потреби.
- `prefers-reduced-motion` вимикає анімації глобально; автоплей у JS теж його перевіряє.
