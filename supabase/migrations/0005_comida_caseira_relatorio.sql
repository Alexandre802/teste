-- ═══════════════════════════════════════════════════════════════════════════
-- Um relatório, uma função.
--
-- Todo número do painel — cards, gráfico, formas de pagamento, mais vendidos,
-- horários — sai daqui. A conta mora no banco por dois motivos: não trafega
-- pedido por pedido para o celular da dona, e não existe uma segunda versão
-- da fórmula do lucro escrita em JavaScript para divergir com o tempo.
--
-- Definições, escritas uma vez:
--
--   FATURADO          pedido não cancelado que está pago OU concluído.
--   FATURAMENTO BRUTO soma do total dos pedidos faturados.
--   RECEBIMENTOS      soma dos lançamentos de entrada (estorno entra negativo).
--   CUSTO             custo dos itens dos pedidos faturados, quando informado.
--   LUCRO BRUTO       faturamento bruto − custo.
--   LUCRO LÍQUIDO     recebimentos − custo − despesas.
--   TICKET MÉDIO      faturamento bruto ÷ pedidos faturados.
--
-- O lucro líquido parte do que entrou de verdade, não do que foi faturado:
-- é o número que responde "quanto sobrou no caixa".
-- ═══════════════════════════════════════════════════════════════════════════

create or replace function comida_caseira_report(
  p_from   timestamptz,
  p_to     timestamptz,
  p_bucket text default 'day'
) returns jsonb
language plpgsql
security definer
stable
set search_path = public, pg_temp
as $$
declare
  v_tz     constant text := 'America/Sao_Paulo';
  v_bucket text := case when p_bucket in ('day','week','month') then p_bucket else 'day' end;
  v_res    jsonb;
