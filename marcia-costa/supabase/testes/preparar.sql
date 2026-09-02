-- Simula o que o Supabase fornece de graca (esquema auth e papeis), para dar
-- para rodar as migrations e os testes num Postgres comum.
create schema if not exists auth;
create table if not exists auth.users (id uuid primary key);
create or replace function auth.uid() returns uuid
  language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
do $$ begin create role anon nologin; exception when duplicate_object then null; end $$;
do $$ begin create role authenticated nologin; exception when duplicate_object then null; end $$;
grant usage on schema auth to anon, authenticated;
grant select on auth.users to anon, authenticated;
grant execute on function auth.uid() to anon, authenticated;
