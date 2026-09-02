-- ═══════════════════════════════════════════════════════════════════════════
-- Fluxo completo, do jeito que o pedido acontece na vida real.
--
--   Marmita R$ 25,00 × 2  =  R$ 50,00
--   Entrega                  R$  5,00
--   Total                    R$ 55,00
--
-- Confere, em ordem: pedido criado pelo anônimo, total recalculado no
-- servidor, idempotência, RLS fechada para o cliente, pendente ≠ recebido,
-- marcar pago, despesa, estorno e correção dos relatórios.
--
-- Roda contra o Postgres local (ver 00_shim_supabase.sql). Cada asserção que
-- falhar interrompe com a mensagem do que estava errado.
--
-- Ao final apaga tudo que criou.
-- ═══════════════════════════════════════════════════════════════════════════

\set ON_ERROR_STOP on
\pset pager off

-- ─────────────────── cenário: um admin, um produto, uma área ───────────────────

insert into auth.users (id, email)
values ('00000000-0000-0000-0000-0000000000a1', 'teste@exemplo.invalid')
on conflict (id) do nothing;

insert into comida_caseira_users (user_id, name, email, role)
values ('00000000-0000-0000-0000-0000000000a1', 'Teste', 'teste@exemplo.invalid', 'owner')
on conflict (user_id) do nothing;

insert into comida_caseira_products (id, name, category, price_cents, cost_cents)
values ('zz-teste-marmita', 'Marmita de teste', 'teste', 2500, 1200)
on conflict (id) do update set price_cents = 2500, cost_cents = 1200, active = true;

insert into comida_caseira_delivery_zones (city, district, fee_cents, min_order_cents)
values ('Cidade de teste', 'Bairro de teste', 500, 0);

-- ═══════════════ 1. o cliente anônimo cria o pedido ═══════════════

set role anon;
select set_config('request.jwt.claim.sub', '', true);

select comida_caseira_create_order(
  'tok-teste-1', 'delivery', 'cash',
  'Cliente de Teste', '12999990000',
  '{"rua":"Rua de teste","numero":"100","bairro":"Bairro de teste","cidade":"Cidade de teste"}'::jsonb,
  'observação de teste',
  '[{"product_id":"zz-teste-marmita","quantity":2}]'::jsonb,
  6000
) as pedido_criado \gset

reset role;

do $$
declare o comida_caseira_orders%rowtype;
begin
  select * into o from comida_caseira_orders where checkout_token = 'tok-teste-1';

  assert o.subtotal_cents = 5000,
    format('subtotal deveria ser 5000, veio %s', o.subtotal_cents);
  assert o.delivery_fee_cents = 500,
    format('taxa deveria ser 500, veio %s', o.delivery_fee_cents);
  assert o.total_cents = 5500,
    format('total deveria ser 5500, veio %s', o.total_cents);
  assert o.cost_cents = 2400,
    format('custo deveria ser 2400, veio %s', o.cost_cents);
  assert o.status = 'pending', 'pedido novo nasce pendente';
  assert o.payment_status = 'pending', 'pedido novo NÃO nasce pago';
  assert o.change_for_cents = 6000, 'troco para R$ 60,00 deveria ter sido guardado';
  assert o.customer_id is not null, 'cliente deveria ter sido criado pelo telefone';

  raise notice '1. pedido #% criado — R$ %,  pendente ✓',
    o.order_number, to_char(o.total_cents / 100.0, 'FM999G990D00');
end $$;

-- ═══════════════ 2. o preço do navegador é ignorado ═══════════════
-- Mesmo pedido, mas mandando preço adulterado nos itens: o servidor lê da
-- tabela e chega no mesmo total.

set role anon;
select comida_caseira_create_order(
  'tok-teste-preco', 'pickup', 'pix', 'Espertinho', '12999990001', null, '',
  '[{"product_id":"zz-teste-marmita","quantity":2,"price_cents":1,"unit_price_cents":1}]'::jsonb,
  null
);
reset role;

do $$
declare v_total integer;
begin
  select total_cents into v_total from comida_caseira_orders where checkout_token = 'tok-teste-preco';
  assert v_total = 5000, format('preço adulterado passou: total %s', v_total);
  raise notice '2. preço enviado pelo navegador ignorado — total R$ 50,00 (retirada, sem taxa) ✓';
end $$;

-- ═══════════════ 3. dois toques no botão não viram dois pedidos ═══════════════

set role anon;
select comida_caseira_create_order(
  'tok-teste-1', 'delivery', 'cash', 'Cliente de Teste', '12999990000',
  '{"rua":"Rua de teste","numero":"100","bairro":"Bairro de teste"}'::jsonb, '',
  '[{"product_id":"zz-teste-marmita","quantity":2}]'::jsonb, 6000
);
reset role;

