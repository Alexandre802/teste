-- ===========================================================================
-- 0004: RLS — quem pode ver e mexer em cada coisa
-- ===========================================================================
-- Regra de ouro: o cliente anonimo NAO le nada e NAO escreve nada. A unica
-- coisa que ele consegue fazer e chamar comida_caseira_create_order, que e
-- SECURITY DEFINER e valida tudo antes de gravar.
-- ===========================================================================

alter table comida_caseira_users              enable row level security;
alter table comida_caseira_settings           enable row level security;
alter table comida_caseira_products           enable row level security;
alter table comida_caseira_product_options    enable row level security;
alter table comida_caseira_delivery_zones     enable row level security;
alter table comida_caseira_customers          enable row level security;
alter table comida_caseira_orders             enable row level security;
alter table comida_caseira_order_items        enable row level security;
alter table comida_caseira_revenues           enable row level security;
alter table comida_caseira_expense_categories enable row level security;
alter table comida_caseira_expenses           enable row level security;
alter table comida_caseira_cash_sessions      enable row level security;
alter table comida_caseira_cash_movements     enable row level security;
alter table comida_caseira_audit_logs         enable row level security;

-- Sem FORCE, o dono da tabela (que roda as funcoes SECURITY DEFINER) continua
-- passando pelas politicas. E exatamente o que queremos.

do $$
declare
  t text;
  -- Leitura liberada para qualquer usuario do painel.
  leitura text[] := array[
    'comida_caseira_settings', 'comida_caseira_products', 'comida_caseira_product_options',
    'comida_caseira_delivery_zones', 'comida_caseira_customers', 'comida_caseira_orders',
    'comida_caseira_order_items', 'comida_caseira_revenues',
    'comida_caseira_expense_categories', 'comida_caseira_expenses',
    'comida_caseira_cash_sessions', 'comida_caseira_cash_movements',
    'comida_caseira_audit_logs', 'comida_caseira_users'
  ];
begin
  foreach t in array leitura loop
    execute format('drop policy if exists %I on %I', t || '_admin_le', t);
    execute format(
      'create policy %I on %I for select to authenticated using (comida_caseira_is_admin())',
      t || '_admin_le', t
    );
  end loop;
end $$;

-- --------------------------------------------------------------------------
-- Escrita do dia a dia: caixa, gerente e dona
-- --------------------------------------------------------------------------
do $$
declare
  t text;
  operacao text[] := array[
    'comida_caseira_revenues', 'comida_caseira_expenses',
    'comida_caseira_cash_sessions', 'comida_caseira_cash_movements'
  ];
begin
  foreach t in array operacao loop
    execute format('drop policy if exists %I on %I', t || '_admin_insere', t);
    execute format(
      'create policy %I on %I for insert to authenticated with check (comida_caseira_is_admin())',
      t || '_admin_insere', t
    );
    execute format('drop policy if exists %I on %I', t || '_admin_altera', t);
    execute format(
      'create policy %I on %I for update to authenticated using (comida_caseira_is_admin())',
      t || '_admin_altera', t
    );
    -- Apagar lancamento financeiro so a dona e o gerente. Caixa corrige com
    -- um lancamento novo, nao apagando o historico.
    execute format('drop policy if exists %I on %I', t || '_dono_apaga', t);
    execute format(
      'create policy %I on %I for delete to authenticated using '
      '(comida_caseira_current_role() in (''owner'', ''manager''))',
      t || '_dono_apaga', t
    );
  end loop;
end $$;

-- Pedidos: qualquer usuario do painel muda status; ninguem apaga pedido.
drop policy if exists comida_caseira_orders_admin_altera on comida_caseira_orders;
create policy comida_caseira_orders_admin_altera on comida_caseira_orders
  for update to authenticated using (comida_caseira_is_admin());

drop policy if exists comida_caseira_orders_admin_insere on comida_caseira_orders;
create policy comida_caseira_orders_admin_insere on comida_caseira_orders
  for insert to authenticated with check (comida_caseira_is_admin());

drop policy if exists comida_caseira_order_items_admin_insere on comida_caseira_order_items;
create policy comida_caseira_order_items_admin_insere on comida_caseira_order_items
  for insert to authenticated with check (comida_caseira_is_admin());

-- --------------------------------------------------------------------------
-- Cadastro: produtos, zonas, categorias, dados da casa e usuarios
-- --------------------------------------------------------------------------
do $$
declare
  t text;
  cadastro text[] := array[
    'comida_caseira_settings', 'comida_caseira_products', 'comida_caseira_product_options',
    'comida_caseira_delivery_zones', 'comida_caseira_expense_categories',
    'comida_caseira_customers'
  ];
begin
  foreach t in array cadastro loop
    execute format('drop policy if exists %I on %I', t || '_gestor_escreve', t);
    execute format(
      'create policy %I on %I for all to authenticated '
      'using (comida_caseira_current_role() in (''owner'', ''manager'')) '
      'with check (comida_caseira_current_role() in (''owner'', ''manager''))',
      t || '_gestor_escreve', t
    );
  end loop;
end $$;

-- Usuarios do painel: so a dona mexe.
drop policy if exists comida_caseira_users_dono_escreve on comida_caseira_users;
create policy comida_caseira_users_dono_escreve on comida_caseira_users
  for all to authenticated
  using (comida_caseira_current_role() = 'owner')
  with check (comida_caseira_current_role() = 'owner');

-- Auditoria e so leitura: ninguem edita nem apaga o proprio rastro.

-- --------------------------------------------------------------------------
-- Permissoes de esquema
-- --------------------------------------------------------------------------
do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    -- Nenhum acesso direto a tabela para quem nao esta logado.
    execute 'revoke all on all tables in schema public from anon';
    execute 'revoke all on all sequences in schema public from anon';
    execute 'revoke all on all functions in schema public from anon';
    -- A unica porta do cliente.
    execute 'grant execute on function comida_caseira_create_order('
         || 'text, text, text, text, text, jsonb, jsonb, text, bigint) to anon';
  end if;

  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    execute 'grant usage on schema public to authenticated';
    execute 'grant select, insert, update, delete on all tables in schema public to authenticated';
    execute 'grant usage, select on all sequences in schema public to authenticated';
    execute 'grant execute on all functions in schema public to authenticated';
  end if;
end $$;

-- --------------------------------------------------------------------------
-- Realtime: o painel escuta pedido novo
-- --------------------------------------------------------------------------
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    execute 'alter publication supabase_realtime add table comida_caseira_orders';
  end if;
exception when duplicate_object then null;
end $$;
