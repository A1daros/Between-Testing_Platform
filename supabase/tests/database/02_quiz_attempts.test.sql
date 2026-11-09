begin;
\ir ../helpers/fixtures.psql
select plan(51);

select tests.login('student');

select is(public.get_quiz_attempt(1001) -> 'attempt', 'null'::jsonb, 'no attempt before the first start');
select is((public.get_quiz_attempt(1001) ->> 'attempts_used')::int, 0, 'nothing used before the first start');
select is((public.get_quiz_attempt(1001) ->> 'attempts_allowed')::int, 2, 'a student has two attempts');

select is((public.start_quiz_attempt(1001) ->> 'attempts_used')::int, 1, 'an attempt counts from the moment it starts');
select is(
  (public.start_quiz_attempt(1001) -> 'attempt' ->> 'id')::bigint,
  tests.attempt(1001, 'student'),
  'starting again resumes the active attempt'
);
select is(
  (select count(*)::int from public.quiz_attempts where test_id = 1001),
  1,
  'starting again does not create a second attempt'
);

select throws_ok('select public.get_correct_answers(1001)', '42501', 'Access denied', 'key is closed during the first attempt');

select is(
  public.save_quiz_progress(tests.attempt(1001, 'student'), '{"3001":13001}', 1) ->> 'status',
  'active',
  'progress is accepted while the attempt is active'
);
select is(public.get_quiz_attempt(1001) -> 'attempt' -> 'answers', '{"3001":13001}'::jsonb, 'saved answers come back after a reload');
select is((public.get_quiz_attempt(1001) -> 'attempt' ->> 'question_index')::int, 1, 'saved position comes back after a reload');

select public.save_quiz_progress(tests.attempt(1001, 'student'), '{"3001":13001,"3101":13101,"3002":13001,"abc":"x"}', 1);
select is(
  public.get_quiz_attempt(1001) -> 'attempt' -> 'answers',
  '{"3001":13001}'::jsonb,
  'answers from another test, mismatched pairs and malformed keys are dropped'
);

select public.save_quiz_progress(tests.attempt(1001, 'student'), '{}', 99);
select is((public.get_quiz_attempt(1001) -> 'attempt' ->> 'question_index')::int, 2, 'position is clamped to the last question');
select public.save_quiz_progress(tests.attempt(1001, 'student'), '{}', -5);
select is((public.get_quiz_attempt(1001) -> 'attempt' ->> 'question_index')::int, 0, 'position is clamped to the first question');

select throws_ok(
  format('select public.save_quiz_progress(%s, %L, 0)', tests.attempt(1001, 'student'), '[]'),
  '22023', 'Invalid answers payload', 'progress must be a JSON object'
);
select throws_ok(
  format('select public.submit_quiz_attempt(%s, null)', tests.attempt(1001, 'student')),
  '22023', 'Invalid answers payload', 'submit needs an answers object'
);

select tests.login('second');
select throws_ok(
  format('select public.save_quiz_progress(%s, %L, 0)', tests.attempt(1001, 'student'), '{}'),
  'P0002', 'Attempt not found', 'another student cannot save into my attempt'
);
select throws_ok(
  format('select public.submit_quiz_attempt(%s, %L)', tests.attempt(1001, 'student'), '{}'),
  'P0002', 'Attempt not found', 'another student cannot submit my attempt'
);

select tests.login('student');
select is(
  public.submit_quiz_attempt(tests.attempt(1001, 'student'), '{"3001":13001,"3002":23002,"3003":13003}')
    - 'result_id' - 'attempts_used' - 'attempts_allowed',
  '{"score":3,"total":5}'::jsonb,
  'score counts part points and defaults to one point without a part'
);

select is(
  (select count(*)::int from public.results where test_id = 1001 and user_id = tests.uid('student')),
  1,
  'submit writes one result for the current user'
);
select is(
  (select count(*)::int from public.result_answers ra join public.results r on r.id = ra.result_id
   where r.test_id = 1001 and r.user_id = tests.uid('student')),
  3,
  'submit stores every answer'
);

select tests.logout();
create temp table first_attempt on commit drop as
  select id, result_id from public.quiz_attempts where test_id = 1001 and user_id = tests.uid('student');
grant select on first_attempt to authenticated;
select tests.login('student');

select is(
  (public.submit_quiz_attempt((select id from first_attempt), '{"3001":13001,"3002":13002,"3003":13003}') ->> 'score')::int,
  3,
  'a repeated submit returns the first score instead of rescoring'
);
select is(
  (select count(*)::int from public.results where test_id = 1001 and user_id = tests.uid('student')),
  1,
  'a repeated submit does not create another result'
);
select is(
  public.save_quiz_progress((select id from first_attempt), '{}', 0) ->> 'status',
  'finished',
  'progress on a finished attempt reports finished'
);
select throws_ok('select public.get_correct_answers(1001)', '42501', 'Access denied', 'key stays closed while an attempt is left');

