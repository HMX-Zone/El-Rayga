-- iCal sync helpers: the cron route holds ELRAYGA_RPC_SECRET, the tables
-- themselves stay closed to anon.

create or replace function elrayga_list_ical_feeds(p_secret text)
returns table (id uuid, room_id uuid, url text)
language plpgsql stable security definer set search_path = public as $$
begin
  if p_secret is distinct from (select value from elrayga_config where key = 'rpc_secret') then
    raise exception 'unauthorized';
  end if;
  return query select f.id, f.room_id, f.url from elrayga_ical_feeds f;
end $$;

create or replace function elrayga_apply_ical_blocks(p_secret text, p_feed_id uuid, p_days date[])
returns int language plpgsql security definer set search_path = public as $$
declare
  v_room uuid;
begin
  if p_secret is distinct from (select value from elrayga_config where key = 'rpc_secret') then
    raise exception 'unauthorized';
  end if;
  select room_id into v_room from elrayga_ical_feeds where id = p_feed_id;
  if not found then raise exception 'unknown feed'; end if;

  delete from elrayga_blocked_dates where room_id = v_room and source = 'ical';
  insert into elrayga_blocked_dates (room_id, day, source)
    select v_room, d, 'ical' from unnest(p_days) as d
  on conflict do nothing;
  update elrayga_ical_feeds set last_synced_at = now() where id = p_feed_id;
  return coalesce(array_length(p_days, 1), 0);
end $$;

grant execute on function
  elrayga_list_ical_feeds(text),
  elrayga_apply_ical_blocks(text, uuid, date[])
to anon, authenticated;
