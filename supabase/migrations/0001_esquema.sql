-- ===========================================================================
-- Comida Caseira da Marcia Costa — fluxo de caixa
-- 0001: esquema base
-- ===========================================================================
-- Tudo com o prefixo comida_caseira_ para nunca se misturar com outro cliente
-- que venha a dividir o mesmo banco.
--
-- Dinheiro SEMPRE em centavos (bigint). R$ 25,00 = 2500. Nada de float.
-- Datas em timestamptz; a apresentacao converte para America/Sao_Paulo.
-- ===========================================================================

create extension if not exists pgcrypto;

-- --------------------------------------------------------------------------
-- Tipos
-- --------------------------------------------------------------------------
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

do $$ begin
  create type comida_caseira_payment_method as enum ('pix', 'cash', 'debit', 'credit');
exception when duplicate_object then null; end $$;

do $$ begin
  create type comida_caseira_order_type as enum ('delivery', 'pickup');
exception when duplicate_object then null; end $$;

do $$ begin
  create type comida_caseira_order_source as enum ('site', 'manual');
exception when duplicate_object then null; end $$;

do $$ begin
  create type comida_caseira_role as enum ('owner', 'manager', 'cashier');
exception when duplicate_object then null; end $$;

do $$ begin
  create type comida_caseira_cash_movement_kind as enum ('opening', 'sangria', 'suprimento');
exception when duplicate_object then null; end $$;

-- --------------------------------------------------------------------------
-- Quem pode entrar no painel
-- --------------------------------------------------------------------------
-- Espelha auth.users do Supabase. NAO existe cadastro publico: a linha aqui e
-- criada a mao pela dona, e sem linha aqui o usuario nao ve nada.
create table if not exists comida_caseira_users (
  user_id    uuid primary key,
  nome       text not null,
  role       comida_caseira_role not null default 'cashier',
  ativo      boolean not null default true,
  created_at timestamptz not null default now()
);

comment on table comida_caseira_users is
  'Usuarios do painel. Sem linha aqui, o usuario autenticado nao enxerga nada.';

-- Quem esta logado e ativo no painel?
create or replace function comida_caseira_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from comida_caseira_users
    where user_id = auth.uid() and ativo
  );
$$;

-- Papel do usuario atual, ou null se ele nao for do painel.
create or replace function comida_caseira_current_role()
returns comida_caseira_role
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select role from comida_caseira_users
  where user_id = auth.uid() and ativo;
$$;

-- --------------------------------------------------------------------------
-- Configuracoes da casa (uma linha so)
-- --------------------------------------------------------------------------
create table if not exists comida_caseira_settings (
  id             boolean primary key default true check (id),
  nome           text not null default 'Comida Caseira da Márcia Costa',
  telefone       text not null default '',
  whatsapp       text not null default '',
  instagram      text not null default '',
  endereco       text not null default '',
  horarios       jsonb not null default '[]'::jsonb,
  som_novo_pedido boolean not null default true,
  updated_at     timestamptz not null default now()
);

insert into comida_caseira_settings (id) values (true) on conflict do nothing;

-- --------------------------------------------------------------------------
-- Produtos: so o que o painel precisa saber alem do cardapio publico
-- --------------------------------------------------------------------------
-- O cardapio publico continua em data/menu.ts. Aqui fica o CUSTO, que nunca
-- pode aparecer no site, e o preco espelhado para o servidor recalcular o
-- pedido sem confiar no navegador.
create table if not exists comida_caseira_products (
  id              text primary key,
  nome            text not null,
  categoria       text not null default '',
  price_cents     bigint not null check (price_cents >= 0),
  cost_cents      bigint not null default 0 check (cost_cents >= 0),
  ativo           boolean not null default true,
  updated_at      timestamptz not null default now()
);

comment on column comida_caseira_products.cost_cents is
  'Custo do produto. NUNCA exposto no site publico.';

-- Grupos de opcao com preco proprio, para o servidor validar adicionais.
create table if not exists comida_caseira_product_options (
  id            text primary key,
  product_id    text not null references comida_caseira_products(id) on delete cascade,
  grupo_id      text not null,
  grupo_nome    text not null,
  nome          text not null,
  price_delta_cents bigint not null default 0 check (price_delta_cents >= 0),
  cost_delta_cents  bigint not null default 0 check (cost_delta_cents >= 0),
  ativo         boolean not null default true
);