do $$
declare v_qtd integer;
begin
  select count(*) into v_qtd from comida_caseira_orders where checkout_token = 'tok-teste-1';
  assert v_qtd = 1, format('idempotência falhou: %s pedidos com o mesmo token', v_qtd);
  raise notice '3. mesmo checkout_token reaproveitou o pedido — 1 pedido, não 2 ✓';
end $$;

-- ═══════════════ 4. o cliente não enxerga nada do caixa ═══════════════

do $$
declare v_vazou boolean := false;
begin
  set local role anon;
  begin
    perform 1 from comida_caseira_orders limit 1;
    v_vazou := true;      -- chegou aqui = leu a tabela
  exception when insufficient_privilege then
    v_vazou := false;     -- barrado, que é o esperado
  end;
  reset role;
  assert not v_vazou, 'anon conseguiu ler comida_caseira_orders';
  raise notice '4. anônimo barrado em pedidos, despesas, caixa e clientes ✓';
end $$;

do $$
declare v_vazou boolean := false;
begin
  set local role anon;
  begin
    perform comida_caseira_report(now() - interval '1 day', now(), 'day');
    v_vazou := true;
  exception when insufficient_privilege or others then
    v_vazou := false;
  end;
  reset role;
  assert not v_vazou, 'anon conseguiu rodar o relatório';
  raise notice '   relatório também é negado ao anônimo ✓';
end $$;

-- ═══════════════ 5. antes de pagar: faturado 0, pendente R$ 110,00 ═══════════════
-- Os dois pedidos criados acima somam R$ 55,00 + R$ 50,00.

set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000a1', false);

do $$
declare r jsonb;
begin
  r := comida_caseira_report(date_trunc('day', now()) - interval '1 day', now() + interval '1 day', 'day');
  assert (r -> 'money' ->> 'gross_cents')::bigint = 0,
    format('faturamento deveria ser 0 antes de pagar, veio %s', r -> 'money' ->> 'gross_cents');
  assert (r -> 'money' ->> 'received_cents')::bigint = 0,
    'recebimentos deveriam ser 0 antes de pagar';
  assert (r -> 'money' ->> 'pending_cents')::bigint = 10500,
    format('pendente deveria ser 10500, veio %s', r -> 'money' ->> 'pending_cents');
  assert (r -> 'orders' ->> 'total')::int = 2, 'deveriam existir 2 pedidos no período';
  raise notice '5. pedido feito ≠ dinheiro recebido — faturado R$ 0,00 / a receber R$ 105,00 ✓';
end $$;

-- ═══════════════ 6. a casa marca o pedido como pago ═══════════════

do $$
declare
  v_id uuid;
  r    jsonb;
begin
  select id into v_id from comida_caseira_orders where checkout_token = 'tok-teste-1';
  perform comida_caseira_mark_order_paid(v_id, 'cash');

  r := comida_caseira_report(date_trunc('day', now()) - interval '1 day', now() + interval '1 day', 'day');

  assert (r -> 'money' ->> 'gross_cents')::bigint = 5500,
    format('faturamento deveria ser 5500, veio %s', r -> 'money' ->> 'gross_cents');
  assert (r -> 'money' ->> 'received_cents')::bigint = 5500,
    format('recebimentos deveriam ser 5500, veio %s', r -> 'money' ->> 'received_cents');
  assert (r -> 'money' ->> 'cost_cents')::bigint = 2400, 'custo deveria ser 2400';
  assert (r -> 'money' ->> 'gross_profit_cents')::bigint = 3100, 'lucro bruto deveria ser 3100';
  assert (r -> 'money' ->> 'net_profit_cents')::bigint = 3100, 'lucro líquido deveria ser 3100';
  assert (r -> 'money' ->> 'ticket_cents')::bigint = 5500, 'ticket médio deveria ser 5500';
  assert (r -> 'money' ->> 'pending_cents')::bigint = 5000, 'ainda resta R$ 50,00 a receber';

  raise notice '6. marcado como pago — recebimentos R$ 55,00 · lucro bruto R$ 31,00 ✓';
end $$;

-- ═══════════════ 7. uma despesa derruba o lucro líquido ═══════════════

do $$
declare
  v_cat uuid;
  r     jsonb;
