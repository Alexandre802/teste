-- Fotos de produto: bucket público de leitura, escrita só do dono.
insert into storage.buckets (id, name, public)
values ('produtos', 'produtos', true)
on conflict (id) do nothing;

drop policy if exists "produtos leitura publica"  on storage.objects;
drop policy if exists "produtos escrita do dono"  on storage.objects;
drop policy if exists "produtos update do dono"   on storage.objects;
drop policy if exists "produtos delete do dono"   on storage.objects;

create policy "produtos leitura publica" on storage.objects
  for select using (bucket_id = 'produtos');

-- Cada arquivo vai para uma pasta com o id do usuário: produtos/<uid>/<arquivo>.
create policy "produtos escrita do dono" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'produtos' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "produtos update do dono" on storage.objects
  for update to authenticated
  using (bucket_id = 'produtos' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "produtos delete do dono" on storage.objects
  for delete to authenticated
  using (bucket_id = 'produtos' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- Tempo real: o painel de outro aparelho recebe a venda sem refresh.
do $$
declare
  t text;
begin
  foreach t in array array[
    'products', 'product_variants', 'inventory', 'sales', 'sale_items',
    'inventory_movements', 'expenses', 'suppliers', 'settings', 'daily_closings'
  ]
  loop
    begin
      execute format('alter publication supabase_realtime add table public.%I', t);
    exception when duplicate_object then
      null;
    end;
  end loop;
end;
$$;
