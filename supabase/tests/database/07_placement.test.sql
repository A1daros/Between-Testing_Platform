begin;
\ir ../helpers/fixtures.psql
select plan(10);

select tests.login_anon();

select is(jsonb_array_length(public.get_placement_questions()), 6, 'anon gets only placement questions');
select ok(public.get_placement_questions()::text not like '%is_correct%', 'placement questions never contain is_correct');
select is(public.get_placement_questions() -> 0 ->> 'id', '3301', 'placement questions follow the sort order');
select is(jsonb_array_length(public.get_placement_questions() -> 0 -> 'answers'), 2, 'each question brings its answers');

select is(public.calculate_placement_level('{}') ->> 'level_code', 'A1', 'no answers give the lowest level');
select is(
  public.calculate_placement_level('{"3301":13301,"3302":13302,"3303":13303}') ->> 'level_code',
  'A1',
  'passing only the first level stays at the first level'
);
select is(
  public.calculate_placement_level('{"3301":13301,"3302":13302,"3303":13303,"3304":13304,"3305":13305,"3306":13306}') ->> 'level_code',
  'A2',
  'passing every level gives the highest level'
);
select is(
  public.calculate_placement_level('{"3301":13301,"3302":13302,"3304":13304,"3305":13305,"3306":13306}') ->> 'level_code',
  'A1',
  'a failed level stops the climb even if the next one is passed'
);
select is(
  public.calculate_placement_level('{"3001":13001,"3002":13002,"3003":13003}') ->> 'level_code',
  'A1',
  'answers from other tests do not count'
);
select throws_ok('select public.calculate_placement_level(''[]'')', '22023', 'p_answers must be a JSON object', 'answers must be an object');

select * from finish();
rollback;
