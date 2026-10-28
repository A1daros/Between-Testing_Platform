


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "private";


ALTER SCHEMA "private" OWNER TO "postgres";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."test_type_enum" AS ENUM (
    'submodule_quiz',
    'final_test',
    'placement_test'
);


ALTER TYPE "public"."test_type_enum" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "private"."is_admin"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;


ALTER FUNCTION "private"."is_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_placement_level"("p_answers" "jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  c_pass_threshold constant int := 3;   -- correct answers needed to pass a level
  v_level   record;
  v_correct int;
  v_code    text;
  v_title   text;
begin
  if p_answers is null or jsonb_typeof(p_answers) <> 'object' then
    raise exception 'p_answers must be a JSON object' using errcode = '22023';
  end if;

  -- lowest level is the default result (same as the old client logic)
  select code, title into v_code, v_title
  from public.levels order by sort_order limit 1;

  for v_level in
    select id, code, title from public.levels order by sort_order
  loop
    select count(*) into v_correct
    from public.questions q
    join public.tests t   on t.id = q.test_id and t.test_type = 'placement_test'
    join public.answers a on a.question_id = q.id and a.is_correct
    where q.level_id = v_level.id
      and (p_answers ->> q.id::text) = a.id::text;

    if v_correct >= c_pass_threshold then
      v_code  := v_level.code;
      v_title := v_level.title;
    else
      exit;
    end if;
  end loop;

  return jsonb_build_object('level_code', v_code, 'level_title', v_title);
end;
$$;


ALTER FUNCTION "public"."calculate_placement_level"("p_answers" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_test"("p_test_id" bigint) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  if not exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  ) then
    raise exception 'Forbidden' using errcode = '42501';
  end if;

  if not exists (select 1 from public.tests where id = p_test_id) then
    raise exception 'Test not found' using errcode = 'P0002';
  end if;

  delete from public.result_answers
  where result_id in (select id from public.results where test_id = p_test_id);

  delete from public.results where test_id = p_test_id;

  delete from public.answers
  where question_id in (select id from public.questions where test_id = p_test_id);

  delete from public.questions  where test_id = p_test_id;
  delete from public.test_parts where test_id = p_test_id;
  delete from public.tests      where id      = p_test_id;
end;
$$;


ALTER FUNCTION "public"."delete_test"("p_test_id" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_correct_answers"("p_test_id" bigint) RETURNS "jsonb"
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated' using errcode = '28000';
  end if;

  -- ключ бачить адмін або той, хто вже здавав цей тест
  if not (
    private.is_admin()
    or exists (
      select 1
      from public.results r
      where r.test_id = p_test_id
        and r.user_id = auth.uid()
    )
  ) then
    raise exception 'Access denied' using errcode = '42501';
  end if;

  return (
    select coalesce(
      jsonb_agg(
        jsonb_build_object('question_id', a.question_id, 'answer_id', a.id)
        order by a.question_id, a.id
      ),
      '[]'::jsonb
    )
    from public.answers a
    join public.questions q on q.id = a.question_id
    where q.test_id = p_test_id
      and a.is_correct
  );
end;
$$;


ALTER FUNCTION "public"."get_correct_answers"("p_test_id" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_placement_questions"() RETURNS "jsonb"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select coalesce(jsonb_agg(s.item order by s.sort_order, s.id), '[]'::jsonb)
  from (
    select
      q.id,
      q.sort_order,
      jsonb_build_object(
        'id',          q.id,
        'question',    q.question,
        'description', q.description,
        'sort_order',  q.sort_order,
        'tests',       jsonb_build_object('title', t.title, 'description', t.description),
        'levels',      jsonb_build_object('code', l.code),
        'answers', (
          select coalesce(
            jsonb_agg(
              jsonb_build_object('id', a.id, 'answer_text', a.answer_text)
              order by a.id
            ),
            '[]'::jsonb
          )
          from public.answers a
          where a.question_id = q.id
        )
      ) as item
    from public.questions q
    join public.tests t on t.id = q.test_id and t.test_type = 'placement_test'
    left join public.levels l on l.id = q.level_id
  ) s;
$$;


ALTER FUNCTION "public"."get_placement_questions"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$begin
insert into
  public.profiles (id, display_name, email, name, surname)
values
  (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'display_name',
      new.email
    ),
    new.email,
    new.raw_user_meta_data ->> 'name',
    new.raw_user_meta_data ->> 'surname'
  );

return new;

end;$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."save_quiz_result"("p_test_id" bigint, "p_user_id" "uuid", "p_score" integer, "p_total" integer, "p_answers" "jsonb") RETURNS bigint
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
declare
  v_result_id bigint;
begin
  insert into public.results (test_id, user_id, score, total)
  values (p_test_id, p_user_id, p_score, p_total)
  returning id into v_result_id;

  insert into public.result_answers (result_id, question_id, answer_id)
  select v_result_id, (a->>'question_id')::bigint, (a->>'answer_id')::bigint
  from jsonb_array_elements(p_answers) as a;

  return v_result_id;
end;
$$;


ALTER FUNCTION "public"."save_quiz_result"("p_test_id" bigint, "p_user_id" "uuid", "p_score" integer, "p_total" integer, "p_answers" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."save_test"("p_payload" "jsonb", "p_test_id" bigint DEFAULT NULL::bigint) RETURNS bigint
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
declare
  v_test_id bigint;
  v_part jsonb;
  v_part_id bigint;
  v_part_map jsonb := '{}'::jsonb;
  v_question jsonb;
  v_question_id bigint;
  v_answer jsonb;
  v_idx integer;
begin
  if not private.is_admin() then
    raise exception 'Only admins can save tests';
  end if;

  if p_test_id is null then
    -- СТВОРЕННЯ
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
    -- РЕДАГУВАННЯ: оновлюємо тест (test_type не чіпаємо)
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
      raise exception 'Test % not found', p_test_id;
    end if;

    -- Прибираємо результати та стару структуру (порядок важливий через зв'язки)
    delete from public.result_answers
    where result_id in (select id from public.results where test_id = v_test_id);

    delete from public.results where test_id = v_test_id;

    delete from public.answers
    where question_id in (select id from public.questions where test_id = v_test_id);

    delete from public.questions where test_id = v_test_id;
    delete from public.test_parts where test_id = v_test_id;
  end if;

  -- Нова структура (однаково для створення й редагування)
  v_idx := 0;
  for v_part in
    select value from jsonb_array_elements(coalesce(p_payload->'parts', '[]'::jsonb))
  loop
    v_idx := v_idx + 1;

    insert into public.test_parts (test_id, title, instruction, points, sort_order)
    values (
      v_test_id,
      v_part->>'title',
      v_part->>'instruction',
      (v_part->>'points')::integer,
      v_idx
    )
    returning id into v_part_id;

    v_part_map := v_part_map || jsonb_build_object(v_part->>'uiId', v_part_id);
  end loop;

  v_idx := 0;
  for v_question in
    select value from jsonb_array_elements(coalesce(p_payload->'questions', '[]'::jsonb))
  loop
    v_idx := v_idx + 1;

    insert into public.questions (test_id, part_id, question, sort_order)
    values (
      v_test_id,
      (v_part_map ->> (v_question->>'partId'))::bigint,
      v_question->>'question',
      v_idx
    )
    returning id into v_question_id;

    for v_answer in
      select value from jsonb_array_elements(v_question->'answers')
    loop
      insert into public.answers (question_id, answer_text, is_correct)
      values (
        v_question_id,
        v_answer->>'text',
        (v_answer->>'isCorrect')::boolean
      );
    end loop;
  end loop;

  return v_test_id;
end;
$$;


ALTER FUNCTION "public"."save_test"("p_payload" "jsonb", "p_test_id" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."submit_quiz"("p_test_id" bigint, "p_answers" "jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_user_id   uuid := auth.uid();
  v_invalid   int;
  v_score     numeric;
  v_total     numeric;
  v_result_id bigint;
begin
  if v_user_id is null then
    raise exception 'Not authenticated' using errcode = '28000';
  end if;

  if p_answers is null or jsonb_typeof(p_answers) <> 'object' then
    raise exception 'Invalid answers payload';
  end if;

  if not exists (select 1 from tests where id = p_test_id) then
    raise exception 'Test not found';
  end if;

  select count(*) into v_invalid
  from (
    select key::bigint as question_id, value::bigint as answer_id
    from jsonb_each_text(p_answers)
  ) p
  left join questions q
    on q.id = p.question_id and q.test_id = p_test_id
  left join answers a
    on a.id = p.answer_id and a.question_id = p.question_id
  where q.id is null or a.id is null;

  if v_invalid > 0 then
    raise exception 'Invalid question or answer for this test';
  end if;

  select coalesce(sum(coalesce(tp.points, 1)), 0) into v_total
  from questions q
  left join test_parts tp on tp.id = q.part_id
  where q.test_id = p_test_id;

  if v_total = 0 then
    raise exception 'Test has no questions';
  end if;

  select coalesce(sum(coalesce(tp.points, 1)), 0) into v_score
  from (
    select key::bigint as question_id, value::bigint as answer_id
    from jsonb_each_text(p_answers)
  ) p
  join questions q on q.id = p.question_id
  join answers a on a.id = p.answer_id and a.is_correct
  left join test_parts tp on tp.id = q.part_id;

  insert into results (test_id, user_id, score, total)
  values (p_test_id, v_user_id, v_score, v_total)
  returning id into v_result_id;

  insert into result_answers (result_id, question_id, answer_id)
  select v_result_id, key::bigint, value::bigint
  from jsonb_each_text(p_answers);

  return jsonb_build_object(
    'result_id', v_result_id,
    'score', v_score,
    'total', v_total
  );
end;
$$;


ALTER FUNCTION "public"."submit_quiz"("p_test_id" bigint, "p_answers" "jsonb") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."answers" (
    "id" bigint NOT NULL,
    "question_id" bigint NOT NULL,
    "answer_text" "text" NOT NULL,
    "is_correct" boolean NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."answers" OWNER TO "postgres";


ALTER TABLE "public"."answers" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."answers_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."levels" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "code" character varying(10) NOT NULL,
    "title" character varying(100) NOT NULL,
    "sort_order" integer NOT NULL
);


ALTER TABLE "public"."levels" OWNER TO "postgres";


ALTER TABLE "public"."levels" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."levels_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "role" "text" DEFAULT 'student'::"text" NOT NULL,
    "display_name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "avatar_url" "text",
    "birth_date" "date",
    "email" "text",
    "name" "text",
    "surname" "text"
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."program" (
    "id" "text" NOT NULL,
    "age_group" "text" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text" NOT NULL,
    "sort_order" smallint DEFAULT 0 NOT NULL
);


ALTER TABLE "public"."program" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."program_format" (
    "id" bigint NOT NULL,
    "program_id" "text" NOT NULL,
    "type" "text" NOT NULL,
    "lessons_per_month" smallint NOT NULL,
    "duration_minutes" smallint NOT NULL,
    "price" integer NOT NULL,
    "is_popular" boolean DEFAULT false NOT NULL,
    "sort_order" smallint DEFAULT 0 NOT NULL,
    CONSTRAINT "program_format_duration_minutes_check" CHECK (("duration_minutes" > 0)),
    CONSTRAINT "program_format_lessons_per_month_check" CHECK (("lessons_per_month" > 0)),
    CONSTRAINT "program_format_price_check" CHECK (("price" >= 0))
);


ALTER TABLE "public"."program_format" OWNER TO "postgres";


ALTER TABLE "public"."program_format" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."program_format_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."questions" (
    "id" bigint NOT NULL,
    "test_id" bigint NOT NULL,
    "question" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "title" character varying(100),
    "description" "text",
    "sort_order" integer,
    "part_id" bigint,
    "level_id" bigint
);


ALTER TABLE "public"."questions" OWNER TO "postgres";


ALTER TABLE "public"."questions" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."questions_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."result_answers" (
    "id" bigint NOT NULL,
    "result_id" bigint NOT NULL,
    "question_id" bigint NOT NULL,
    "answer_id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."result_answers" OWNER TO "postgres";


ALTER TABLE "public"."result_answers" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."result_answers_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."results" (
    "id" bigint NOT NULL,
    "test_id" bigint NOT NULL,
    "score" bigint NOT NULL,
    "total" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid"
);


ALTER TABLE "public"."results" OWNER TO "postgres";


ALTER TABLE "public"."results" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."results_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."submodules" (
    "id" bigint NOT NULL,
    "level_id" bigint,
    "title" character varying(100) NOT NULL,
    "sort_order" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."submodules" OWNER TO "postgres";


ALTER TABLE "public"."submodules" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."submodules_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."teachers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "role" "text" NOT NULL,
    "degree" "text",
    "age" integer,
    "photo_url" "text",
    "sort_order" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "experience" "text",
    "specialties" "text"
);


ALTER TABLE "public"."teachers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."test_parts" (
    "id" bigint NOT NULL,
    "test_id" bigint NOT NULL,
    "title" character varying(100) NOT NULL,
    "instruction" "text",
    "points" integer,
    "sort_order" integer NOT NULL
);


ALTER TABLE "public"."test_parts" OWNER TO "postgres";


ALTER TABLE "public"."test_parts" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."test_parts_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."tests" (
    "id" bigint NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "level_id" bigint,
    "submodule_id" bigint,
    "test_type" "public"."test_type_enum" NOT NULL,
    "timer_enabled" boolean,
    "timer_type" "text",
    "timer_duration" integer,
    CONSTRAINT "check_test_relations" CHECK (((("test_type" = 'final_test'::"public"."test_type_enum") AND ("level_id" IS NOT NULL) AND ("submodule_id" IS NULL)) OR (("test_type" = 'submodule_quiz'::"public"."test_type_enum") AND ("submodule_id" IS NOT NULL) AND ("level_id" IS NULL)) OR (("test_type" = 'placement_test'::"public"."test_type_enum") AND ("level_id" IS NULL) AND ("submodule_id" IS NULL))))
);


ALTER TABLE "public"."tests" OWNER TO "postgres";


ALTER TABLE "public"."tests" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."tests_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."theory_sections" (
    "id" bigint NOT NULL,
    "submodule_id" bigint NOT NULL,
    "title" character varying(100) NOT NULL,
    "content" "text" NOT NULL,
    "sort_order" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."theory_sections" OWNER TO "postgres";


ALTER TABLE "public"."theory_sections" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."theory_sections_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."writing_prompts" (
    "id" bigint NOT NULL,
    "submodule_id" bigint NOT NULL,
    "prompt_text" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."writing_prompts" OWNER TO "postgres";


ALTER TABLE "public"."writing_prompts" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."writing_prompts_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."writing_submissions" (
    "id" bigint NOT NULL,
    "writing_prompt_id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "answer_text" "text" NOT NULL,
    "submitted_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."writing_submissions" OWNER TO "postgres";


ALTER TABLE "public"."writing_submissions" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."writing_submissions_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE ONLY "public"."answers"
    ADD CONSTRAINT "answers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."levels"
    ADD CONSTRAINT "levels_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."levels"
    ADD CONSTRAINT "levels_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."levels"
    ADD CONSTRAINT "levels_sort_order_key" UNIQUE ("sort_order");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."program_format"
    ADD CONSTRAINT "program_format_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."program"
    ADD CONSTRAINT "program_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."questions"
    ADD CONSTRAINT "questions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."result_answers"
    ADD CONSTRAINT "result_answers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."results"
    ADD CONSTRAINT "results_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."submodules"
    ADD CONSTRAINT "submodules_level_order_unique" UNIQUE ("level_id", "sort_order");



ALTER TABLE ONLY "public"."submodules"
    ADD CONSTRAINT "submodules_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."teachers"
    ADD CONSTRAINT "teachers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."test_parts"
    ADD CONSTRAINT "test_parts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."test_parts"
    ADD CONSTRAINT "test_parts_test_id_sort_order_key" UNIQUE ("test_id", "sort_order");



ALTER TABLE ONLY "public"."tests"
    ADD CONSTRAINT "tests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."theory_sections"
    ADD CONSTRAINT "theory_sections_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."theory_sections"
    ADD CONSTRAINT "theory_sections_submodule_order_unique" UNIQUE ("submodule_id", "sort_order");



ALTER TABLE ONLY "public"."writing_prompts"
    ADD CONSTRAINT "writing_prompts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."writing_submissions"
    ADD CONSTRAINT "writing_submissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."writing_submissions"
    ADD CONSTRAINT "writing_submissions_prompt_user_unique" UNIQUE ("writing_prompt_id", "user_id");



CREATE UNIQUE INDEX "program_format_one_popular" ON "public"."program_format" USING "btree" ("program_id") WHERE "is_popular";



CREATE INDEX "program_format_program_id_idx" ON "public"."program_format" USING "btree" ("program_id");



ALTER TABLE ONLY "public"."answers"
    ADD CONSTRAINT "answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."program_format"
    ADD CONSTRAINT "program_format_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "public"."program"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."questions"
    ADD CONSTRAINT "questions_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "public"."levels"("id");



ALTER TABLE ONLY "public"."questions"
    ADD CONSTRAINT "questions_part_id_fkey" FOREIGN KEY ("part_id") REFERENCES "public"."test_parts"("id");



ALTER TABLE ONLY "public"."questions"
    ADD CONSTRAINT "questions_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "public"."tests"("id");



ALTER TABLE ONLY "public"."result_answers"
    ADD CONSTRAINT "result_answers_answer_id_fkey" FOREIGN KEY ("answer_id") REFERENCES "public"."answers"("id");



ALTER TABLE ONLY "public"."result_answers"
    ADD CONSTRAINT "result_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id");



ALTER TABLE ONLY "public"."result_answers"
    ADD CONSTRAINT "result_answers_result_id_fkey" FOREIGN KEY ("result_id") REFERENCES "public"."results"("id");



ALTER TABLE ONLY "public"."results"
    ADD CONSTRAINT "results_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "public"."tests"("id");



ALTER TABLE ONLY "public"."results"
    ADD CONSTRAINT "results_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."results"
    ADD CONSTRAINT "results_user_id_profiles_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."submodules"
    ADD CONSTRAINT "submodules_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "public"."levels"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."test_parts"
    ADD CONSTRAINT "test_parts_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "public"."tests"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tests"
    ADD CONSTRAINT "tests_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "public"."levels"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."tests"
    ADD CONSTRAINT "tests_submodule_id_fkey" FOREIGN KEY ("submodule_id") REFERENCES "public"."submodules"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."theory_sections"
    ADD CONSTRAINT "theory_sections_submodule_id_fkey" FOREIGN KEY ("submodule_id") REFERENCES "public"."submodules"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."writing_prompts"
    ADD CONSTRAINT "writing_prompts_submodule_id_fkey" FOREIGN KEY ("submodule_id") REFERENCES "public"."submodules"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."writing_submissions"
    ADD CONSTRAINT "writing_submissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."writing_submissions"
    ADD CONSTRAINT "writing_submissions_writing_prompt_id_fkey" FOREIGN KEY ("writing_prompt_id") REFERENCES "public"."writing_prompts"("id") ON DELETE CASCADE;



CREATE POLICY "Admin can create answers" ON "public"."answers" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admin can create questions" ON "public"."questions" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admin can delete results" ON "public"."results" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admin can delete tests" ON "public"."tests" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admin can update tests" ON "public"."tests" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admin can view all submissions" ON "public"."writing_submissions" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can create test parts" ON "public"."test_parts" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can create tests" ON "public"."tests" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can delete answers" ON "public"."answers" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can delete questions" ON "public"."questions" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can delete result answers" ON "public"."result_answers" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can delete test parts" ON "public"."test_parts" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can view all profiles" ON "public"."profiles" FOR SELECT TO "authenticated" USING (( SELECT "private"."is_admin"() AS "is_admin"));



CREATE POLICY "Admins can view all result answers" ON "public"."result_answers" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can view all results" ON "public"."results" FOR SELECT TO "authenticated" USING (( SELECT (EXISTS ( SELECT 1
           FROM "public"."profiles"
          WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))) AS "exists"));



