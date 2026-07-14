-- Water Tracker — initial schema
-- Design: docs/water-tracker/APPROACH.md §3
-- The sticker identifies the BOTTLE, the phone identifies the PERSON.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id                uuid primary key references auth.users (id) on delete cascade,
  display_name      text,
  timezone          text not null default 'UTC',
  notify_at         time not null default '21:00',      -- local time for daily summary
  expo_push_token   text,
  last_summary_date date,                               -- guards double-sends
  created_at        timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: own row" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- Auto-create a profile on signup.
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Metric registry — water is just the first metric (steps/workouts/calories
-- later become new rows here, not new tables).
-- ---------------------------------------------------------------------------
create table public.metric_types (
  id          smallint generated always as identity primary key,
  slug        text not null unique,
  unit        text not null,
  aggregation text not null default 'sum'
);

alter table public.metric_types enable row level security;
create policy "metric_types: readable" on public.metric_types
  for select using (true);

insert into public.metric_types (slug, unit) values ('water', 'ml');

-- ---------------------------------------------------------------------------
-- Bottles (one row per physical NFC sticker) and per-user links
-- ---------------------------------------------------------------------------
create table public.bottles (
  id         uuid primary key default gen_random_uuid(),
  short_code text not null unique,          -- what's encoded in the tag URL
  nfc_uid    text unique,                   -- factory serial, filled in once the
                                            -- physical tag is written (anti-spoof)
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now()
);

