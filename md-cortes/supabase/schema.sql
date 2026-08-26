-- ═══════════════════════════════════════════════════════════════════════════
-- MD_cortes — estrutura completa do banco
--
-- Como aplicar: Supabase → SQL Editor → cole este arquivo inteiro → Run.
-- É idempotente: pode rodar de novo sem quebrar nada.
--
-- O que ele cria:
--   1. tabelas profiles / services / haircuts / notifications
--   2. índices para as consultas que o app realmente faz
--   3. Row Level Security — a permissão de verdade, no banco
--   4. gatilho que cria o perfil quando um usuário é registrado no Auth
--   5. gatilho que gera a notificação do Maicon a cada corte lançado
--   6. publicação Realtime das tabelas que o app escuta
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. Tabelas ────────────────────────────────────────────────────────────

-- Espelha auth.users com o que o app precisa mostrar (nome, cargo).
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  name        text not null,
  email       text not null,
  role        text not null default 'employee' check (role in ('developer', 'employee')),
  job_title   text,                        -- "Desenvolvedor", "Funcionário 1", "Funcionário 2"
  created_at  timestamptz not null default now()
);

comment on column public.profiles.role is
  'developer = acesso total (Maicon). employee = só os próprios cortes (Gabriel, Nino).';

-- Catálogo de serviços. Preço aqui é sugestão: o valor cobrado vai no corte.
create table if not exists public.services (
  id             uuid primary key default gen_random_uuid(),
  name           text not null unique,
  default_price  numeric(10, 2) not null default 0,
  active         boolean not null default true,
  sort_order     integer not null default 0,
  created_at     timestamptz not null default now()
);

-- Um corte lançado. service_name é gravado junto de propósito: se o serviço for
-- renomeado ou desativado depois, o histórico continua contando a verdade do dia.
create table if not exists public.haircuts (
  id              uuid primary key default gen_random_uuid(),
  employee_id     uuid not null references public.profiles (id) on delete cascade,
  service_id      uuid references public.services (id) on delete set null,
  service_name    text not null,
  price           numeric(10, 2) not null check (price >= 0),
  payment_method  text not null check (payment_method in ('pix', 'dinheiro', 'debito', 'credito')),
  created_at      timestamptz not null default now()
);

-- Caixa de entrada do Maicon. Uma linha por destinatário.
create table if not exists public.notifications (
  id            uuid primary key default gen_random_uuid(),
  recipient_id  uuid not null references public.profiles (id) on delete cascade,
  employee_id   uuid references public.profiles (id) on delete set null,
  haircut_id    uuid references public.haircuts (id) on delete cascade,
  title         text not null,
  message       text not null,
  read          boolean not null default false,
  created_at    timestamptz not null default now()
);

-- ── 2. Índices ────────────────────────────────────────────────────────────
-- As consultas do app são sempre "cortes de fulano dentro de um intervalo" e
-- "notificações não lidas de fulano". Os índices abaixo cobrem exatamente isso.
-- Os recortes de hoje/semana/mês viram intervalos de timestamptz calculados no
-- fuso America/Sao_Paulo antes de chegar ao banco, então o índice por data
-- resolve todos eles sem precisar de coluna derivada.

create index if not exists haircuts_created_at_idx
  on public.haircuts (created_at desc);

create index if not exists haircuts_employee_created_at_idx
  on public.haircuts (employee_id, created_at desc);

create index if not exists notifications_recipient_created_at_idx
  on public.notifications (recipient_id, created_at desc);

-- Índice parcial: o sino só conta as não lidas, então só elas precisam de índice.
create index if not exists notifications_unread_idx
  on public.notifications (recipient_id)
  where read = false;

create index if not exists profiles_role_idx on public.profiles (role);

-- ── 3. Row Level Security ─────────────────────────────────────────────────

alter table public.profiles      enable row level security;
alter table public.services      enable row level security;
alter table public.haircuts      enable row level security;
alter table public.notifications enable row level security;

-- Sem SECURITY DEFINER esta função cairia em recursão: a política de profiles
-- consultaria profiles, que dispara a política de novo. Definer lê a tabela
-- ignorando RLS, que é justamente o que se quer aqui.
create or replace function public.is_developer()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'developer'
  );
$$;

revoke all on function public.is_developer() from public;
grant execute on function public.is_developer() to authenticated;

-- profiles ─────────────────────────────────────────────────────────────────
drop policy if exists "perfil proprio visivel"        on public.profiles;
drop policy if exists "desenvolvedor ve todos"        on public.profiles;
drop policy if exists "perfil proprio editavel"       on public.profiles;

create policy "perfil proprio visivel" on public.profiles
  for select to authenticated
  using (id = auth.uid());

create policy "desenvolvedor ve todos" on public.profiles
  for select to authenticated
  using (public.is_developer());

