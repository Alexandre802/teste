-- ===========================================================================
-- 0003: carimbo de status, numeros do painel e fechamento de caixa
-- ===========================================================================

-- --------------------------------------------------------------------------
-- Carimbo automatico das datas de status
-- --------------------------------------------------------------------------
create or replace function comida_caseira_carimba_status()
returns trigger
language plpgsql
as $$
begin
  -- Pedido cancelado nao volta atras: quem errou registra um pedido novo.
  if old.status = 'cancelled' and new.status <> 'cancelled' then
    raise exception 'Pedido cancelado não pode voltar de status' using errcode = '22023';
  end if;

  if new.status <> old.status then
    if new.status = 'confirmed'        and new.confirmed_at is null then new.confirmed_at := now(); end if;
    if new.status = 'completed'        and new.completed_at is null then new.completed_at := now(); end if;
    if new.status = 'cancelled'        and new.cancelled_at is null then new.cancelled_at := now(); end if;
  end if;

  if new.payment_status <> old.payment_status then
    if new.payment_status = 'paid'     and new.paid_at is null     then new.paid_at := now();     end if;
    if new.payment_status = 'refunded' and new.refunded_at is null then new.refunded_at := now(); end if;
  end if;

  -- Cancelar zera a cobranca: pedido cancelado nao entra no faturamento.
  if new.status = 'cancelled' and new.payment_status = 'pending' then
    new.payment_status := 'cancelled';
  end if;

  return new;
end;
$$;

drop trigger if exists comida_caseira_orders_status_tg on comida_caseira_orders;
create trigger comida_caseira_orders_status_tg
  before update on comida_caseira_orders
  for each row execute function comida_caseira_carimba_status();

-- --------------------------------------------------------------------------
-- Pedidos que contam como faturamento
-- --------------------------------------------------------------------------
-- "Pago ou concluido, e nao cancelado." Um pedido apenas criado ainda nao e
-- faturamento: fica em "a receber" ate a casa confirmar.
create or replace view comida_caseira_vw_faturaveis as
  select *
  from comida_caseira_orders
  where status <> 'cancelled'
    and payment_status <> 'cancelled'
    and (payment_status = 'paid' or status = 'completed');

-- --------------------------------------------------------------------------
-- Resumo do periodo — a conta que o painel mostra
-- --------------------------------------------------------------------------
-- As datas chegam no fuso de Sao Paulo, que e o fuso da casa.
create or replace function comida_caseira_resumo(p_de date, p_ate date)
returns jsonb
language sql
stable
as $$
  with
  periodo as (select p_de as de, p_ate as ate),
  pedidos as (
    select o.*
    from comida_caseira_orders o, periodo p
    where (o.created_at at time zone 'America/Sao_Paulo')::date between p.de and p.ate
  ),
  faturaveis as (
    select * from pedidos
    where status <> 'cancelled'
      and payment_status <> 'cancelled'
      and (payment_status = 'paid' or status = 'completed')
  ),
  receb as (
    select coalesce(sum(r.amount_cents), 0) as total
    from comida_caseira_revenues r, periodo p
    where r.ocorrido_em between p.de and p.ate
  ),
  desp as (
    select coalesce(sum(e.amount_cents), 0) as total
    from comida_caseira_expenses e, periodo p
    where e.ocorrido_em between p.de and p.ate
  ),
  numeros as (
    select
      (select count(*) from pedidos where status <> 'cancelled')            as pedidos,
      (select count(*) from pedidos where status = 'cancelled')             as cancelados,
      (select count(*) from faturaveis)                                    as pedidos_faturados,
      (select coalesce(sum(total_cents), 0) from faturaveis)               as faturamento,
      (select coalesce(sum(cost_cents), 0) from faturaveis)                as custo,
      (select coalesce(sum(total_cents), 0) from pedidos
        where status <> 'cancelled' and payment_status = 'pending')        as pendente,
      (select total from receb)                                            as recebimentos,
      (select total from desp)                                             as despesas
  )
  select jsonb_build_object(
    'pedidos',              n.pedidos,
    'cancelados',           n.cancelados,
    'pedidos_faturados',    n.pedidos_faturados,
    'faturamento_cents',    n.faturamento,
    'recebimentos_cents',   n.recebimentos,
    'pendente_cents',       n.pendente,
    'despesas_cents',       n.despesas,
    'custo_cents',          n.custo,
    'lucro_bruto_cents',    n.faturamento - n.custo,
    'lucro_liquido_cents',  n.recebimentos - n.custo - n.despesas,
    'ticket_medio_cents',
      case when n.pedidos_faturados > 0
        then round(n.faturamento::numeric / n.pedidos_faturados)::bigint
        else 0 end
  )
  from numeros n;
$$;

comment on function comida_caseira_resumo is
  'Faturamento = pedidos pagos ou concluidos. Recebimentos = dinheiro que '
  'entrou de fato (inclui receita manual e desconta estorno de reembolso). '
  'Lucro bruto = faturamento - custo. Lucro liquido = recebimentos - custo - despesas.';

