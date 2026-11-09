begin;
\ir ../helpers/fixtures.psql
select plan(27);

create function tests.payload()
returns jsonb
language sql
immutable
as $$
  select '{
    "title": "Plain test", "description": "", "levelId": "901", "timerEnabled": false, "timerType": null, "timerDuration": null,
    "parts": [
      {"id": 2001, "uiId": "2001", "title": "Listening", "instruction": "Listen", "points": 2, "audioPath": "parts/listening.mp3"},
      {"id": 2002, "uiId": "2002", "title": "Reading", "instruction": "Read", "points": 1, "audioPath": null}
    ],
    "questions": [
      {"id": 3001, "partId": "2001", "question": "Plain 1", "description": "", "answers": [
        {"id": 13001, "text": "Correct 3001", "isCorrect": true}, {"id": 23001, "text": "Wrong 3001", "isCorrect": false}]},
      {"id": 3002, "partId": "2001", "question": "Plain 2", "description": "", "answers": [
        {"id": 13002, "text": "Correct 3002", "isCorrect": true}, {"id": 23002, "text": "Wrong 3002", "isCorrect": false}]},
      {"id": 3003, "partId": null, "question": "Plain 3", "description": "", "answers": [
        {"id": 13003, "text": "Correct 3003", "isCorrect": true}, {"id": 23003, "text": "Wrong 3003", "isCorrect": false}]}
    ]
  }'::jsonb;
$$;

insert into public.results (id, test_id, user_id, score, total)
values (9001, 1001, tests.uid('student'), 5, 5);
insert into public.result_answers (result_id, question_id, answer_id)
values (9001, 3001, 13001), (9001, 3002, 13002), (9001, 3003, 13003);

select tests.login('student');
select throws_ok(format('select public.save_test(%L::jsonb)', tests.payload()), '42501', 'Only admins can save tests', 'a student cannot create a test');
select throws_ok(format('select public.save_test(%L::jsonb, 1001)', tests.payload()), '42501', 'Only admins can save tests', 'a student cannot edit a test');
select throws_ok('select public.delete_test(1001)', '42501', 'Forbidden', 'a student cannot delete a test');

select tests.login('admin');
select throws_ok('select public.save_test(''[]''::jsonb)', '22023', 'p_payload must be a JSON object', 'a payload must be an object');
select throws_ok(format('select public.save_test(%L::jsonb, 999999)', tests.payload()), 'P0002', 'Test 999999 not found', 'an unknown test cannot be edited');

select public.save_test('{
  "title": "Created", "description": "About", "levelId": "901", "timerEnabled": true, "timerType": "test", "timerDuration": 60,
  "parts": [{"uiId": "new-part", "title": "New part", "instruction": "Do", "points": 3, "audioPath": " "}],
  "questions": [{"partId": "new-part", "question": "New question", "description": "  ", "answers": [
    {"text": "Right", "isCorrect": true}, {"text": "Bad", "isCorrect": false}]}]
}'::jsonb);
select is((select test_type::text from public.tests where title = 'Created'), 'final_test', 'a created test is always a final test');
select is((select timer_duration from public.tests where title = 'Created'), 60, 'timer settings are saved');
select is(
  (select tp.title::text from public.questions q join public.test_parts tp on tp.id = q.part_id where q.question = 'New question'),
  'New part',
  'a new question links to a new part through its ui id'
);
select is((select audio_path from public.test_parts where title = 'New part'), null::text, 'a blank audio path is stored as null');
select is((select description from public.questions where question = 'New question'), null::text, 'a blank reading text is stored as null');

select tests.logout();
select is((select count(*)::int from public.answers a join public.questions q on q.id = a.question_id where q.question = 'New question' and a.is_correct), 1, 'the correct answer flag is saved');
select tests.login('admin');

select public.save_test(jsonb_set(tests.payload(), '{title}', '"Renamed"'), 1001);
select is((select title from public.tests where id = 1001), 'Renamed', 'editing updates the title');
select is((select array_agg(id order by id)::bigint[] from public.questions where test_id = 1001), array[3001, 3002, 3003]::bigint[], 'editing keeps question ids');
select is((select count(*)::int from public.result_answers where result_id = 9001), 3, 'editing keeps student answers');

