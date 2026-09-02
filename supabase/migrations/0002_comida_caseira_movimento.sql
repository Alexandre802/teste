-- ═══════════════════════════════════════════════════════════════════════════
-- Pedidos, recebimentos, despesas e caixa.
--
-- A separação que sustenta o painel inteiro:
--
--   PEDIDO       — o cliente pediu.            (comida_caseira_orders)
--   RECEBIMENTO  — o dinheiro entrou.          (comida_caseira_entries)
--   DESPESA      — o dinheiro saiu.            (comida_caseira_expenses)
--
-- Pedido criado NÃO é dinheiro recebido. O recebimento só existe quando a
-- casa marca o pedido como pago — e aí uma linha entra em `entries`. É o que
-- impede o faturamento de mentir.
-- ═══════════════════════════════════════════════════════════════════════════

-- Número curto e sequencial do pedido, o que a casa fala em voz alta.
create sequence if not exists comida_caseira_order_number_seq as bigint start 1;

create table if not exists comida_caseira_orders (
  id                 uuid primary key default gen_random_uuid(),
  order_number       bigint not null unique default nextval('comida_caseira_order_number_seq'),

  customer_id        uuid references comida_caseira_customers(id) on delete set null,
  customer_name      text not null default '',
  customer_phone     text not null default '',

  order_type         comida_caseira_order_type not null,
  status             comida_caseira_order_status not null default 'pending',
  payment_method     comida_caseira_payment_method not null,
  payment_status     comida_caseira_payment_status not null default 'pending',

  subtotal_cents     integer not null check (subtotal_cents >= 0),
  delivery_fee_cents integer not null default 0 check (delivery_fee_cents >= 0),
  discount_cents     integer not null default 0 check (discount_cents >= 0),
  total_cents        integer not null check (total_cents >= 0),
  -- custo dos itens no momento da venda; null quando nenhum item tinha custo
  cost_cents         integer check (cost_cents is null or cost_cents >= 0),
  -- "troco para": só faz sentido no dinheiro
  change_for_cents   integer check (change_for_cents is null or change_for_cents >= 0),

  address            jsonb,
  notes              text not null default '',
  cancel_reason      text,

  source             comida_caseira_order_source not null default 'site',
  -- idempotência: dois toques em "Enviar pedido" reaproveitam o mesmo pedido
  checkout_token     text unique,

  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  confirmed_at       timestamptz,
  paid_at            timestamptz,
  completed_at       timestamptz,
  cancelled_at       timestamptz,
  refunded_at        timestamptz
);

create index if not exists comida_caseira_orders_created_idx on comida_caseira_orders (created_at desc);
create index if not exists comida_caseira_orders_status_idx  on comida_caseira_orders (status);
create index if not exists comida_caseira_orders_payment_idx on comida_caseira_orders (payment_status);
create index if not exists comida_caseira_orders_customer_idx on comida_caseira_orders (customer_id);

drop trigger if exists comida_caseira_orders_touch on comida_caseira_orders;
create trigger comida_caseira_orders_touch
  before update on comida_caseira_orders
  for each row execute function comida_caseira_touch_updated_at();

-- ─────────────────────────── itens do pedido ───────────────────────────
-- Tudo aqui é FOTOGRAFIA do momento da venda: nome, preço e custo ficam
-- gravados na linha. Se a marmita subir de R$ 25 para R$ 28 amanhã, o pedido
-- de hoje continua valendo R$ 25 no relatório de hoje.

create table if not exists comida_caseira_order_items (
  id               uuid primary key default gen_random_uuid(),
  order_id         uuid not null references comida_caseira_orders(id) on delete cascade,
  product_id       text,
  product_name     text not null,
  quantity         integer not null check (quantity > 0),
  unit_price_cents integer not null check (unit_price_cents >= 0),
  unit_cost_cents  integer check (unit_cost_cents is null or unit_cost_cents >= 0),
  addons_cents     integer not null default 0 check (addons_cents >= 0),
  options          jsonb not null default '[]'::jsonb,
  note             text not null default '',
  total_cents      integer not null check (total_cents >= 0),
  created_at       timestamptz not null default now()
);

create index if not exists comida_caseira_order_items_order_idx
  on comida_caseira_order_items (order_id);
