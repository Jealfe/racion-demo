-- Run before deploying family-api. No data is modified.
begin;
create or replace function public.family_unread_counts(p_device_id uuid, p_author text)
returns jsonb
language sql stable security invoker set search_path = ''
as $$
  select jsonb_object_agg(counts.kind, counts.n)
  from (
    select sections.kind, count(items.id) as n
    from unnest(array['thanks','wishlist','ideas','likes','moments','movies','designs']) as sections(kind)
    left join public.device_reads reads
      on reads.device_id = p_device_id and reads.section = sections.kind
    left join public.shared_items items
      on items.kind = sections.kind
      and items.created_at > coalesce(reads.last_seen_at, '1970-01-01'::timestamptz)
      and items.author_name <> p_author
    group by sections.kind
  ) counts;
$$;
revoke all on function public.family_unread_counts(uuid,text) from public, anon, authenticated;
grant execute on function public.family_unread_counts(uuid,text) to service_role;
commit;
