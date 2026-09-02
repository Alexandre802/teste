-- ===========================================================================
-- 0002: criacao segura do pedido, gatilhos financeiros e auditoria
-- ===========================================================================

-- --------------------------------------------------------------------------
-- Taxa de entrega oficial: o navegador nao decide isso
-- --------------------------------------------------------------------------
-- Procura primeiro a faixa do bairro; se nao houver, cai na faixa da cidade.
-- Devolve null quando a casa ainda nao confirmou a taxa da regiao.
create or replace function comida_caseira_taxa_entrega(p_cidade text, p_bairro text)
returns bigint
language sql
stable
as $$
  select fee_cents
  from comida_caseira_delivery_zones
  where ativo
    and lower(cidade) = lower(coalesce(p_cidade, ''))
    and (
      lower(bairro) = lower(coalesce(p_bairro, ''))
      or bairro = ''
    )
  order by (bairro <> '') desc
  limit 1;
$$;

create or replace function comida_caseira_pedido_minimo(p_cidade text, p_bairro text)
returns bigint
language sql
stable
as $$
  select pedido_minimo_cents
  from comida_caseira_delivery_zones
  where ativo
    and lower(cidade) = lower(coalesce(p_cidade, ''))
    and (
      lower(bairro) = lower(coalesce(p_bairro, ''))
      or bairro = ''
    )
  order by (bairro <> '') desc
  limit 1;
$$;

