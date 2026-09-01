-- =====================================================================
-- MD_agenda — estrutura inicial
--
-- Duas decisões sustentam o resto do arquivo:
--
-- 1. A garantia contra agendamento duplo é do banco, não do aplicativo.
--    A exclusion constraint em `appointments` recusa qualquer sobreposição
--    entre horários que ocupam agenda, mesmo que dois pedidos cheguem no
--    mesmo milissegundo, em réplicas diferentes.
--
-- 2. O cliente anônimo não lê nada. RLS ligada em todas as tabelas e
--    nenhuma policy para `anon`: a área pública é servida pelo servidor do
--    Next, com service role, que devolve só o necessário. Telefone de
--    cliente nunca sai por consulta direta.
-- =====================================================================

create extension if not exists pgcrypto;
create extension if not exists btree_gist;

-- ---------------------------------------------------------------------
-- Perfis: quem pode entrar no painel.
-- A linha é criada à mão pelo dono depois de convidar o usuário no
-- Supabase Auth. Sem linha aqui, o usuário autenticado não enxerga nada.
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role text not null default 'admin' check (role in ('admin')),
  created_at timestamptz not null default now()
);

-- security definer para a policy de profiles não consultar profiles em loop.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ---------------------------------------------------------------------
-- Serviços
-- ---------------------------------------------------------------------
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 60),
  description text check (char_length(description) <= 160),
  price_cents integer not null check (price_cents >= 0),
  duration_minutes integer not null check (duration_minutes between 5 and 600),
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists services_active_idx on public.services (active, sort_order);

-- ---------------------------------------------------------------------
-- Expediente. 0 = domingo … 6 = sábado.
-- Os horários são guardados no fuso da barbearia (time, sem timezone);
-- a conversão para UTC acontece na aplicação, em lib/time.ts.
-- ---------------------------------------------------------------------
create table if not exists public.business_hours (
  weekday smallint primary key check (weekday between 0 and 6),
  is_open boolean not null default false,
  opens_at time,
  closes_at time,
  break_start time,
  break_end time,
  updated_at timestamptz not null default now(),
  constraint business_hours_range check (
    not is_open
    or (opens_at is not null and closes_at is not null and closes_at > opens_at)
  ),
  constraint business_hours_break check (
    (break_start is null and break_end is null)
    or (break_start is not null and break_end is not null and break_end > break_start)
  )
);

-- A semana nasce fechada de propósito: enquanto o dono não confirmar o
-- expediente real, o site não oferece horário nenhum em vez de chutar um.
insert into public.business_hours (weekday, is_open)
select generate_series(0, 6), false
on conflict (weekday) do nothing;

-- ---------------------------------------------------------------------
-- Bloqueios (compromisso, folga, período fechado)
-- ---------------------------------------------------------------------
create table if not exists public.blocked_periods (
  id uuid primary key default gen_random_uuid(),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reason text check (char_length(reason) <= 120),
  created_at timestamptz not null default now(),
  constraint blocked_periods_range check (ends_at > starts_at)
);

create index if not exists blocked_periods_window_idx
  on public.blocked_periods using gist (tstzrange(starts_at, ends_at, '[)'));

-- ---------------------------------------------------------------------
-- Agendamentos
-- ---------------------------------------------------------------------
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  -- Chave do link direto do cliente: prova posse do agendamento sem conta.
  access_token text not null default encode(gen_random_bytes(24), 'hex'),
  customer_name text not null check (char_length(customer_name) between 3 and 80),
  customer_phone text not null check (customer_phone ~ '^[0-9]{10,13}$'),
  service_id uuid references public.services (id) on delete set null,
  -- Snapshot: alterar o preço do serviço amanhã não reescreve o combinado.
  service_name_snapshot text not null,
  service_price_snapshot integer not null check (service_price_snapshot >= 0),
  service_duration_snapshot integer not null check (service_duration_snapshot > 0),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
  notes text check (char_length(notes) <= 240),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  cancelled_at timestamptz,
  cancel_reason text check (char_length(cancel_reason) <= 200),
  constraint appointments_range check (ends_at > starts_at)
);

-- O coração da proteção contra agendamento duplo.
-- Dois pedidos simultâneos para 10:00: o segundo recebe 23P01 e a aplicação
-- traduz para "esse horário acabou de ser reservado".
alter table public.appointments
  drop constraint if exists appointments_no_overlap;
alter table public.appointments
  add constraint appointments_no_overlap
  exclude using gist (tstzrange(starts_at, ends_at, '[)') with &&)
  where (status in ('pending', 'confirmed'));

create index if not exists appointments_starts_at_idx on public.appointments (starts_at);
create index if not exists appointments_status_idx on public.appointments (status, starts_at);
create index if not exists appointments_phone_idx on public.appointments (customer_phone, starts_at);

