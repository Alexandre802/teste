import type { Despesa, Pedido, Receita } from "@/lib/admin/tipos";
import { ROTULO_FORMA, ROTULO_PAGAMENTO, ROTULO_STATUS, ROTULO_TIPO } from "@/lib/admin/tipos";
import { formatarData, formatarHora } from "@/lib/admin/periodo";

/**
 * Exportação em CSV para abrir no Excel brasileiro.
 *
 * Duas escolhas que parecem detalhe e não são: separador ponto e vírgula e
 * valor com vírgula decimal. Com vírgula como separador, o Excel em português
 * joga tudo numa coluna só e o número vira texto.
 */

export type LinhaCsv = Record<string, string>;

/** Valor em reais no formato que o Excel brasileiro entende como número. */
function reais(centavos: number): string {
  return (centavos / 100).toFixed(2).replace(".", ",");
}

function escapar(valor: string): string {
  const limpo = valor.replace(/\r?\n/g, " ");
  return /[";]/.test(limpo) ? `"${limpo.replace(/"/g, '""')}"` : limpo;
}

export function montarCsv(linhas: LinhaCsv[]): string {
  if (linhas.length === 0) return "";
  const colunas = Object.keys(linhas[0]);
  const corpo = linhas.map((linha) =>
    colunas.map((coluna) => escapar(linha[coluna] ?? "")).join(";"),
  );
  return [colunas.join(";"), ...corpo].join("\r\n");
}

export function linhasDePedidos(pedidos: Pedido[]): LinhaCsv[] {
  return pedidos.map((pedido) => ({
    Pedido: String(pedido.order_number),
    Data: formatarData(pedido.created_at),
    Hora: formatarHora(pedido.created_at),
    Cliente: pedido.customer_name,
    Telefone: pedido.customer_phone,
    Tipo: ROTULO_TIPO[pedido.order_type],
    Status: ROTULO_STATUS[pedido.status],
    Pagamento: ROTULO_FORMA[pedido.payment_method],
    "Situação do pagamento": ROTULO_PAGAMENTO[pedido.payment_status],
    Subtotal: reais(pedido.subtotal_cents),
    Entrega:
      pedido.delivery_fee_cents === null
        ? "a combinar"
        : reais(pedido.delivery_fee_cents),
    Total: reais(pedido.total_cents),
    Custo: reais(pedido.cost_cents),
    Observação: pedido.notes,
  }));
}

export function linhasDeReceitas(receitas: Receita[]): LinhaCsv[] {
  return receitas.map((receita) => ({
    Data: receita.ocorrido_em.split("-").reverse().join("/"),
    Descrição: receita.descricao,
    Tipo: receita.tipo === "order" ? "Pedido" : "Manual",
    Pagamento: ROTULO_FORMA[receita.payment_method],
    Valor: reais(receita.amount_cents),
    Observação: receita.observacao,
  }));
}

export function linhasDeDespesas(
  despesas: Despesa[],
  categorias: Map<string, string>,
): LinhaCsv[] {
  return despesas.map((despesa) => ({
    Data: despesa.ocorrido_em.split("-").reverse().join("/"),
    Categoria: despesa.category_id
      ? (categorias.get(despesa.category_id) ?? "")
      : "",
    Descrição: despesa.descricao,
    Fornecedor: despesa.fornecedor,
    Pagamento: ROTULO_FORMA[despesa.payment_method],
    Valor: reais(despesa.amount_cents),
    Observação: despesa.observacao,
  }));
}
