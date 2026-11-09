-- Every approved user could read the questions, answers and parts of any test
-- without starting an attempt, so a test could be studied with no timer and no
-- used attempt. Test content now opens with the first attempt and stays open for
-- the result review. Placement goes through security definer RPCs and is not
-- affected. Permissive policies are OR-ed, so the old ones are replaced.
--
-- questions(count) now returns zero before the first attempt, while the test list
-- and the start screen still show the size of a test. PostgREST exposes
-- public.question_count as a computed field: tests?select=question_count.
--
-- createSignedUrl needs select on the object, so a student gets the audio only
-- during an active attempt of that test. An already issued URL works until it
-- expires, and the play limit is still counted by the client calling
-- register_audio_play.
create or replace function private.readable_test_ids()
returns setof bigint
language sql
stable
security definer
set search_path = ''
as $$
  select t.id
  from public.tests t
  where private.is_admin()
  union
  select r.test_id
  from public.results r
  where r.user_id = auth.uid() and private.is_approved()
  union
  select a.test_id
  from public.quiz_attempts a
  where a.user_id = auth.uid() and private.is_approved();
$$;

revoke all on function private.readable_test_ids() from public, anon;
grant execute on function private.readable_test_ids() to authenticated;

drop policy if exists "questions: approved select" on public.questions;
drop policy if exists "questions: attempt select" on public.questions;
create policy "questions: attempt select"
  on public.questions
  for select
  to authenticated
  using (test_id in (select private.readable_test_ids()));

drop policy if exists "answers: approved select" on public.answers;
drop policy if exists "answers: attempt select" on public.answers;
create policy "answers: attempt select"
  on public.answers
  for select
  to authenticated
  using (
    question_id in (
      select q.id
      from public.questions q
      where q.test_id in (select private.readable_test_ids())
    )
  );

drop policy if exists "test_parts: approved select" on public.test_parts;
drop policy if exists "test_parts: attempt select" on public.test_parts;
create policy "test_parts: attempt select"
  on public.test_parts
  for select
  to authenticated
  using (test_id in (select private.readable_test_ids()));

create or replace function public.question_count(p_test public.tests)
returns int
language sql
stable
security definer
set search_path = ''
as $$
  select count(*)::int
  from public.questions q
  where q.test_id = p_test.id and private.is_approved();
$$;

revoke all on function public.question_count(public.tests) from public, anon;
grant execute on function public.question_count(public.tests) to authenticated;

create or replace function private.playable_audio_paths()
returns setof text
language sql
stable
security definer
set search_path = ''
as $$
  select tp.audio_path
  from public.quiz_attempts a
  join public.test_parts tp on tp.test_id = a.test_id
  where a.user_id = auth.uid()
    and a.finished_at is null
    and tp.audio_path is not null
    and not private.is_attempt_expired(a)
    and private.is_approved();
$$;

revoke all on function private.playable_audio_paths() from public, anon;
grant execute on function private.playable_audio_paths() to authenticated;

drop policy if exists "test-audio: approved select" on storage.objects;
drop policy if exists "test-audio: attempt select" on storage.objects;
create policy "test-audio: attempt select"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'test-audio'
    and (
      (select private.is_admin())
      or name in (select private.playable_audio_paths())
    )
  );
