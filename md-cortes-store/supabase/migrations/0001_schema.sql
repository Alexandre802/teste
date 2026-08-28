-- MD Cortes Store — estrutura do banco
-- Valores monetários são inteiros em centavos: nada de arredondamento de float.
-- Todo id é gerado no cliente para que uma operação feita offline possa ser
-- reenviada mais tarde sem duplicar (ver 0003_functions.sql).

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- perfil ----
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text        not null default 'Maicon',
  store_name  text        not null default 'MD Cortes Store',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ----------------------------------------------------------- fornecedores ---
create table if not exists public.suppliers (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid        not null references auth.users (id) on delete cascade,
  name       text        not null,
  phone      text,
  notes      text,
  archived   boolean     not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists suppliers_user_idx on public.suppliers (user_id);

-- --------------------------------------------------------------- produtos ---
-- Um produto guarda nome, preço e custo. Cada cor é uma variante, e cada
-- variante tem uma linha de estoque por tamanho.
create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users (id) on delete cascade,
  name        text        not null,
  category    text        not null default 'outros',
  supplier_id uuid        references public.suppliers (id) on delete set null,
  sku         text,
  cost_cents  integer     not null default 0 check (cost_cents  >= 0),
  price_cents integer     not null default 0 check (price_cents >= 0),
  min_stock   integer     not null default 3 check (min_stock   >= 0),
  archived    boolean     not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists products_user_idx on public.products (user_id);

create table if not exists public.product_variants (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid        not null references auth.users (id) on delete cascade,
  product_id uuid        not null references public.products (id) on delete cascade,
  color_name text        not null,
  color_hex  text        not null default '#111111',
  sku        text,
  image_url  text,
  archived   boolean     not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, color_name)
);
create index if not exists product_variants_user_idx on public.product_variants (user_id);

create table if not exists public.inventory (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid        not null references auth.users (id) on delete cascade,
  variant_id uuid        not null references public.product_variants (id) on delete cascade,
  size       text        not null,
  quantity   integer     not null default 0 check (quantity >= 0),
  position   smallint    not null default 0,
  updated_at timestamptz not null default now(),
  unique (variant_id, size)
);
create index if not exists inventory_user_idx on public.inventory (user_id);

-- ----------------------------------------------------------------- vendas ---
create table if not exists public.sales (
  id             uuid primary key,
  user_id        uuid        not null references auth.users (id) on delete cascade,
  total_cents    integer     not null default 0 check (total_cents >= 0),
  cost_cents     integer     not null default 0 check (cost_cents  >= 0),
  payment_method text        not null check (payment_method in ('pix', 'dinheiro', 'debito', 'credito')),
  status         text        not null default 'concluida' check (status in ('concluida', 'cancelada')),
  note           text,
  sold_at        timestamptz not null default now(),
  cancelled_at   timestamptz,
  created_at     timestamptz not null default now()
);
create index if not exists sales_user_sold_idx on public.sales (user_id, sold_at desc);

create table if not exists public.sale_items (
  id               uuid primary key,
  user_id          uuid    not null references auth.users (id) on delete cascade,
  sale_id          uuid    not null references public.sales (id) on delete cascade,
  variant_id       uuid    references public.product_variants (id) on delete set null,
  product_id       uuid    references public.products (id) on delete set null,
  -- Nome e cor ficam gravados na venda: se o produto for renomeado depois,
  -- o histórico continua contando o que de fato foi vendido.
  product_name     text    not null,
  color_name       text    not null,
  size             text    not null,
  quantity         integer not null check (quantity > 0),
  unit_price_cents integer not null check (unit_price_cents >= 0),
  unit_cost_cents  integer not null check (unit_cost_cents  >= 0)
);
create index if not exists sale_items_sale_idx on public.sale_items (sale_id);
create index if not exists sale_items_user_idx on public.sale_items (user_id);

-- ------------------------------------------------ movimentações de estoque ---
create table if not exists public.inventory_movements (
  id              uuid primary key,
  user_id         uuid        not null references auth.users (id) on delete cascade,
  variant_id      uuid        not null references public.product_variants (id) on delete cascade,
  size            text        not null,
  delta           integer     not null,
  kind            text        not null check (kind in ('entrada', 'venda', 'cancelamento', 'ajuste', 'cadastro')),
  unit_cost_cents integer,
  supplier_id     uuid        references public.suppliers (id) on delete set null,
  sale_id         uuid        references public.sales (id) on delete set null,
  note            text,
  created_at      timestamptz not null default now()
);
create index if not exists inventory_movements_user_idx on public.inventory_movements (user_id, created_at desc);
create index if not exists inventory_movements_variant_idx on public.inventory_movements (variant_id);

-- --------------------------------------------------------------- despesas ---
create table if not exists public.expenses (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid        not null references auth.users (id) on delete cascade,
  description  text        not null,
  amount_cents integer     not null check (amount_cents >= 0),
  category     text        not null default 'outros',
  spent_on     date        not null default current_date,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists expenses_user_date_idx on public.expenses (user_id, spent_on desc);

-- ------------------------------------------------------------ preferências ---
create table if not exists public.settings (
  user_id                   uuid primary key references auth.users (id) on delete cascade,
  reminders_enabled         boolean     not null default true,
  reminder_interval_minutes integer     not null default 120 check (reminder_interval_minutes in (60, 120, 180, 240)),
  quiet_start               time        not null default '08:00',
  quiet_end                 time        not null default '22:00',
  reminder_message          text        not null default 'Maicon, você vendeu? Como está o estoque?',
  default_payment           text        not null default 'pix' check (default_payment in ('pix', 'dinheiro', 'debito', 'credito')),
  low_stock_alert           boolean     not null default true,
  onboarded                 boolean     not null default false,
  -- Base do lembrete inteligente: uma venda recente adia o próximo aviso.
  last_sale_at              timestamptz,
  last_stock_update_at      timestamptz,
  last_reminder_at          timestamptz,
  updated_at                timestamptz not null default now()
);

-- ---------------------------------------------------------- notificações ----
create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid        not null references auth.users (id) on delete cascade,
  title      text        not null,
  body       text        not null,
  kind       text        not null default 'lembrete',
  read_at    timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_idx on public.notifications (user_id, created_at desc);

create table if not exists public.push_subscriptions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid        not null references auth.users (id) on delete cascade,
  endpoint     text        not null unique,
  p256dh       text        not null,
  auth         text        not null,
  user_agent   text,
  created_at   timestamptz not null default now(),
  last_sent_at timestamptz
);
create index if not exists push_subscriptions_user_idx on public.push_subscriptions (user_id);

-- ------------------------------------------------------- fechamento do dia ---
create table if not exists public.daily_closings (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid        not null references auth.users (id) on delete cascade,
  closing_date   date        not null,
  revenue_cents  integer     not null default 0,
  cost_cents     integer     not null default 0,
  expenses_cents integer     not null default 0,
  profit_cents   integer     not null default 0,
  items_sold     integer     not null default 0,
  sales_count    integer     not null default 0,
  by_payment     jsonb       not null default '{}'::jsonb,
  top_products   jsonb       not null default '[]'::jsonb,
  closed_at      timestamptz not null default now(),
  unique (user_id, closing_date)
);

-- ---------------------------------------------------- perfil no cadastro -----
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  insert into public.settings (user_id) values (new.id) on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