alter table public.bottles enable row level security;
-- short_code is a public-ish pointer: any signed-in user may resolve it
-- (that's what makes handing the bottle to a friend work).
create policy "bottles: readable by authenticated" on public.bottles
  for select to authenticated using (true);
-- Inserts go through the register_bottle() RPC only.

create table public.user_bottles (
  user_id     uuid not null references public.profiles (id) on delete cascade,
  bottle_id   uuid not null references public.bottles (id) on delete cascade,
  nickname    text not null,
  capacity_ml integer not null check (capacity_ml between 50 and 5000),
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  primary key (user_id, bottle_id)
);

alter table public.user_bottles enable row level security;
create policy "user_bottles: own rows" on public.user_bottles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Events — the heart of the system. One row per logged thing.
-- ---------------------------------------------------------------------------
create table public.events (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles (id) on delete cascade,
  metric_type_id  smallint not null references public.metric_types (id),
  value           numeric not null check (value > 0),
  occurred_at     timestamptz not null default now(),
  source          text not null check (source in ('nfc', 'qr', 'manual', 'healthkit', 'health_connect')),
  bottle_id       uuid references public.bottles (id),
  client_event_id uuid not null,            -- idempotency key from the device
  created_at      timestamptz not null default now(),
  unique (user_id, client_event_id)
);

create index events_user_day_idx on public.events (user_id, occurred_at desc);

alter table public.events enable row level security;
create policy "events: own rows" on public.events
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Goals — per user, per metric
-- ---------------------------------------------------------------------------
create table public.goals (
  user_id        uuid not null references public.profiles (id) on delete cascade,
  metric_type_id smallint not null references public.metric_types (id),
  target_value   numeric not null check (target_value > 0),
  effective_from date not null default current_date,
  primary key (user_id, metric_type_id, effective_from)
);

alter table public.goals enable row level security;
create policy "goals: own rows" on public.goals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- RPCs
-- ---------------------------------------------------------------------------

-- Create a bottle and link it to the caller. Returns the row incl. short_code
-- (the app then writes https://<domain>/t/<short_code> to the physical tag).
create or replace function public.register_bottle(
  p_nickname    text,
  p_capacity_ml integer,
  p_nfc_uid     text default null
) returns public.bottles
language plpgsql security definer set search_path = public as $$
declare
  v_code   text;
  v_bottle public.bottles;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  loop
    -- 6-char lowercase hex code, e.g. '9f3ea2' (~16.7M combos; collision -> retry)
    v_code := lower(substr(encode(gen_random_bytes(4), 'hex'), 1, 6));
    begin
      insert into public.bottles (short_code, nfc_uid, created_by)
      values (v_code, p_nfc_uid, auth.uid())
      returning * into v_bottle;
      exit;
    exception when unique_violation then
      -- rare code collision: retry (nfc_uid collision would loop forever,
      -- so re-raise if that's the culprit)
      if p_nfc_uid is not null
         and exists (select 1 from public.bottles where nfc_uid = p_nfc_uid) then
        raise exception 'tag already registered';
      end if;
    end;
  end loop;

  insert into public.user_bottles (user_id, bottle_id, nickname, capacity_ml)
  values (auth.uid(), v_bottle.id, p_nickname, p_capacity_ml);

  return v_bottle;
end $$;

-- Link an existing bottle (scanned a friend's sticker) to the caller.
create or replace function public.link_bottle(
  p_short_code  text,
  p_nickname    text,
  p_capacity_ml integer
) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_bottle_id uuid;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  select id into v_bottle_id from public.bottles where short_code = p_short_code;
  if v_bottle_id is null then raise exception 'unknown bottle'; end if;

  insert into public.user_bottles (user_id, bottle_id, nickname, capacity_ml)
  values (auth.uid(), v_bottle_id, p_nickname, p_capacity_ml)
  on conflict (user_id, bottle_id)
    do update set nickname = excluded.nickname,
                  capacity_ml = excluded.capacity_ml,
                  is_active = true;
end $$;

-- Log one scan. Idempotent on (user, client_event_id) so offline retries and
-- double-taps can never duplicate. value defaults to the caller's configured
-- capacity for that bottle; p_value_ml overrides (the ¾/½/¼ adjuster edits
-- the event afterwards via a normal RLS update).
create or replace function public.log_bottle_scan(
  p_short_code      text,
  p_client_event_id uuid,
  p_occurred_at     timestamptz default now(),
  p_value_ml        integer default null,
  p_source          text default 'nfc'
) returns public.events
language plpgsql security definer set search_path = public as $$
declare
  v_bottle_id   uuid;
  v_capacity    integer;
  v_event       public.events;
  v_metric      smallint;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;

  select b.id, ub.capacity_ml into v_bottle_id, v_capacity
  from public.bottles b
  join public.user_bottles ub on ub.bottle_id = b.id and ub.user_id = auth.uid()
  where b.short_code = p_short_code;

  if v_bottle_id is null then raise exception 'bottle not linked'; end if;

  select id into v_metric from public.metric_types where slug = 'water';

  insert into public.events
    (user_id, metric_type_id, value, occurred_at, source, bottle_id, client_event_id)
  values
    (auth.uid(), v_metric, coalesce(p_value_ml, v_capacity), p_occurred_at,
     p_source, v_bottle_id, p_client_event_id)
  on conflict (user_id, client_event_id) do nothing;

  select * into v_event from public.events
  where user_id = auth.uid() and client_event_id = p_client_event_id;
  return v_event;
end $$;

-- Service-role variant used by the daily-summary edge function (no auth.uid()).
-- Not exposed to clients: revoke from anon/authenticated below.
create or replace function public.admin_today_total(p_user_id uuid)
returns table (total numeric, goal numeric)
language sql security definer set search_path = public as $$
  with me as (select p.id, p.timezone from public.profiles p where p.id = p_user_id),
  metric as (select id from public.metric_types where slug = 'water'),
  local_day as (select (now() at time zone (select timezone from me))::date as d)
  select
    coalesce((select sum(e.value) from public.events e, me, metric, local_day
              where e.user_id = me.id
                and e.metric_type_id = metric.id
                and (e.occurred_at at time zone me.timezone)::date = local_day.d), 0),
    (select g.target_value from public.goals g, metric
      where g.user_id = p_user_id and g.metric_type_id = metric.id
        and g.effective_from <= current_date
      order by g.effective_from desc limit 1);
$$;

revoke execute on function public.admin_today_total(uuid) from anon, authenticated;

-- Today's total + goal for the caller, computed in THEIR timezone.
create or replace function public.today_summary(p_metric_slug text default 'water')
returns table (total numeric, goal numeric, day date)
language sql security definer set search_path = public as $$
  with me as (select p.id, p.timezone from public.profiles p where p.id = auth.uid()),
  metric as (select id from public.metric_types where slug = p_metric_slug),
  local_day as (select (now() at time zone (select timezone from me))::date as d)
  select
    coalesce((select sum(e.value) from public.events e, me, metric, local_day
              where e.user_id = me.id
                and e.metric_type_id = metric.id
                and (e.occurred_at at time zone me.timezone)::date = local_day.d), 0),
    (select g.target_value from public.goals g, metric
      where g.user_id = auth.uid() and g.metric_type_id = metric.id
        and g.effective_from <= current_date
      order by g.effective_from desc limit 1),
    (select d from local_day);
$$;
