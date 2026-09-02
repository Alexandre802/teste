-- ═══════════════════════════════════════════════════════════════════════════
-- Operações do painel: mudar status, marcar pago, estornar, fechar caixa.
--
-- Cada uma é uma função só, com auditoria dentro. Fazer isso por UPDATE solto
-- do navegador espalharia a regra ("marcar pago também gera recebimento") por
-- várias telas, e uma delas ia esquecer.
-- ═══════════════════════════════════════════════════════════════════════════

create or replace function comida_caseira_audit(
  p_action text, p_entity text, p_entity_id text, p_old jsonb, p_new jsonb
) returns void
language sql
security definer
set search_path = public, pg_temp
as $$
  insert into comida_caseira_audit_logs (user_id, action, entity, entity_id, old_data, new_data)
  values (auth.uid(), p_action, p_entity, p_entity_id, p_old, p_new);
$$;

-- ───────────────────────── status do pedido ─────────────────────────

create or replace function comida_caseira_set_order_status(
  p_order_id uuid,
  p_status   text,
  p_reason   text default null
) returns comida_caseira_orders
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_antes  comida_caseira_orders%rowtype;
  v_depois comida_caseira_orders%rowtype;
  v_status comida_caseira_order_status;
begin
  if not comida_caseira_is_admin() then
    raise exception 'não autorizado' using errcode = '42501';
  end if;

  if p_status not in ('pending','confirmed','preparing','out_for_delivery','completed','cancelled') then
    raise exception 'status inválido' using errcode = '22023';
  end if;
  v_status := p_status::comida_caseira_order_status;

  select * into v_antes from comida_caseira_orders where id = p_order_id;
  if not found then
    raise exception 'pedido não encontrado' using errcode = 'P0002';
  end if;

  update comida_caseira_orders
     set status        = v_status,
         cancel_reason = case when v_status = 'cancelled'
                              then left(btrim(coalesce(p_reason, '')), 300)
                              else cancel_reason end,
         confirmed_at  = case when v_status = 'confirmed' and confirmed_at is null
                              then now() else confirmed_at end,
         completed_at  = case when v_status = 'completed' then now() else completed_at end,
         cancelled_at  = case when v_status = 'cancelled' then now() else null end,
         -- pedido cancelado não fica "a receber" pendurado no painel
         payment_status = case
           when v_status = 'cancelled' and payment_status = 'pending' then 'cancelled'
           else payment_status
         end
   where id = p_order_id
   returning * into v_depois;

  perform comida_caseira_audit(
    'order.status', 'order', p_order_id::text,
    jsonb_build_object('status', v_antes.status, 'payment_status', v_antes.payment_status),
    jsonb_build_object('status', v_depois.status, 'payment_status', v_depois.payment_status,
                       'reason', v_depois.cancel_reason)
  );

  return v_depois;
end;
$$;

-- ─────────────────────────── marcar pago ───────────────────────────
-- O único lugar do sistema que transforma pedido em RECEBIMENTO.

create or replace function comida_caseira_mark_order_paid(
  p_order_id uuid,
  p_method   text default null
) returns comida_caseira_orders
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_antes  comida_caseira_orders%rowtype;
  v_depois comida_caseira_orders%rowtype;
  v_method comida_caseira_payment_method;
begin
  if not comida_caseira_is_admin() then
    raise exception 'não autorizado' using errcode = '42501';
  end if;

  select * into v_antes from comida_caseira_orders where id = p_order_id;
  if not found then
    raise exception 'pedido não encontrado' using errcode = 'P0002';
  end if;

  if v_antes.status = 'cancelled' then
    raise exception 'pedido cancelado não pode ser marcado como pago' using errcode = '22023';
  end if;

  if v_antes.payment_status = 'paid' then
    return v_antes; -- já pago: nada a fazer, e nenhum recebimento duplicado
  end if;

  v_method := coalesce(nullif(btrim(coalesce(p_method, '')), '')::comida_caseira_payment_method,
                       v_antes.payment_method);

  update comida_caseira_orders
     set payment_status = 'paid',
         payment_method = v_method,
         paid_at        = now(),
         -- pagar implica que a casa já aceitou o pedido
         status         = case when status = 'pending' then 'confirmed' else status end,
         confirmed_at   = coalesce(confirmed_at, now())
   where id = p_order_id
   returning * into v_depois;

  insert into comida_caseira_entries (order_id, kind, amount_cents, method, description, created_by)
  values (
    p_order_id, 'order', v_depois.total_cents, v_method,
    'Pedido #' || v_depois.order_number, auth.uid()
  )
  on conflict do nothing;

  perform comida_caseira_audit(
    'order.paid', 'order', p_order_id::text,
    jsonb_build_object('payment_status', v_antes.payment_status),
    jsonb_build_object('payment_status', 'paid', 'method', v_method,
                       'amount_cents', v_depois.total_cents)
  );

  return v_depois;
