-- Registration approval: a new account gets status 'pending' and has no
-- access to tests until an admin approves it. The restriction lives in RLS and
-- in the quiz RPCs, not only in the UI.

-- Existing users keep access: the column is added with default 'approved'
-- (backfilling current rows), then the default switches to 'pending' for new
-- sign-ups. handle_new_user does not set status, so metadata from signUp
-- cannot influence it. Clients cannot update it either: the column is not in
-- the profiles update grant.
alter table public.profiles
  add column if not exists status text not null default 'approved';

alter table public.profiles
  alter column status set default 'pending';

alter table public.profiles
  drop constraint if exists profiles_status_check;

alter table public.profiles
  add constraint profiles_status_check
  check (status in ('pending', 'approved', 'rejected'));

-- Admins always count as approved, whatever their status is.
create or replace function private.is_approved()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and (status = 'approved' or role = 'admin')
  );
$$;

revoke all on function private.is_approved() from public, anon;
grant execute on function private.is_approved() to authenticated;

-- Test content was readable by every authenticated user (using (true)), and
-- test_parts even by anon. Permissive policies are OR-ed, so the old ones are
-- replaced rather than complemented. Placement test keeps working for anon and
-- pending users: it goes through security definer RPCs.
drop policy if exists "Users can view all tests" on public.tests;
drop policy if exists "tests: approved select" on public.tests;
create policy "tests: approved select"
  on public.tests
  for select
  to authenticated
  using ((select private.is_approved()));

drop policy if exists "Users can view all questions" on public.questions;
drop policy if exists "Users can check all questions" on public.questions;
drop policy if exists "questions: approved select" on public.questions;
create policy "questions: approved select"
  on public.questions
  for select
  to authenticated
  using ((select private.is_approved()));

drop policy if exists "Users can view all answers" on public.answers;
drop policy if exists "answers: approved select" on public.answers;
create policy "answers: approved select"
  on public.answers
  for select
  to authenticated
  using ((select private.is_approved()));

drop policy if exists "Allow public read access" on public.test_parts;
drop policy if exists "test_parts: approved select" on public.test_parts;
create policy "test_parts: approved select"
  on public.test_parts
  for select
  to authenticated
  using ((select private.is_approved()));

-- Only admins change statuses. profiles has no admin update policy and the
-- column is not granted, so this goes through a security definer RPC.
create or replace function public.set_profile_status(p_user_id uuid, p_status text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_status text;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated' using errcode = '28000';
  end if;

  if not private.is_admin() then
    raise exception 'Forbidden' using errcode = '42501';
  end if;

  if p_status is null or p_status not in ('pending', 'approved', 'rejected') then
    raise exception 'Invalid status %', p_status using errcode = '22023';
  end if;

  update public.profiles
  set status = p_status
  where id = p_user_id
  returning status into v_status;

  if v_status is null then
    raise exception 'Profile % not found', p_user_id using errcode = 'P0002';
  end if;

  return jsonb_build_object('id', p_user_id, 'status', v_status);
end;
$$;

revoke all on function public.set_profile_status(uuid, text) from public, anon;
grant execute on function public.set_profile_status(uuid, text) to authenticated;

-- submit_quiz is security definer and bypasses RLS, so it checks approval
-- itself. Body is unchanged apart from the check and schema-qualified names.
create or replace function public.submit_quiz(p_test_id bigint, p_answers jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id   uuid := auth.uid();
  v_invalid   int;
  v_score     numeric;
  v_total     numeric;
  v_result_id bigint;
begin
  if v_user_id is null then
    raise exception 'Not authenticated' using errcode = '28000';
  end if;

  if not private.is_approved() then
    raise exception 'Account is not approved' using errcode = '42501';
  end if;

  if p_answers is null or jsonb_typeof(p_answers) <> 'object' then
    raise exception 'Invalid answers payload' using errcode = '22023';
  end if;

  if not exists (select 1 from public.tests where id = p_test_id) then
    raise exception 'Test not found' using errcode = 'P0002';
  end if;

  select count(*) into v_invalid
  from (
    select key::bigint as question_id, value::bigint as answer_id
    from jsonb_each_text(p_answers)
  ) p
  left join public.questions q
    on q.id = p.question_id and q.test_id = p_test_id
  left join public.answers a
    on a.id = p.answer_id and a.question_id = p.question_id
  where q.id is null or a.id is null;

  if v_invalid > 0 then
    raise exception 'Invalid question or answer for this test' using errcode = '22023';
  end if;

  select coalesce(sum(coalesce(tp.points, 1)), 0) into v_total
  from public.questions q
  left join public.test_parts tp on tp.id = q.part_id
  where q.test_id = p_test_id;

  if v_total = 0 then
    raise exception 'Test has no questions';
  end if;

  select coalesce(sum(coalesce(tp.points, 1)), 0) into v_score
  from (
    select key::bigint as question_id, value::bigint as answer_id
    from jsonb_each_text(p_answers)
  ) p
  join public.questions q on q.id = p.question_id
  join public.answers a on a.id = p.answer_id and a.is_correct
  left join public.test_parts tp on tp.id = q.part_id;

  insert into public.results (test_id, user_id, score, total)
  values (p_test_id, v_user_id, v_score, v_total)
  returning id into v_result_id;

  insert into public.result_answers (result_id, question_id, answer_id)
  select v_result_id, key::bigint, value::bigint
  from jsonb_each_text(p_answers);

  return jsonb_build_object(
    'result_id', v_result_id,
    'score', v_score,
    'total', v_total
  );
end;
$$;

revoke all on function public.submit_quiz(bigint, jsonb) from public, anon;
grant execute on function public.submit_quiz(bigint, jsonb) to authenticated;

-- The answer key is shown to an admin, or to an approved user who has already
-- taken the test. A rejected user keeps their results but not the key.
create or replace function public.get_correct_answers(p_test_id bigint)
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

  if not (
    private.is_admin()
    or (
      private.is_approved()
      and exists (
        select 1
        from public.results r
        where r.test_id = p_test_id
          and r.user_id = auth.uid()
      )
    )
  ) then
    raise exception 'Access denied' using errcode = '42501';
  end if;

  return (
    select coalesce(
      jsonb_agg(
        jsonb_build_object('question_id', a.question_id, 'answer_id', a.id)
        order by a.question_id, a.id
      ),
      '[]'::jsonb
    )
    from public.answers a
    join public.questions q on q.id = a.question_id
    where q.test_id = p_test_id
      and a.is_correct
  );
end;
$$;

revoke all on function public.get_correct_answers(bigint) from public, anon;
grant execute on function public.get_correct_answers(bigint) to authenticated;
