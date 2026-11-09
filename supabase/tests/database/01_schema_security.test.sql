begin;
\ir ../helpers/fixtures.psql
select plan(24);

select is_empty(
  $$select c.relname from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity$$,
  'every public table has RLS enabled'
);

select is_empty(
  $$select p.proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname in ('public', 'private') and p.prosecdef
      and not exists (select 1 from unnest(p.proconfig) c where c like 'search_path=%')$$,
  'every security definer function pins search_path'
);

select is(
  (select array_agg(p.proname::text order by p.proname::text) from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public' and has_function_privilege('anon', p.oid, 'execute')),
  array['calculate_placement_level', 'get_placement_questions'],
  'anon can execute only the placement functions'
);

select is_empty(
  $$select p.proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'private' and p.proname not in ('is_admin', 'is_approved', 'readable_test_ids', 'playable_audio_paths')
      and has_function_privilege('authenticated', p.oid, 'execute')$$,
  'authenticated cannot execute private helpers directly'
);

select hasnt_function('public', 'save_quiz_result', 'legacy save_quiz_result is gone');
select hasnt_function('public', 'submit_quiz', 'legacy submit_quiz is gone');

select ok(not has_column_privilege('anon', 'public.answers', 'is_correct', 'select'), 'anon cannot read is_correct');
select ok(not has_column_privilege('authenticated', 'public.answers', 'is_correct', 'select'), 'authenticated cannot read is_correct');
select ok(not has_table_privilege('authenticated', 'public.answers', 'select'), 'answers has no table-wide select');

select is(
  (select array_agg(a.attname::text order by a.attname::text) from pg_attribute a
   where a.attrelid = 'public.profiles'::regclass and a.attnum > 0 and not a.attisdropped
     and has_column_privilege('authenticated', a.attrelid, a.attnum, 'update')),
  array['avatar_url', 'birth_date', 'display_name'],
  'authenticated can update only the editable profile columns'
);

select ok(not has_table_privilege('anon', 'public.profiles', 'select'), 'anon cannot read profiles');
select ok(not has_table_privilege('authenticated', 'public.results', 'insert'), 'results cannot be inserted by clients');
select ok(not has_table_privilege('authenticated', 'public.result_answers', 'insert'), 'result_answers cannot be inserted by clients');
select ok(not has_table_privilege('authenticated', 'public.quiz_attempts', 'update'), 'quiz_attempts cannot be updated by clients');
select ok(not has_table_privilege('authenticated', 'public.test_attempt_grants', 'insert'), 'attempt grants cannot be inserted by clients');
select ok(not has_table_privilege('anon', 'public.quiz_attempts', 'select'), 'anon cannot read quiz_attempts');

select is((select public from storage.buckets where id = 'test-audio'), false, 'test-audio bucket is private');
select is((select public from storage.buckets where id = 'avatars'), true, 'avatars bucket is public');

select has_trigger('auth', 'users', 'on_auth_user_created', 'signup trigger exists');
select has_trigger('auth', 'users', 'on_auth_user_email_confirmed', 'email confirmation trigger exists');

select ok(not has_function_privilege('authenticated', 'public.handle_new_user()', 'execute'), 'authenticated cannot execute the signup trigger function');
select ok(has_function_privilege('authenticated', 'public.delete_test(bigint)', 'execute'), 'authenticated keeps execute on delete_test for admins');

select tests.login_anon();
select throws_ok('select public.delete_test(1001)', '42501', 'permission denied for function delete_test', 'anon has no execute on delete_test');
select throws_ok('select public.handle_new_user()', '42501', 'permission denied for function handle_new_user', 'anon has no execute on the signup trigger function');

select * from finish();
rollback;
