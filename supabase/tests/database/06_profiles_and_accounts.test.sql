begin;
\ir ../helpers/fixtures.psql
select plan(30);

insert into auth.users (id, email, raw_user_meta_data, aud, role)
values (
  'dddddddd-0000-4000-8000-000000000001',
  'new@example.test',
  '{"display_name":"New","name":"Ivan","surname":"Koval","role":"admin","status":"approved","terms_version":"2026-11"}',
  'authenticated',
  'authenticated'
);

select is((select role from public.profiles where email = 'new@example.test'), 'student', 'signup metadata cannot set the role');
select is((select status from public.profiles where email = 'new@example.test'), 'pending', 'signup metadata cannot set the status');
select is((select name from public.profiles where email = 'new@example.test'), 'Ivan', 'signup stores the name');
select is((select terms_version from public.profiles where email = 'new@example.test'), '2026-11', 'signup stores the terms version');
select isnt((select terms_accepted_at from public.profiles where email = 'new@example.test'), null::timestamptz, 'signup records the consent time');

insert into auth.users (id, email, raw_user_meta_data, aud, role)
values ('dddddddd-0000-4000-8000-000000000002', 'bare@example.test', '{}', 'authenticated', 'authenticated');
select is((select display_name from public.profiles where email = 'bare@example.test'), 'bare@example.test', 'the display name falls back to the email');
select is((select terms_accepted_at from public.profiles where email = 'bare@example.test'), null::timestamptz, 'no consent is recorded without a terms version');

update auth.users set email = 'changed@example.test' where id = 'dddddddd-0000-4000-8000-000000000001';
select is((select email from public.profiles where id = 'dddddddd-0000-4000-8000-000000000001'), 'changed@example.test', 'an email change reaches the profile');

select is((select email_confirmed_at from public.profiles where id = 'dddddddd-0000-4000-8000-000000000001'), null::timestamptz, 'a new profile is not confirmed');
update auth.users set email_confirmed_at = now() where id = 'dddddddd-0000-4000-8000-000000000001';
select isnt((select email_confirmed_at from public.profiles where id = 'dddddddd-0000-4000-8000-000000000001'), null::timestamptz, 'an email confirmation reaches the profile');

select tests.login('student');
select throws_ok(format('select public.set_profile_status(%L, ''approved'')', tests.uid('pending')), '42501', 'Forbidden', 'a student cannot change statuses');

select tests.login('admin');
select throws_ok(format('select public.set_profile_status(%L, ''boss'')', tests.uid('pending')), '22023', 'Invalid status boss', 'an unknown status is refused');
select throws_ok('select public.set_profile_status(''dddddddd-0000-4000-8000-000000000099'', ''rejected'')', 'P0002', 'Profile dddddddd-0000-4000-8000-000000000099 not found', 'an unknown profile is refused');
select throws_ok(format('select public.set_profile_status(%L, ''approved'')', tests.uid('unconfirmed')), '22023', 'Email is not confirmed', 'an unconfirmed email cannot be approved');
select lives_ok(format('select public.set_profile_status(%L, ''rejected'')', tests.uid('unconfirmed')), 'an unconfirmed email can be rejected');
select is(public.set_profile_status(tests.uid('pending'), 'approved') ->> 'status', 'approved', 'an admin can approve a confirmed email');

select tests.login('pending');
select is((select count(*)::int from public.tests where id = 1001), 1, 'an approved user gets access at once');

select tests.logout();
insert into public.results (id, test_id, user_id, score, total, created_at)
values
  (9001, 1001, tests.uid('student'), 3, 5, now() - interval '3 days'),
  (9002, 1002, tests.uid('second'), 1, 2, now() - interval '2 days'),
  (9003, 1003, tests.uid('student'), 2, 3, now() - interval '1 day');
insert into public.result_answers (result_id, question_id, answer_id) values (9001, 3001, 13001);
insert into public.test_attempt_grants (user_id, test_id, extra_attempts) values (tests.uid('student'), 1001, 1);
insert into public.quiz_attempts (test_id, user_id) values (1002, tests.uid('student'));

select tests.login('student');
select throws_ok('select public.get_admin_results()', '42501', 'Forbidden', 'a student cannot read the admin results');

select tests.login('admin');
select throws_ok('select public.get_admin_results('''', ''score'')', '22023', 'Invalid sort', 'an unknown sort is refused');
select throws_ok('select public.get_admin_results('''', ''date'', 101)', '22023', 'Invalid page', 'a page cannot exceed the limit');
select is((public.get_admin_results() ->> 'total')::int, 3, 'the total counts every result');
select is((public.get_admin_results() -> 'items' -> 0 ->> 'id')::int, 9003, 'results are sorted by the newest first');
select is((public.get_admin_results('', 'test') -> 'items' -> 0 ->> 'id')::int, 9001, 'results can be sorted by test title');
select is((public.get_admin_results('second') ->> 'total')::int, 1, 'the search matches the student name');
select is((public.get_admin_results('question timer') ->> 'total')::int, 1, 'the search matches the test title');
select is((public.get_admin_results('%') ->> 'total')::int, 0, 'like wildcards are matched literally');
select is(
  (public.get_admin_results('', 'date', 1, 1) -> 'items' -> 0 ->> 'id')::int,
  9002,
  'limit and offset select the page'
);

select tests.logout();
delete from auth.users where id = tests.uid('student');
select is(
  (select count(*)::int from public.profiles where id = tests.uid('student'))
    + (select count(*)::int from public.quiz_attempts where user_id = tests.uid('student'))
    + (select count(*)::int from public.test_attempt_grants where user_id = tests.uid('student')),
  0,
  'deleting an account removes the profile, attempts and grants'
);
select is(
  (select count(*)::int from public.results where id in (9001, 9003) and user_id is null),
  2,
  'deleting an account keeps results without a link to the person'
);

select tests.login('admin');
select ok(public.get_admin_results('', 'student') -> 'items' -> 2 -> 'profiles' = 'null'::jsonb, 'anonymous results still appear in the admin list');

select * from finish();
rollback;