-- --------------------------------------------------------------------------
-- Series e recortes do relatorio
-- --------------------------------------------------------------------------
create or replace function comida_caseira_vendas_por_dia(p_de date, p_ate date)
returns table (dia date, pedidos bigint, faturamento_cents bigint)
language sql
stable
as $$
  select
    d::date as dia,
    count(f.id) as pedidos,
    coalesce(sum(f.total_cents), 0)::bigint as faturamento_cents
  from generate_series(p_de, p_ate, interval '1 day') d
  left join comida_caseira_vw_faturaveis f
    on (f.created_at at time zone 'America/Sao_Paulo')::date = d::date
  group by d
  order by d;
$$;

create or replace function comida_caseira_por_forma_pagamento(p_de date, p_ate date)
returns table (forma comida_caseira_payment_method, pedidos bigint, valor_cents bigint)
language sql
stable
as $$
  select payment_method, count(*)::bigint, coalesce(sum(total_cents), 0)::bigint
  from comida_caseira_vw_faturaveis
  where (created_at at time zone 'America/Sao_Paulo')::date between p_de and p_ate
  group by payment_method
  order by 3 desc;
$$;

create or replace function comida_caseira_mais_vendidos(p_de date, p_ate date, p_limite int default 10)
returns table (
  product_id text, produto text, quantidade bigint,
  faturamento_cents bigint, custo_cents bigint
)
language sql
stable
as $$
  select
    i.product_id,
    max(i.product_name_snapshot),
    sum(i.quantity)::bigint,
    sum(i.total_cents)::bigint,
    sum(i.unit_cost_cents * i.quantity)::bigint
  from comida_caseira_order_items i
  join comida_caseira_vw_faturaveis o on o.id = i.order_id
  where (o.created_at at time zone 'America/Sao_Paulo')::date between p_de and p_ate
  group by i.product_id
  order by 3 desc
  limit greatest(p_limite, 1);
$$;

create or replace function comida_caseira_por_hora(p_de date, p_ate date)
returns table (hora int, pedidos bigint, faturamento_cents bigint)
language sql
stable
as $$
  select
    extract(hour from (created_at at time zone 'America/Sao_Paulo'))::int,
    count(*)::bigint,
    coalesce(sum(total_cents), 0)::bigint
  from comida_caseira_vw_faturaveis
  where (created_at at time zone 'America/Sao_Paulo')::date between p_de and p_ate
  group by 1
  order by 1;
$$;

create or replace function comida_caseira_entrega_x_retirada(p_de date, p_ate date)
returns table (tipo comida_caseira_order_type, pedidos bigint, faturamento_cents bigint)
language sql
stable
as $$
  select order_type, count(*)::bigint, coalesce(sum(total_cents), 0)::bigint
  from comida_caseira_vw_faturaveis
  where (created_at at time zone 'America/Sao_Paulo')::date between p_de and p_ate
  group by order_type
  order by 1;
$$;

-- --------------------------------------------------------------------------
-- Fechamento de caixa
-- --------------------------------------------------------------------------
-- Conta so o dinheiro FISICO: pix, debito e credito nao passam pela gaveta.
create or replace function comida_caseira_resumo_caixa(p_session uuid)
returns jsonb
language sql
stable
as $$
  with s as (select * from comida_caseira_cash_sessions where id = p_session),
  janela as (
    select aberto_em as de, coalesce(fechado_em, now()) as ate, abertura_cents from s
  ),
  receitas as (
    select
      coalesce(sum(amount_cents) filter (where payment_method = 'cash'), 0)   as dinheiro,
      coalesce(sum(amount_cents) filter (where payment_method = 'pix'), 0)    as pix,
      coalesce(sum(amount_cents) filter (where payment_method = 'debit'), 0)  as debito,
      coalesce(sum(amount_cents) filter (where payment_method = 'credit'), 0) as credito
    from comida_caseira_revenues r, janela j
    where r.created_at >= j.de and r.created_at <= j.ate
  ),
  despesas as (
    select coalesce(sum(amount_cents) filter (where payment_method = 'cash'), 0) as dinheiro
    from comida_caseira_expenses e, janela j
    where e.created_at >= j.de and e.created_at <= j.ate
  ),
  movs as (
    select
      coalesce(sum(amount_cents) filter (where kind = 'sangria'), 0)    as sangria,
      coalesce(sum(amount_cents) filter (where kind = 'suprimento'), 0) as suprimento
    from comida_caseira_cash_movements where session_id = p_session
  )
  select jsonb_build_object(
    'abertura_cents',        j.abertura_cents,
    'dinheiro_cents',        r.dinheiro,
    'pix_cents',             r.pix,
    'debito_cents',          r.debito,
    'credito_cents',         r.credito,
    'despesas_dinheiro_cents', d.dinheiro,
    'sangria_cents',         m.sangria,
    'suprimento_cents',      m.suprimento,
    'esperado_cents',
      j.abertura_cents + r.dinheiro + m.suprimento - d.dinheiro - m.sangria,
    'contado_cents',         s.contado_cents,
    'diferenca_cents',
      case when s.contado_cents is null then null
        else s.contado_cents
             - (j.abertura_cents + r.dinheiro + m.suprimento - d.dinheiro - m.sangria)
      end
  )
  from s, janela j, receitas r, despesas d, movs m;
$$;

comment on function comida_caseira_resumo_caixa is
  'So o dinheiro fisico entra na conta da gaveta. Pix, debito e credito '
  'aparecem apenas como informacao.';
