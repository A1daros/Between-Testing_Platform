-- Prevent privilege escalation: users could update their own profiles.role
-- (e.g. set it to 'admin') because the update policy has no column restriction.
-- Limit client writes to the columns the app actually edits.
revoke all on table public.profiles from anon;
revoke insert, update, delete, truncate on table public.profiles from authenticated;

grant update (display_name, birth_date, avatar_url) on table public.profiles to authenticated;

-- Legacy RPC: trusts client-provided user id and score. Replaced by submit_quiz.
drop function if exists public.save_quiz_result(bigint, uuid, integer, integer, jsonb);
