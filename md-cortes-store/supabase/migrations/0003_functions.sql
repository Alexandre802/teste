-- Operações que precisam ser atômicas e reexecutáveis.
--
-- Reexecutáveis porque o app funciona offline: uma venda registrada sem
-- internet fica numa fila local e é reenviada depois. Se o reenvio acontecer
-- duas vezes (aba duplicada, retry após timeout), o id gerado no cliente faz
-- a segunda chamada virar um no-op em vez de baixar o estoque de novo.
--
-- security invoker: as políticas de RLS continuam valendo dentro da função.

-- ------------------------------------------------------- registrar venda ----
create or replace function public.register_sale(p_sale jsonb)
returns public.sales
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_uid    uuid := auth.uid();
  v_id     uuid := (p_sale ->> 'id')::uuid;
  v_sale   public.sales;
  v_item   jsonb;
  v_total  integer := 0;
  v_cost   integer := 0;
  v_sold   timestamptz := coalesce((p_sale ->> 'sold_at')::timestamptz, now());
begin
  if v_uid is null then
    raise exception 'sem sessão';
  end if;
  if v_id is null then
    raise exception 'venda sem id';
  end if;

  select * into v_sale from public.sales where id = v_id;
  if found then
    return v_sale;                              -- reenvio da mesma venda
  end if;

  for v_item in select * from jsonb_array_elements(p_sale -> 'items') loop
    v_total := v_total + (v_item ->> 'unit_price_cents')::int * (v_item ->> 'quantity')::int;
    v_cost  := v_cost  + (v_item ->> 'unit_cost_cents')::int  * (v_item ->> 'quantity')::int;
  end loop;

  insert into public.sales (id, user_id, total_cents, cost_cents, payment_method, status, note, sold_at)
  values (v_id, v_uid, v_total, v_cost, p_sale ->> 'payment_method', 'concluida', p_sale ->> 'note', v_sold)
  returning * into v_sale;

  for v_item in select * from jsonb_array_elements(p_sale -> 'items') loop
    insert into public.sale_items (
      id, user_id, sale_id, variant_id, product_id, product_name, color_name,
      size, quantity, unit_price_cents, unit_cost_cents
    )
    values (
      (v_item ->> 'id')::uuid, v_uid, v_id, (v_item ->> 'variant_id')::uuid,
      (v_item ->> 'product_id')::uuid, v_item ->> 'product_name', v_item ->> 'color_name',
      v_item ->> 'size', (v_item ->> 'quantity')::int,
      (v_item ->> 'unit_price_cents')::int, (v_item ->> 'unit_cost_cents')::int
    );

    update public.inventory
       set quantity   = greatest(0, quantity - (v_item ->> 'quantity')::int),
           updated_at = now()
     where variant_id = (v_item ->> 'variant_id')::uuid
       and size       = v_item ->> 'size';

    insert into public.inventory_movements (id, user_id, variant_id, size, delta, kind, unit_cost_cents, sale_id, created_at)
    values (
      gen_random_uuid(), v_uid, (v_item ->> 'variant_id')::uuid, v_item ->> 'size',
      -(v_item ->> 'quantity')::int, 'venda', (v_item ->> 'unit_cost_cents')::int, v_id, v_sold
    );
  end loop;

  update public.settings
     set last_sale_at = greatest(coalesce(last_sale_at, v_sold), v_sold),
         updated_at   = now()
   where user_id = v_uid;

  return v_sale;
end;
$$;

-- -------------------------------------------------------- cancelar venda ----
create or replace function public.cancel_sale(p_sale_id uuid)
returns public.sales
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_uid  uuid := auth.uid();
  v_sale public.sales;
  v_item public.sale_items;
begin
  select * into v_sale from public.sales where id = p_sale_id for update;
  if not found then
    raise exception 'venda não encontrada';
  end if;
  if v_sale.status = 'cancelada' then
    return v_sale;                              -- já cancelada, nada a repor
  end if;

  for v_item in select * from public.sale_items where sale_id = p_sale_id loop
    if v_item.variant_id is not null then
      update public.inventory
         set quantity = quantity + v_item.quantity, updated_at = now()
       where variant_id = v_item.variant_id and size = v_item.size;

      insert into public.inventory_movements (id, user_id, variant_id, size, delta, kind, sale_id, note)
      values (gen_random_uuid(), v_uid, v_item.variant_id, v_item.size, v_item.quantity,
              'cancelamento', p_sale_id, 'Venda cancelada');
    end if;
  end loop;

  update public.sales
     set status = 'cancelada', cancelled_at = now()
   where id = p_sale_id
  returning * into v_sale;

  update public.settings set last_stock_update_at = now(), updated_at = now() where user_id = v_uid;
  return v_sale;
end;
$$;

-- --------------------------------------------- entrada / ajuste de estoque ---
-- Recebe um lote de movimentações. Cada linha traz o id gerado no cliente, e
-- o estoque só é alterado quando a linha entra de fato — reenviar o mesmo
-- lote não soma duas vezes.
create or replace function public.apply_movements(p_movements jsonb)
returns integer
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_uid     uuid := auth.uid();
  v_mov     jsonb;
  v_id      uuid;
  v_applied integer := 0;
begin
  if v_uid is null then
    raise exception 'sem sessão';
  end if;

  for v_mov in select * from jsonb_array_elements(p_movements) loop
    insert into public.inventory_movements (
      id, user_id, variant_id, size, delta, kind, unit_cost_cents, supplier_id, note, created_at
    )
    values (
      (v_mov ->> 'id')::uuid, v_uid, (v_mov ->> 'variant_id')::uuid, v_mov ->> 'size',
      (v_mov ->> 'delta')::int, v_mov ->> 'kind', (v_mov ->> 'unit_cost_cents')::int,
      (v_mov ->> 'supplier_id')::uuid, v_mov ->> 'note',
      coalesce((v_mov ->> 'created_at')::timestamptz, now())
    )
    on conflict (id) do nothing
    returning id into v_id;

    if v_id is not null then
      insert into public.inventory (user_id, variant_id, size, quantity, position)
      values (v_uid, (v_mov ->> 'variant_id')::uuid, v_mov ->> 'size',
              greatest(0, (v_mov ->> 'delta')::int), coalesce((v_mov ->> 'position')::int, 0))
      on conflict (variant_id, size) do update
        set quantity   = greatest(0, public.inventory.quantity + (v_mov ->> 'delta')::int),
            updated_at = now();
      v_applied := v_applied + 1;
    end if;
    v_id := null;
  end loop;

  update public.settings set last_stock_update_at = now(), updated_at = now() where user_id = v_uid;
  return v_applied;
end;
$$;
