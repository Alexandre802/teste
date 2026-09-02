-- ===========================================================================
-- Teste do fluxo financeiro de ponta a ponta.
-- Roda em transacao e faz rollback: nao deixa dado de teste no banco.
-- ===========================================================================
\set ON_ERROR_STOP on
begin;

create or replace function ok(descricao text, condicao boolean) returns void
language plpgsql as $$
begin
  if condicao then
    raise notice 'OK   %', descricao;
  else
    raise exception 'FALHOU: %', descricao;
  end if;
end $$;

-- Cadastro mínimo para o teste --------------------------------------------
insert into comida_caseira_products (id, nome, categoria, price_cents, cost_cents)
values ('teste-marmita', 'Marmita de teste', 'marmitas', 2500, 1200);

insert into comida_caseira_product_options
  (id, product_id, grupo_id, grupo_nome, nome, price_delta_cents, cost_delta_cents)
values ('teste-extra', 'teste-marmita', 'adicionais', 'Adicionais', 'Ovo', 300, 100);

insert into comida_caseira_products (id, nome, categoria, price_cents, cost_cents)
values ('teste-outro', 'Outro produto', 'lanches', 1000, 400);

update comida_caseira_delivery_zones
set fee_cents = 500 where cidade = 'Jacareí - SP' and bairro = '';

-- 1. Pedido do site: 2x R$ 25,00 + entrega R$ 5,00 = R$ 55,00 --------------
do $$
declare r jsonb; v_id uuid;
begin
  r := comida_caseira_create_order(
    'tok-teste-1', 'Cliente de Teste', '12999990000', 'delivery', 'pix',
    '[{"product_id":"teste-marmita","quantity":2}]'::jsonb,
    '{"rua":"Rua de Teste","numero":"10","bairro":"Centro","cidade":"Jacareí - SP"}'::jsonb
  );
  perform ok('subtotal recalculado = R$ 50,00', (r->>'subtotal_cents')::bigint = 5000);
  perform ok('taxa veio da configuração = R$ 5,00', (r->>'delivery_fee_cents')::bigint = 500);
  perform ok('total = R$ 55,00', (r->>'total_cents')::bigint = 5500);
  perform ok('número do pedido gerado', (r->>'order_number')::int >= 1001);

  v_id := (r->>'order_id')::uuid;
  perform ok('custo do pedido = 2 x R$ 12,00',
    (select cost_cents from comida_caseira_orders where id = v_id) = 2400);
  perform ok('nasce como pendente',
    (select status::text || '/' || payment_status::text
       from comida_caseira_orders where id = v_id) = 'pending/pending');
  perform ok('snapshot do nome e do preço gravado',
    (select product_name_snapshot = 'Marmita de teste' and unit_price_cents = 2500
       and unit_cost_cents = 1200
       from comida_caseira_order_items where order_id = v_id));
end $$;

-- 2. Idempotência: o mesmo token não cria um segundo pedido ----------------
do $$
declare r jsonb;
begin
  r := comida_caseira_create_order(
    'tok-teste-1', 'Cliente de Teste', '12999990000', 'delivery', 'pix',
    '[{"product_id":"teste-marmita","quantity":2}]'::jsonb,
    '{"rua":"Rua de Teste","numero":"10","bairro":"Centro","cidade":"Jacareí - SP"}'::jsonb
  );
  perform ok('token repetido devolve o mesmo pedido', (r->>'duplicado')::boolean);
  perform ok('só existe um pedido com esse token',
    (select count(*) from comida_caseira_orders where checkout_token = 'tok-teste-1') = 1);
end $$;

-- 3. O navegador não manda preço; opção de outro produto é ignorada --------
do $$
declare r jsonb;
begin
  r := comida_caseira_create_order(
    'tok-teste-2', 'Cliente de Teste', '12999990000', 'pickup', 'cash',
    -- price_cents e total_cents abaixo são lixo de propósito: o servidor ignora.
    '[{"product_id":"teste-marmita","quantity":1,"price_cents":1,"total_cents":1,
       "option_ids":["teste-extra","id-inexistente"]}]'::jsonb
  );
  perform ok('preço enviado pelo navegador é ignorado',
    (r->>'subtotal_cents')::bigint = 2800);
  perform ok('opção inexistente não entra na conta',
    (r->>'total_cents')::bigint = 2800);
  perform ok('retirada não cobra entrega', (r->>'delivery_fee_cents')::bigint = 0);
end $$;

do $$
declare r jsonb;
begin
  -- Opcao que pertence a OUTRO produto nao pode baratear nem encarecer nada.
  r := comida_caseira_create_order(
    'tok-teste-3', 'Cliente de Teste', '12999990000', 'pickup', 'cash',
    '[{"product_id":"teste-outro","quantity":1,"option_ids":["teste-extra"]}]'::jsonb
  );
  perform ok('opção de outro produto é descartada', (r->>'total_cents')::bigint = 1000);
end $$;

