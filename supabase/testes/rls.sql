-- ===========================================================================
-- Teste do RLS: o que o cliente anonimo consegue e o que nao consegue.
-- ===========================================================================
\set ON_ERROR_STOP on
begin;

create or replace function ok(descricao text, condicao boolean) returns void
language plpgsql as $$
begin
  if condicao then raise notice 'OK   %', descricao;
  else raise exception 'FALHOU: %', descricao; end if;
end $$;

insert into comida_caseira_products (id, nome, categoria, price_cents, cost_cents)
values ('rls-produto', 'Produto RLS', 'marmitas', 2500, 1000);

-- Um pedido e uma despesa para o anonimo tentar bisbilhotar.
select comida_caseira_create_order(
  'rls-token', 'Fulano', '12988887777', 'pickup', 'cash',
  '[{"product_id":"rls-produto","quantity":1}]'::jsonb);

insert into comida_caseira_expenses (descricao, amount_cents, payment_method)
values ('Despesa secreta', 5000, 'cash');

-- ---------------------------------------------------------------- anônimo
set local role anon;

do $$
declare n int;
begin
  begin
    select count(*) into n from comida_caseira_orders;
    perform ok('anônimo não lista pedidos', n = 0);
  exception when insufficient_privilege then
    perform ok('anônimo não lista pedidos (sem permissão)', true);
  end;

  begin
    select count(*) into n from comida_caseira_expenses;
    perform ok('anônimo não lista despesas', n = 0);
  exception when insufficient_privilege then
    perform ok('anônimo não lista despesas (sem permissão)', true);
  end;

  begin
    select count(*) into n from comida_caseira_customers;
    perform ok('anônimo não lista clientes', n = 0);
  exception when insufficient_privilege then
    perform ok('anônimo não lista clientes (sem permissão)', true);
  end;

  begin
    select count(*) into n from comida_caseira_products where cost_cents > 0;
    perform ok('anônimo não enxerga o custo dos produtos', n = 0);
  exception when insufficient_privilege then
    perform ok('anônimo não enxerga o custo dos produtos (sem permissão)', true);
  end;

  begin
    select count(*) into n from comida_caseira_cash_sessions;
    perform ok('anônimo não enxerga o caixa', n = 0);
  exception when insufficient_privilege then
    perform ok('anônimo não enxerga o caixa (sem permissão)', true);
  end;

  begin
    insert into comida_caseira_orders
      (customer_name, order_type, payment_method, subtotal_cents, total_cents)
    values ('Invasor', 'pickup', 'pix', 1, 1);
    raise exception 'FALHOU: anônimo inseriu pedido direto na tabela';
  exception when insufficient_privilege or others then
    perform ok('anônimo não insere pedido direto na tabela', true);
  end;
end $$;

-- A única porta que funciona para o anônimo.
do $$
declare r jsonb;
begin
  r := comida_caseira_create_order(
    'rls-token-2', 'Beltrano', '12977776666', 'pickup', 'pix',
    '[{"product_id":"rls-produto","quantity":1}]'::jsonb);
  perform ok('anônimo cria pedido pela função segura',
    (r->>'total_cents')::bigint = 2500);
end $$;

reset role;

-- ------------------------------------------------------- usuário do painel
do $$
declare v_user uuid := gen_random_uuid(); n int;
begin
  insert into auth.users (id) values (v_user);
  insert into comida_caseira_users (user_id, nome, role) values (v_user, 'Márcia', 'owner');

  perform set_config('request.jwt.claim.sub', v_user::text, true);
  execute 'set local role authenticated';

  select count(*) into n from comida_caseira_orders;
  perform ok('a dona enxerga os pedidos', n >= 2);

  select count(*) into n from comida_caseira_expenses;
  perform ok('a dona enxerga as despesas', n >= 1);

  select count(*) into n from comida_caseira_products where cost_cents > 0;
  perform ok('a dona enxerga o custo dos produtos', n >= 1);
end $$;

reset role;

-- Usuário autenticado que NÃO está na tabela do painel não enxerga nada.
do $$
declare v_intruso uuid := gen_random_uuid(); n int;
begin
  insert into auth.users (id) values (v_intruso);
  perform set_config('request.jwt.claim.sub', v_intruso::text, true);
  execute 'set local role authenticated';

  select count(*) into n from comida_caseira_orders;
  perform ok('logado sem cadastro no painel não vê pedido', n = 0);

  select count(*) into n from comida_caseira_expenses;
  perform ok('logado sem cadastro no painel não vê despesa', n = 0);
end $$;

reset role;

-- Caixa não apaga lançamento financeiro.
do $$
declare v_caixa uuid := gen_random_uuid(); n int;
begin
  insert into auth.users (id) values (v_caixa);
  insert into comida_caseira_users (user_id, nome, role) values (v_caixa, 'Ajudante', 'cashier');
  perform set_config('request.jwt.claim.sub', v_caixa::text, true);
  execute 'set local role authenticated';

  delete from comida_caseira_expenses;
  get diagnostics n = row_count;
  perform ok('caixa não apaga despesa', n = 0);

  insert into comida_caseira_expenses (descricao, amount_cents, payment_method)
  values ('Gás do dia', 12000, 'cash');
  perform ok('caixa registra despesa', true);

  begin
    update comida_caseira_products set price_cents = 1 where id = 'rls-produto';
    get diagnostics n = row_count;
    perform ok('caixa não altera preço de produto', n = 0);
  exception when insufficient_privilege then
    perform ok('caixa não altera preço de produto (sem permissão)', true);
  end;
end $$;

reset role;
rollback;
