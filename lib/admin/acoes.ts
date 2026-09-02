"use server";

import { revalidatePath } from "next/cache";

import { criarClienteServidor, usuarioDoPainel } from "@/lib/supabase/server";
import type { FormaPagamentoDb, StatusPedido } from "@/lib/admin/tipos";

/**
 * Ações do painel. Toda uma delas confere o usuário no servidor antes de
 * escrever — a RLS já barraria, mas a checagem aqui devolve uma mensagem que
 * a tela consegue mostrar, em vez de um erro cru do banco.
 */

export type Resultado = { ok: true } | { ok: false; erro: string };

async function contexto() {
  const usuario = await usuarioDoPainel();
  if (!usuario) return null;
  const supabase = await criarClienteServidor();
  if (!supabase) return null;
  return { usuario, supabase };
}

const SEM_ACESSO: Resultado = {
  ok: false,
  erro: "Sua sessão expirou. Entre de novo para continuar.",
};

/** Muda o status do pedido. O banco carimba a data e barra o que não pode. */
export async function mudarStatusPedido(
  id: string,
  status: StatusPedido,
): Promise<Resultado> {
  const ctx = await contexto();
  if (!ctx) return SEM_ACESSO;

  const { error } = await ctx.supabase
    .from("comida_caseira_orders")
    .update({ status })
    .eq("id", id);

  if (error) return { ok: false, erro: error.message };

  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${id}`);
  revalidatePath("/admin");
  return { ok: true };
}

/** Marca o pedido como pago. O gatilho do banco lança a receita sozinho. */
export async function marcarPago(id: string): Promise<Resultado> {
  const ctx = await contexto();
  if (!ctx) return SEM_ACESSO;

  const { error } = await ctx.supabase
    .from("comida_caseira_orders")
    .update({ payment_status: "paid" })
    .eq("id", id);

  if (error) return { ok: false, erro: error.message };

  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${id}`);
  revalidatePath("/admin");
  revalidatePath("/admin/receitas");
  return { ok: true };
}

