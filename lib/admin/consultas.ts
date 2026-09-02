import "server-only";

import { criarClienteServidor } from "@/lib/supabase/server";
import type { Periodo } from "@/lib/admin/periodo";
import type {
  CategoriaDespesa,
  ClienteAdmin,
  Despesa,
  ItemPedido,
  Pedido,
  ProdutoAdmin,
  Receita,
  ResumoCaixa,
  ResumoPeriodo,
  SessaoCaixa,
  ZonaEntrega,
} from "@/lib/admin/tipos";
import { RESUMO_VAZIO } from "@/lib/admin/tipos";

/**
 * Leitura do painel, sempre no servidor.
 *
 * Toda consulta passa pela sessão do usuário, então a RLS decide o que volta.
 * Não existe chave de serviço aqui: se o painel conseguisse ignorar a RLS,
 * um erro de rota exporia o financeiro inteiro.
 */

async function cliente() {
  const supabase = await criarClienteServidor();
  if (!supabase) throw new Error("Supabase não configurado");
  return supabase;
}

export async function buscarResumo(periodo: Periodo): Promise<ResumoPeriodo> {
  const supabase = await cliente();
  const { data, error } = await supabase.rpc("comida_caseira_resumo", {
    p_de: periodo.de,
    p_ate: periodo.ate,
  });
  if (error) throw error;
  return { ...RESUMO_VAZIO, ...(data as ResumoPeriodo) };
}

export async function buscarVendasPorDia(periodo: Periodo) {
  const supabase = await cliente();
  const { data, error } = await supabase.rpc("comida_caseira_vendas_por_dia", {
    p_de: periodo.de,
    p_ate: periodo.ate,
  });
  if (error) throw error;
  return (data ?? []) as {
    dia: string;
    pedidos: number;
    faturamento_cents: number;
  }[];
}

export async function buscarPorFormaPagamento(periodo: Periodo) {
  const supabase = await cliente();
  const { data, error } = await supabase.rpc(
    "comida_caseira_por_forma_pagamento",
    { p_de: periodo.de, p_ate: periodo.ate },
  );
  if (error) throw error;
  return (data ?? []) as {
    forma: "pix" | "cash" | "debit" | "credit";
    pedidos: number;
    valor_cents: number;
  }[];
}

export async function buscarMaisVendidos(periodo: Periodo, limite = 10) {
  const supabase = await cliente();
  const { data, error } = await supabase.rpc("comida_caseira_mais_vendidos", {
    p_de: periodo.de,
    p_ate: periodo.ate,
    p_limite: limite,
  });
  if (error) throw error;
  return (data ?? []) as {
    product_id: string;
    produto: string;
    quantidade: number;
    faturamento_cents: number;
    custo_cents: number;
  }[];
}

export async function buscarPorHora(periodo: Periodo) {
  const supabase = await cliente();
  const { data, error } = await supabase.rpc("comida_caseira_por_hora", {
    p_de: periodo.de,
    p_ate: periodo.ate,
  });
  if (error) throw error;
  return (data ?? []) as {
    hora: number;
    pedidos: number;
    faturamento_cents: number;
  }[];
}

export async function buscarEntregaXRetirada(periodo: Periodo) {
  const supabase = await cliente();
  const { data, error } = await supabase.rpc(
    "comida_caseira_entrega_x_retirada",
    { p_de: periodo.de, p_ate: periodo.ate },
  );
  if (error) throw error;
  return (data ?? []) as {
    tipo: "delivery" | "pickup";
    pedidos: number;
    faturamento_cents: number;
  }[];
}

