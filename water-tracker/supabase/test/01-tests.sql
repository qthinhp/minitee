-- Backend test suite. Run after 00-shim.sql + migrations/0001_init.sql.
-- Exercises the whole story: signup trigger, bottle registration, the
-- idempotent scan RPC, per-user sharing, RLS isolation, and the
-- timezone-correct daily totals. Any failure aborts with an exception.

\set ON_ERROR_STOP on

-- Fixed identities for the whole run
\set alice '11111111-1111-1111-1111-111111111111'
\set bob   '22222222-2222-2222-2222-222222222222'
\set carol '33333333-3333-3333-3333-333333333333'

-- ---------------------------------------------------------------------------
-- 1. Signup trigger creates profiles
-- ---------------------------------------------------------------------------
insert into auth.users (id, email) values
  (:'alice', 'alice@test.dev'),
  (:'bob',   'bob@test.dev'),
  (:'carol', 'carol@test.dev');

do $$ begin
  assert (select count(*) from public.profiles) = 3,
    'signup trigger should have created 3 profiles';
end $$;

update public.profiles set timezone = 'Asia/Ho_Chi_Minh' where id = '11111111-1111-1111-1111-111111111111';
update public.profiles set timezone = 'Pacific/Kiritimati' where id = '33333333-3333-3333-3333-333333333333';

insert into public.goals (user_id, metric_type_id, target_value)
select '11111111-1111-1111-1111-111111111111', id, 2500 from public.metric_types where slug = 'water';

-- ---------------------------------------------------------------------------
-- 2. Alice registers a bottle (as an authenticated client)
-- ---------------------------------------------------------------------------
set role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', false);

create temporary table t (code text);
insert into t select short_code from public.register_bottle('Big Blue', 500);

do $$ begin
  assert (select count(*) from public.user_bottles) = 1, 'alice should have 1 linked bottle';
  assert (select capacity_ml from public.user_bottles limit 1) = 500, 'capacity should be 500';
  assert length((select code from t)) = 6, 'short_code should be 6 chars';
end $$;

-- ---------------------------------------------------------------------------
-- 3. Scan logging: default capacity, override, and idempotency
-- ---------------------------------------------------------------------------
select public.log_bottle_scan((select code from t), 'aaaaaaaa-0000-0000-0000-000000000001'::uuid);
-- same client_event_id again (offline retry / double tap) -> must NOT duplicate
select public.log_bottle_scan((select code from t), 'aaaaaaaa-0000-0000-0000-000000000001'::uuid);
-- second scan with a value override (the ¾ adjuster path re-logs at 375)
select public.log_bottle_scan((select code from t), 'aaaaaaaa-0000-0000-0000-000000000002'::uuid, now(), 375);

do $$ begin
  assert (select count(*) from public.events) = 2, 'retry must not create a duplicate event';
  assert (select sum(value) from public.events) = 875, 'total should be 500 + 375';
end $$;

do $$
declare r record;
begin
  select * into r from public.today_summary();
  assert r.total = 875, format('alice today total: expected 875, got %s', r.total);
  assert r.goal = 2500, format('alice goal: expected 2500, got %s', r.goal);
end $$;

-- ---------------------------------------------------------------------------
-- 4. Sharing: Bob scans Alice's sticker
-- ---------------------------------------------------------------------------
select set_config('request.jwt.claim.sub', '22222222-2222-2222-2222-222222222222', false);

-- unlinked scan must fail loudly (the app catches this and opens LinkBottle)
do $$
declare code text;
begin
  select t.code into code from t;
  begin
    perform public.log_bottle_scan(code, 'bbbbbbbb-0000-0000-0000-000000000001'::uuid);
    raise exception 'scan of an unlinked bottle should have failed';
  exception when others then
    if sqlerrm not like '%bottle not linked%' then raise; end if;
  end;
end $$;