end;
$$;

-- ───────────────────────────── estorno ─────────────────────────────
-- O estorno NÃO apaga o recebimento: lança uma linha negativa. O período se
-- corrige sozinho e o histórico continua contando o que aconteceu.

create or replace function comida_caseira_refund_order(
  p_order_id uuid,
  p_reason   text default null
) returns comida_caseira_orders
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_antes  comida_caseira_orders%rowtype;
  v_depois comida_caseira_orders%rowtype;
begin
  if not comida_caseira_is_admin() then
    raise exception 'não autorizado' using errcode = '42501';
  end if;

  select * into v_antes from comida_caseira_orders where id = p_order_id;
  if not found then
    raise exception 'pedido não encontrado' using errcode = 'P0002';
  end if;

  if v_antes.payment_status <> 'paid' then
    raise exception 'só é possível estornar pedido pago' using errcode = '22023';
  end if;

  update comida_caseira_orders
     set payment_status = 'refunded',
         refunded_at    = now()
   where id = p_order_id
   returning * into v_depois;

  insert into comida_caseira_entries (order_id, kind, amount_cents, method, description, notes, created_by)
  values (
    null, 'refund', -v_antes.total_cents, v_antes.payment_method,
    'Estorno do pedido #' || v_antes.order_number,
    left(btrim(coalesce(p_reason, '')), 300), auth.uid()
  );

  perform comida_caseira_audit(
    'order.refund', 'order', p_order_id::text,
    jsonb_build_object('payment_status', 'paid', 'amount_cents', v_antes.total_cents),
    jsonb_build_object('payment_status', 'refunded', 'reason', p_reason)
  );

  return v_depois;
end;
$$;

-- ──────────────────────────── caixa ────────────────────────────

create or replace function comida_caseira_open_cash_session(
  p_opening_cents integer,
  p_notes text default ''
) returns comida_caseira_cash_sessions
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_sessao comida_caseira_cash_sessions%rowtype;
begin
  if not comida_caseira_is_admin() then
    raise exception 'não autorizado' using errcode = '42501';
  end if;

  if exists (select 1 from comida_caseira_cash_sessions where closed_at is null) then
    raise exception 'já existe caixa aberto' using errcode = '22023';
  end if;

  insert into comida_caseira_cash_sessions (opening_cents, opened_by, notes)
  values (greatest(coalesce(p_opening_cents, 0), 0), auth.uid(), left(coalesce(p_notes,''), 300))
  returning * into v_sessao;

  perform comida_caseira_audit('cash.open', 'cash_session', v_sessao.id::text, null, to_jsonb(v_sessao));
  return v_sessao;
end;
$$;

-- Fechamento: o esperado é calculado aqui, não digitado. Quem digita os dois
-- lados da conferência não está conferindo nada.
create or replace function comida_caseira_close_cash_session(
  p_session_id uuid,
  p_counted_cents integer,
  p_notes text default ''
) returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_sessao    comida_caseira_cash_sessions%rowtype;
  v_dinheiro  integer;
  v_outras    jsonb;
  v_despesas  integer;
  v_sangria   integer;
  v_supri     integer;
  v_esperado  integer;
  v_contado   integer := greatest(coalesce(p_counted_cents, 0), 0);
begin
  if not comida_caseira_is_admin() then
    raise exception 'não autorizado' using errcode = '42501';
  end if;

  select * into v_sessao from comida_caseira_cash_sessions where id = p_session_id;
  if not found then
    raise exception 'caixa não encontrado' using errcode = 'P0002';
  end if;
  if v_sessao.closed_at is not null then
    raise exception 'caixa já fechado' using errcode = '22023';
  end if;

  -- só o dinheiro físico entra na conferência da gaveta
  select coalesce(sum(amount_cents), 0) into v_dinheiro
    from comida_caseira_entries
   where method = 'cash' and occurred_at >= v_sessao.opened_at;

  select coalesce(jsonb_object_agg(method, valor), '{}'::jsonb) into v_outras
    from (
      select method::text as method, sum(amount_cents)::bigint as valor
        from comida_caseira_entries
       where method <> 'cash' and occurred_at >= v_sessao.opened_at
       group by method
    ) t;

  select coalesce(sum(amount_cents), 0) into v_despesas
    from comida_caseira_expenses
   where method = 'cash' and occurred_at >= v_sessao.opened_at;

  select coalesce(sum(amount_cents) filter (where type = 'sangria'), 0),
         coalesce(sum(amount_cents) filter (where type = 'suprimento'), 0)
    into v_sangria, v_supri
    from comida_caseira_cash_movements
   where session_id = p_session_id;

  v_esperado := v_sessao.opening_cents + v_dinheiro + v_supri - v_despesas - v_sangria;

  update comida_caseira_cash_sessions
     set closed_at        = now(),
         closed_by        = auth.uid(),
         expected_cents   = v_esperado,
         counted_cents    = v_contado,
         difference_cents = v_contado - v_esperado,
         notes            = left(coalesce(p_notes, ''), 300)
   where id = p_session_id
   returning * into v_sessao;

  perform comida_caseira_audit('cash.close', 'cash_session', p_session_id::text, null, to_jsonb(v_sessao));

  return jsonb_build_object(
    'session',          to_jsonb(v_sessao),
    'cash_in_cents',    v_dinheiro,
    'other_methods',    v_outras,
    'cash_out_cents',   v_despesas,
    'sangria_cents',    v_sangria,
    'suprimento_cents', v_supri,
    'expected_cents',   v_esperado,
    'counted_cents',    v_contado,
    'difference_cents', v_contado - v_esperado
  );
