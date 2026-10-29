-- profiles.email is copied from auth.users only on signup, so it went stale
-- after an email change. Keep it in sync on every confirmed change.
create or replace function private.sync_profile_email()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles
  set email = new.email
  where id = new.id;

  return new;
end;
$$;

revoke all on function private.sync_profile_email() from public, anon, authenticated;

drop trigger if exists on_auth_user_email_updated on auth.users;

create trigger on_auth_user_email_updated
  after update of email on auth.users
  for each row
  when (old.email is distinct from new.email)
  execute function private.sync_profile_email();

-- Backfill profiles whose email has already drifted.
update public.profiles p
set email = u.email
from auth.users u
where u.id = p.id
  and p.email is distinct from u.email;

-- submit_quiz accepted any test, including the placement test, whose level is
-- computed by calculate_placement_level and is never stored as a result.
-- Body is unchanged apart from the test type check.
create or replace function public.submit_quiz(p_test_id bigint, p_answers jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id   uuid := auth.uid();
  v_test_type text;
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

  select test_type into v_test_type
  from public.tests
  where id = p_test_id;

  if not found then
    raise exception 'Test not found' using errcode = 'P0002';
  end if;

  if v_test_type not in ('final_test', 'submodule_quiz') then
    raise exception 'This test type cannot be submitted' using errcode = '22023';
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
