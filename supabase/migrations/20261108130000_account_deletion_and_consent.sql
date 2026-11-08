-- The privacy policy promises deletion, but foreign keys blocked deleting a
-- user who had a profile or results. Deleting a user now removes the profile
-- and keeps the results without a link to the person, so school statistics
-- stay intact.
alter table public.profiles
  drop constraint if exists profiles_id_fkey;

alter table public.profiles
  add constraint profiles_id_fkey
  foreign key (id) references auth.users (id) on delete cascade;

alter table public.results
  drop constraint if exists results_user_id_fkey;

alter table public.results
  add constraint results_user_id_fkey
  foreign key (user_id) references auth.users (id) on delete set null;

alter table public.results
  drop constraint if exists results_user_id_profiles_fkey;

alter table public.results
  add constraint results_user_id_profiles_fkey
  foreign key (user_id) references public.profiles (id) on delete set null;

-- Proof of consent to the terms and the privacy policy. The time comes from
-- the server, and the version from sign-up metadata. Accounts created before
-- this migration stay null: their consent was not recorded. The columns are
-- not in the client update grant on profiles.
alter table public.profiles
  add column if not exists terms_accepted_at timestamptz,
  add column if not exists terms_version text;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_terms_version text := left(new.raw_user_meta_data ->> 'terms_version', 32);
begin
  insert into public.profiles (
    id,
    display_name,
    email,
    name,
    surname,
    terms_accepted_at,
    terms_version
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', new.email),
    new.email,
    new.raw_user_meta_data ->> 'name',
    new.raw_user_meta_data ->> 'surname',
    case when v_terms_version is not null then now() end,
    v_terms_version
  );

  return new;
end;
$$;