-- 4. Produto inexistente e quantidade inválida são recusados ---------------
do $$
begin
  begin
    perform comida_caseira_create_order('tok-x1', 'X', '', 'pickup', 'pix',
      '[{"product_id":"nao-existe","quantity":1}]'::jsonb);
    raise exception 'FALHOU: produto inexistente foi aceito';
  exception when sqlstate '22023' then
    perform ok('produto inexistente é recusado', true);
  end;

  begin
    perform comida_caseira_create_order('tok-x2', 'X', '', 'pickup', 'pix',
      '[{"product_id":"teste-marmita","quantity":0}]'::jsonb);
    raise exception 'FALHOU: quantidade zero foi aceita';
  exception when sqlstate '22023' then
    perform ok('quantidade zero é recusada', true);
  end;

  begin
    perform comida_caseira_create_order('tok-x3', 'X', '', 'delivery', 'pix',
      '[{"product_id":"teste-marmita","quantity":1}]'::jsonb,
      '{"cidade":"Jacareí - SP"}'::jsonb);
    raise exception 'FALHOU: endereço incompleto foi aceito';
  exception when sqlstate '22023' then
    perform ok('endereço incompleto é recusado', true);
  end;
end $$;

-- 5. Antes de confirmar: nada de faturamento, tudo a receber --------------
do $$
declare r jsonb; hoje date := (now() at time zone 'America/Sao_Paulo')::date;
begin
  r := comida_caseira_resumo(hoje, hoje);
  perform ok('faturamento ainda é zero', (r->>'faturamento_cents')::bigint = 0);
  perform ok('recebimentos ainda são zero', (r->>'recebimentos_cents')::bigint = 0);
  perform ok('R$ 55,00 + R$ 28,00 + R$ 10,00 aparecem como a receber',
    (r->>'pendente_cents')::bigint = 9300);
  perform ok('3 pedidos no período', (r->>'pedidos')::int = 3);
end $$;

-- 6. Marcar como pago: vira faturamento e recebimento ---------------------
do $$
declare r jsonb; hoje date := (now() at time zone 'America/Sao_Paulo')::date;
begin
  update comida_caseira_orders
  set payment_status = 'paid', status = 'confirmed'
  where checkout_token = 'tok-teste-1';

  perform ok('paid_at foi carimbado',
    (select paid_at is not null from comida_caseira_orders where checkout_token = 'tok-teste-1'));
  perform ok('a receita do pedido foi lançada sozinha',
    (select count(*) from comida_caseira_revenues r
      join comida_caseira_orders o on o.id = r.order_id
      where o.checkout_token = 'tok-teste-1' and r.amount_cents = 5500) = 1);

  r := comida_caseira_resumo(hoje, hoje);
  perform ok('faturamento = R$ 55,00', (r->>'faturamento_cents')::bigint = 5500);
  perform ok('recebimentos = R$ 55,00', (r->>'recebimentos_cents')::bigint = 5500);
  perform ok('custo dos produtos = R$ 24,00', (r->>'custo_cents')::bigint = 2400);
  perform ok('lucro bruto = R$ 31,00', (r->>'lucro_bruto_cents')::bigint = 3100);
  perform ok('a receber caiu para R$ 38,00', (r->>'pendente_cents')::bigint = 3800);
  perform ok('ticket médio = R$ 55,00', (r->>'ticket_medio_cents')::bigint = 5500);
end $$;

-- 7. Despesa entra no lucro líquido ---------------------------------------
do $$
declare r jsonb; hoje date := (now() at time zone 'America/Sao_Paulo')::date;
begin
  insert into comida_caseira_expenses (category_id, descricao, amount_cents, payment_method)
  select id, 'Compra de teste', 1000, 'cash'
  from comida_caseira_expense_categories where nome = 'Ingredientes';

  r := comida_caseira_resumo(hoje, hoje);
  perform ok('despesas = R$ 10,00', (r->>'despesas_cents')::bigint = 1000);
  perform ok('lucro líquido = 55 - 24 - 10 = R$ 21,00',
    (r->>'lucro_liquido_cents')::bigint = 2100);
end $$;

-- 8. Reembolso lança o estorno e corrige o relatório -----------------------
do $$
declare r jsonb; hoje date := (now() at time zone 'America/Sao_Paulo')::date;
begin
  update comida_caseira_orders
  set payment_status = 'refunded', status = 'cancelled', cancel_reason = 'Teste'
  where checkout_token = 'tok-teste-1';

  perform ok('o estorno foi lançado',
    (select count(*) from comida_caseira_revenues r
      join comida_caseira_orders o on o.id = r.order_id
      where o.checkout_token = 'tok-teste-1' and r.amount_cents = -5500) = 1);

  r := comida_caseira_resumo(hoje, hoje);
  perform ok('faturamento voltou a zero', (r->>'faturamento_cents')::bigint = 0);
  perform ok('recebimentos voltaram a zero', (r->>'recebimentos_cents')::bigint = 0);
  perform ok('o pedido cancelado saiu da contagem', (r->>'pedidos')::int = 2);
  perform ok('cancelado é contado à parte', (r->>'cancelados')::int = 1);
  perform ok('lucro líquido = 0 - 0 - 10 = -R$ 10,00',
    (r->>'lucro_liquido_cents')::bigint = -1000);