-- --------------------------------------------------------------------------
-- comida_caseira_create_order
-- --------------------------------------------------------------------------
-- A UNICA porta pela qual um cliente anonimo cria pedido.
--
-- O frontend manda apenas product_id, quantidade e as opcoes escolhidas.
-- Preco, adicionais, custo, taxa e total sao TODOS recalculados aqui. Nada do
-- que o navegador diz sobre dinheiro e aproveitado.
--
-- Idempotente por p_checkout_token: tocar duas vezes em "enviar" devolve o
-- mesmo pedido em vez de criar outro.
create or replace function comida_caseira_create_order(
  p_checkout_token  text,
  p_customer_name   text,
  p_customer_phone  text,
  p_order_type      text,
  p_payment_method  text,
  p_items           jsonb,
  p_address         jsonb default null,
  p_notes           text default '',
  p_troco_para_cents bigint default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_token      text := nullif(btrim(p_checkout_token), '');
  v_nome       text := nullif(btrim(p_customer_name), '');
  v_telefone   text := btrim(coalesce(p_customer_phone, ''));
  v_tipo       comida_caseira_order_type;
  v_forma      comida_caseira_payment_method;
  v_order_id   uuid;
  v_numero     integer;
  v_subtotal   bigint := 0;
  v_custo      bigint := 0;
  v_taxa       bigint;
  v_minimo     bigint;
  v_total      bigint;
  v_cidade     text := btrim(coalesce(p_address ->> 'cidade', ''));
  v_bairro     text := btrim(coalesce(p_address ->> 'bairro', ''));
  v_customer   uuid;
  v_item       jsonb;
  v_produto    comida_caseira_products%rowtype;
  v_qtd        integer;
  v_extra      bigint;
  v_extra_custo bigint;
  v_opcoes     jsonb;
  v_existente  comida_caseira_orders%rowtype;
begin
  if v_token is null then
    raise exception 'checkout_token obrigatório' using errcode = '22023';
  end if;

  -- Idempotencia: mesmo token, mesmo pedido.
  select * into v_existente from comida_caseira_orders where checkout_token = v_token;
  if found then
    return jsonb_build_object(
      'order_id', v_existente.id,
      'order_number', v_existente.order_number,
      'total_cents', v_existente.total_cents,
      'delivery_fee_cents', v_existente.delivery_fee_cents,
      'subtotal_cents', v_existente.subtotal_cents,
      'duplicado', true
    );
  end if;

  if v_nome is null then
    raise exception 'Informe o nome do cliente' using errcode = '22023';
  end if;

  begin
    v_tipo := p_order_type::comida_caseira_order_type;
  exception when others then
    raise exception 'Tipo de pedido inválido' using errcode = '22023';
  end;

  begin
    v_forma := p_payment_method::comida_caseira_payment_method;
  exception when others then
    raise exception 'Forma de pagamento inválida' using errcode = '22023';
  end;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'O pedido está vazio' using errcode = '22023';
  end if;

  if jsonb_array_length(p_items) > 60 then
    raise exception 'Pedido com itens demais' using errcode = '22023';
  end if;

  if v_tipo = 'delivery' then
    if v_cidade = '' or v_bairro = ''
       or btrim(coalesce(p_address ->> 'rua', '')) = ''
       or btrim(coalesce(p_address ->> 'numero', '')) = '' then
      raise exception 'Endereço de entrega incompleto' using errcode = '22023';
    end if;
  end if;

  insert into comida_caseira_orders (
    customer_name, customer_phone, order_type, payment_method,
    subtotal_cents, total_cents, address_json, notes, source, checkout_token,
    troco_para_cents
  ) values (
    v_nome, v_telefone, v_tipo, v_forma,
    0, 0,
    case when v_tipo = 'delivery' then p_address else null end,
    left(coalesce(p_notes, ''), 500),
    'site', v_token,
    case when v_forma = 'cash' then p_troco_para_cents else null end
  )
  returning id, order_number into v_order_id, v_numero;

  -- Cada item e recalculado a partir da tabela de produtos.
  for v_item in select * from jsonb_array_elements(p_items) loop
    select * into v_produto
    from comida_caseira_products
    where id = (v_item ->> 'product_id') and ativo;

    if not found then
      raise exception 'Produto indisponível: %', coalesce(v_item ->> 'product_id', '?')
        using errcode = '22023';
    end if;

    v_qtd := coalesce((v_item ->> 'quantity')::integer, 0);
    if v_qtd < 1 or v_qtd > 99 then
      raise exception 'Quantidade inválida para %', v_produto.nome using errcode = '22023';
    end if;

    -- Adicionais: so contam as opcoes que existem MESMO para este produto.
    select
      coalesce(sum(o.price_delta_cents), 0),
      coalesce(sum(o.cost_delta_cents), 0),
      coalesce(
        jsonb_agg(jsonb_build_object('grupo', o.grupo_nome, 'nome', o.nome)),
        '[]'::jsonb
      )
    into v_extra, v_extra_custo, v_opcoes
    from comida_caseira_product_options o
    where o.product_id = v_produto.id
      and o.ativo
      and o.id in (
        select jsonb_array_elements_text(coalesce(v_item -> 'option_ids', '[]'::jsonb))
      );

    insert into comida_caseira_order_items (
      order_id, product_id, product_name_snapshot,
      unit_price_cents, unit_cost_cents, quantity,
      addons_cents, options_json, observacao, total_cents
    ) values (
      v_order_id, v_produto.id, v_produto.nome,
      v_produto.price_cents, v_produto.cost_cents, v_qtd,
      v_extra, v_opcoes, left(coalesce(v_item ->> 'observacao', ''), 280),
      (v_produto.price_cents + v_extra) * v_qtd
    );

    v_subtotal := v_subtotal + (v_produto.price_cents + v_extra) * v_qtd;
    v_custo := v_custo + (v_produto.cost_cents + v_extra_custo) * v_qtd;
  end loop;

  -- Taxa: sai da configuracao, nunca do navegador.
  if v_tipo = 'delivery' then
    v_taxa := comida_caseira_taxa_entrega(v_cidade, v_bairro);
    v_minimo := comida_caseira_pedido_minimo(v_cidade, v_bairro);
    if v_minimo is not null and v_subtotal < v_minimo then
      raise exception 'O pedido mínimo para essa região é de R$ %',
        to_char(v_minimo / 100.0, 'FM999999990.00') using errcode = '22023';
    end if;
  else
    v_taxa := 0;
  end if;

  v_total := v_subtotal + coalesce(v_taxa, 0);

  update comida_caseira_orders
  set subtotal_cents = v_subtotal,
      delivery_fee_cents = case when v_tipo = 'delivery' then v_taxa else 0 end,
      total_cents = v_total,
      cost_cents = v_custo
  where id = v_order_id;

  -- Cliente: identificado pelo telefone quando ele existe.
  if v_telefone <> '' then
    -- O indice de telefone e parcial (so vale para telefone preenchido), entao
    -- o ON CONFLICT precisa repetir a mesma condicao para o Postgres reconhece-lo.
    insert into comida_caseira_customers (nome, telefone)
    values (v_nome, v_telefone)
    on conflict (telefone) where telefone <> '' do update set nome = excluded.nome
    returning id into v_customer;

    update comida_caseira_orders set customer_id = v_customer where id = v_order_id;
  end if;

  return jsonb_build_object(
    'order_id', v_order_id,
    'order_number', v_numero,
    'subtotal_cents', v_subtotal,
    'delivery_fee_cents', case when v_tipo = 'delivery' then v_taxa else 0 end,
    'total_cents', v_total,
    'duplicado', false
  );
end;
$$;

comment on function comida_caseira_create_order is
  'Unica porta de entrada de pedido para cliente anonimo. Recalcula preco, '
  'adicionais, custo, taxa e total no servidor. Idempotente por checkout_token.';

-- --------------------------------------------------------------------------
-- Pedido pago vira receita; reembolso lanca o estorno
-- --------------------------------------------------------------------------
create or replace function comida_caseira_sincroniza_receita()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  -- Virou pago: entra como recebimento de verdade.
  if new.payment_status = 'paid' and coalesce(old.payment_status, 'pending') <> 'paid' then
    insert into comida_caseira_revenues (order_id, tipo, descricao, amount_cents, payment_method, ocorrido_em)
    values (
      new.id, 'order', 'Pedido #' || new.order_number,
      new.total_cents, new.payment_method,
      (coalesce(new.paid_at, now()) at time zone 'America/Sao_Paulo')::date
    )
    on conflict do nothing;
  end if;

  -- Virou reembolsado: lanca o estorno em vez de apagar o historico.
  if new.payment_status = 'refunded' and coalesce(old.payment_status, 'pending') <> 'refunded' then
    insert into comida_caseira_revenues (order_id, tipo, descricao, amount_cents, payment_method, ocorrido_em)
    values (
      new.id, 'order', 'Reembolso do pedido #' || new.order_number,
      -new.total_cents, new.payment_method,
      (now() at time zone 'America/Sao_Paulo')::date
    );
  end if;

  return new;
end;
$$;

drop trigger if exists comida_caseira_orders_receita_tg on comida_caseira_orders;
create trigger comida_caseira_orders_receita_tg
  after update of payment_status on comida_caseira_orders
  for each row execute function comida_caseira_sincroniza_receita();

-- --------------------------------------------------------------------------
-- Totais do cliente: sempre recalculados a partir dos pedidos que valem
-- --------------------------------------------------------------------------
create or replace function comida_caseira_atualiza_cliente()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_cliente uuid := coalesce(new.customer_id, old.customer_id);
begin
  if v_cliente is null then
    return coalesce(new, old);
  end if;

  update comida_caseira_customers c
  set pedidos = sub.pedidos,
      total_cents = sub.total,
      ultimo_pedido_at = sub.ultimo
  from (
    select
      count(*)::int as pedidos,
      coalesce(sum(total_cents), 0) as total,
      max(created_at) as ultimo
    from comida_caseira_orders
    where customer_id = v_cliente and status <> 'cancelled'
  ) sub
  where c.id = v_cliente;

  return coalesce(new, old);
end;
$$;

drop trigger if exists comida_caseira_orders_cliente_tg on comida_caseira_orders;
create trigger comida_caseira_orders_cliente_tg
  after insert or update of customer_id, total_cents, status or delete
  on comida_caseira_orders
  for each row execute function comida_caseira_atualiza_cliente();

-- --------------------------------------------------------------------------
-- Auditoria do que mexe em dinheiro
-- --------------------------------------------------------------------------
create or replace function comida_caseira_audita()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user uuid;
begin
  -- auth.uid() nao existe fora do Supabase; fora de la o registro fica sem autor.
  begin
    v_user := auth.uid();
  exception when others then
    v_user := null;
  end;

  insert into comida_caseira_audit_logs (user_id, action, entity, entity_id, old_data, new_data)
  values (
    v_user,
    lower(tg_op),
    tg_table_name,
    coalesce((to_jsonb(new) ->> 'id'), (to_jsonb(old) ->> 'id'), '?'),
    case when tg_op = 'INSERT' then null else to_jsonb(old) end,
    case when tg_op = 'DELETE' then null else to_jsonb(new) end
  );

  return coalesce(new, old);
end;
$$;

drop trigger if exists comida_caseira_orders_audit_tg on comida_caseira_orders;
create trigger comida_caseira_orders_audit_tg
  after update or delete on comida_caseira_orders
  for each row execute function comida_caseira_audita();

drop trigger if exists comida_caseira_expenses_audit_tg on comida_caseira_expenses;
create trigger comida_caseira_expenses_audit_tg
  after insert or update or delete on comida_caseira_expenses
  for each row execute function comida_caseira_audita();

drop trigger if exists comida_caseira_revenues_audit_tg on comida_caseira_revenues;
create trigger comida_caseira_revenues_audit_tg
  after insert or update or delete on comida_caseira_revenues
  for each row execute function comida_caseira_audita();

drop trigger if exists comida_caseira_cash_sessions_audit_tg on comida_caseira_cash_sessions;
create trigger comida_caseira_cash_sessions_audit_tg
  after insert or update or delete on comida_caseira_cash_sessions
  for each row execute function comida_caseira_audita();