create index if not exists comida_caseira_product_options_produto_idx
  on comida_caseira_product_options (product_id);

-- --------------------------------------------------------------------------
-- Zonas de entrega: a taxa oficial mora aqui, e so aqui
-- --------------------------------------------------------------------------
create table if not exists comida_caseira_delivery_zones (
  id                 uuid primary key default gen_random_uuid(),
  cidade             text not null,
  bairro             text not null default '',
  fee_cents          bigint check (fee_cents >= 0),
  pedido_minimo_cents bigint check (pedido_minimo_cents >= 0),
  prazo_minutos      integer check (prazo_minutos > 0),
  ativo              boolean not null default true,
  unique (cidade, bairro)
);

comment on column comida_caseira_delivery_zones.fee_cents is
  'null = taxa ainda nao confirmada pela casa. O site escreve "a combinar".';

-- --------------------------------------------------------------------------
-- Clientes: montados sozinhos a partir dos pedidos
-- --------------------------------------------------------------------------
create table if not exists comida_caseira_customers (
  id           uuid primary key default gen_random_uuid(),
  nome         text not null,
  telefone     text not null default '',
  pedidos      integer not null default 0,
  total_cents  bigint not null default 0,
  ultimo_pedido_at timestamptz,
  created_at   timestamptz not null default now()
);

create unique index if not exists comida_caseira_customers_telefone_idx
  on comida_caseira_customers (telefone) where telefone <> '';

-- --------------------------------------------------------------------------
-- Pedidos
-- --------------------------------------------------------------------------
create sequence if not exists comida_caseira_order_number_seq start 1001;

create table if not exists comida_caseira_orders (
  id                uuid primary key default gen_random_uuid(),
  order_number      integer not null unique default nextval('comida_caseira_order_number_seq'),

  customer_id       uuid references comida_caseira_customers(id) on delete set null,
  customer_name     text not null,
  customer_phone    text not null default '',

  order_type        comida_caseira_order_type not null,
  status            comida_caseira_order_status not null default 'pending',
  payment_method    comida_caseira_payment_method not null,
  payment_status    comida_caseira_payment_status not null default 'pending',

  subtotal_cents     bigint not null check (subtotal_cents >= 0),
  -- null = taxa da regiao ainda nao confirmada; nao entra no total.
  delivery_fee_cents bigint check (delivery_fee_cents >= 0),
  discount_cents     bigint not null default 0 check (discount_cents >= 0),
  total_cents        bigint not null check (total_cents >= 0),
  cost_cents         bigint not null default 0 check (cost_cents >= 0),

  troco_para_cents   bigint check (troco_para_cents >= 0),
  address_json       jsonb,
  notes              text not null default '',

  source             comida_caseira_order_source not null default 'site',
  -- Chave de idempotencia: o mesmo checkout nunca vira dois pedidos.
  checkout_token     text unique,

  cancel_reason      text,

  created_at    timestamptz not null default now(),
  confirmed_at  timestamptz,
  paid_at       timestamptz,
  completed_at  timestamptz,
  cancelled_at  timestamptz,
  refunded_at   timestamptz
);

create index if not exists comida_caseira_orders_created_idx
  on comida_caseira_orders (created_at desc);
create index if not exists comida_caseira_orders_status_idx
  on comida_caseira_orders (status);
create index if not exists comida_caseira_orders_payment_status_idx
  on comida_caseira_orders (payment_status);
create index if not exists comida_caseira_orders_customer_idx
  on comida_caseira_orders (customer_id);

-- Retirada nao tem taxa nem endereco.
alter table comida_caseira_orders drop constraint if exists comida_caseira_orders_retirada_ck;
alter table comida_caseira_orders add constraint comida_caseira_orders_retirada_ck
  check (
    order_type <> 'pickup'
    or (coalesce(delivery_fee_cents, 0) = 0 and address_json is null)
  );

-- --------------------------------------------------------------------------
-- Itens do pedido — com snapshot de nome, preco e custo
-- --------------------------------------------------------------------------
create table if not exists comida_caseira_order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references comida_caseira_orders(id) on delete cascade,
  product_id    text not null,

  -- Snapshot: se o preco mudar amanha, o pedido antigo continua com o valor
  -- que o cliente pagou.
  product_name_snapshot text not null,
  unit_price_cents bigint not null check (unit_price_cents >= 0),
  unit_cost_cents  bigint not null default 0 check (unit_cost_cents >= 0),

  quantity      integer not null check (quantity > 0),
  addons_cents  bigint not null default 0 check (addons_cents >= 0),
  options_json  jsonb not null default '[]'::jsonb,
  observacao    text not null default '',

  total_cents   bigint not null check (total_cents >= 0)
);

