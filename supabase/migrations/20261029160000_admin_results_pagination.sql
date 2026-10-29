-- The admin results page loaded every result at once and searched/sorted on the
-- client. Search and sort span two joined tables (profiles, tests), which
-- PostgREST cannot filter with a single OR, so the page is served by an RPC.
create or replace function public.get_admin_results(
  p_query text default '',
  p_sort text default 'date',
  p_limit int default 20,
  p_offset int default 0
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_pattern text;
  v_total   int;
  v_items   jsonb;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated' using errcode = '28000';
  end if;

  if not private.is_admin() then
    raise exception 'Forbidden' using errcode = '42501';
  end if;

  if p_sort is null or p_sort not in ('date', 'test', 'student') then
    raise exception 'Invalid sort' using errcode = '22023';
  end if;

  if p_limit is null or p_limit not between 1 and 100
    or p_offset is null or p_offset < 0 then
    raise exception 'Invalid page' using errcode = '22023';
  end if;

  -- Escape LIKE wildcards so the query is matched literally.
  v_pattern := '%' || replace(replace(replace(
    coalesce(trim(p_query), ''), '\', '\\'), '%', '\%'), '_', '\_') || '%';

  with filtered as (
    select r.id, r.test_id, r.user_id, r.score, r.total, r.created_at,
           t.title, t.test_type, p.display_name
    from public.results r
    join public.tests t on t.id = r.test_id
    left join public.profiles p on p.id = r.user_id
    where t.title ilike v_pattern
       or p.display_name ilike v_pattern
  ),
  page as (
    select *
    from filtered
    order by
      case when p_sort = 'test' then title end asc nulls last,
      case when p_sort = 'student' then display_name end asc nulls last,
      created_at desc,
      id desc
    limit p_limit
    offset p_offset
  )
  select
    (select count(*) from filtered),
    coalesce(jsonb_agg(
      jsonb_build_object(
        'id', page.id,
        'test_id', page.test_id,
        'user_id', page.user_id,
        'score', page.score,
        'total', page.total,
        'created_at', page.created_at,
        'tests', jsonb_build_object(
          'title', page.title,
          'test_type', page.test_type
        ),
        'profiles', case
          when page.display_name is null then null
          else jsonb_build_object('display_name', page.display_name)
        end
      )
      order by
        case when p_sort = 'test' then page.title end asc nulls last,
        case when p_sort = 'student' then page.display_name end asc nulls last,
        page.created_at desc,
        page.id desc
    ), '[]'::jsonb)
  into v_total, v_items
  from page;

  return jsonb_build_object('items', v_items, 'total', v_total);
end;
$$;

revoke all on function public.get_admin_results(text, text, int, int) from public, anon;
grant execute on function public.get_admin_results(text, text, int, int) to authenticated;
