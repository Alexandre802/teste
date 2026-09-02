import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  AreaEntrega,
  CategoriaDespesa,
  ClienteStats,
  Despesa,
  ItemPedido,
  Lancamento,
  Pedido,
  PedidoComItens,
  ProdutoAdmin,
  Relatorio,
  ResumoCaixa,
  SessaoCaixa,
  MovimentoCaixa,
  UsuarioAdmin,
} from './tipos';

/**
 * Todas as consultas do painel, num arquivo só.
 *
 * As telas não escrevem SQL nem montam `select` — chamam daqui. É o que
 * garante que "pedidos de hoje" signifique a mesma coisa no resumo e na lista,
 * e o que torna possível mudar uma coluna sem caçar `.from(...)` por vinte
 * componentes.
 *
 * Tudo passa pela RLS: o que volta é o que o usuário autenticado pode ver.
 */

/** Erro de consulta com a mensagem que veio do banco, para a tela mostrar. */
function conferir<T>(resultado: { data: T | null; error: { message: string } | null }): T {
  if (resultado.error) throw new Error(resultado.error.message);
  return resultado.data as T;
}

/* ───────────────────────────── relatório ───────────────────────────── */

export async function carregarRelatorio(
  sb: SupabaseClient,
  de: Date,
  ate: Date,
  bucket: 'day' | 'week' | 'month' = 'day',
): Promise<Relatorio> {
  const { data, error } = await sb.rpc('comida_caseira_report', {
    p_from: de.toISOString(),
    p_to: ate.toISOString(),
    p_bucket: bucket,
  });
  if (error) throw new Error(error.message);
  return data as Relatorio;
}

/* ────────────────────────────── pedidos ────────────────────────────── */

export interface FiltroPedidos {
  de?: Date;
  ate?: Date;
  status?: string;
  /** Número do pedido, nome ou telefone. */
  busca?: string;
  limite?: number;
}