select public.start_quiz_attempt(1001);
select throws_ok('select public.get_correct_answers(1001)', '42501', 'Access denied', 'key stays closed during the last attempt');
select is(
  public.submit_quiz_attempt(tests.attempt(1001, 'student'), '{}') ->> 'score',
  '0',
  'an empty attempt scores zero and still counts'
);

select is(jsonb_array_length(public.get_correct_answers(1001)), 3, 'key opens after the last attempt');
select is(
  (select jsonb_agg(item ->> 'answer_id' order by item ->> 'answer_id') from jsonb_array_elements(public.get_correct_answers(1001)) item),
  '["13001","13002","13003"]'::jsonb,
  'key contains only the correct answers'
);
select throws_ok('select public.start_quiz_attempt(1001)', '42501', 'No attempts left', 'a third attempt is refused');

select throws_ok(format('select public.grant_extra_attempt(%L, 1001)', tests.uid('student')), '42501', 'Forbidden', 'a student cannot grant attempts');
select throws_ok(format('select public.get_student_attempts(%L)', tests.uid('second')), '42501', 'Forbidden', 'a student cannot read attempts of others');

select tests.login('admin');
select is(
  (public.get_student_attempts(tests.uid('student')) -> 0 ->> 'key_open')::boolean,
  true,
  'an admin sees that the key is open'
);
select is(
  (public.grant_extra_attempt(tests.uid('student'), 1001) ->> 'attempts_allowed')::int,
  3,
  'an admin grant adds one attempt'
);
select is(
  (public.grant_extra_attempt(tests.uid('student'), 1001) ->> 'attempts_allowed')::int,
  4,
  'grants add up'
);
select throws_ok(format('select public.grant_extra_attempt(%L, 1001)', tests.uid('admin')), 'P0002', 'Student not found', 'an admin cannot be granted attempts');
select throws_ok(format('select public.grant_extra_attempt(%L, 999999)', tests.uid('student')), 'P0002', 'Test not found', 'a grant needs an existing test');
select is(
  (public.get_student_attempts(tests.uid('student')) -> 0 ->> 'attempts_used')::int,
  2,
  'an admin sees used attempts of a student'
);
select is(
  (public.get_student_attempts(tests.uid('student')) -> 0 ->> 'key_open')::boolean,
  false,
  'a grant closes the key for the admin view too'
);

select tests.login('student');
select is((public.start_quiz_attempt(1001) ->> 'attempts_used')::int, 3, 'a granted attempt can be started');
select throws_ok('select public.get_correct_answers(1001)', '42501', 'Access denied', 'key closes again during a granted attempt');
select is((select count(*)::int from public.results where test_id = 1001 and after_key), 0, 'results before the key are not flagged');
select public.submit_quiz_attempt(tests.attempt(1001, 'student'), '{}');
select is((select count(*)::int from public.results where test_id = 1001 and after_key), 1, 'a result after the key is flagged');

select tests.login('admin');
select is(
  (select count(*)::int
   from jsonb_array_elements(public.get_admin_results('Plain test', 'date', 20, 0) -> 'items') item
   where (item ->> 'after_key')::boolean),
  1,
  'the admin results page returns the flag'
);
select ok(public.get_quiz_attempt(1001) -> 'attempts_allowed' = 'null'::jsonb, 'admins have no attempt limit');
select is(jsonb_array_length(public.get_correct_answers(1001)), 3, 'admins read the key without an attempt');

select tests.login('pending');
select throws_ok('select public.start_quiz_attempt(1001)', '42501', 'Account is not approved', 'a pending user cannot start');
select tests.login('rejected');
select throws_ok('select public.get_quiz_attempt(1001)', '42501', 'Account is not approved', 'a rejected user cannot read attempts');

select tests.login('second');
select throws_ok('select public.start_quiz_attempt(1005)', '22023', 'This test type cannot be submitted', 'a placement test has no attempts');
select throws_ok('select public.start_quiz_attempt(999999)', 'P0002', 'Test not found', 'an unknown test is refused');
select throws_ok('select public.start_quiz_attempt(1004)', 'P0002', 'Test has no questions', 'an empty test cannot be started');

select public.start_quiz_attempt(1001);
select public.submit_quiz_attempt(tests.attempt(1001, 'second'), '{}');
select tests.login('admin');
select public.grant_extra_attempt(tests.uid('second'), 1001);
select tests.login('second');
select public.start_quiz_attempt(1001);
select public.submit_quiz_attempt(tests.attempt(1001, 'second'), '{}');
select public.start_quiz_attempt(1001);
select public.submit_quiz_attempt(tests.attempt(1001, 'second'), '{}');
select is(
  (select count(*)::int from public.results where test_id = 1001 and after_key),
  0,
  'a grant made before the key opened does not flag later results'
);

select * from finish();
rollback;