end;
$$;

-- Prévia do fechamento, sem fechar nada. É o que a tela mostra enquanto o
-- caixa está aberto.
create or replace function comida_caseira_cash_session_preview(p_session_id uuid)
returns jsonb
language plpgsql
security definer
stable
set search_path = public, pg_temp
as $$
declare
  v_sessao   comida_caseira_cash_sessions%rowtype;
  v_dinheiro integer;
  v_outras   jsonb;
  v_despesas integer;
  v_sangria  integer;
  v_supri    integer;
begin
  if not comida_caseira_is_admin() then
    raise exception 'não autorizado' using errcode = '42501';
  end if;

  select * into v_sessao from comida_caseira_cash_sessions where id = p_session_id;
  if not found then
    raise exception 'caixa não encontrado' using errcode = 'P0002';
  end if;

  select coalesce(sum(amount_cents), 0) into v_dinheiro
    from comida_caseira_entries
   where method = 'cash' and occurred_at >= v_sessao.opened_at
     and (v_sessao.closed_at is null or occurred_at <= v_sessao.closed_at);

  select coalesce(jsonb_object_agg(method, valor), '{}'::jsonb) into v_outras
    from (
      select method::text as method, sum(amount_cents)::bigint as valor
        from comida_caseira_entries
       where method <> 'cash' and occurred_at >= v_sessao.opened_at
         and (v_sessao.closed_at is null or occurred_at <= v_sessao.closed_at)
       group by method
    ) t;

  select coalesce(sum(amount_cents), 0) into v_despesas
    from comida_caseira_expenses
   where method = 'cash' and occurred_at >= v_sessao.opened_at
     and (v_sessao.closed_at is null or occurred_at <= v_sessao.closed_at);

  select coalesce(sum(amount_cents) filter (where type = 'sangria'), 0),
         coalesce(sum(amount_cents) filter (where type = 'suprimento'), 0)
    into v_sangria, v_supri
    from comida_caseira_cash_movements
   where session_id = p_session_id;

  return jsonb_build_object(
    'session',          to_jsonb(v_sessao),
    'cash_in_cents',    v_dinheiro,
    'other_methods',    v_outras,
    'cash_out_cents',   v_despesas,
    'sangria_cents',    v_sangria,
    'suprimento_cents', v_supri,
    'expected_cents',   v_sessao.opening_cents + v_dinheiro + v_supri - v_despesas - v_sangria
  );
end;
$$;

revoke all on function comida_caseira_set_order_status(uuid, text, text) from public, anon;
revoke all on function comida_caseira_mark_order_paid(uuid, text) from public, anon;
revoke all on function comida_caseira_refund_order(uuid, text) from public, anon;
revoke all on function comida_caseira_open_cash_session(integer, text) from public, anon;
revoke all on function comida_caseira_close_cash_session(uuid, integer, text) from public, anon;
revoke all on function comida_caseira_cash_session_preview(uuid) from public, anon;
revoke all on function comida_caseira_audit(text, text, text, jsonb, jsonb) from public, anon;

grant execute on function comida_caseira_set_order_status(uuid, text, text) to authenticated;
grant execute on function comida_caseira_mark_order_paid(uuid, text) to authenticated;
grant execute on function comida_caseira_refund_order(uuid, text) to authenticated;
grant execute on function comida_caseira_open_cash_session(integer, text) to authenticated;
grant execute on function comida_caseira_close_cash_session(uuid, integer, text) to authenticated;
grant execute on function comida_caseira_cash_session_preview(uuid) to authenticated;
grant execute on function comida_caseira_audit(text, text, text, jsonb, jsonb) to authenticated;