-- link with HIS OWN fill amount, then scan
select public.link_bottle((select code from t), 'Blue (Bob)', 750);
select public.log_bottle_scan((select code from t), 'bbbbbbbb-0000-0000-0000-000000000002'::uuid);

do $$
declare r record;
begin
  select * into r from public.today_summary();
  assert r.total = 750, format('bob today total: expected 750 (his capacity), got %s', r.total);
end $$;

-- ---------------------------------------------------------------------------
-- 5. RLS isolation: Bob only sees Bob
-- ---------------------------------------------------------------------------
do $$ begin
  assert (select count(*) from public.events) = 1, 'bob must only see his own event';
end $$;

-- bob attempts to modify alice's event by its client_event_id -> 0 rows
update public.events set value = 9999 where client_event_id = 'aaaaaaaa-0000-0000-0000-000000000001';

select set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', false);
do $$ begin
  assert (select count(*) from public.events) = 2, 'alice sees her 2 events';
  assert (select sum(value) from public.events) = 875, 'alice''s data untouched by bob''s update';
end $$;

-- admin helper must not be callable by clients
do $$
begin
  begin
    perform public.admin_today_total('11111111-1111-1111-1111-111111111111');
    raise exception 'admin_today_total should be denied to authenticated role';
  exception when insufficient_privilege then null;
  end;
end $$;

-- ---------------------------------------------------------------------------
-- 6. Timezone correctness (the classic hydration-app bug)
--    Carol is UTC+14. An event at her local 00:30 TODAY may be "yesterday"
--    in UTC — it must still count. Her local 23:00 YESTERDAY must not.
-- ---------------------------------------------------------------------------
reset role;
select set_config('request.jwt.claim.sub', '', false);

insert into public.events (user_id, metric_type_id, value, occurred_at, source, client_event_id)
select '33333333-3333-3333-3333-333333333333', id, 111,
       ((now() at time zone 'Pacific/Kiritimati')::date::timestamp + interval '30 minutes') at time zone 'Pacific/Kiritimati',
       'manual', 'cccccccc-0000-0000-0000-000000000001'
from public.metric_types where slug = 'water';

insert into public.events (user_id, metric_type_id, value, occurred_at, source, client_event_id)
select '33333333-3333-3333-3333-333333333333', id, 999,
       (((now() at time zone 'Pacific/Kiritimati')::date::timestamp - interval '1 hour') at time zone 'Pacific/Kiritimati'),
       'manual', 'cccccccc-0000-0000-0000-000000000002'
from public.metric_types where slug = 'water';

set role authenticated;
select set_config('request.jwt.claim.sub', '33333333-3333-3333-3333-333333333333', false);
do $$
declare r record;
begin
  select * into r from public.today_summary();
  assert r.total = 111,
    format('carol: expected 111 (today-local only, yesterday-local excluded), got %s', r.total);
end $$;

-- ---------------------------------------------------------------------------
-- 7. Service-role path used by the daily-summary edge function
-- ---------------------------------------------------------------------------
reset role;
do $$
declare r record;
begin
  select * into r from public.admin_today_total('11111111-1111-1111-1111-111111111111');
  assert r.total = 875, format('admin total for alice: expected 875, got %s', r.total);
  assert r.goal = 2500, 'admin goal for alice: expected 2500';
end $$;

-- ---------------------------------------------------------------------------
-- 8. Duplicate NFC tag registration is rejected
-- ---------------------------------------------------------------------------
set role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', false);
select public.register_bottle('Gym bottle', 750, '04:AA:BB:CC:DD:EE:FF');
do $$
begin
  begin
    perform public.register_bottle('Sneaky clone', 500, '04:AA:BB:CC:DD:EE:FF');
    raise exception 'duplicate nfc_uid should have been rejected';
  exception when others then
    if sqlerrm not like '%already registered%' then raise; end if;
  end;
end $$;

reset role;
select 'ALL BACKEND TESTS PASSED ✅' as result;