CREATE POLICY "Allow public read access" ON "public"."levels" FOR SELECT USING (true);



CREATE POLICY "Allow public read access" ON "public"."submodules" FOR SELECT USING (true);



CREATE POLICY "Allow public read access" ON "public"."test_parts" FOR SELECT USING (true);



CREATE POLICY "Allow public read access" ON "public"."theory_sections" FOR SELECT USING (true);



CREATE POLICY "Allow public read access" ON "public"."writing_prompts" FOR SELECT USING (true);



CREATE POLICY "Anon can read placement test" ON "public"."tests" FOR SELECT TO "anon" USING (("test_type" = 'placement_test'::"public"."test_type_enum"));



CREATE POLICY "Anon can read placement test answers" ON "public"."answers" FOR SELECT TO "anon" USING ((EXISTS ( SELECT 1
   FROM ("public"."questions"
     JOIN "public"."tests" ON (("tests"."id" = "questions"."test_id")))
  WHERE (("questions"."id" = "answers"."question_id") AND ("tests"."test_type" = 'placement_test'::"public"."test_type_enum")))));



CREATE POLICY "Anon can read placement test questions" ON "public"."questions" FOR SELECT TO "anon" USING ((EXISTS ( SELECT 1
   FROM "public"."tests"
  WHERE (("tests"."id" = "questions"."test_id") AND ("tests"."test_type" = 'placement_test'::"public"."test_type_enum")))));



