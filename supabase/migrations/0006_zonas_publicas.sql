-- ===========================================================================
-- 0006: a taxa de entrega que o site mostra vem da mesma configuracao que o
-- servidor usa para cobrar. Nao existem duas taxas.
-- ===========================================================================
-- A tabela de zonas continua fechada para o anonimo. O que abre e apenas esta
-- funcao, que devolve o que o cliente ja veria na tela de qualquer forma:
-- cidade, bairro, taxa, pedido minimo e prazo. Nada de custo ou faturamento.

create or replace function comida_caseira_zonas_publicas()
returns table (
  cidade text,
  bairro text,
  fee_cents bigint,
  pedido_minimo_cents bigint,
  prazo_minutos integer
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select cidade, bairro, fee_cents, pedido_minimo_cents, prazo_minutos
  from comida_caseira_delivery_zones
  where ativo
  order by cidade, bairro;
$$;

comment on function comida_caseira_zonas_publicas is
  'Area de entrega e taxa, para o site publico. So dado que o cliente ja ve.';

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    execute 'grant execute on function comida_caseira_zonas_publicas() to anon';
  end if;
end $$;
