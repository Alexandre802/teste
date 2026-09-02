-- ═══════════════════════════════════════════════════════════════════════════
-- Segurança: RLS em tudo, e uma única porta para o cliente anônimo.
--
-- O visitante do site NÃO enxerga pedido, caixa, despesa, cliente nem custo.
-- Ele só consegue fazer uma coisa: chamar `comida_caseira_create_order`, que
-- recalcula preço e taxa do zero antes de gravar qualquer coisa.
-- ═══════════════════════════════════════════════════════════════════════════

alter table comida_caseira_users               enable row level security;
alter table comida_caseira_settings            enable row level security;
alter table comida_caseira_products            enable row level security;
alter table comida_caseira_delivery_zones      enable row level security;
alter table comida_caseira_customers           enable row level security;
alter table comida_caseira_orders              enable row level security;
alter table comida_caseira_order_items         enable row level security;
alter table comida_caseira_entries             enable row level security;
alter table comida_caseira_expense_categories  enable row level security;
alter table comida_caseira_expenses            enable row level security;
alter table comida_caseira_cash_sessions       enable row level security;
alter table comida_caseira_cash_movements      enable row level security;
alter table comida_caseira_audit_logs          enable row level security;

-- Nenhuma tabela é exposta pela API REST ao papel `anon`: sem GRANT, mesmo
-- uma política mal escrita no futuro não vira vazamento.
revoke all on comida_caseira_users              from anon;
revoke all on comida_caseira_settings           from anon;
revoke all on comida_caseira_products           from anon;
revoke all on comida_caseira_delivery_zones     from anon;
revoke all on comida_caseira_customers          from anon;
revoke all on comida_caseira_orders             from anon;
revoke all on comida_caseira_order_items        from anon;
revoke all on comida_caseira_entries            from anon;
revoke all on comida_caseira_expense_categories from anon;
revoke all on comida_caseira_expenses           from anon;
revoke all on comida_caseira_cash_sessions      from anon;
revoke all on comida_caseira_cash_movements     from anon;
revoke all on comida_caseira_audit_logs         from anon;

-- ────────────────────── políticas: só administrador ──────────────────────
-- Um bloco só, gerado, porque treze tabelas com a mesma regra escritas à mão
-- é onde se esquece uma.

do $$
declare
  t text;
  tabelas text[] := array[
    'comida_caseira_settings',
    'comida_caseira_products',
    'comida_caseira_delivery_zones',
    'comida_caseira_customers',
    'comida_caseira_orders',
    'comida_caseira_order_items',
    'comida_caseira_entries',
    'comida_caseira_expense_categories',
    'comida_caseira_expenses',
    'comida_caseira_cash_sessions',
    'comida_caseira_cash_movements'
  ];
begin
  foreach t in array tabelas loop
    execute format('drop policy if exists %I on %I', t || '_admin_all', t);
    execute format(
      'create policy %I on %I for all to authenticated
         using (comida_caseira_is_admin()) with check (comida_caseira_is_admin())',
      t || '_admin_all', t
    );
  end loop;
end $$;

-- Auditoria: administrador lê e escreve, mas NINGUÉM altera nem apaga.
-- Registro que pode ser reescrito não serve de auditoria.
drop policy if exists comida_caseira_audit_logs_read on comida_caseira_audit_logs;
create policy comida_caseira_audit_logs_read on comida_caseira_audit_logs
  for select to authenticated using (comida_caseira_is_admin());

drop policy if exists comida_caseira_audit_logs_write on comida_caseira_audit_logs;
create policy comida_caseira_audit_logs_write on comida_caseira_audit_logs
  for insert to authenticated with check (comida_caseira_is_admin());

-- Usuários: cada um lê a si mesmo; só `owner` mexe na equipe.
drop policy if exists comida_caseira_users_self on comida_caseira_users;
create policy comida_caseira_users_self on comida_caseira_users
  for select to authenticated using (user_id = auth.uid() or comida_caseira_is_admin());

drop policy if exists comida_caseira_users_manage on comida_caseira_users;
create policy comida_caseira_users_manage on comida_caseira_users
  for all to authenticated
  using (comida_caseira_current_role() = 'owner')
  with check (comida_caseira_current_role() = 'owner');

-- ─────────────────────── view: total por cliente ───────────────────────
-- `security_invoker` faz a view respeitar a RLS de quem consulta, em vez de
-- rodar com os poderes de quem a criou — sem isso ela seria um buraco.

create or replace view comida_caseira_customer_stats
with (security_invoker = true) as
  select c.id,
         c.name,
         c.phone,
         c.phone_digits,
         c.created_at,
         count(o.id) filter (where o.status <> 'cancelled')            as orders_count,
         coalesce(sum(o.total_cents) filter (
           where o.status <> 'cancelled' and o.payment_status = 'paid'
         ), 0)::bigint                                                  as paid_cents,
         coalesce(sum(o.total_cents) filter (where o.status <> 'cancelled'), 0)::bigint
                                                                        as total_cents,
         max(o.created_at) filter (where o.status <> 'cancelled')       as last_order_at
    from comida_caseira_customers c
    left join comida_caseira_orders o on o.customer_id = c.id
   group by c.id;

