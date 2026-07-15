-- Supabase-environment shim for LOCAL testing of the migrations.
-- Recreates just enough of Supabase's runtime (auth schema, JWT-based
-- auth.uid(), the anon/authenticated/service_role roles, default grants)
-- that migrations/0001_init.sql runs unmodified against vanilla Postgres.
-- NEVER run this against a real Supabase project — it's already there.

do $$ begin
  if not exists (select from pg_roles where rolname = 'anon') then
    create role anon nologin;
  end if;
  if not exists (select from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin;
  end if;
  if not exists (select from pg_roles where rolname = 'service_role') then
    create role service_role nologin bypassrls;
  end if;
end $$;

create schema if not exists auth;

create table if not exists auth.users (
  id    uuid primary key,
  email text
);

-- Supabase resolves auth.uid() from the request JWT; locally we read the
-- same claim from a session setting the tests control.
create or replace function auth.uid() returns uuid
language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;

-- Supabase grants these automatically via default privileges.
grant usage on schema public to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public grant execute on functions to anon, authenticated, service_role;
