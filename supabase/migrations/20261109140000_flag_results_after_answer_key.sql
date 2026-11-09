-- A grant lets a student retake a test after the answer key was already open, and
-- that result looked the same as an honest one. The key can only close again
-- through a grant, so a grant made while it is open records that moment, and every
-- later result of that student and test is flagged. Older results stay unflagged:
-- there is no record of when their key was open.
--
-- The functions below repeat their latest versions with these additions:
-- - finalize_quiz_attempt (20261108120000_quiz_attempts): results.after_key;
-- - grant_extra_attempt (20261108120000_quiz_attempts): records key_opened_at;
-- - get_student_attempts (20261108120000_quiz_attempts): key_open for the admin
--   confirmation;
-- - get_admin_results (20261107120000_track_test_content_changes): after_key.
alter table public.test_attempt_grants
  add column if not exists key_opened_at timestamptz;

alter table public.results
  add column if not exists after_key boolean not null default false;

create or replace function private.is_key_open(p_user_id uuid, p_test_id bigint)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    not exists (
      select 1 from public.quiz_attempts a
      where a.user_id = p_user_id and a.test_id = p_test_id and a.finished_at is null
    )
    and (
      select count(*) from public.results r
      where r.user_id = p_user_id and r.test_id = p_test_id
    ) >= private.attempts_allowed(p_user_id, p_test_id),
    false
  );
$$;

revoke all on function private.is_key_open(uuid, bigint) from public, anon, authenticated;

create or replace function private.finalize_quiz_attempt(p_attempt public.quiz_attempts)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_answers   jsonb;
  v_score     numeric;
  v_total     numeric;
  v_after_key boolean;
  v_result_id bigint;
begin
  v_answers := private.clean_attempt_answers(p_attempt.test_id, p_attempt.answers);

  select coalesce(sum(coalesce(tp.points, 1)), 0) into v_total
  from public.questions q
  left join public.test_parts tp on tp.id = q.part_id
  where q.test_id = p_attempt.test_id;

  if v_total = 0 then
    raise exception 'Test has no questions' using errcode = 'P0002';
  end if;

  select coalesce(sum(coalesce(tp.points, 1)), 0) into v_score
  from jsonb_each_text(v_answers) p
  join public.questions q on q.id::text = p.key
  join public.answers a on a.id::text = p.value and a.is_correct
  left join public.test_parts tp on tp.id = q.part_id;

  v_after_key := exists (
    select 1 from public.test_attempt_grants g
    where g.user_id = p_attempt.user_id
      and g.test_id = p_attempt.test_id
      and g.key_opened_at is not null
  );

  insert into public.results (test_id, user_id, score, total, after_key)
  values (p_attempt.test_id, p_attempt.user_id, v_score, v_total, v_after_key)
  returning id into v_result_id;

  insert into public.result_answers (result_id, question_id, answer_id)
  select v_result_id, p.key::bigint, p.value::bigint
  from jsonb_each_text(v_answers) p;

  update public.quiz_attempts a
  set answers = v_answers,
      finished_at = now(),
      result_id = v_result_id
  where a.id = p_attempt.id;

  return private.quiz_result_payload(v_result_id, p_attempt.user_id, p_attempt.test_id);
end;
$$;

revoke all on function private.finalize_quiz_attempt(public.quiz_attempts) from public, anon, authenticated;

create or replace function public.grant_extra_attempt(p_user_id uuid, p_test_id bigint)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_key_open boolean;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated' using errcode = '28000';
  end if;

  if not private.is_admin() then
    raise exception 'Forbidden' using errcode = '42501';
  end if;

  if not exists (
    select 1 from public.profiles p
    where p.id = p_user_id and p.role = 'student'
  ) then
    raise exception 'Student not found' using errcode = 'P0002';
  end if;

  if not exists (select 1 from public.tests t where t.id = p_test_id) then
    raise exception 'Test not found' using errcode = 'P0002';
  end if;

  v_key_open := private.is_key_open(p_user_id, p_test_id);

  insert into public.test_attempt_grants (user_id, test_id, extra_attempts, key_opened_at)
  values (p_user_id, p_test_id, 1, case when v_key_open then now() end)
  on conflict (user_id, test_id) do update
  set extra_attempts = public.test_attempt_grants.extra_attempts + 1,
      key_opened_at = coalesce(
        public.test_attempt_grants.key_opened_at,
        excluded.key_opened_at
      ),
      updated_at = now();

  return jsonb_build_object(
    'attempts_used', private.attempts_used(p_user_id, p_test_id),
    'attempts_allowed', private.attempts_allowed(p_user_id, p_test_id)
  );
end;
$$;

revoke all on function public.grant_extra_attempt(uuid, bigint) from public, anon;
grant execute on function public.grant_extra_attempt(uuid, bigint) to authenticated;

create or replace function public.get_student_attempts(p_user_id uuid)
returns jsonb
language plpgsql
stable
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

  return (
    select coalesce(jsonb_agg(
      jsonb_build_object(
        'test_id', t.id,
        'title', t.title,
        'attempts_used', private.attempts_used(p_user_id, t.id),
        'attempts_allowed', private.attempts_allowed(p_user_id, t.id),
        'key_open', private.is_key_open(p_user_id, t.id)
      )
      order by t.title
    ), '[]'::jsonb)
    from public.tests t
    where exists (
        select 1 from public.results r
        where r.test_id = t.id and r.user_id = p_user_id
      )
      or exists (
        select 1 from public.quiz_attempts a
        where a.test_id = t.id and a.user_id = p_user_id
      )
  );
end;
$$;

revoke all on function public.get_student_attempts(uuid) from public, anon;
grant execute on function public.get_student_attempts(uuid) to authenticated;

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

  v_pattern := '%' || replace(replace(replace(
    coalesce(trim(p_query), ''), '\', '\\'), '%', '\%'), '_', '\_') || '%';

  with filtered as (
    select r.id, r.test_id, r.user_id, r.score, r.total, r.created_at, r.after_key,
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
        'after_key', page.after_key,
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
