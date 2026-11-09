begin;
\ir ../helpers/fixtures.psql
select plan(31);

select tests.login('student');
select public.start_quiz_attempt(1002);
select ok(
  (public.get_quiz_attempt(1002) -> 'attempt' ->> 'seconds_left')::int between 599 and 600,
  'a timed test returns the seconds left from the server'
);
select ok(public.get_quiz_attempt(1002) -> 'attempt' -> 'question_seconds_left' = 'null'::jsonb, 'a test timer has no question timer');

select tests.logout();
update public.quiz_attempts set deadline_at = now() - interval '10 seconds' where test_id = 1002;
select tests.login('student');
select is(public.save_quiz_progress(tests.attempt(1002, 'student'), '{"3101":13101}', 0) ->> 'status', 'active', 'answers are accepted during the grace period');
select is((public.get_quiz_attempt(1002) -> 'attempt' ->> 'seconds_left')::int, 1, 'seconds left never drops below one during the grace period');

select tests.logout();
update public.quiz_attempts set deadline_at = now() - interval '16 seconds' where test_id = 1002;
select tests.login('student');
select is(public.save_quiz_progress(tests.attempt(1002, 'student'), '{"3101":13101,"3102":13102}', 1) ->> 'status', 'expired', 'progress after the deadline reports expired');
select is(
  (public.submit_quiz_attempt(tests.attempt(1002, 'student'), '{"3101":13101,"3102":13102}') ->> 'score')::int,
  1,
  'only answers saved before the deadline are scored'
);

select public.start_quiz_attempt(1002);
select tests.logout();
update public.quiz_attempts set deadline_at = now() - interval '1 minute' where test_id = 1002 and finished_at is null;
select tests.login('student');
select is(public.start_quiz_attempt(1002) -> 'attempt', 'null'::jsonb, 'starting with an expired attempt does not open a new one');
select is((public.get_quiz_attempt(1002) ->> 'attempts_used')::int, 2, 'the abandoned attempt was finalized and counted');

select tests.login('second');
select public.start_quiz_attempt(1002);
select tests.logout();
update public.quiz_attempts set deadline_at = now() - interval '1 minute' where test_id = 1002 and user_id = tests.uid('second');
select tests.login('second');
select is((public.get_quiz_attempt(1002) -> 'expired_result' ->> 'score')::int, 0, 'opening an abandoned test scores it');
select is(tests.attempt(1002, 'second'), null::bigint, 'the abandoned attempt is finished');

select tests.login('student');
select public.start_quiz_attempt(1003);
select is((public.get_quiz_attempt(1003) -> 'attempt' ->> 'question_seconds_left')::int, 30, 'a question timer comes from the server');
select ok(public.get_quiz_attempt(1003) -> 'attempt' -> 'seconds_left' = 'null'::jsonb, 'a question timer has no test timer');

select public.save_quiz_progress(tests.attempt(1003, 'student'), '{"3202":13202}', 0);
select is(public.get_quiz_attempt(1003) -> 'attempt' -> 'answers', '{}'::jsonb, 'a later question cannot be answered ahead of time');

select public.save_quiz_progress(tests.attempt(1003, 'student'), '{"3201":13201}', 2);
select is(public.get_quiz_attempt(1003) -> 'attempt' -> 'answers', '{"3201":13201}'::jsonb, 'the current question can be answered');
select is((public.get_quiz_attempt(1003) -> 'attempt' ->> 'question_index')::int, 0, 'a question cannot be skipped ahead');

select public.save_quiz_progress(tests.attempt(1003, 'student'), '{"3201":13201}', 1);
select is((public.get_quiz_attempt(1003) -> 'attempt' ->> 'question_index')::int, 1, 'moving to the next question works');

select public.save_quiz_progress(tests.attempt(1003, 'student'), '{"3201":23201,"3202":13202}', 0);
select is((public.get_quiz_attempt(1003) -> 'attempt' ->> 'question_index')::int, 1, 'moving back is refused');
select is(
  public.get_quiz_attempt(1003) -> 'attempt' -> 'answers',
  '{"3201":13201,"3202":13202}'::jsonb,
  'a previous answer cannot be changed'
);

select tests.logout();
update public.quiz_attempts set question_deadline_at = now() - interval '16 seconds' where test_id = 1003;
select tests.login('student');
select is((public.get_quiz_attempt(1003) -> 'attempt' ->> 'question_index')::int, 2, 'an expired question moves on while the page is closed');

select tests.logout();
update public.quiz_attempts set question_deadline_at = now() - interval '16 seconds' where test_id = 1003;
select tests.login('student');
select is(public.save_quiz_progress(tests.attempt(1003, 'student'), '{"3203":13203}', 2) ->> 'status', 'expired', 'the last expired question ends the attempt');
select is(
  (public.submit_quiz_attempt(tests.attempt(1003, 'student'), '{"3203":13203}') ->> 'score')::int,
  2,
  'an answer after the last deadline is not scored'
);

select tests.login('second');
select public.start_quiz_attempt(1003);
select tests.logout();
update public.quiz_attempts set question_deadline_at = now() - interval '100 seconds' where test_id = 1003 and user_id = tests.uid('second');
select tests.login('second');
select is((public.get_quiz_attempt(1003) -> 'attempt' ->> 'question_index')::int, 2, 'several expired questions are skipped at once');

select tests.login('student');
select public.start_quiz_attempt(1001);
select is((public.register_audio_play(tests.attempt(1001, 'student'), 2001) ->> 'plays_used')::int, 1, 'the first play is registered');
select is((public.register_audio_play(tests.attempt(1001, 'student'), 2001) ->> 'plays_used')::int, 2, 'the second play is registered');
select throws_ok(format('select public.register_audio_play(%s, 2001)', tests.attempt(1001, 'student')), '42501', 'Audio plays exhausted', 'a third play is refused');
select is(public.get_quiz_attempt(1001) -> 'attempt' -> 'audio_plays', '{"2001":2}'::jsonb, 'the play count survives a reload');
select throws_ok(format('select public.register_audio_play(%s, 2002)', tests.attempt(1001, 'student')), 'P0002', 'Audio not found', 'a part without audio is refused');
select throws_ok(format('select public.register_audio_play(%s, 999999)', tests.attempt(1001, 'student')), 'P0002', 'Audio not found', 'a part of another test is refused');

select tests.login('second');
select throws_ok(format('select public.register_audio_play(%s, 2001)', tests.attempt(1001, 'student')), 'P0002', 'Attempt not found', 'another student cannot use my plays');

select public.start_quiz_attempt(1001);
select tests.logout();
update public.quiz_attempts set deadline_at = now() - interval '1 minute' where test_id = 1001 and user_id = tests.uid('second');
select tests.login('second');
select throws_ok(format('select public.register_audio_play(%s, 2001)', tests.attempt(1001, 'second')), '42501', 'Attempt is over', 'no plays after the deadline');

select tests.logout();
create temp table finished_attempt on commit drop as
  select tests.attempt(1001, 'student') as id;
grant select on finished_attempt to authenticated;
select tests.login('student');
select public.submit_quiz_attempt((select id from finished_attempt), '{}');
select throws_ok(format('select public.register_audio_play(%s, 2001)', (select id from finished_attempt)), '42501', 'Attempt is over', 'no plays after the attempt is finished');

select * from finish();
rollback;