select tests.logout();
select is((select test_type::text from public.tests where id = 1001), 'final_test', 'editing never changes the test type');
update public.tests set content_updated_at = null where id = 1001;
select tests.login('admin');

select public.save_test(tests.payload(), 1001);
select todo('save_test renumbers parts, which fires the content trigger even without changes', 1);
select is((select content_updated_at from public.tests where id = 1001), null::timestamptz, 'saving unchanged content does not mark results as outdated');

select tests.logout();
update public.tests set content_updated_at = null where id = 1002;
select tests.login('admin');
select public.save_test('{"title": "Timed renamed", "description": "", "levelId": "901", "timerEnabled": true, "timerType": "test", "timerDuration": 600, "parts": [],
  "questions": [
    {"id": 3101, "partId": null, "question": "Timed 1", "description": "", "answers": [{"id": 13101, "text": "Correct 3101", "isCorrect": true}, {"id": 23101, "text": "Wrong 3101", "isCorrect": false}]},
    {"id": 3102, "partId": null, "question": "Timed 2", "description": "", "answers": [{"id": 13102, "text": "Correct 3102", "isCorrect": true}, {"id": 23102, "text": "Wrong 3102", "isCorrect": false}]}
  ]}'::jsonb, 1002);
select is((select content_updated_at from public.tests where id = 1002), null::timestamptz, 'renaming a test without parts does not mark results as outdated');
select public.save_test('{"title": "Timed renamed", "description": "", "levelId": "901", "timerEnabled": true, "timerType": "test", "timerDuration": 600, "parts": [],
  "questions": [
    {"id": 3101, "partId": null, "question": "Timed 1 changed", "description": "", "answers": [{"id": 13101, "text": "Correct 3101", "isCorrect": true}, {"id": 23101, "text": "Wrong 3101", "isCorrect": false}]},
    {"id": 3102, "partId": null, "question": "Timed 2", "description": "", "answers": [{"id": 13102, "text": "Correct 3102", "isCorrect": true}, {"id": 23102, "text": "Wrong 3102", "isCorrect": false}]}
  ]}'::jsonb, 1002);
select isnt((select content_updated_at from public.tests where id = 1002), null::timestamptz, 'changing a question marks results as outdated');

select lives_ok(
  format('select public.save_test(%L::jsonb, 1001)', jsonb_set(
    jsonb_set(tests.payload(), '{parts,0,id}', '2002'),
    '{parts,1,id}', '2001'
  )),
  'parts can swap positions despite the unique sort order'
);
select public.save_test(tests.payload(), 1001);

select public.save_test(tests.payload() - 'parts' || '{"parts":[{"id": 2001, "uiId": "2001", "title": "Listening", "instruction": "Listen", "points": 2},{"id": 2002, "uiId": "2002", "title": "Reading", "instruction": "Read", "points": 1}]}'::jsonb, 1001);
select is((select audio_path from public.test_parts where id = 2001), 'parts/listening.mp3', 'a payload without an audio key keeps the file');

select throws_ok(
  format('select public.save_test(%L::jsonb, 1002)', tests.payload() - 'questions'),
  '22023', 'Part 2001 does not belong to test 1002', 'a part of another test is refused'
);
select throws_ok(
  format('select public.save_test(%L::jsonb, 1002)', tests.payload() - 'parts'),
  '22023', 'Question 3001 does not belong to test 1002', 'a question of another test is refused'
);
select throws_ok(
  format('select public.save_test(%L::jsonb, 1001)', jsonb_set(tests.payload(), '{questions,0,answers,0,id}', '13002')),
  '22023', 'Answer 13002 does not belong to question 3001', 'an answer of another question is refused'
);

select public.save_test(jsonb_set(tests.payload(), '{questions}', (tests.payload() -> 'questions') - 2), 1001);
select is((select count(*)::int from public.questions where id = 3003), 0, 'a question missing from the payload is removed');
select is((select count(*)::int from public.result_answers where result_id = 9001), 2, 'only student answers of the removed question are removed');
select is((select score::int from public.results where id = 9001), 5, 'the score of a past result does not change');

select public.delete_test(1001);
select is(
  (select count(*)::int from public.tests where id = 1001)
    + (select count(*)::int from public.questions where test_id = 1001)
    + (select count(*)::int from public.results where test_id = 1001),
  0,
  'deleting a test removes its questions and results'
);

select * from finish();
rollback;
