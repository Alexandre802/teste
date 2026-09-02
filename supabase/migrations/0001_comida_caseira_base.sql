-- ═══════════════════════════════════════════════════════════════════════════
-- Fluxo de caixa da Comida Caseira da Márcia Costa — estrutura base.
--
-- Todo objeto leva o prefixo `comida_caseira_`. É proposital: o banco pode
-- hospedar outros projetos, e nome genérico (`orders`, `expenses`) mistura
-- dado de cliente diferente na primeira consulta distraída.
--
-- Dinheiro é SEMPRE inteiro em centavos. Nenhuma coluna de valor é float:
-- 0.1 + 0.2 não fecha caixa.
--
-- Datas são `timestamptz`. O fuso de exibição (America/Sao_Paulo) é aplicado
-- na leitura — guardar horário local sem fuso é o que faz venda das 23h cair
-- no dia errado no relatório.
-- ═══════════════════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;

-- ─────────────────────────────── enums ───────────────────────────────

do $$ begin
  create type comida_caseira_order_status as enum (
    'pending', 'confirmed', 'preparing', 'out_for_delivery', 'completed', 'cancelled'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type comida_caseira_payment_status as enum (
    'pending', 'paid', 'refunded', 'cancelled'
  );
exception when duplicate_object then null; end $$;

-- `card` existe porque o site oferece "Cartão" sem perguntar se é débito ou
-- crédito — quem sabe é a maquininha. O admin refina depois. Inventar
-- "crédito" no momento do pedido sujaria o relatório de formas de pagamento.
do $$ begin
  create type comida_caseira_payment_method as enum (
    'pix', 'cash', 'debit', 'credit', 'card'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type comida_caseira_order_type as enum ('delivery', 'pickup');
exception when duplicate_object then null; end $$;

do $$ begin
  create type comida_caseira_order_source as enum ('site', 'manual');
exception when duplicate_object then null; end $$;

do $$ begin
  create type comida_caseira_entry_kind as enum ('order', 'manual', 'refund', 'other');
exception when duplicate_object then null; end $$;

do $$ begin
  create type comida_caseira_cash_movement as enum ('sangria', 'suprimento');
exception when duplicate_object then null; end $$;

do $$ begin
  create type comida_caseira_role as enum ('owner', 'manager', 'cashier');
exception when duplicate_object then null; end $$;

-- ───────────────────────── funções auxiliares ─────────────────────────

-- Minúsculas, sem acento, espaços colapsados. Serve para casar o bairro que
-- o cliente digitou ("Jardim São josé ") com o que a casa cadastrou.
-- Feita com translate() em vez da extensão unacc[e]nt: uma extensão a menos
-- para o dono do banco precisar habilitar.
create or replace function comida_caseira_normalize(p_texto text)
returns text
language sql
immutable
set search_path = pg_catalog, public
as $$
  select btrim(regexp_replace(
    translate(
      lower(coalesce(p_texto, '')),
      'áàâãäéèêëíìîïóòôõöúùûüçñ',
      'aaaaaeeeeiiiiooooouuuucn'
    ),
    '\s+', ' ', 'g'
  ));
$$;

create or replace function comida_caseira_touch_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ──────────────────────────── usuários ────────────────────────────
-- Não há cadastro público. O primeiro usuário é criado no painel do Supabase
-- (Authentication → Add user) e ligado aqui pelo SQL editor. Ver 0004.

create table if not exists comida_caseira_users (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  name       text not null default '',
  email      text not null default '',
  role       comida_caseira_role not null default 'cashier',
  active     boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists comida_caseira_users_touch on comida_caseira_users;
create trigger comida_caseira_users_touch
  before update on comida_caseira_users
  for each row execute function comida_caseira_touch_updated_at();

-- Quem é administrador. Toda política de RLS passa por aqui.
create or replace function comida_caseira_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
      from public.comida_caseira_users u
     where u.user_id = auth.uid()
       and u.active
  );
$$;

create or replace function comida_caseira_current_role()
returns comida_caseira_role
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select u.role
    from public.comida_caseira_users u
   where u.user_id = auth.uid()
     and u.active
   limit 1;
$$;

-- ─────────────────────────── configurações ───────────────────────────
-- Chave/valor: dados da empresa, som de pedido novo, número inicial do
-- pedido. Nenhum valor é semeado com dado inventado — a tela de
-- Configurações começa vazia e a dona preenche.

create table if not exists comida_caseira_settings (
  key        text primary key,
  value      jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

-- ───────────────────────────── produtos ─────────────────────────────
-- Espelho do cardápio do site MAIS o custo, que é exclusivo do admin.
--
-- É esta tabela — nunca o navegador — que diz quanto custa um item na hora
-- de criar o pedido. `id` é o mesmo identificador usado no catálogo do site.

create table if not exists comida_caseira_products (
  id          text primary key,
  name        text not null,
  category    text not null default '',
  price_cents integer not null check (price_cents >= 0),
  -- null = custo ainda não informado. Zero significaria "custo zero", que é
  -- outra coisa: o lucro sairia inflado no relatório.
  cost_cents  integer check (cost_cents is null or cost_cents >= 0),
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

drop trigger if exists comida_caseira_products_touch on comida_caseira_products;
create trigger comida_caseira_products_touch
  before update on comida_caseira_products
  for each row execute function comida_caseira_touch_updated_at();

-- ──────────────────────── áreas de entrega ────────────────────────
-- Fonte única da taxa. O site público lê daqui pela mesma função que o
-- servidor usa para fechar a conta, então não existem duas taxas diferentes.
-- `district = null` é a regra coringa da cidade.

create table if not exists comida_caseira_delivery_zones (
  id              uuid primary key default gen_random_uuid(),
  city            text not null default '',
  district        text,
  district_norm   text generated always as (comida_caseira_normalize(district)) stored,
  fee_cents       integer not null default 0 check (fee_cents >= 0),
  min_order_cents integer not null default 0 check (min_order_cents >= 0),
  active          boolean not null default true,
  sort_order      integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists comida_caseira_delivery_zones_norm_idx
  on comida_caseira_delivery_zones (district_norm) where active;

drop trigger if exists comida_caseira_delivery_zones_touch on comida_caseira_delivery_zones;
create trigger comida_caseira_delivery_zones_touch
  before update on comida_caseira_delivery_zones
  for each row execute function comida_caseira_touch_updated_at();

-- ───────────────────────────── clientes ─────────────────────────────
-- Montada sozinha a partir dos pedidos. Guarda o mínimo: nome e telefone.
-- Sem e-mail, sem CPF, sem data de nascimento — o que não é coletado não vaza.
--
-- Quantos pedidos e quanto gastou NÃO são colunas aqui: são somados na hora
-- pela view `comida_caseira_customer_stats` (0003). Contador denormalizado
-- desanda no primeiro cancelamento e ninguém percebe.

create table if not exists comida_caseira_customers (
  id            uuid primary key default gen_random_uuid(),
  name          text not null default '',
  phone         text not null,
  phone_digits  text generated always as (regexp_replace(phone, '\D', '', 'g')) stored,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create unique index if not exists comida_caseira_customers_phone_idx
  on comida_caseira_customers (phone_digits);

drop trigger if exists comida_caseira_customers_touch on comida_caseira_customers;
create trigger comida_caseira_customers_touch
  before update on comida_caseira_customers
  for each row execute function comida_caseira_touch_updated_at();