-- O funcionário pode ajustar o próprio nome, nunca o próprio cargo. O
-- `role` continua igual ao que já está gravado; quem promove alguém é o SQL.
create policy "perfil proprio editavel" on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid() and role = (select p.role from public.profiles p where p.id = auth.uid()));

-- services ─────────────────────────────────────────────────────────────────
drop policy if exists "servicos visiveis"        on public.services;
drop policy if exists "servicos so admin edita"  on public.services;

create policy "servicos visiveis" on public.services
  for select to authenticated
  using (true);

create policy "servicos so admin edita" on public.services
  for all to authenticated
  using (public.is_developer())
  with check (public.is_developer());

-- haircuts ─────────────────────────────────────────────────────────────────
drop policy if exists "corte proprio visivel"       on public.haircuts;
drop policy if exists "desenvolvedor ve cortes"     on public.haircuts;
drop policy if exists "lanca corte em nome proprio" on public.haircuts;
drop policy if exists "corrige corte proprio"       on public.haircuts;
drop policy if exists "apaga corte proprio"         on public.haircuts;
drop policy if exists "desenvolvedor edita cortes"  on public.haircuts;
drop policy if exists "desenvolvedor apaga cortes"  on public.haircuts;

create policy "corte proprio visivel" on public.haircuts
  for select to authenticated
  using (employee_id = auth.uid());

create policy "desenvolvedor ve cortes" on public.haircuts
  for select to authenticated
  using (public.is_developer());

-- O employee_id não vem do formulário: o WITH CHECK obriga a ser o usuário
-- autenticado. Gabriel não consegue lançar um corte no nome do Nino nem
-- forjando a requisição.
create policy "lanca corte em nome proprio" on public.haircuts
  for insert to authenticated
  with check (employee_id = auth.uid());

create policy "corrige corte proprio" on public.haircuts
  for update to authenticated
  using (employee_id = auth.uid())
  with check (employee_id = auth.uid());

create policy "apaga corte proprio" on public.haircuts
  for delete to authenticated
  using (employee_id = auth.uid());

create policy "desenvolvedor edita cortes" on public.haircuts
  for update to authenticated
  using (public.is_developer())
  with check (public.is_developer());

create policy "desenvolvedor apaga cortes" on public.haircuts
  for delete to authenticated
  using (public.is_developer());

-- notifications ────────────────────────────────────────────────────────────
drop policy if exists "so o destinatario le"      on public.notifications;
drop policy if exists "so o destinatario marca"   on public.notifications;

create policy "so o destinatario le" on public.notifications
  for select to authenticated
  using (recipient_id = auth.uid());

create policy "so o destinatario marca" on public.notifications
  for update to authenticated
  using (recipient_id = auth.uid())
  with check (recipient_id = auth.uid());

-- Ninguém insere notificação pela API: quem cria é o gatilho abaixo, em
-- SECURITY DEFINER. Não existe policy de INSERT aqui de propósito.

-- ── 4. Perfil automático ao registrar usuário ─────────────────────────────

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, role, job_title)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.email,
    case when new.raw_user_meta_data ->> 'role' = 'developer' then 'developer' else 'employee' end,
    new.raw_user_meta_data ->> 'job_title'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── 5. Notificação do Maicon a cada corte ─────────────────────────────────
-- Fica no banco, não no app: assim o aviso é gerado mesmo que o corte entre por
-- outro caminho, e o funcionário não precisa (nem pode) escrever na caixa de
-- entrada de outra pessoa.

create or replace function public.notify_developers_on_haircut()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  autor  text;
  valor  text;
begin
  select name into autor from public.profiles where id = new.employee_id;
  autor := coalesce(autor, 'Funcionário');
  valor := 'R$ ' || replace(to_char(new.price, 'FM999G999G990D00'), ',', '#');
  valor := replace(replace(valor, '.', ','), '#', '.');

  insert into public.notifications (recipient_id, employee_id, haircut_id, title, message)
  select p.id,
         new.employee_id,
         new.id,
         'Novo corte registrado',
         autor || ' registrou ' || new.service_name || ' — ' || valor
  from public.profiles p
  where p.role = 'developer'
    and p.id <> new.employee_id;   -- o próprio Maicon não se auto-notifica

  return new;
end;
$$;

drop trigger if exists on_haircut_created on public.haircuts;
create trigger on_haircut_created
  after insert on public.haircuts
  for each row execute function public.notify_developers_on_haircut();

-- ── 6. Realtime ───────────────────────────────────────────────────────────
-- Sem isto o app não recebe os eventos e o painel só atualizaria com F5.

do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
end
$$;

do $$
begin
  begin
    alter publication supabase_realtime add table public.haircuts;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.notifications;
  exception when duplicate_object then null;
  end;
end
$$;

-- O Realtime respeita RLS: cada sessão só recebe as linhas que ela poderia ler.
alter table public.haircuts      replica identity full;
alter table public.notifications replica identity full;