-- Segunda linha de defesa: nem a aplicação nem um script solto conseguem
-- gravar em cima de um bloqueio do barbeiro.
create or replace function public.reject_blocked_appointment()
returns trigger
language plpgsql
as $$
begin
  if new.status in ('pending', 'confirmed') and exists (
    select 1 from public.blocked_periods b
    where tstzrange(b.starts_at, b.ends_at, '[)')
       && tstzrange(new.starts_at, new.ends_at, '[)')
  ) then
    raise exception 'horário bloqueado pelo barbeiro'
      using errcode = '23P01';
  end if;
  return new;
end;
$$;

drop trigger if exists appointments_reject_blocked on public.appointments;
create trigger appointments_reject_blocked
  before insert or update of starts_at, ends_at, status on public.appointments
  for each row execute function public.reject_blocked_appointment();

-- ---------------------------------------------------------------------
-- Notificações internas (alimentam o Realtime do painel)
-- ---------------------------------------------------------------------
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('appointment_created', 'appointment_cancelled')),
  title text not null,
  body text not null,
  appointment_id uuid references public.appointments (id) on delete cascade,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_created_idx on public.notifications (created_at desc);

-- ---------------------------------------------------------------------
-- Configuração (linha única)
--
-- Os valores abaixo são padrões técnicos do sistema, não dados da
-- barbearia. Preço, expediente, telefone e política de cancelamento reais
-- entram pelo painel, em /admin/configuracoes.
-- ---------------------------------------------------------------------
create table if not exists public.settings (
  id smallint primary key default 1 check (id = 1),
  slot_interval_minutes integer not null default 30 check (slot_interval_minutes between 5 and 240),
  minimum_booking_notice_minutes integer not null default 60 check (minimum_booking_notice_minutes >= 0),
  booking_window_days integer not null default 30 check (booking_window_days between 1 and 365),
  cancel_before_minutes integer not null default 120 check (cancel_before_minutes >= 0),
  auto_confirm_appointments boolean not null default false,
  barber_name text not null default 'Maicon',
  barber_photo_url text,
  barber_tagline text,
  business_name text not null default 'MD_agenda',
  business_address text,
  business_phone text,
  whatsapp_number text,
  timezone text not null default 'America/Sao_Paulo',
  updated_at timestamptz not null default now()
);

insert into public.settings (id) values (1) on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- updated_at automático
-- ---------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists services_touch on public.services;
create trigger services_touch before update on public.services
  for each row execute function public.touch_updated_at();

drop trigger if exists appointments_touch on public.appointments;
create trigger appointments_touch before update on public.appointments
  for each row execute function public.touch_updated_at();

drop trigger if exists business_hours_touch on public.business_hours;
create trigger business_hours_touch before update on public.business_hours
  for each row execute function public.touch_updated_at();

drop trigger if exists settings_touch on public.settings;
create trigger settings_touch before update on public.settings
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------
-- Visão de clientes para o painel.
-- security_invoker: a visão respeita a RLS de quem consulta, em vez de
-- rodar com os poderes do dono.
-- ---------------------------------------------------------------------
create or replace view public.customers_overview
with (security_invoker = on) as
select
  (array_agg(a.customer_name order by a.starts_at desc))[1] as name,
  a.customer_phone as phone,
  max(a.starts_at) filter (where a.status <> 'cancelled') as last_visit,
  count(*) as appointment_count
from public.appointments a
group by a.customer_phone;

-- =====================================================================
-- Row Level Security
--
-- Sem policy para `anon`: o cliente anônimo não lista agendamento, não
-- lista cliente e não alcança telefone de ninguém. Só o servidor, com
-- service role (que ignora RLS por definição), grava agendamento.
-- =====================================================================
alter table public.profiles enable row level security;
alter table public.services enable row level security;
alter table public.business_hours enable row level security;
alter table public.blocked_periods enable row level security;
alter table public.appointments enable row level security;
alter table public.notifications enable row level security;
alter table public.settings enable row level security;

drop policy if exists profiles_self_read on public.profiles;
create policy profiles_self_read on public.profiles
  for select to authenticated
  using (id = auth.uid());

drop policy if exists services_admin_all on public.services;
create policy services_admin_all on public.services
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists business_hours_admin_all on public.business_hours;
create policy business_hours_admin_all on public.business_hours
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists blocked_periods_admin_all on public.blocked_periods;
create policy blocked_periods_admin_all on public.blocked_periods
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists appointments_admin_all on public.appointments;
create policy appointments_admin_all on public.appointments
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists notifications_admin_all on public.notifications;
create policy notifications_admin_all on public.notifications
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists settings_admin_all on public.settings;
create policy settings_admin_all on public.settings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- Realtime: o painel recebe agendamento novo sem recarregar a página.
-- ---------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'appointments'
  ) then
    alter publication supabase_realtime add table public.appointments;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table public.notifications;
  end if;
exception
  when undefined_object then
    raise notice 'publicação supabase_realtime não encontrada; ative o Realtime pelo painel do Supabase.';
end
$$;