create index if not exists comida_caseira_order_items_product_idx
  on comida_caseira_order_items (product_id);

-- ──────────────────────── recebimentos (receitas) ────────────────────────
-- Uma linha por dinheiro que entrou de verdade.
--
--   kind = 'order'   — gerada quando o pedido é marcado como pago
--   kind = 'manual'  — venda que não passou pelo site
--   kind = 'refund'  — estorno; valor NEGATIVO, para o período se corrigir
--                      sozinho sem apagar histórico
--   kind = 'other'   — qualquer outra entrada

create table if not exists comida_caseira_entries (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid references comida_caseira_orders(id) on delete cascade,
  kind         comida_caseira_entry_kind not null default 'manual',
  amount_cents integer not null,
  method       comida_caseira_payment_method not null,
  description  text not null default '',
  notes        text not null default '',
  occurred_at  timestamptz not null default now(),
  created_by   uuid references auth.users(id) on delete set null,
  created_at   timestamptz not null default now()
);

-- um pedido gera no máximo um recebimento automático
create unique index if not exists comida_caseira_entries_order_idx
  on comida_caseira_entries (order_id) where kind = 'order';
create index if not exists comida_caseira_entries_occurred_idx
  on comida_caseira_entries (occurred_at desc);

-- ───────────────────────────── despesas ─────────────────────────────

create table if not exists comida_caseira_expense_categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text not null unique,
  active     boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists comida_caseira_expenses (
  id           uuid primary key default gen_random_uuid(),
  category_id  uuid references comida_caseira_expense_categories(id) on delete set null,
  description  text not null default '',
  amount_cents integer not null check (amount_cents > 0),
  method       comida_caseira_payment_method not null default 'cash',
  supplier     text not null default '',
  notes        text not null default '',
  occurred_at  timestamptz not null default now(),
  created_by   uuid references auth.users(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists comida_caseira_expenses_occurred_idx
  on comida_caseira_expenses (occurred_at desc);
create index if not exists comida_caseira_expenses_category_idx
  on comida_caseira_expenses (category_id);

drop trigger if exists comida_caseira_expenses_touch on comida_caseira_expenses;
create trigger comida_caseira_expenses_touch
  before update on comida_caseira_expenses
  for each row execute function comida_caseira_touch_updated_at();

-- ─────────────────────── caixa: abertura e fechamento ───────────────────────

create table if not exists comida_caseira_cash_sessions (
  id               uuid primary key default gen_random_uuid(),
  opened_at        timestamptz not null default now(),
  opened_by        uuid references auth.users(id) on delete set null,
  opening_cents    integer not null default 0 check (opening_cents >= 0),
  closed_at        timestamptz,
  closed_by        uuid references auth.users(id) on delete set null,
  -- preenchidos no fechamento
  expected_cents   integer,
  counted_cents    integer,
  difference_cents integer,
  notes            text not null default '',
  created_at       timestamptz not null default now()
);

-- só um caixa aberto por vez: dois abertos tornam a conferência impossível
create unique index if not exists comida_caseira_cash_sessions_open_idx
  on comida_caseira_cash_sessions ((closed_at is null)) where closed_at is null;

-- ─────────────────────── sangria e suprimento ───────────────────────

create table if not exists comida_caseira_cash_movements (
  id           uuid primary key default gen_random_uuid(),
  session_id   uuid references comida_caseira_cash_sessions(id) on delete cascade,
  type         comida_caseira_cash_movement not null,
  amount_cents integer not null check (amount_cents > 0),
  reason       text not null default '',
  created_by   uuid references auth.users(id) on delete set null,
  created_at   timestamptz not null default now()
);

create index if not exists comida_caseira_cash_movements_session_idx
  on comida_caseira_cash_movements (session_id);

-- ────────────────────────────── auditoria ──────────────────────────────

create table if not exists comida_caseira_audit_logs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete set null,
  action     text not null,
  entity     text not null,
  entity_id  text,
  old_data   jsonb,
  new_data   jsonb,
  created_at timestamptz not null default now()
);

create index if not exists comida_caseira_audit_logs_created_idx
  on comida_caseira_audit_logs (created_at desc);
create index if not exists comida_caseira_audit_logs_entity_idx
  on comida_caseira_audit_logs (entity, entity_id);