end $$;

-- 9. Pedido cancelado não volta atrás -------------------------------------
do $$
begin
  begin
    update comida_caseira_orders set status = 'confirmed' where checkout_token = 'tok-teste-1';
    raise exception 'FALHOU: pedido cancelado voltou de status';
  exception when sqlstate '22023' then
    perform ok('pedido cancelado não volta de status', true);
  end;
end $$;

-- 10. Cancelar sem ter recebido não deixa cobrança pendente ---------------
do $$
declare hoje date := (now() at time zone 'America/Sao_Paulo')::date; r jsonb;
begin
  update comida_caseira_orders set status = 'cancelled' where checkout_token = 'tok-teste-3';
  perform ok('cancelar zera a cobrança pendente',
    (select payment_status::text from comida_caseira_orders where checkout_token = 'tok-teste-3')
    = 'cancelled');
  r := comida_caseira_resumo(hoje, hoje);
  perform ok('a receber ficou só com o pedido vivo', (r->>'pendente_cents')::bigint = 2800);
end $$;

-- 11. Cliente montado sozinho ---------------------------------------------
do $$
begin
  perform ok('o cliente foi criado a partir do pedido',
    (select count(*) from comida_caseira_customers where telefone = '12999990000') = 1);
  perform ok('os totais do cliente ignoram o que foi cancelado',
    (select total_cents from comida_caseira_customers where telefone = '12999990000') = 2800);
end $$;

-- 12. Auditoria registrou as mudanças -------------------------------------
do $$
begin
  perform ok('a auditoria guardou as alterações de pedido',
    (select count(*) from comida_caseira_audit_logs
      where entity = 'comida_caseira_orders') >= 3);
  perform ok('a auditoria guardou a despesa',
    (select count(*) from comida_caseira_audit_logs
      where entity = 'comida_caseira_expenses') >= 1);
end $$;

-- 13. Caixa ---------------------------------------------------------------
do $$
declare v_sessao uuid; r jsonb;
begin
  insert into comida_caseira_cash_sessions (abertura_cents) values (10000)
  returning id into v_sessao;

  insert into comida_caseira_revenues (tipo, descricao, amount_cents, payment_method)
  values ('manual', 'Venda no balcão', 3000, 'cash');

  insert into comida_caseira_cash_movements (session_id, kind, amount_cents, motivo)
  values (v_sessao, 'sangria', 2000, 'Retirada para o banco');

  r := comida_caseira_resumo_caixa(v_sessao);
  perform ok('abertura do caixa = R$ 100,00', (r->>'abertura_cents')::bigint = 10000);
  perform ok('dinheiro recebido = R$ 30,00', (r->>'dinheiro_cents')::bigint = 3000);
  perform ok('despesa em dinheiro = R$ 10,00', (r->>'despesas_dinheiro_cents')::bigint = 1000);
  perform ok('sangria = R$ 20,00', (r->>'sangria_cents')::bigint = 2000);
  perform ok('esperado na gaveta = 100 + 30 - 10 - 20 = R$ 100,00',
    (r->>'esperado_cents')::bigint = 10000);
  perform ok('sem contagem, a diferença fica nula', r->>'diferenca_cents' is null);

  update comida_caseira_cash_sessions
  set contado_cents = 9500, fechado_em = now() where id = v_sessao;
  r := comida_caseira_resumo_caixa(v_sessao);
  perform ok('faltando R$ 5,00 na gaveta, a diferença aparece',
    (r->>'diferenca_cents')::bigint = -500);
end $$;

-- 14. Só existe um caixa aberto por vez -----------------------------------
do $$
declare v_a uuid;
begin
  insert into comida_caseira_cash_sessions (abertura_cents) values (0) returning id into v_a;
  begin
    insert into comida_caseira_cash_sessions (abertura_cents) values (0);
    raise exception 'FALHOU: abriu dois caixas ao mesmo tempo';
  exception when unique_violation then
    perform ok('não dá para abrir dois caixas ao mesmo tempo', true);
  end;
  delete from comida_caseira_cash_sessions where id = v_a;
end $$;

-- 15. Relatórios de apoio -------------------------------------------------
do $$
declare hoje date := (now() at time zone 'America/Sao_Paulo')::date;
begin
  perform ok('a série diária cobre o período',
    (select count(*) from comida_caseira_vendas_por_dia(hoje - 6, hoje)) = 7);
  perform ok('mais vendidos responde sem erro',
    (select count(*) >= 0 from comida_caseira_mais_vendidos(hoje - 30, hoje, 5)));
  perform ok('por hora responde sem erro',
    (select count(*) >= 0 from comida_caseira_por_hora(hoje - 30, hoje)));
  perform ok('entrega x retirada responde sem erro',
    (select count(*) >= 0 from comida_caseira_entrega_x_retirada(hoje - 30, hoje)));
  perform ok('formas de pagamento responde sem erro',
    (select count(*) >= 0 from comida_caseira_por_forma_pagamento(hoje - 30, hoje)));
end $$;

rollback;
