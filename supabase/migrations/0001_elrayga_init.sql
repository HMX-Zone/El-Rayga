-- ============================================================
-- EL RAYGA CAMP — booking schema (namespaced elrayga_*)
-- Lives in the shared HMX Zone project; follows the existing
-- convention of per-site table prefixes (cf. marketing_*).
-- All client access goes through SECURITY DEFINER functions —
-- tables themselves are not readable/writable by anon except
-- rooms & reviews (read-only).
-- ============================================================

create table if not exists elrayga_rooms (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  kind text not null check (kind in ('hut','room','dorm')),
  sleeps int not null,
  per_bed boolean not null default false,
  units int not null default 1,           -- bookable units of this type (beds for dorms)
  base_price numeric not null,            -- EGP / unit / night
  photos jsonb not null default '[]'::jsonb,
  accent text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists elrayga_bookings (
  id uuid primary key default gen_random_uuid(),
  ref text unique not null,
  room_id uuid not null references elrayga_rooms(id),
  check_in date not null,
  check_out date not null,
  units int not null default 1 check (units > 0),
  guests int not null default 1,
  guest jsonb not null,                    -- {first,last,email,phone,notes}
  locale text not null default 'en',
  status text not null default 'pending'
    check (status in ('pending','confirmed','paid','cancelled')),
  payment_method text
    check (payment_method in ('paymob_card','paymob_wallet','arrival')),
  base_total numeric not null,
  fee_total numeric not null,
  total numeric not null,
  paymob_order_id text,
  paymob_txn_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (check_out > check_in)
);
create index if not exists elrayga_bookings_room_dates
  on elrayga_bookings (room_id, check_in, check_out) where status <> 'cancelled';

create table if not exists elrayga_blocked_dates (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references elrayga_rooms(id),
  day date not null,
  source text not null default 'manual' check (source in ('manual','ical')),
  note text,
  unique (room_id, day, source)
);

create table if not exists elrayga_ical_feeds (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references elrayga_rooms(id),
  url text not null,
  label text,
  last_synced_at timestamptz
);

create table if not exists elrayga_reviews (
  id uuid primary key default gen_random_uuid(),
  platform text not null check (platform in ('google','booking','tripadvisor','facebook')),
  rating numeric not null,
  author text not null,
  said_when text,
  verbatim boolean not null default false,
  lang text,
  original text,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists elrayga_config (
  key text primary key,
  value text not null
);

-- ---------------- RLS ----------------
alter table elrayga_rooms enable row level security;
alter table elrayga_bookings enable row level security;
alter table elrayga_blocked_dates enable row level security;
alter table elrayga_ical_feeds enable row level security;
alter table elrayga_reviews enable row level security;
alter table elrayga_config enable row level security;

create policy elrayga_rooms_public_read on elrayga_rooms
  for select to anon, authenticated using (active);
create policy elrayga_reviews_public_read on elrayga_reviews
  for select to anon, authenticated using (true);
-- bookings / blocked / feeds / config: no direct policies → definer functions only.

-- ---------------- functions ----------------

-- per-day availability: units still free for [p_from, p_to)
create or replace function elrayga_availability(p_slug text, p_from date, p_to date)
returns table (day date, free int)
language sql stable security definer set search_path = public as $$
  with r as (select id, units from elrayga_rooms where slug = p_slug and active),
  days as (select generate_series(p_from, p_to - 1, interval '1 day')::date as day)
  select d.day,
    greatest(0,
      (select units from r)
      - coalesce((select sum(b.units)::int from elrayga_bookings b, r
                  where b.room_id = r.id and b.status <> 'cancelled'
                    and b.check_in <= d.day and b.check_out > d.day), 0)
      - case when exists (select 1 from elrayga_blocked_dates bl, r
                          where bl.room_id = r.id and bl.day = d.day)
             then (select units from r) else 0 end
    ) as free
  from days d
  where exists (select 1 from r);
$$;

-- authoritative price quote
create or replace function elrayga_quote(p_slug text, p_in date, p_out date, p_units int)
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'nights', (p_out - p_in),
    'rate', r.base_price,
    'units', p_units,
    'base', r.base_price * (p_out - p_in) * p_units,
    'fee',  round(r.base_price * (p_out - p_in) * p_units * 0.05),
    'total', r.base_price * (p_out - p_in) * p_units
           + round(r.base_price * (p_out - p_in) * p_units * 0.05)
  )
  from elrayga_rooms r where r.slug = p_slug and r.active;
$$;

-- create a booking (validates + conflict-checks under an advisory lock)
create or replace function elrayga_create_booking(
  p_slug text, p_in date, p_out date, p_units int, p_guests int,
  p_guest jsonb, p_method text, p_locale text default 'en'
) returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_room elrayga_rooms;
  v_quote jsonb;
  v_ref text;
  v_day date;
  v_free int;
  v_status text;
begin
  select * into v_room from elrayga_rooms where slug = p_slug and active;
  if not found then raise exception 'unknown room'; end if;
  if p_in < current_date then raise exception 'check-in is in the past'; end if;
  if p_out <= p_in then raise exception 'check-out must be after check-in'; end if;
  if p_out - p_in > 30 then raise exception 'stays longer than 30 nights: contact the desk'; end if;
  if p_units < 1 or p_units > v_room.units then raise exception 'invalid unit count'; end if;
  if p_method not in ('paymob_card','paymob_wallet','arrival') then raise exception 'invalid payment method'; end if;
  if coalesce(trim(p_guest->>'first'),'') = '' or coalesce(trim(p_guest->>'email'),'') = '' then
    raise exception 'guest name and email are required';
  end if;

  perform pg_advisory_xact_lock(hashtext('elrayga_' || v_room.id::text));

  for v_day, v_free in select * from elrayga_availability(p_slug, p_in, p_out) loop
    if v_free < p_units then
      raise exception 'sold out on %', v_day;
    end if;
  end loop;

  v_quote := elrayga_quote(p_slug, p_in, p_out, p_units);
  v_ref := 'ELR-' || to_char(now(), 'YYMM') || '-' ||
           upper(substr(md5(random()::text || clock_timestamp()::text), 1, 4));
  v_status := case when p_method = 'arrival' then 'confirmed' else 'pending' end;

  insert into elrayga_bookings
    (ref, room_id, check_in, check_out, units, guests, guest, locale, status,
     payment_method, base_total, fee_total, total)
  values
    (v_ref, v_room.id, p_in, p_out, p_units, p_guests, p_guest, p_locale, v_status,
     p_method, (v_quote->>'base')::numeric, (v_quote->>'fee')::numeric, (v_quote->>'total')::numeric);

  return jsonb_build_object('ref', v_ref, 'status', v_status) || v_quote;
end $$;

-- fetch a booking by ref (for checkout/confirmation pages)
create or replace function elrayga_get_booking(p_ref text)
returns jsonb language sql stable security definer set search_path = public as $$
  select to_jsonb(b) - 'id' - 'room_id'
         || jsonb_build_object('room_slug', r.slug, 'room_kind', r.kind, 'per_bed', r.per_bed)
  from elrayga_bookings b join elrayga_rooms r on r.id = b.room_id
  where b.ref = p_ref;
$$;

-- payment status transitions, guarded by the server-held RPC secret
create or replace function elrayga_set_payment(
  p_ref text, p_secret text, p_status text, p_txn text default null, p_order_id text default null
) returns boolean language plpgsql security definer set search_path = public as $$
begin
  if p_secret is distinct from (select value from elrayga_config where key = 'rpc_secret') then
    raise exception 'unauthorized';
  end if;
  if p_status not in ('paid','confirmed','cancelled','pending') then raise exception 'bad status'; end if;
  update elrayga_bookings
     set status = p_status,
         paymob_txn_id = coalesce(p_txn, paymob_txn_id),
         paymob_order_id = coalesce(p_order_id, paymob_order_id),
         updated_at = now()
   where ref = p_ref;
  return found;
end $$;

-- iCal export data (server route formats VCALENDAR)
create or replace function elrayga_ical_events(p_slug text)
returns table (ref text, check_in date, check_out date, status text)
language sql stable security definer set search_path = public as $$
  select b.ref, b.check_in, b.check_out, b.status
  from elrayga_bookings b join elrayga_rooms r on r.id = b.room_id
  where r.slug = p_slug and b.status in ('confirmed','paid') and b.check_out >= current_date;
$$;

grant execute on function
  elrayga_availability(text,date,date),
  elrayga_quote(text,date,date,int),
  elrayga_create_booking(text,date,date,int,int,jsonb,text,text),
  elrayga_get_booking(text),
  elrayga_set_payment(text,text,text,text,text),
  elrayga_ical_events(text)
to anon, authenticated;