-- ═══════════════ a única porta do cliente anônimo ═══════════════
--
-- Recebe id do produto e quantidade. Mais nada de dinheiro vem do navegador:
-- preço, custo, taxa e total são lidos e somados aqui dentro.
--
-- Idempotente por `p_checkout_token`: o segundo toque em "Enviar pedido"
-- recebe de volta o MESMO pedido, sem criar outro.

create or replace function comida_caseira_create_order(
  p_checkout_token text,
  p_order_type     text,
  p_payment_method text,
  p_customer_name  text,
  p_customer_phone text,
  p_address        jsonb,
  p_notes          text,
  p_items          jsonb,
  p_change_for_cents integer default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_token       text := nullif(btrim(coalesce(p_checkout_token, '')), '');
  v_type        comida_caseira_order_type;
  v_method      comida_caseira_payment_method;
  v_order       comida_caseira_orders%rowtype;
  v_item        jsonb;
  v_product     comida_caseira_products%rowtype;
  v_qty         integer;
  v_subtotal    integer := 0;
  v_cost        integer := 0;
  v_cost_known  boolean := false;
  v_fee         integer := 0;
  v_min         integer := 0;
  v_total       integer;
  v_customer_id uuid;
  v_phone       text := regexp_replace(coalesce(p_customer_phone, ''), '\D', '', 'g');
  v_name        text := btrim(coalesce(p_customer_name, ''));
  v_district    text := btrim(coalesce(p_address ->> 'bairro', ''));
  v_city        text := btrim(coalesce(p_address ->> 'cidade', ''));
  v_change      integer := nullif(greatest(coalesce(p_change_for_cents, 0), 0), 0);
  v_items_out   jsonb := '[]'::jsonb;
  v_count       integer;
begin
  if v_token is null then
    raise exception 'checkout_token obrigatório' using errcode = '22023';
  end if;

  -- ── idempotência ──
  -- Antes de qualquer coisa: este token já virou pedido? Então devolve ele.
  select * into v_order
    from comida_caseira_orders
   where checkout_token = v_token;

  if found then
    return jsonb_build_object(
      'order_id',           v_order.id,
      'order_number',       v_order.order_number,
      'subtotal_cents',     v_order.subtotal_cents,
      'delivery_fee_cents', v_order.delivery_fee_cents,
      'total_cents',        v_order.total_cents,
      'duplicate',          true
    );
  end if;

  -- ── validação dos parâmetros ──
  if p_order_type not in ('delivery', 'pickup') then
    raise exception 'tipo de pedido inválido' using errcode = '22023';
  end if;
  v_type := p_order_type::comida_caseira_order_type;

  if p_payment_method not in ('pix', 'cash', 'debit', 'credit', 'card') then
    raise exception 'forma de pagamento inválida' using errcode = '22023';
  end if;
  v_method := p_payment_method::comida_caseira_payment_method;

  if jsonb_typeof(p_items) <> 'array' then
    raise exception 'itens inválidos' using errcode = '22023';
  end if;

  v_count := jsonb_array_length(p_items);
  if v_count = 0 then
    raise exception 'pedido sem itens' using errcode = '22023';
  end if;
  if v_count > 60 then
    raise exception 'pedido com itens demais' using errcode = '22023';
  end if;

  if v_type = 'delivery' and coalesce(btrim(p_address ->> 'rua'), '') = '' then
    raise exception 'endereço obrigatório na entrega' using errcode = '22023';
  end if;

  -- ── o pedido em si ──
  insert into comida_caseira_orders (
    order_type, status, payment_method, payment_status,
    subtotal_cents, delivery_fee_cents, total_cents,
    customer_name, customer_phone, address, notes,
    source, checkout_token, change_for_cents
  ) values (
    v_type, 'pending', v_method, 'pending',
    0, 0, 0,
    left(v_name, 120), left(v_phone, 20),
    case when v_type = 'delivery' then p_address else null end,
    left(btrim(coalesce(p_notes, '')), 500),
    'site', v_token,
    case when v_method = 'cash' then v_change else null end
  )
  returning * into v_order;

  -- ── itens: preço e custo vêm da tabela, nunca do navegador ──
  for v_item in select * from jsonb_array_elements(p_items) loop
    v_qty := floor(coalesce((v_item ->> 'quantity')::numeric, 0))::integer;

    if v_qty is null or v_qty < 1 or v_qty > 99 then
      raise exception 'quantidade inválida' using errcode = '22023';
    end if;

    select * into v_product
      from comida_caseira_products
     where id = (v_item ->> 'product_id')
       and active;

    if not found then
      raise exception 'produto indisponível: %', coalesce(v_item ->> 'product_id', '?')
        using errcode = '22023';
    end if;

    v_subtotal := v_subtotal + v_product.price_cents * v_qty;

    if v_product.cost_cents is not null then
      v_cost := v_cost + v_product.cost_cents * v_qty;
      v_cost_known := true;
    end if;

    insert into comida_caseira_order_items (
      order_id, product_id, product_name, quantity,
      unit_price_cents, unit_cost_cents, note, total_cents
    ) values (
      v_order.id, v_product.id, v_product.name, v_qty,
      v_product.price_cents, v_product.cost_cents,
      left(btrim(coalesce(v_item ->> 'note', '')), 200),
      v_product.price_cents * v_qty
    );

    v_items_out := v_items_out || jsonb_build_object(
      'product_id',       v_product.id,
      'name',             v_product.name,
      'quantity',         v_qty,
      'unit_price_cents', v_product.price_cents,
      'total_cents',      v_product.price_cents * v_qty
    );
  end loop;

  -- ── taxa de entrega: da configuração da casa, não do navegador ──
  if v_type = 'delivery' then
    select z.fee_cents, z.min_order_cents into v_fee, v_min
      from comida_caseira_delivery_zones z
     where z.active
       and (
         z.district_norm = comida_caseira_normalize(v_district)
         or (z.district is null and (v_city = '' or comida_caseira_normalize(z.city) = comida_caseira_normalize(v_city)))
       )
     -- bairro específico ganha da regra coringa da cidade
     order by (z.district is not null) desc, z.sort_order
     limit 1;

    v_fee := coalesce(v_fee, 0);
    v_min := coalesce(v_min, 0);

    if v_min > 0 and v_subtotal < v_min then
      raise exception 'pedido abaixo do mínimo de entrega' using errcode = '22023';
    end if;
  end if;

  v_total := v_subtotal + v_fee;

  -- troco menor que o total é engano de leitura ("quanto quero de volta"):
  -- vira "sem troco" em vez de ir errado para a cozinha
  if v_change is not null and v_change < v_total then
    v_change := null;
  end if;

  -- ── cliente: criado ou reaproveitado pelo telefone ──
  if v_phone <> '' then
    insert into comida_caseira_customers (name, phone)
    values (left(v_name, 120), left(v_phone, 20))
    on conflict (phone_digits) do update
      set name = case
            when excluded.name <> '' then excluded.name
            else comida_caseira_customers.name
          end
    returning id into v_customer_id;
  end if;

  update comida_caseira_orders
     set subtotal_cents     = v_subtotal,
         delivery_fee_cents = v_fee,
         total_cents        = v_total,
         cost_cents         = case when v_cost_known then v_cost else null end,
         change_for_cents   = case when v_method = 'cash' then v_change else null end,
         customer_id        = v_customer_id
   where id = v_order.id
   returning * into v_order;

  return jsonb_build_object(
    'order_id',           v_order.id,
    'order_number',       v_order.order_number,
    'subtotal_cents',     v_order.subtotal_cents,
    'delivery_fee_cents', v_order.delivery_fee_cents,
    'total_cents',        v_order.total_cents,
    'items',              v_items_out,
    'duplicate',          false
  );
end;
$$;

revoke all on function comida_caseira_create_order(
  text, text, text, text, text, jsonb, text, jsonb, integer
) from public;
grant execute on function comida_caseira_create_order(
  text, text, text, text, text, jsonb, text, jsonb, integer
) to anon, authenticated;

-- ─────────────── taxa de entrega para a tela do cliente ───────────────
-- O site precisa mostrar a taxa ANTES de fechar o pedido. Esta função
-- devolve só isso — taxa e mínimo do bairro — sem abrir a tabela inteira.

create or replace function comida_caseira_delivery_quote(
  p_district text,
  p_city text default ''
)
returns jsonb
language plpgsql
security definer
stable
set search_path = public, pg_temp
as $$
declare
  v_fee integer;
  v_min integer;
  v_configurado boolean;
begin
  select exists (select 1 from comida_caseira_delivery_zones where active)
    into v_configurado;

  if not v_configurado then
    -- nenhuma área cadastrada: o site fica calado em vez de inventar frete
    return jsonb_build_object('configured', false);
  end if;

  select z.fee_cents, z.min_order_cents into v_fee, v_min
    from comida_caseira_delivery_zones z
   where z.active
     and (
       z.district_norm = comida_caseira_normalize(p_district)
       or (z.district is null and (coalesce(p_city, '') = '' or comida_caseira_normalize(z.city) = comida_caseira_normalize(p_city)))
     )
   order by (z.district is not null) desc, z.sort_order
   limit 1;

  if v_fee is null then
    return jsonb_build_object('configured', true, 'covered', false);
  end if;

  return jsonb_build_object(
    'configured',      true,
    'covered',         true,
    'fee_cents',       v_fee,
    'min_order_cents', v_min
  );
end;
$$;

revoke all on function comida_caseira_delivery_quote(text, text) from public;
grant execute on function comida_caseira_delivery_quote(text, text) to anon, authenticated;
