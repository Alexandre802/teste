-- RLS: só existe um dono, mas cada linha continua amarrada a auth.uid().
-- Sem isso, a chave anônima do Supabase leria a base inteira.

alter table public.profiles            enable row level security;
alter table public.suppliers           enable row level security;
alter table public.products            enable row level security;
alter table public.product_variants    enable row level security;
alter table public.inventory           enable row level security;
alter table public.sales               enable row level security;
alter table public.sale_items          enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.expenses            enable row level security;
alter table public.settings            enable row level security;
alter table public.notifications       enable row level security;
alter table public.push_subscriptions  enable row level security;
alter table public.daily_closings      enable row level security;

-- O perfil usa a própria PK como dono.
drop policy if exists profiles_owner on public.profiles;
create policy profiles_owner on public.profiles
  for all to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

drop policy if exists settings_owner on public.settings;
create policy settings_owner on public.settings
  for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

do $$
declare
  t text;
begin
  foreach t in array array[
    'suppliers', 'products', 'product_variants', 'inventory', 'sales', 'sale_items',
    'inventory_movements', 'expenses', 'notifications', 'push_subscriptions', 'daily_closings'
  ]
  loop
    execute format('drop policy if exists %I on public.%I', t || '_owner', t);
    execute format(
      'create policy %I on public.%I for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))',
      t || '_owner', t
    );
  end loop;
end;
$$;
