begin;
\ir ../helpers/fixtures.psql
select plan(44);

insert into public.results (id, test_id, user_id, score, total)
values (9001, 1001, tests.uid('student'), 1, 5), (9002, 1001, tests.uid('second'), 2, 5);
insert into public.result_answers (result_id, question_id, answer_id)
values (9001, 3001, 13001), (9002, 3001, 13001);
insert into storage.objects (bucket_id, name) values ('test-audio', 'parts/listening.mp3');

select tests.login_anon();
select is((select count(*)::int from public.tests where test_type = 'final_test'), 0, 'anon cannot see final tests');
select is((select count(*)::int from public.questions where test_id = 1001), 0, 'anon cannot see questions of final tests');
select is((select count(*)::int from public.answers where question_id = 3001), 0, 'anon cannot see answers of final tests');
select is((select count(*)::int from public.test_parts), 0, 'anon cannot see test parts');
select is((select count(*)::int from public.levels), 2, 'anon can read levels');
select throws_ok('select is_correct from public.answers', '42501', null, 'anon cannot select is_correct');
select is((select count(*)::int from public.results), 0, 'anon cannot see results');
select throws_ok('select public.start_quiz_attempt(1001)', '42501', null, 'anon cannot start an attempt');
select throws_ok('select public.get_correct_answers(1001)', '42501', null, 'anon cannot read the key');
select is((select count(*)::int from storage.objects where bucket_id = 'test-audio'), 0, 'anon cannot see test audio');

select tests.login('pending');
select is((select count(*)::int from public.tests where test_type = 'final_test'), 0, 'a pending user cannot see final tests');
select is((select count(*)::int from public.questions where test_id = 1001), 0, 'a pending user cannot see questions');
select is((select count(*)::int from public.answers where question_id = 3001), 0, 'a pending user cannot see answers');
select is((select count(*)::int from public.test_parts), 0, 'a pending user cannot see test parts');
select is((select count(*)::int from public.profiles), 1, 'a pending user sees only their profile');
select is((select count(*)::int from storage.objects where bucket_id = 'test-audio'), 0, 'a pending user cannot see test audio');
select throws_ok('select public.get_correct_answers(1001)', '42501', 'Access denied', 'a pending user cannot read the key');

select tests.login('rejected');
select is((select count(*)::int from public.tests where test_type = 'final_test'), 0, 'a rejected user cannot see tests');

select tests.login('student');
select is((select count(*)::int from public.tests where id = 1001), 1, 'an approved student can see tests');
select is((select count(*)::int from public.answers where question_id = 3001), 2, 'an approved student can see answer texts');
select throws_ok('select is_correct from public.answers', '42501', null, 'an approved student cannot select is_correct');
select throws_ok('select * from public.answers', '42501', null, 'select star on answers fails for an approved student');
select is((select count(*)::int from storage.objects where bucket_id = 'test-audio'), 1, 'an approved student can see test audio');

select is((select count(*)::int from public.profiles), 1, 'a student sees only their own profile');
select is((select count(*)::int from public.results), 1, 'a student sees only their own results');
select is((select count(*)::int from public.result_answers), 1, 'a student sees only their own answers');

select throws_ok(format('insert into public.results (test_id, user_id, score, total) values (1001, %L, 5, 5)', tests.uid('student')), '42501', null, 'a student cannot insert a result');
select lives_ok('update public.results set score = 999', 'updating results does not raise');
select tests.logout();
select is((select max(score)::int from public.results), 2, 'a student cannot change a score');
select tests.login('student');

select lives_ok('delete from public.results', 'deleting results does not raise');
select tests.logout();
select is((select count(*)::int from public.results), 2, 'a student cannot delete results');
select tests.login('student');

select throws_ok('update public.profiles set role = ''admin''', '42501', null, 'a student cannot become an admin');
select throws_ok('update public.profiles set status = ''approved''', '42501', null, 'a student cannot approve themselves');
select lives_ok('update public.profiles set display_name = ''Renamed''', 'a student can rename themselves');
select tests.logout();
select is((select display_name from public.profiles where id = tests.uid('second')), 'Second', 'a student cannot rename others');
select tests.login('student');

select throws_ok(format('insert into public.quiz_attempts (test_id, user_id) values (1001, %L)', tests.uid('student')), '42501', null, 'a student cannot insert an attempt directly');
select throws_ok('update public.quiz_attempts set answers = ''{}''', '42501', null, 'a student cannot edit an attempt directly');
select throws_ok(format('insert into public.test_attempt_grants (user_id, test_id, extra_attempts) values (%L, 1001, 5)', tests.uid('student')), '42501', null, 'a student cannot grant attempts directly');

select throws_ok('insert into storage.objects (bucket_id, name) values (''test-audio'', ''parts/x.mp3'')', '42501', null, 'a student cannot upload test audio');
select throws_ok(format('insert into storage.objects (bucket_id, name) values (''avatars'', %L)', tests.uid('second') || '/x.png'), '42501', null, 'a student cannot upload into another avatar folder');
select lives_ok(format('insert into storage.objects (bucket_id, name) values (''avatars'', %L)', tests.uid('student') || '/x.png'), 'a student can upload into their avatar folder');

select tests.login('admin');
select is((select count(*)::int from public.profiles), 6, 'an admin sees every profile');
select is((select count(*)::int from public.tests where id = 1001), 1, 'an admin with pending status still counts as approved');

select tests.login('student');
select todo('questions are readable before an attempt starts, which bypasses the timer', 1);
select is((select count(*)::int from public.questions where test_id = 1001), 0, 'a student without an attempt cannot read questions');

select * from finish();
rollback;