export async function carregarPedidos(
  sb: SupabaseClient,
  filtro: FiltroPedidos = {},
): Promise<Pedido[]> {
  let consulta = sb
    .from('comida_caseira_orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(filtro.limite ?? 100);

  if (filtro.de) consulta = consulta.gte('created_at', filtro.de.toISOString());
  if (filtro.ate) consulta = consulta.lt('created_at', filtro.ate.toISOString());
  if (filtro.status) consulta = consulta.eq('status', filtro.status);

  const busca = filtro.busca?.trim();
  if (busca) {
    const digitos = busca.replace(/\D/g, '');
    const partes = [`customer_name.ilike.%${busca}%`];

    // Número do pedido só entra quando a busca é um número: mandar texto para
    // uma coluna bigint faz o Postgres recusar a consulta inteira.
    if (/^\d+$/.test(busca.replace('#', ''))) {
      partes.push(`order_number.eq.${busca.replace('#', '')}`);
    }
    if (digitos.length >= 4) partes.push(`customer_phone.ilike.%${digitos}%`);

    consulta = consulta.or(partes.join(','));
  }

  return conferir(await consulta);
}

export async function carregarPedido(sb: SupabaseClient, id: string): Promise<PedidoComItens> {
  const pedido = conferir<Pedido>(
    await sb.from('comida_caseira_orders').select('*').eq('id', id).single(),
  );
  const itens = conferir<ItemPedido[]>(
    await sb
      .from('comida_caseira_order_items')
      .select('*')
      .eq('order_id', id)
      .order('created_at', { ascending: true }),
  );
  return { ...pedido, itens };
}

export async function mudarStatusPedido(
  sb: SupabaseClient,
  id: string,
  status: string,
  motivo?: string,
): Promise<void> {
  const { error } = await sb.rpc('comida_caseira_set_order_status', {
    p_order_id: id,
    p_status: status,
    p_reason: motivo ?? null,
  });
  if (error) throw new Error(error.message);
}

export async function marcarPedidoPago(
  sb: SupabaseClient,
  id: string,
  forma?: string,
): Promise<void> {
  const { error } = await sb.rpc('comida_caseira_mark_order_paid', {
    p_order_id: id,
    p_method: forma ?? null,
  });
  if (error) throw new Error(error.message);
}

export async function estornarPedido(
  sb: SupabaseClient,
  id: string,
  motivo?: string,
): Promise<void> {
  const { error } = await sb.rpc('comida_caseira_refund_order', {
    p_order_id: id,
    p_reason: motivo ?? null,
  });
  if (error) throw new Error(error.message);
}

/* ─────────────────────── receitas (lançamentos) ─────────────────────── */

export async function carregarLancamentos(
  sb: SupabaseClient,
  de?: Date,
  ate?: Date,
): Promise<Lancamento[]> {
  let consulta = sb
    .from('comida_caseira_entries')
    .select('*')
    .order('occurred_at', { ascending: false })
    .limit(200);

  if (de) consulta = consulta.gte('occurred_at', de.toISOString());
  if (ate) consulta = consulta.lt('occurred_at', ate.toISOString());

  return conferir(await consulta);
}

export interface NovaReceita {
  amount_cents: number;
  method: string;
  description: string;
  notes?: string;
  occurred_at: string;
  order_id?: string | null;
  kind: 'manual' | 'other';
}

export async function criarReceita(sb: SupabaseClient, receita: NovaReceita): Promise<void> {
  const { error } = await sb.from('comida_caseira_entries').insert(receita);
  if (error) throw new Error(error.message);
}

/* ───────────────────────────── despesas ───────────────────────────── */

export async function carregarDespesas(
  sb: SupabaseClient,
  de?: Date,
  ate?: Date,
): Promise<Despesa[]> {
  let consulta = sb
    .from('comida_caseira_expenses')
    .select('*, categoria:comida_caseira_expense_categories(name)')
    .order('occurred_at', { ascending: false })
    .limit(200);

  if (de) consulta = consulta.gte('occurred_at', de.toISOString());
  if (ate) consulta = consulta.lt('occurred_at', ate.toISOString());

  return conferir(await consulta);
}

export async function carregarCategorias(sb: SupabaseClient): Promise<CategoriaDespesa[]> {
  return conferir(
    await sb
      .from('comida_caseira_expense_categories')
      .select('*')
      .eq('active', true)
      .order('sort_order'),
  );
}

export interface NovaDespesa {
  category_id: string | null;
  description: string;
  amount_cents: number;
  method: string;
  supplier?: string;
  notes?: string;
  occurred_at: string;
}

export async function criarDespesa(sb: SupabaseClient, despesa: NovaDespesa): Promise<void> {
  const { error } = await sb.from('comida_caseira_expenses').insert(despesa);
  if (error) throw new Error(error.message);
}

export async function apagarDespesa(sb: SupabaseClient, id: string): Promise<void> {
  const { error } = await sb.from('comida_caseira_expenses').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

/* ───────────────────────────── produtos ───────────────────────────── */

export async function carregarProdutos(sb: SupabaseClient): Promise<ProdutoAdmin[]> {
  return conferir(await sb.from('comida_caseira_products').select('*').order('name'));
}

export async function salvarCustoProduto(
  sb: SupabaseClient,
  id: string,
  custoCentavos: number | null,
): Promise<void> {
  const { error } = await sb
    .from('comida_caseira_products')
    .update({ cost_cents: custoCentavos })
    .eq('id', id);
  if (error) throw new Error(error.message);
}

/**
 * Sincroniza o cardápio do site com a tabela de produtos.
 *
 * `upsert` com `ignoreDuplicates: false` atualiza nome, categoria e preço, e
 * NÃO toca em `cost_cents` — o custo é conhecimento da casa, não do catálogo,
 * e seria apagado a cada sincronização se entrasse aqui.
 */
export async function sincronizarProdutos(
  sb: SupabaseClient,
  produtos: { id: string; name: string; category: string; price_cents: number; active: boolean }[],
): Promise<number> {
  const { error } = await sb
    .from('comida_caseira_products')
    .upsert(produtos, { onConflict: 'id', ignoreDuplicates: false });
  if (error) throw new Error(error.message);
  return produtos.length;
}

/* ───────────────────────────── clientes ───────────────────────────── */

export async function carregarClientes(sb: SupabaseClient): Promise<ClienteStats[]> {
  return conferir(
    await sb
      .from('comida_caseira_customer_stats')
      .select('*')
      .order('last_order_at', { ascending: false, nullsFirst: false })
      .limit(300),
  );
}

/* ──────────────────────────── configurações ──────────────────────────── */

export async function carregarConfiguracao<T>(
  sb: SupabaseClient,
  chave: string,
): Promise<T | null> {
  const { data, error } = await sb
    .from('comida_caseira_settings')
    .select('value')
    .eq('key', chave)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data?.value as T) ?? null;
}

export async function salvarConfiguracao(
  sb: SupabaseClient,
  chave: string,
  valor: unknown,
): Promise<void> {
  const { error } = await sb
    .from('comida_caseira_settings')
    .upsert({ key: chave, value: valor, updated_at: new Date().toISOString() }, { onConflict: 'key' });
  if (error) throw new Error(error.message);
}

export async function carregarAreasEntrega(sb: SupabaseClient): Promise<AreaEntrega[]> {
  return conferir(
    await sb.from('comida_caseira_delivery_zones').select('*').order('sort_order').order('city'),
  );
}

export async function salvarAreaEntrega(
  sb: SupabaseClient,
  area: Partial<AreaEntrega>,
): Promise<void> {
  const { error } = area.id
    ? await sb.from('comida_caseira_delivery_zones').update(area).eq('id', area.id)
    : await sb.from('comida_caseira_delivery_zones').insert(area);
  if (error) throw new Error(error.message);
}

export async function apagarAreaEntrega(sb: SupabaseClient, id: string): Promise<void> {
  const { error } = await sb.from('comida_caseira_delivery_zones').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function carregarUsuarios(sb: SupabaseClient): Promise<UsuarioAdmin[]> {
  return conferir(await sb.from('comida_caseira_users').select('*').order('name'));
}

/* ─────────────────────────────── caixa ─────────────────────────────── */

export async function caixaAberto(sb: SupabaseClient): Promise<SessaoCaixa | null> {
  const { data, error } = await sb
    .from('comida_caseira_cash_sessions')
    .select('*')
    .is('closed_at', null)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as SessaoCaixa) ?? null;
}

export async function historicoCaixa(sb: SupabaseClient): Promise<SessaoCaixa[]> {
  return conferir(
    await sb
      .from('comida_caseira_cash_sessions')
      .select('*')
      .not('closed_at', 'is', null)
      .order('closed_at', { ascending: false })
      .limit(30),
  );
}

export async function resumoCaixa(sb: SupabaseClient, sessaoId: string): Promise<ResumoCaixa> {
  const { data, error } = await sb.rpc('comida_caseira_cash_session_preview', {
    p_session_id: sessaoId,
  });
  if (error) throw new Error(error.message);
  return data as ResumoCaixa;
}

export async function abrirCaixa(
  sb: SupabaseClient,
  aberturaCentavos: number,
  observacao = '',
): Promise<void> {
  const { error } = await sb.rpc('comida_caseira_open_cash_session', {
    p_opening_cents: aberturaCentavos,
    p_notes: observacao,
  });
  if (error) throw new Error(error.message);
}

export async function fecharCaixa(
  sb: SupabaseClient,
  sessaoId: string,
  contadoCentavos: number,
  observacao = '',
): Promise<ResumoCaixa> {
  const { data, error } = await sb.rpc('comida_caseira_close_cash_session', {
    p_session_id: sessaoId,
    p_counted_cents: contadoCentavos,
    p_notes: observacao,
  });
  if (error) throw new Error(error.message);
  return data as ResumoCaixa;
}

export async function carregarMovimentosCaixa(
  sb: SupabaseClient,
  sessaoId: string,
): Promise<MovimentoCaixa[]> {
  return conferir(
    await sb
      .from('comida_caseira_cash_movements')
      .select('*')
      .eq('session_id', sessaoId)
      .order('created_at', { ascending: false }),
  );
}

export async function registrarMovimentoCaixa(
  sb: SupabaseClient,
  movimento: { session_id: string; type: 'sangria' | 'suprimento'; amount_cents: number; reason: string },
): Promise<void> {
  const { error } = await sb.from('comida_caseira_cash_movements').insert(movimento);
  if (error) throw new Error(error.message);
}
