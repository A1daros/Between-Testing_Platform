-- save_test moved every part to a negative sort_order before renumbering, which
-- fired the content trigger, so any save of a test with parts marked its results
-- as "test changed". With a deferred constraint the temporary move is not needed:
-- rows that keep their position are not changed, and uniqueness is still checked
-- at commit.
alter table public.test_parts
  drop constraint if exists test_parts_test_id_sort_order_key;

alter table public.test_parts
  add constraint test_parts_test_id_sort_order_key
  unique (test_id, sort_order)
  deferrable initially deferred;

create or replace function public.save_test(p_payload jsonb, p_test_id bigint default null)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_test_id      bigint;
  v_part         jsonb;
  v_part_id      bigint;
  v_part_map     jsonb    := '{}'::jsonb;
  v_part_ids     bigint[] := '{}';
  v_question     jsonb;
  v_question_id  bigint;
  v_question_ids bigint[] := '{}';
  v_answer       jsonb;
  v_answer_id    bigint;
  v_answer_ids   bigint[] := '{}';
  v_idx          integer;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated' using errcode = '28000';
  end if;

  if not private.is_admin() then
    raise exception 'Only admins can save tests' using errcode = '42501';
  end if;

  if p_payload is null or jsonb_typeof(p_payload) <> 'object' then
    raise exception 'p_payload must be a JSON object' using errcode = '22023';
  end if;

  if p_test_id is null then
    insert into public.tests
      (title, description, level_id, test_type, timer_enabled, timer_type, timer_duration)
    values (
      p_payload->>'title',
      p_payload->>'description',
      (p_payload->>'levelId')::bigint,
      'final_test',
      coalesce((p_payload->>'timerEnabled')::boolean, false),
      p_payload->>'timerType',
      (p_payload->>'timerDuration')::integer
    )
    returning id into v_test_id;
  else
    -- test_type is never changed by the form
    update public.tests
    set title          = p_payload->>'title',
        description    = p_payload->>'description',
        level_id       = (p_payload->>'levelId')::bigint,
        timer_enabled  = coalesce((p_payload->>'timerEnabled')::boolean, false),
        timer_type     = p_payload->>'timerType',
        timer_duration = (p_payload->>'timerDuration')::integer
    where id = p_test_id
    returning id into v_test_id;

    if v_test_id is null then
      raise exception 'Test % not found', p_test_id using errcode = 'P0002';
    end if;
  end if;

  -- Parts. An id that does not belong to this test is rejected, so a payload
  -- cannot move rows from another test.
  v_idx := 0;
  for v_part in
    select value from jsonb_array_elements(coalesce(p_payload->'parts', '[]'::jsonb))
  loop
    v_idx := v_idx + 1;
    v_part_id := (v_part->>'id')::bigint;

    if v_part_id is null then
      insert into public.test_parts (test_id, title, instruction, points, sort_order, audio_path)
      values (
        v_test_id,
        v_part->>'title',
        v_part->>'instruction',
        (v_part->>'points')::integer,
        v_idx,
        nullif(btrim(v_part->>'audioPath'), '')
      )
      returning id into v_part_id;
    else
      update public.test_parts
      set title       = v_part->>'title',
          instruction = v_part->>'instruction',
          points      = (v_part->>'points')::integer,
          sort_order  = v_idx,
          audio_path  = case
                          when v_part ? 'audioPath'
                            then nullif(btrim(v_part->>'audioPath'), '')
                          else audio_path
                        end
      where id = v_part_id and test_id = v_test_id;

      if not found then
        raise exception 'Part % does not belong to test %', v_part_id, v_test_id
          using errcode = '22023';
      end if;
    end if;

    v_part_ids := v_part_ids || v_part_id;
    v_part_map := v_part_map || jsonb_build_object(v_part->>'uiId', v_part_id);
  end loop;

  -- Questions and answers. Only the columns the form edits are updated, the
  -- rest (level_id, title) stay as they are.
  v_idx := 0;
  for v_question in
    select value from jsonb_array_elements(coalesce(p_payload->'questions', '[]'::jsonb))
  loop
    v_idx := v_idx + 1;
    v_question_id := (v_question->>'id')::bigint;

    if v_question_id is null then
      insert into public.questions (test_id, part_id, question, sort_order, description)
      values (
        v_test_id,
        (v_part_map ->> (v_question->>'partId'))::bigint,
        v_question->>'question',
        v_idx,
        nullif(btrim(v_question->>'description'), '')
      )
      returning id into v_question_id;
    else
      update public.questions
      set part_id     = (v_part_map ->> (v_question->>'partId'))::bigint,
          question    = v_question->>'question',
          sort_order  = v_idx,
          description = case
                          when v_question ? 'description'
                            then nullif(btrim(v_question->>'description'), '')
                          else description
                        end
      where id = v_question_id and test_id = v_test_id;

      if not found then
        raise exception 'Question % does not belong to test %', v_question_id, v_test_id
          using errcode = '22023';
      end if;
    end if;

    v_question_ids := v_question_ids || v_question_id;

    for v_answer in
      select value from jsonb_array_elements(coalesce(v_question->'answers', '[]'::jsonb))
    loop
      v_answer_id := (v_answer->>'id')::bigint;

      if v_answer_id is null then
        insert into public.answers (question_id, answer_text, is_correct)
        values (
          v_question_id,
          v_answer->>'text',
          (v_answer->>'isCorrect')::boolean
        )
        returning id into v_answer_id;
      else
        update public.answers
        set answer_text = v_answer->>'text',
            is_correct  = (v_answer->>'isCorrect')::boolean
        where id = v_answer_id and question_id = v_question_id;

        if not found then
          raise exception 'Answer % does not belong to question %', v_answer_id, v_question_id
            using errcode = '22023';
        end if;
      end if;

      v_answer_ids := v_answer_ids || v_answer_id;
    end loop;
  end loop;

  -- Remove what the admin deleted in the form. Student answers that point at
  -- removed questions/answers go too (FKs have no cascade); results stay.
  -- Audio files of removed parts are deleted from Storage by the client.
  delete from public.result_answers ra
  where ra.question_id in (
          select q.id from public.questions q
          where q.test_id = v_test_id and q.id <> all (v_question_ids)
        )
     or ra.answer_id in (
          select a.id
          from public.answers a
          join public.questions q on q.id = a.question_id
          where q.test_id = v_test_id and a.id <> all (v_answer_ids)
        );

  delete from public.answers a
  using public.questions q
  where q.id = a.question_id
    and q.test_id = v_test_id
    and a.id <> all (v_answer_ids);

  delete from public.questions
  where test_id = v_test_id and id <> all (v_question_ids);

  delete from public.test_parts
  where test_id = v_test_id and id <> all (v_part_ids);

  return v_test_id;
end;
$$;

revoke all on function public.save_test(jsonb, bigint) from public, anon;
grant execute on function public.save_test(jsonb, bigint) to authenticated;

-- The baseline revoked these from public only, and on a new database the default
-- privileges also give them to anon. handle_new_user runs only as a trigger, so
-- no client role needs it; trigger execution does not check this privilege.
revoke all on function public.delete_test(bigint) from public, anon;
grant execute on function public.delete_test(bigint) to authenticated;

revoke all on function public.handle_new_user() from public, anon, authenticated;
