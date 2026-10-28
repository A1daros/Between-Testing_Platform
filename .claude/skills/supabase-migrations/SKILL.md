---
name: supabase-migrations
description: Правила роботи зі схемою Supabase/Postgres — як писати файли в supabase/migrations, RPC-функції (SECURITY DEFINER, search_path, перевірка адміна, коди помилок), RLS-політики, гранти (зокрема колонкові на answers і profiles), бакети Storage, а також пастки наявної схеми. Використовуй перед створенням або зміною міграції, RPC, політики, таблиці, бакета, а також перед зміною сервісу, який читає answers/profiles/results.
---

# Правила міграцій і схеми БД

Джерело правди — `supabase/migrations/`. Базова міграція `20261028135607_remote_schema.sql` — знімок хмари, зроблений `supabase db pull`.

## Файли міграцій

- Ім'я: `YYYYMMDDHHMMSS_snake_case_опис.sql` англійською (`20261028150000_harden_profiles_and_drop_save_quiz_result.sql`). Таймстемп має бути більшим за останній наявний.
- Кожна зміна схеми — **новий** файл. Застосовані міграції не редагуються. Єдиний виняток — базова міграція, коли треба дописати в неї те, що вже є в хмарі, але `db pull` не експортує (наприклад, рядки `storage.buckets`).
- Рукописний SQL — нижнім регістром, імена без лапок, завжди зі схемою (`public.tests`, `private.is_admin()`). Стиль із лапками й великими літерами в базовій міграції — це артефакт `pg_dump`, його не копіюємо.
- Коментарі англійською, над блоком, пояснюють **чому** (див. `harden_profiles...`).
- Пиши так, щоб повторний запуск не ламався: `if exists` / `if not exists`, `create or replace function`, `on conflict do nothing`, `drop policy if exists` перед `create policy`.
- Застосовує міграції користувач. Після зміни схеми онови `src/types/database.ts`.

## Що `db pull` бачить, а що ні

- Бачить: таблиці, типи, функції (зокрема тригерні), RLS-політики, гранти в `public`/`private`, а також окремим diff-ом зміни в `auth` і `storage` (тригер на `auth.users`, політики на `storage.objects`).
- Не бачить: рядки `storage.buckets`, файли в Storage, дані таблиць, налаштування Auth/SMTP/секрети. Нові бакети додавай вручну через `insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) ... on conflict (id) do nothing`.

## Привілеї: RLS — єдиний бар'єр

- `alter default privileges` у схемі `public` дає `anon` і `authenticated` **ALL** на кожну нову таблицю, послідовність і функцію. Тому:
  - кожна нова таблиця: `alter table ... enable row level security` + явні політики в тій самій міграції;
  - забирай непотрібні права явно (`revoke insert, update, delete, truncate on table ... from anon, authenticated`), якщо таблицю змінюють лише через RPC або адмін;
  - кожна нова функція: `revoke all on function ... from public, anon;`, а потім `grant execute` лише потрібним ролям. `anon` отримує доступ тільки до placement-функцій.
- **`answers.is_correct` захищено колонковими грантами**: `anon`/`authenticated` мають `select` лише на `id`, `question_id`, `answer_text`. Наслідки:
  - ніколи не роби `grant select on table public.answers` цілком;
  - нову колонку в `answers`, яку має читати клієнт, відкривай окремим `grant select (col)`;
  - у клієнті `answers(*)` / `select('*')` по `answers` впаде з помилкою доступу. Завжди перелічуй колонки, як у `resultAnswers.ts`.
- **`profiles`**: клієнт може оновлювати лише `display_name`, `birth_date`, `avatar_url` (колонковий грант). `role` і будь-які службові поля (майбутній `status` для схвалення) **не** додавай у цей грант — їх змінює тільки RPC/адмін. Нове поле, яке редагує сам користувач, додавай окремим `grant update (col)`.
- **`results` / `result_answers`**: `insert` для клієнта відкликано, записи робить лише `submit_quiz`. Не повертай клієнтського insert-у й не створюй RPC, що приймає `user_id` чи `score` від клієнта (з цієї причини видалено `save_quiz_result`).

## RLS-політики