CREATE POLICY "Anyone can view teachers" ON "public"."teachers" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Users can check all questions" ON "public"."questions" FOR SELECT TO "authenticated" USING ((( SELECT "questions"."test_id") = "test_id"));



CREATE POLICY "Users can insert their own submissions" ON "public"."writing_submissions" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can update own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can view all answers" ON "public"."answers" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Users can view all questions" ON "public"."questions" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Users can view all tests" ON "public"."tests" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Users can view own profile" ON "public"."profiles" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view own result answers" ON "public"."result_answers" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."results"
  WHERE (("results"."id" = "result_answers"."result_id") AND ("results"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view own results" ON "public"."results" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can view their own submissions" ON "public"."writing_submissions" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "public"."answers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."levels" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."program" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "program: public read" ON "public"."program" FOR SELECT TO "authenticated", "anon" USING (true);



ALTER TABLE "public"."program_format" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "program_format: public read" ON "public"."program_format" FOR SELECT TO "authenticated", "anon" USING (true);



ALTER TABLE "public"."questions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."result_answers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."results" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."submodules" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."teachers" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "teachers_delete_admin" ON "public"."teachers" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "teachers_insert_admin" ON "public"."teachers" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "teachers_select_public" ON "public"."teachers" FOR SELECT USING (true);



CREATE POLICY "teachers_update_admin" ON "public"."teachers" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



ALTER TABLE "public"."test_parts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tests" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."theory_sections" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."writing_prompts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."writing_submissions" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "private" TO "authenticated";



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";






















































































































































REVOKE ALL ON FUNCTION "private"."is_admin"() FROM PUBLIC;
GRANT ALL ON FUNCTION "private"."is_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "private"."is_admin"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."calculate_placement_level"("p_answers" "jsonb") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."calculate_placement_level"("p_answers" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_placement_level"("p_answers" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_placement_level"("p_answers" "jsonb") TO "service_role";



REVOKE ALL ON FUNCTION "public"."delete_test"("p_test_id" bigint) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."delete_test"("p_test_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_test"("p_test_id" bigint) TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_correct_answers"("p_test_id" bigint) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_correct_answers"("p_test_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_correct_answers"("p_test_id" bigint) TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_placement_questions"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_placement_questions"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_placement_questions"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_placement_questions"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."handle_new_user"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."save_quiz_result"("p_test_id" bigint, "p_user_id" "uuid", "p_score" integer, "p_total" integer, "p_answers" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."save_quiz_result"("p_test_id" bigint, "p_user_id" "uuid", "p_score" integer, "p_total" integer, "p_answers" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."save_quiz_result"("p_test_id" bigint, "p_user_id" "uuid", "p_score" integer, "p_total" integer, "p_answers" "jsonb") TO "service_role";



REVOKE ALL ON FUNCTION "public"."save_test"("p_payload" "jsonb", "p_test_id" bigint) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."save_test"("p_payload" "jsonb", "p_test_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."save_test"("p_payload" "jsonb", "p_test_id" bigint) TO "service_role";



REVOKE ALL ON FUNCTION "public"."submit_quiz"("p_test_id" bigint, "p_answers" "jsonb") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."submit_quiz"("p_test_id" bigint, "p_answers" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."submit_quiz"("p_test_id" bigint, "p_answers" "jsonb") TO "service_role";


















GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."answers" TO "anon";
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."answers" TO "authenticated";
GRANT ALL ON TABLE "public"."answers" TO "service_role";



GRANT SELECT("id") ON TABLE "public"."answers" TO "anon";
GRANT SELECT("id") ON TABLE "public"."answers" TO "authenticated";



GRANT SELECT("question_id") ON TABLE "public"."answers" TO "anon";
GRANT SELECT("question_id") ON TABLE "public"."answers" TO "authenticated";



GRANT SELECT("answer_text") ON TABLE "public"."answers" TO "anon";
GRANT SELECT("answer_text") ON TABLE "public"."answers" TO "authenticated";



GRANT ALL ON SEQUENCE "public"."answers_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."answers_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."answers_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."levels" TO "anon";
GRANT ALL ON TABLE "public"."levels" TO "authenticated";
GRANT ALL ON TABLE "public"."levels" TO "service_role";



GRANT ALL ON SEQUENCE "public"."levels_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."levels_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."levels_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,MAINTAIN ON TABLE "public"."program" TO "anon";
GRANT SELECT,REFERENCES,TRIGGER,MAINTAIN ON TABLE "public"."program" TO "authenticated";
GRANT ALL ON TABLE "public"."program" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,MAINTAIN ON TABLE "public"."program_format" TO "anon";
GRANT SELECT,REFERENCES,TRIGGER,MAINTAIN ON TABLE "public"."program_format" TO "authenticated";
GRANT ALL ON TABLE "public"."program_format" TO "service_role";



GRANT ALL ON SEQUENCE "public"."program_format_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."program_format_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."program_format_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."questions" TO "anon";
GRANT ALL ON TABLE "public"."questions" TO "authenticated";
GRANT ALL ON TABLE "public"."questions" TO "service_role";



GRANT ALL ON SEQUENCE "public"."questions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."questions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."questions_id_seq" TO "service_role";



GRANT SELECT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."result_answers" TO "anon";
GRANT SELECT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."result_answers" TO "authenticated";
GRANT ALL ON TABLE "public"."result_answers" TO "service_role";



GRANT ALL ON SEQUENCE "public"."result_answers_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."result_answers_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."result_answers_id_seq" TO "service_role";



GRANT SELECT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."results" TO "anon";
GRANT SELECT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."results" TO "authenticated";
GRANT ALL ON TABLE "public"."results" TO "service_role";



GRANT ALL ON SEQUENCE "public"."results_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."results_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."results_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."submodules" TO "anon";
GRANT ALL ON TABLE "public"."submodules" TO "authenticated";
GRANT ALL ON TABLE "public"."submodules" TO "service_role";



GRANT ALL ON SEQUENCE "public"."submodules_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."submodules_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."submodules_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."teachers" TO "anon";
GRANT ALL ON TABLE "public"."teachers" TO "authenticated";
GRANT ALL ON TABLE "public"."teachers" TO "service_role";



GRANT ALL ON TABLE "public"."test_parts" TO "anon";
GRANT ALL ON TABLE "public"."test_parts" TO "authenticated";
GRANT ALL ON TABLE "public"."test_parts" TO "service_role";



GRANT ALL ON SEQUENCE "public"."test_parts_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."test_parts_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."test_parts_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."tests" TO "anon";
GRANT ALL ON TABLE "public"."tests" TO "authenticated";
GRANT ALL ON TABLE "public"."tests" TO "service_role";



GRANT ALL ON SEQUENCE "public"."tests_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."tests_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."tests_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."theory_sections" TO "anon";
GRANT ALL ON TABLE "public"."theory_sections" TO "authenticated";
GRANT ALL ON TABLE "public"."theory_sections" TO "service_role";



GRANT ALL ON SEQUENCE "public"."theory_sections_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."theory_sections_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."theory_sections_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."writing_prompts" TO "anon";
GRANT ALL ON TABLE "public"."writing_prompts" TO "authenticated";
GRANT ALL ON TABLE "public"."writing_prompts" TO "service_role";



GRANT ALL ON SEQUENCE "public"."writing_prompts_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."writing_prompts_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."writing_prompts_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."writing_submissions" TO "anon";
GRANT ALL ON TABLE "public"."writing_submissions" TO "authenticated";
GRANT ALL ON TABLE "public"."writing_submissions" TO "service_role";



GRANT ALL ON SEQUENCE "public"."writing_submissions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."writing_submissions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."writing_submissions_id_seq" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































drop extension if exists "pg_net";

drop policy "program: public read" on "public"."program";

drop policy "program_format: public read" on "public"."program_format";

drop policy "Anyone can view teachers" on "public"."teachers";

revoke delete on table "public"."program" from "anon";

revoke insert on table "public"."program" from "anon";

revoke truncate on table "public"."program" from "anon";

revoke update on table "public"."program" from "anon";

revoke delete on table "public"."program" from "authenticated";

revoke insert on table "public"."program" from "authenticated";

revoke truncate on table "public"."program" from "authenticated";

revoke update on table "public"."program" from "authenticated";

revoke delete on table "public"."program_format" from "anon";

revoke insert on table "public"."program_format" from "anon";

revoke truncate on table "public"."program_format" from "anon";

revoke update on table "public"."program_format" from "anon";

revoke delete on table "public"."program_format" from "authenticated";

revoke insert on table "public"."program_format" from "authenticated";

revoke truncate on table "public"."program_format" from "authenticated";

revoke update on table "public"."program_format" from "authenticated";

revoke insert on table "public"."result_answers" from "anon";

revoke insert on table "public"."result_answers" from "authenticated";

revoke insert on table "public"."results" from "anon";

revoke insert on table "public"."results" from "authenticated";


  create policy "program: public read"
  on "public"."program"
  as permissive
  for select
  to anon, authenticated
using (true);



  create policy "program_format: public read"
  on "public"."program_format"
  as permissive
  for select
  to anon, authenticated
using (true);



  create policy "Anyone can view teachers"
  on "public"."teachers"
  as permissive
  for select
  to anon, authenticated
using (true);


CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- Buckets are rows in storage.buckets, so db pull does not export them.
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;


  create policy "Users can update own avatar"
  on "storage"."objects"
  as permissive
  for update
  to public
using (((bucket_id = 'avatars'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));



  create policy "Users can upload own avatar"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check (((bucket_id = 'avatars'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));



  create policy "Users can view own avatar"
  on "storage"."objects"
  as permissive
  for select
  to public
using (((bucket_id = 'avatars'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));