/** Cancela o pedido. Se já estava pago, registra o reembolso junto. */
export async function cancelarPedido(
  id: string,
  motivo: string,
  reembolsar: boolean,
): Promise<Resultado> {
  const ctx = await contexto();
  if (!ctx) return SEM_ACESSO;

  const { error } = await ctx.supabase
    .from("comida_caseira_orders")
    .update({
      status: "cancelled",
      cancel_reason: motivo.trim().slice(0, 300) || null,
      ...(reembolsar ? { payment_status: "refunded" as const } : {}),
    })
    .eq("id", id);

  if (error) return { ok: false, erro: error.message };

  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${id}`);
  revalidatePath("/admin");
  revalidatePath("/admin/receitas");
  return { ok: true };
}

export async function registrarReceita(entrada: {
  tipo: "manual" | "outros";
  descricao: string;
  amount_cents: number;
  payment_method: FormaPagamentoDb;
  ocorrido_em: string;
  observacao: string;
}): Promise<Resultado> {
  const ctx = await contexto();
  if (!ctx) return SEM_ACESSO;

  if (!entrada.descricao.trim()) {
    return { ok: false, erro: "Escreva uma descrição para a receita." };
  }
  if (!Number.isInteger(entrada.amount_cents) || entrada.amount_cents <= 0) {
    return { ok: false, erro: "Informe um valor maior que zero." };
  }

  const { error } = await ctx.supabase.from("comida_caseira_revenues").insert({
    tipo: entrada.tipo,
    descricao: entrada.descricao.trim().slice(0, 200),
    amount_cents: entrada.amount_cents,
    payment_method: entrada.payment_method,
    ocorrido_em: entrada.ocorrido_em,
    observacao: entrada.observacao.trim().slice(0, 300),
    created_by: ctx.usuario.id,
  });

  if (error) return { ok: false, erro: error.message };

  revalidatePath("/admin/receitas");
  revalidatePath("/admin");
  return { ok: true };
}

export async function registrarDespesa(entrada: {
  category_id: string | null;
  descricao: string;
  amount_cents: number;
  payment_method: FormaPagamentoDb;
  ocorrido_em: string;
  fornecedor: string;
  observacao: string;
}): Promise<Resultado> {
  const ctx = await contexto();
  if (!ctx) return SEM_ACESSO;

  if (!entrada.descricao.trim()) {
    return { ok: false, erro: "Escreva uma descrição para a despesa." };
  }
  if (!Number.isInteger(entrada.amount_cents) || entrada.amount_cents <= 0) {
    return { ok: false, erro: "Informe um valor maior que zero." };
  }

  const { error } = await ctx.supabase.from("comida_caseira_expenses").insert({
    category_id: entrada.category_id,
    descricao: entrada.descricao.trim().slice(0, 200),
    amount_cents: entrada.amount_cents,
    payment_method: entrada.payment_method,
    ocorrido_em: entrada.ocorrido_em,
    fornecedor: entrada.fornecedor.trim().slice(0, 120),
    observacao: entrada.observacao.trim().slice(0, 300),
    created_by: ctx.usuario.id,
  });

  if (error) return { ok: false, erro: error.message };

  revalidatePath("/admin/despesas");
  revalidatePath("/admin");
  return { ok: true };
}

export async function apagarDespesa(id: string): Promise<Resultado> {
  const ctx = await contexto();
  if (!ctx) return SEM_ACESSO;
  if (ctx.usuario.role === "cashier") {
    return {
      ok: false,
      erro: "Só a proprietária ou a gerente podem apagar um lançamento.",
    };
  }

  const { error } = await ctx.supabase
    .from("comida_caseira_expenses")
    .delete()
    .eq("id", id);

  if (error) return { ok: false, erro: error.message };

  revalidatePath("/admin/despesas");
  revalidatePath("/admin");
  return { ok: true };
}

/** Custo do produto. Nunca sai daqui para o site público. */
export async function salvarCustoProduto(
  id: string,
  cost_cents: number,
): Promise<Resultado> {
  const ctx = await contexto();
  if (!ctx) return SEM_ACESSO;

  if (!Number.isInteger(cost_cents) || cost_cents < 0) {
    return { ok: false, erro: "Informe um custo válido." };
  }

  const { error } = await ctx.supabase
    .from("comida_caseira_products")
    .update({ cost_cents, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { ok: false, erro: error.message };

  revalidatePath("/admin/produtos");
  return { ok: true };
}

/** Taxa da região. É esta a taxa que o site cobra — não existe uma segunda. */
export async function salvarZona(
  id: string,
  campos: {
    fee_cents: number | null;
    pedido_minimo_cents: number | null;
    prazo_minutos: number | null;
  },
): Promise<Resultado> {
  const ctx = await contexto();
  if (!ctx) return SEM_ACESSO;

  const { error } = await ctx.supabase
    .from("comida_caseira_delivery_zones")
    .update(campos)
    .eq("id", id);

  if (error) return { ok: false, erro: error.message };

  revalidatePath("/admin/configuracoes");
  return { ok: true };
}

export async function abrirCaixa(abertura_cents: number): Promise<Resultado> {
  const ctx = await contexto();
  if (!ctx) return SEM_ACESSO;

  const { error } = await ctx.supabase
    .from("comida_caseira_cash_sessions")
    .insert({ abertura_cents, aberto_por: ctx.usuario.id });

  if (error) {
    // O índice único do banco garante um caixa aberto por vez.
    if (error.code === "23505") {
      return { ok: false, erro: "Já existe um caixa aberto." };
    }
    return { ok: false, erro: error.message };
  }

  revalidatePath("/admin/caixa");
  return { ok: true };
}

export async function fecharCaixa(
  id: string,
  contado_cents: number,
  observacao: string,
): Promise<Resultado> {
  const ctx = await contexto();
  if (!ctx) return SEM_ACESSO;

  const { error } = await ctx.supabase
    .from("comida_caseira_cash_sessions")
    .update({
      contado_cents,
      observacao: observacao.trim().slice(0, 300),
      fechado_em: new Date().toISOString(),
      fechado_por: ctx.usuario.id,
    })
    .eq("id", id);

  if (error) return { ok: false, erro: error.message };

  revalidatePath("/admin/caixa");
  return { ok: true };
}

export async function registrarMovimentoCaixa(
  session_id: string,
  kind: "sangria" | "suprimento",
  amount_cents: number,
  motivo: string,
): Promise<Resultado> {
  const ctx = await contexto();
  if (!ctx) return SEM_ACESSO;

  if (!Number.isInteger(amount_cents) || amount_cents <= 0) {
    return { ok: false, erro: "Informe um valor maior que zero." };
  }

  const { error } = await ctx.supabase
    .from("comida_caseira_cash_movements")
    .insert({
      session_id,
      kind,
      amount_cents,
      motivo: motivo.trim().slice(0, 200),
      created_by: ctx.usuario.id,
    });

  if (error) return { ok: false, erro: error.message };

  revalidatePath("/admin/caixa");
  return { ok: true };
}

export async function salvarDadosDaCasa(campos: {
  telefone: string;
  whatsapp: string;
  instagram: string;
  endereco: string;
  som_novo_pedido: boolean;
}): Promise<Resultado> {
  const ctx = await contexto();
  if (!ctx) return SEM_ACESSO;

  const { error } = await ctx.supabase
    .from("comida_caseira_settings")
    .update({ ...campos, updated_at: new Date().toISOString() })
    .eq("id", true);

  if (error) return { ok: false, erro: error.message };

  revalidatePath("/admin/configuracoes");
  return { ok: true };
}