- Перевірка адміна в нових політиках: `using ((select private.is_admin()))`. Старий інлайн-патерн `exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')` не копіюй. Усередині політики на самій `profiles` він дає рекурсію, тому там уже використовується `is_admin()`.
- `auth.uid()` загортай у `(select auth.uid())`: так значення рахується один раз на запит, а не для кожного рядка.
- Завжди вказуй `to anon` / `to authenticated` / `to anon, authenticated`. Політика без `to` діє на `public`, тобто на всіх.
- Одна політика на дію й роль, із назвою на кшталт `"<table>: <who> <action>"`. Перш ніж додавати нову, перевір, чи її не перекриває наявна (політики permissive, вони об'єднуються через OR). Широкі `using (true)` для `authenticated` на `tests`/`questions`/`answers` уже є, тому обмеження доступу до тестів (схвалення реєстрації) потребує **заміни** цих політик, а не додавання нових.
- Storage: шлях об'єкта — `<user_id>/<file>`, власника перевіряє `(storage.foldername(name))[1] = (select auth.uid())::text`. Для публічного бакета читання за public URL працює й без політик, вони потрібні тільки для API (list/upload/update/delete).

## RPC-функції

- Шаблон:

  ```sql
  create or replace function public.fn_name(p_arg bigint)
  returns jsonb
  language plpgsql
  security definer
  set search_path = ''
  as $$
  begin
    if auth.uid() is null then
      raise exception 'Not authenticated' using errcode = '28000';
    end if;
    if not private.is_admin() then
      raise exception 'Forbidden' using errcode = '42501';
    end if;
    -- ...
  end;
  $$;

  revoke all on function public.fn_name(bigint) from public, anon;
  grant execute on function public.fn_name(bigint) to authenticated;
  ```

- `security definer` обходить RLS, тому вся авторизація має бути **всередині функції**: `auth.uid()`, `private.is_admin()`, перевірка власника. Користувача бери з `auth.uid()`, ніколи з параметра.
- `set search_path = ''` і повні імена `public.x` (як у `get_correct_answers`). Частина старих функцій має `search_path = 'public'` і неповні імена; нові так не пишемо.
- Параметри мають префікс `p_`, змінні — `v_`, константи — `c_`.
- Коди помилок: `28000` — не автентифікований, `42501` — немає прав, `P0002` — не знайдено, `22023` — невалідний параметр. Повідомлення англійською. UI перекладає їх у хуках/компонентах.
- Повертай `jsonb` (`jsonb_build_object`, `coalesce(jsonb_agg(...), '[]'::jsonb)`), щоб порожній результат не був `null`.
- Ключі JSON-пейлоаду, які шле клієнт, — у camelCase (`levelId`, `timerEnabled`, `parts[].uiId`, `questions[].partId`, `answers[].isCorrect`). Ключі відповіді — у snake_case (`result_id`, `level_code`).
- Ніколи не повертай клієнту `is_correct` разом із питаннями. Правильні відповіді віддає лише `get_correct_answers`: адміну або тому, хто вже здавав тест.
- Зміна сигнатури (типи чи кількість параметрів) створює **нову перегрузку**. Стару функцію треба явно видалити: `drop function if exists public.fn(old_types)`.

## Модель і зв'язки (що варто пам'ятати)

- `tests.check_test_relations`: `final_test` → `level_id` обов'язковий і `submodule_id` = null; `submodule_quiz` → навпаки; `placement_test` → обидва null.
- Бал: кожне питання дає `test_parts.points` (або 1, якщо частини немає). `score` і `total` рахує `submit_quiz`.
- Більшість FK **без `on delete cascade`** (`answers→questions`, `questions→tests`, `results→tests`, `result_answers→*`). Тому `delete_test` і `save_test` видаляють дочірні рядки вручну в порядку `result_answers → results → answers → questions → test_parts → tests`. Нова дочірня таблиця тестів = оновлення обох функцій (або `cascade` на новому FK).
- **`save_test` при редагуванні видаляє всі результати учнів за цей тест**, а потім створює питання наново, тож id змінюються. Зважай на це в будь-якій фічі, що посилається на `questions.id`/`answers.id` (аудіо, reading-текст). `save_test` — `security invoker` і завжди ставить `test_type = 'final_test'`.
- `results.user_id` має два FK: на `auth.users` і на `profiles`. Другий потрібен PostgREST для вкладення `results → profiles(display_name)`, тож не видаляй його.
- `profiles.id → auth.users` без cascade: видалення користувача з Auth упреться в профіль і його результати.
- Тригер `on_auth_user_created` → `public.handle_new_user()` заповнює `profiles` з `raw_user_meta_data` (`display_name`, `name`, `surname`). Нову обов'язкову колонку в `profiles` давай з `default` або заповнюй у цій функції, інакше реєстрація впаде.
- Бакети: `avatars` (public, 2 МБ, png/jpeg/webp, політики на власника) і `teachers` (public, без обмежень і без політик, файли — через дашборд). Новий бакет одразу отримує ліміт розміру й `allowed_mime_types`.

## Чекліст для нової міграції

1. Новий файл із правильним таймстемпом; SQL можна безпечно запустити повторно.
2. Нова таблиця: RLS увімкнено, політики з `to <role>`, зайві гранти відкликано.
3. Нова функція: `security definer` + `search_path = ''` + перевірки всередині + `revoke ... from public, anon` + `grant execute`.
4. Колонкові гранти (`answers`, `profiles`) перевірено для нових колонок.
5. Оновлено `src/types/database.ts` і відповідний `src/services/<domain>.ts`.
6. `npm run build` і `npm run lint`.