begin
  if not comida_caseira_is_admin() then
    raise exception 'não autorizado' using errcode = '42501';
  end if;

  with periodo as (
    select p_from as inicio, p_to as fim
  ),
  pedidos as (
    select o.*,
           (o.status <> 'cancelled' and (o.payment_status = 'paid' or o.status = 'completed'))
             as faturado
      from comida_caseira_orders o, periodo p
     where o.created_at >= p.inicio and o.created_at < p.fim
  ),
  lancamentos as (
    select e.* from comida_caseira_entries e, periodo p
     where e.occurred_at >= p.inicio and e.occurred_at < p.fim
  ),
  gastos as (
    select d.* from comida_caseira_expenses d, periodo p
     where d.occurred_at >= p.inicio and d.occurred_at < p.fim
  ),
  itens as (
    select i.*
      from comida_caseira_order_items i
      join pedidos o on o.id = i.order_id
     where o.faturado
  ),
  resumo as (
    select
      count(*)                                                          as pedidos_total,
      count(*) filter (where faturado)                                  as pedidos_faturados,
      count(*) filter (where status = 'cancelled')                      as pedidos_cancelados,
      count(*) filter (where status <> 'cancelled' and payment_status = 'pending')
                                                                        as pedidos_pendentes,
      coalesce(sum(total_cents) filter (where faturado), 0)::bigint     as bruto_cents,
      coalesce(sum(total_cents) filter (
        where status <> 'cancelled' and payment_status = 'pending'
      ), 0)::bigint                                                     as pendente_cents,
      coalesce(sum(cost_cents) filter (where faturado), 0)::bigint      as custo_cents,
      coalesce(sum(delivery_fee_cents) filter (where faturado), 0)::bigint as taxas_cents
    from pedidos
  ),
  caixa as (
    select coalesce(sum(amount_cents), 0)::bigint as recebido_cents from lancamentos
  ),
  saidas as (
    select coalesce(sum(amount_cents), 0)::bigint as despesas_cents from gastos
  ),
  -- eixo do gráfico: dias (ou semanas/meses) sem venda precisam aparecer
  -- como zero, senão a linha "pula" o dia fraco e engana a leitura
  balizas as (
    select generate_series(
             date_trunc(v_bucket, (p_from at time zone v_tz)),
             date_trunc(v_bucket, (p_to   at time zone v_tz) - interval '1 second'),
             ('1 ' || v_bucket)::interval
           ) as inicio
  ),
  serie as (
    select to_char(b.inicio, 'YYYY-MM-DD') as bucket,
           coalesce(count(o.id) filter (where o.faturado), 0)               as pedidos,
           coalesce(sum(o.total_cents) filter (where o.faturado), 0)::bigint as valor_cents
      from balizas b
      left join pedidos o
        on date_trunc(v_bucket, (o.created_at at time zone v_tz)) = b.inicio
     group by b.inicio
     order by b.inicio
  ),
  por_forma as (
    select method::text as forma,
           count(*)                        as quantidade,
           sum(amount_cents)::bigint       as valor_cents
      from lancamentos
     group by method
  ),
  por_tipo as (
    select order_type::text as tipo,
           count(*)                        as quantidade,
           sum(total_cents)::bigint        as valor_cents
      from pedidos where faturado
     group by order_type
  ),
  mais_vendidos as (
    select coalesce(product_id, product_name) as product_id,
           product_name                       as nome,
           sum(quantity)::bigint              as quantidade,
           sum(total_cents)::bigint           as valor_cents
      from itens
     group by 1, 2
     order by quantidade desc, valor_cents desc
     limit 10
  ),
  por_hora as (
    select extract(hour from (created_at at time zone v_tz))::int as hora,
           count(*)                    as quantidade,
           sum(total_cents)::bigint    as valor_cents
      from pedidos where faturado
     group by 1 order by 1
  ),
  gastos_categoria as (
    select coalesce(c.name, 'Sem categoria') as categoria,
           sum(g.amount_cents)::bigint       as valor_cents,
           count(*)                          as quantidade
      from gastos g
      left join comida_caseira_expense_categories c on c.id = g.category_id
     group by 1 order by valor_cents desc
  )
  select jsonb_build_object(
    'from', p_from,
    'to',   p_to,
    'bucket', v_bucket,
    'orders', jsonb_build_object(
      'total',     r.pedidos_total,
      'billed',    r.pedidos_faturados,
      'pending',   r.pedidos_pendentes,
      'cancelled', r.pedidos_cancelados
    ),
    'money', jsonb_build_object(
      'gross_cents',        r.bruto_cents,
      'received_cents',     c.recebido_cents,
      'pending_cents',      r.pendente_cents,
      'expenses_cents',     s.despesas_cents,
      'cost_cents',         r.custo_cents,
      'delivery_fee_cents', r.taxas_cents,
      'gross_profit_cents', r.bruto_cents - r.custo_cents,
      'net_profit_cents',   c.recebido_cents - r.custo_cents - s.despesas_cents,
      'ticket_cents',       case when r.pedidos_faturados > 0
                                 then round(r.bruto_cents::numeric / r.pedidos_faturados)
                                 else 0 end
    ),
    'series',        coalesce((select jsonb_agg(to_jsonb(x)) from serie x), '[]'::jsonb),
    'by_method',     coalesce((select jsonb_agg(to_jsonb(x)) from por_forma x), '[]'::jsonb),
    'by_type',       coalesce((select jsonb_agg(to_jsonb(x)) from por_tipo x), '[]'::jsonb),
    'top_products',  coalesce((select jsonb_agg(to_jsonb(x)) from mais_vendidos x), '[]'::jsonb),
    'by_hour',       coalesce((select jsonb_agg(to_jsonb(x)) from por_hora x), '[]'::jsonb),
    'expenses_by_category',
                     coalesce((select jsonb_agg(to_jsonb(x)) from gastos_categoria x), '[]'::jsonb)
  )
  into v_res
  from resumo r, caixa c, saidas s;

  return v_res;
end;
$$;

revoke all on function comida_caseira_report(timestamptz, timestamptz, text) from public, anon;
grant execute on function comida_caseira_report(timestamptz, timestamptz, text) to authenticated;
