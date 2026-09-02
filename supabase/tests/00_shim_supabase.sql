-- ═══════════════════════════════════════════════════════════════════════════
-- Arremedo do ambiente Supabase, para rodar as migrations num Postgres nu.
--
-- NÃO faz parte do banco de produção — no Supabase tudo isto já existe. Serve
-- para conferir as migrations e rodar supabase/tests/01_fluxo.sql localmente:
--
--   psql -f supabase/tests/00_shim_supabase.sql
--   psql -f supabase/migrations/0001_...  (e os demais, em ordem)
--   psql -f supabase/tests/01_fluxo.sql
-- ═══════════════════════════════════════════════════════════════════════════

create schema if not exists auth;

create table if not exists auth.users (
  id    uuid primary key default gen_random_uuid(),
  email text unique
);

-- No Supabase, auth.uid() lê o JWT. Aqui lê uma variável de sessão, que o
-- teste troca para simular "ninguém logado", "cliente anônimo" e "admin".
create or replace function auth.uid() returns uuid
language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;

do $$ begin create role anon nologin;          exception when duplicate_object then null; end $$;
do $$ begin create role authenticated nologin; exception when duplicate_object then null; end $$;
do $$ begin create role service_role nologin;  exception when duplicate_object then null; end $$;

grant usage on schema public to anon, authenticated, service_role;
alter default privileges in schema public
  grant all on tables to authenticated, service_role;
alter default privileges in schema public
  grant all on sequences to authenticated, service_role;