create index if not exists comida_caseira_order_items_order_idx
  on comida_caseira_order_items (order_id);

-- --------------------------------------------------------------------------
-- Receitas: pedido pago vira lancamento; tambem aceita entrada manual
-- --------------------------------------------------------------------------
create table if not exists comida_caseira_revenues (
  id             uuid primary key default gen_random_uuid(),
  order_id       uuid references comida_caseira_orders(id) on delete cascade,
  tipo           text not null default 'order' check (tipo in ('order', 'manual', 'outros')),
  descricao      text not null default '',
  amount_cents   bigint not null check (amount_cents <> 0),
  payment_method comida_caseira_payment_method not null,
  ocorrido_em    date not null default (now() at time zone 'America/Sao_Paulo')::date,
  observacao     text not null default '',
  created_by     uuid,
  created_at     timestamptz not null default now()
);

comment on column comida_caseira_revenues.amount_cents is
  'Negativo em estorno de reembolso, para o relatorio se corrigir sozinho.';

create index if not exists comida_caseira_revenues_data_idx
  on comida_caseira_revenues (ocorrido_em desc);
create unique index if not exists comida_caseira_revenues_pedido_idx
  on comida_caseira_revenues (order_id) where order_id is not null and amount_cents > 0;

-- --------------------------------------------------------------------------
-- Despesas
-- --------------------------------------------------------------------------
create table if not exists comida_caseira_expense_categories (
  id      uuid primary key default gen_random_uuid(),
  nome    text not null unique,
  ordem   integer not null default 0,
  ativo   boolean not null default true
);

create table if not exists comida_caseira_expenses (
  id             uuid primary key default gen_random_uuid(),
  category_id    uuid references comida_caseira_expense_categories(id) on delete set null,
  descricao      text not null,
  amount_cents   bigint not null check (amount_cents > 0),
  payment_method comida_caseira_payment_method not null,
  fornecedor     text not null default '',
  observacao     text not null default '',
  ocorrido_em    date not null default (now() at time zone 'America/Sao_Paulo')::date,
  created_by     uuid,
  created_at     timestamptz not null default now()
);

create index if not exists comida_caseira_expenses_data_idx
  on comida_caseira_expenses (ocorrido_em desc);

-- --------------------------------------------------------------------------
-- Caixa: abertura, fechamento, sangria e suprimento
-- --------------------------------------------------------------------------
create table if not exists comida_caseira_cash_sessions (
  id              uuid primary key default gen_random_uuid(),
  aberto_em       timestamptz not null default now(),
  fechado_em      timestamptz,
  abertura_cents  bigint not null default 0 check (abertura_cents >= 0),
  contado_cents   bigint check (contado_cents >= 0),
  observacao      text not null default '',
  aberto_por      uuid,
  fechado_por     uuid
);

-- No maximo um caixa aberto por vez.
create unique index if not exists comida_caseira_cash_sessions_aberto_idx
  on comida_caseira_cash_sessions ((fechado_em is null)) where fechado_em is null;

create table if not exists comida_caseira_cash_movements (
  id           uuid primary key default gen_random_uuid(),
  session_id   uuid not null references comida_caseira_cash_sessions(id) on delete cascade,
  kind         comida_caseira_cash_movement_kind not null,
  amount_cents bigint not null check (amount_cents > 0),
  motivo       text not null default '',
  created_by   uuid,
  created_at   timestamptz not null default now()
);

create index if not exists comida_caseira_cash_movements_session_idx
  on comida_caseira_cash_movements (session_id);

-- --------------------------------------------------------------------------
-- Auditoria
-- --------------------------------------------------------------------------
create table if not exists comida_caseira_audit_logs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid,
  action     text not null,
  entity     text not null,
  entity_id  text not null,
  old_data   jsonb,
  new_data   jsonb,
  created_at timestamptz not null default now()
);

create index if not exists comida_caseira_audit_logs_data_idx
  on comida_caseira_audit_logs (created_at desc);