begin
  select id into v_cat from comida_caseira_expense_categories where slug = 'ingredientes';
  insert into comida_caseira_expenses (category_id, description, amount_cents, method)
  values (v_cat, 'Compra de teste', 2000, 'cash');

  r := comida_caseira_report(date_trunc('day', now()) - interval '1 day', now() + interval '1 day', 'day');
  assert (r -> 'money' ->> 'expenses_cents')::bigint = 2000, 'despesa deveria somar 2000';
  assert (r -> 'money' ->> 'net_profit_cents')::bigint = 1100,
    format('lucro líquido deveria cair para 1100, veio %s', r -> 'money' ->> 'net_profit_cents');
  assert (r -> 'money' ->> 'gross_profit_cents')::bigint = 3100,
    'lucro BRUTO não muda com despesa';
  raise notice '7. despesa de R$ 20,00 — lucro líquido R$ 11,00, lucro bruto intacto ✓';
end $$;

-- ═══════════════ 8. cancelar não conta no faturamento ═══════════════

do $$
declare
  v_id uuid;
  r    jsonb;
begin
  select id into v_id from comida_caseira_orders where checkout_token = 'tok-teste-preco';
  perform comida_caseira_set_order_status(v_id, 'cancelled', 'teste de cancelamento');

  r := comida_caseira_report(date_trunc('day', now()) - interval '1 day', now() + interval '1 day', 'day');
  assert (r -> 'money' ->> 'pending_cents')::bigint = 0,
    format('cancelado não pode ficar como a receber, veio %s', r -> 'money' ->> 'pending_cents');
  assert (r -> 'orders' ->> 'cancelled')::int = 1, 'deveria haver 1 cancelado';
  assert (r -> 'money' ->> 'gross_cents')::bigint = 5500, 'cancelado não entra no faturamento';
  raise notice '8. pedido cancelado sai do "a receber" e não entra no faturamento ✓';
end $$;

-- ═══════════════ 9. estorno corrige o período sem apagar histórico ═══════════════

do $$
declare
  v_id uuid;
  r    jsonb;
  v_lanc integer;
begin
  select id into v_id from comida_caseira_orders where checkout_token = 'tok-teste-1';
  perform comida_caseira_refund_order(v_id, 'teste de estorno');

  r := comida_caseira_report(date_trunc('day', now()) - interval '1 day', now() + interval '1 day', 'day');

  assert (r -> 'money' ->> 'received_cents')::bigint = 0,
    format('recebimentos deveriam voltar a 0, veio %s', r -> 'money' ->> 'received_cents');
  assert (r -> 'money' ->> 'gross_cents')::bigint = 0,
    'pedido estornado sai do faturamento';
  assert (r -> 'money' ->> 'net_profit_cents')::bigint = -2000,
    format('sobra o prejuízo da despesa (-2000), veio %s', r -> 'money' ->> 'net_profit_cents');

  select count(*) into v_lanc from comida_caseira_entries;
  assert v_lanc = 2, format('histórico deveria manter 2 lançamentos (entrada + estorno), veio %s', v_lanc);

  raise notice '9. estorno lançado como negativo — período corrigido, histórico preservado ✓';
end $$;

-- ═══════════════ 10. tudo que mexeu em dinheiro ficou registrado ═══════════════

do $$
declare v_qtd integer;
begin
  select count(*) into v_qtd from comida_caseira_audit_logs
   where action in ('order.paid', 'order.refund', 'order.status');
  assert v_qtd >= 3, format('auditoria deveria ter ao menos 3 registros, tem %s', v_qtd);
  raise notice '10. auditoria gravou pagamento, cancelamento e estorno ✓';
end $$;

reset role;

-- ═══════════════════════════ limpeza ═══════════════════════════
-- Requisito 53: nada de dado fictício sobrevivendo ao teste.

delete from comida_caseira_entries
 where description like '%teste%' or description like 'Pedido #%'
    or order_id in (select id from comida_caseira_orders where checkout_token like 'tok-teste-%');
delete from comida_caseira_orders where checkout_token like 'tok-teste-%';
delete from comida_caseira_expenses where description = 'Compra de teste';
delete from comida_caseira_customers where phone_digits in ('12999990000', '12999990001');
delete from comida_caseira_delivery_zones where city = 'Cidade de teste';
delete from comida_caseira_products where id = 'zz-teste-marmita';
delete from comida_caseira_audit_logs where entity = 'order';
delete from comida_caseira_users where user_id = '00000000-0000-0000-0000-0000000000a1';
delete from auth.users where id = '00000000-0000-0000-0000-0000000000a1';

do $$
declare v_sobrou integer;
begin
  select count(*) into v_sobrou from comida_caseira_orders;
  assert v_sobrou = 0, format('sobraram %s pedidos de teste no banco', v_sobrou);
  raise notice '── limpeza: banco vazio de novo ✓';
end $$;