export async function buscarPedidos(opcoes: {
  periodo?: Periodo;
  busca?: string;
  limite?: number;
}): Promise<Pedido[]> {
  const supabase = await cliente();
  let consulta = supabase
    .from("comida_caseira_orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(opcoes.limite ?? 100);

  if (opcoes.periodo) {
    // O banco guarda timestamptz; o recorte usa o dia no fuso da casa.
    consulta = consulta
      .gte("created_at", `${opcoes.periodo.de}T00:00:00-03:00`)
      .lte("created_at", `${opcoes.periodo.ate}T23:59:59-03:00`);
  }

  const busca = opcoes.busca?.trim();
  if (busca) {
    const numero = Number(busca.replace(/\D/g, ""));
    const partes = [
      `customer_name.ilike.%${busca}%`,
      `customer_phone.ilike.%${busca}%`,
    ];
    if (Number.isFinite(numero) && numero > 0) {
      partes.push(`order_number.eq.${numero}`);
    }
    consulta = consulta.or(partes.join(","));
  }

  const { data, error } = await consulta;
  if (error) throw error;
  return (data ?? []) as Pedido[];
}

export async function buscarPedido(id: string) {
  const supabase = await cliente();
  const { data: pedido, error } = await supabase
    .from("comida_caseira_orders")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!pedido) return null;

  const { data: itens, error: erroItens } = await supabase
    .from("comida_caseira_order_items")
    .select("*")
    .eq("order_id", id);
  if (erroItens) throw erroItens;

  return { pedido: pedido as Pedido, itens: (itens ?? []) as ItemPedido[] };
}

export async function buscarReceitas(periodo: Periodo): Promise<Receita[]> {
  const supabase = await cliente();
  const { data, error } = await supabase
    .from("comida_caseira_revenues")
    .select("*")
    .gte("ocorrido_em", periodo.de)
    .lte("ocorrido_em", periodo.ate)
    .order("ocorrido_em", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(300);
  if (error) throw error;
  return (data ?? []) as Receita[];
}

export async function buscarDespesas(periodo: Periodo): Promise<Despesa[]> {
  const supabase = await cliente();
  const { data, error } = await supabase
    .from("comida_caseira_expenses")
    .select("*")
    .gte("ocorrido_em", periodo.de)
    .lte("ocorrido_em", periodo.ate)
    .order("ocorrido_em", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(300);
  if (error) throw error;
  return (data ?? []) as Despesa[];
}

export async function buscarCategoriasDespesa(): Promise<CategoriaDespesa[]> {
  const supabase = await cliente();
  const { data, error } = await supabase
    .from("comida_caseira_expense_categories")
    .select("*")
    .eq("ativo", true)
    .order("ordem");
  if (error) throw error;
  return (data ?? []) as CategoriaDespesa[];
}

export async function buscarProdutos(): Promise<ProdutoAdmin[]> {
  const supabase = await cliente();
  const { data, error } = await supabase
    .from("comida_caseira_products")
    .select("*")
    .order("categoria")
    .order("nome");
  if (error) throw error;
  return (data ?? []) as ProdutoAdmin[];
}

export async function buscarClientes(): Promise<ClienteAdmin[]> {
  const supabase = await cliente();
  const { data, error } = await supabase
    .from("comida_caseira_customers")
    .select("*")
    .order("ultimo_pedido_at", { ascending: false, nullsFirst: false })
    .limit(200);
  if (error) throw error;
  return (data ?? []) as ClienteAdmin[];
}

export async function buscarZonas(): Promise<ZonaEntrega[]> {
  const supabase = await cliente();
  const { data, error } = await supabase
    .from("comida_caseira_delivery_zones")
    .select("*")
    .order("cidade")
    .order("bairro");
  if (error) throw error;
  return (data ?? []) as ZonaEntrega[];
}

export async function buscarCaixaAberto(): Promise<SessaoCaixa | null> {
  const supabase = await cliente();
  const { data, error } = await supabase
    .from("comida_caseira_cash_sessions")
    .select("*")
    .is("fechado_em", null)
    .maybeSingle();
  if (error) throw error;
  return (data as SessaoCaixa) ?? null;
}

export async function buscarCaixasFechados(): Promise<SessaoCaixa[]> {
  const supabase = await cliente();
  const { data, error } = await supabase
    .from("comida_caseira_cash_sessions")
    .select("*")
    .not("fechado_em", "is", null)
    .order("fechado_em", { ascending: false })
    .limit(30);
  if (error) throw error;
  return (data ?? []) as SessaoCaixa[];
}

export async function buscarResumoCaixa(sessao: string): Promise<ResumoCaixa> {
  const supabase = await cliente();
  const { data, error } = await supabase.rpc("comida_caseira_resumo_caixa", {
    p_session: sessao,
  });
  if (error) throw error;
  return data as ResumoCaixa;
}
