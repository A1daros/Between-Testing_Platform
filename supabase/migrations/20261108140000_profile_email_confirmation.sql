-- The admin was notified about every new auth.users row, including bots and
-- addresses nobody controls. Keeping the confirmation time on the profile lets
-- notify-profile-status wait for it and lets the admin see who confirmed.
alter table public.profiles
  add column if not exists email_confirmed_at timestamptz;

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
    terms_version,
    email_confirmed_at
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', new.email),
    new.email,
    new.raw_user_meta_data ->> 'name',
    new.raw_user_meta_data ->> 'surname',
    case when v_terms_version is not null then now() end,
    v_terms_version,
    new.email_confirmed_at
  );

  return new;
end;
$$;

create or replace function private.sync_profile_email_confirmation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles
  set email_confirmed_at = new.email_confirmed_at
  where id = new.id;

  return new;
end;
$$;

revoke all on function private.sync_profile_email_confirmation() from public, anon, authenticated;

drop trigger if exists on_auth_user_email_confirmed on auth.users;

create trigger on_auth_user_email_confirmed
  after update of email_confirmed_at on auth.users
  for each row
  when (old.email_confirmed_at is distinct from new.email_confirmed_at)
  execute function private.sync_profile_email_confirmation();

-- Existing applications were already announced. Apply this migration before
-- deploying the new notify-profile-status, otherwise this backfill emails the
-- admin once for every pending profile.
update public.profiles p
set email_confirmed_at = u.email_confirmed_at
from auth.users u
where u.id = p.id
  and p.email_confirmed_at is distinct from u.email_confirmed_at;

-- Body is unchanged apart from the confirmation check. Without it, approving an
-- address nobody confirmed sends the approval email to a stranger.
create or replace function public.set_profile_status(p_user_id uuid, p_status text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_status text;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated' using errcode = '28000';
  end if;

  if not private.is_admin() then
    raise exception 'Forbidden' using errcode = '42501';
  end if;

  if p_status is null or p_status not in ('pending', 'approved', 'rejected') then
    raise exception 'Invalid status %', p_status using errcode = '22023';
  end if;

  if p_status = 'approved' and exists (
    select 1
    from public.profiles p
    where p.id = p_user_id and p.email_confirmed_at is null
  ) then
    raise exception 'Email is not confirmed' using errcode = '22023';
  end if;

  update public.profiles
  set status = p_status
  where id = p_user_id
  returning status into v_status;

  if v_status is null then
    raise exception 'Profile % not found', p_user_id using errcode = 'P0002';
  end if;

  return jsonb_build_object('id', p_user_id, 'status', v_status);
end;
$$;

revoke all on function public.set_profile_status(uuid, text) from public, anon;
grant execute on function public.set_profile_status(uuid, text) to authenticated;
