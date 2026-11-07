-- Results keep the score they got when submitted, even after the admin edits
-- the test (save_test deletes result_answers of removed questions/answers).
-- tests.content_updated_at records the last change of the test content
-- (parts, questions, answers), so the UI can mark results submitted before
-- that change as "test changed". Edits of the title, description or timer do
-- not count: they do not affect answers. null means never changed after the
-- first save.
alter table public.tests
  add column if not exists content_updated_at timestamptz;

create or replace function private.touch_test_content()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_row     record;
  v_test_id bigint;
begin
  if tg_op = 'DELETE' then
    v_row := old;
  else
    v_row := new;
  end if;

  if tg_table_name = 'answers' then
    select q.test_id into v_test_id
    from public.questions q
    where q.id = v_row.question_id;
  else
    v_test_id := v_row.test_id;
  end if;

  if v_test_id is not null then
    update public.tests
    set content_updated_at = now()
    where id = v_test_id;
  end if;

  return null;
end;
$$;

revoke all on function private.touch_test_content() from public, anon, authenticated;

-- Row updates fire only when something actually changed: save_test rewrites
-- every row it receives, including untouched ones.
drop trigger if exists test_parts_touch_test_content on public.test_parts;
create trigger test_parts_touch_test_content
  after insert or delete on public.test_parts
  for each row execute function private.touch_test_content();

drop trigger if exists test_parts_touch_test_content_update on public.test_parts;
create trigger test_parts_touch_test_content_update
  after update on public.test_parts
  for each row when (old.* is distinct from new.*)
  execute function private.touch_test_content();

drop trigger if exists questions_touch_test_content on public.questions;
create trigger questions_touch_test_content
  after insert or delete on public.questions
  for each row execute function private.touch_test_content();

drop trigger if exists questions_touch_test_content_update on public.questions;
create trigger questions_touch_test_content_update
  after update on public.questions
  for each row when (old.* is distinct from new.*)
  execute function private.touch_test_content();

drop trigger if exists answers_touch_test_content on public.answers;
create trigger answers_touch_test_content
  after insert or delete on public.answers
  for each row execute function private.touch_test_content();

drop trigger if exists answers_touch_test_content_update on public.answers;
create trigger answers_touch_test_content_update
  after update on public.answers
  for each row when (old.* is distinct from new.*)
  execute function private.touch_test_content();

-- Same as 20261029160000_admin_results_pagination, plus
-- tests.content_updated_at in every item.
create or replace function public.get_admin_results(
  p_query text default '',
  p_sort text default 'date',
  p_limit int default 20,
  p_offset int default 0
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_pattern text;
  v_total   int;
  v_items   jsonb;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated' using errcode = '28000';
  end if;

  if not private.is_admin() then
    raise exception 'Forbidden' using errcode = '42501';
  end if;

  if p_sort is null or p_sort not in ('date', 'test', 'student') then
    raise exception 'Invalid sort' using errcode = '22023';
  end if;

  if p_limit is null or p_limit not between 1 and 100
    or p_offset is null or p_offset < 0 then
    raise exception 'Invalid page' using errcode = '22023';
  end if;

  -- Escape LIKE wildcards so the query is matched literally.
  v_pattern := '%' || replace(replace(replace(
    coalesce(trim(p_query), ''), '\', '\\'), '%', '\%'), '_', '\_') || '%';

  with filtered as (
    select r.id, r.test_id, r.user_id, r.score, r.total, r.created_at,
           t.title, t.test_type, t.content_updated_at, p.display_name
    from public.results r
    join public.tests t on t.id = r.test_id
    left join public.profiles p on p.id = r.user_id
    where t.title ilike v_pattern
       or p.display_name ilike v_pattern
  ),
  page as (
    select *
    from filtered
    order by
      case when p_sort = 'test' then title end asc nulls last,
      case when p_sort = 'student' then display_name end asc nulls last,
      created_at desc,
      id desc
    limit p_limit
    offset p_offset
  )
  select
    (select count(*) from filtered),
    coalesce(jsonb_agg(
      jsonb_build_object(
        'id', page.id,
        'test_id', page.test_id,
        'user_id', page.user_id,
        'score', page.score,
        'total', page.total,
        'created_at', page.created_at,
        'tests', jsonb_build_object(
          'title', page.title,
          'test_type', page.test_type,
          'content_updated_at', page.content_updated_at
        ),
        'profiles', case
          when page.display_name is null then null
          else jsonb_build_object('display_name', page.display_name)
        end
      )
      order by
        case when p_sort = 'test' then page.title end asc nulls last,
        case when p_sort = 'student' then page.display_name end asc nulls last,
        page.created_at desc,
        page.id desc
    ), '[]'::jsonb)
  into v_total, v_items
  from page;

  return jsonb_build_object('items', v_items, 'total', v_total);
end;
$$;

revoke all on function public.get_admin_results(text, text, int, int) from public, anon;
grant execute on function public.get_admin_results(text, text, int, int) to authenticated;

-- A new avatar gets a new file name, so the client removes the previous file.
-- Until now there was no delete policy and old avatars piled up in the bucket.
drop policy if exists "avatars: owner delete" on storage.objects;
create policy "avatars: owner delete"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
