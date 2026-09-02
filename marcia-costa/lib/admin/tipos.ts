/** Tipos das tabelas do fluxo de caixa, espelhando supabase/migrations. */

export type StatusPedido =
  | "pending"
  | "confirmed"
  | "preparing"
  | "out_for_delivery"
  | "completed"
  | "cancelled";

export type StatusPagamento = "pending" | "paid" | "refunded" | "cancelled";

export type FormaPagamentoDb = "pix" | "cash" | "debit" | "credit";

export type TipoPedidoDb = "delivery" | "pickup";

export type PapelUsuario = "owner" | "manager" | "cashier";

export const ROTULO_STATUS: Record<StatusPedido, string> = {
  pending: "Pendente",
  confirmed: "Confirmado",
  preparing: "Preparando",
  out_for_delivery: "Saiu para entrega",
  completed: "Concluído",
  cancelled: "Cancelado",
};

export const ROTULO_PAGAMENTO: Record<StatusPagamento, string> = {
  pending: "A receber",
  paid: "Pago",
  refunded: "Reembolsado",
  cancelled: "Cancelado",
};

export const ROTULO_FORMA: Record<FormaPagamentoDb, string> = {
  pix: "Pix",
  cash: "Dinheiro",
  debit: "Débito",
  credit: "Crédito",
};

export const ROTULO_TIPO: Record<TipoPedidoDb, string> = {
  delivery: "Entrega",
  pickup: "Retirada",
};

/** Da forma que o site usa para a que o banco usa. */
export const FORMA_SITE_PARA_BANCO = {
  pix: "pix",
  dinheiro: "cash",
  debito: "debit",
  credito: "credit",
} as const;

export type EnderecoPedido = {
  cep?: string;
  rua?: string;
  numero?: string;
  bairro?: string;
  complemento?: string;
  cidade?: string;
  referencia?: string;
};

export type Pedido = {
  id: string;
  order_number: number;
  customer_id: string | null;
  customer_name: string;
  customer_phone: string;
  order_type: TipoPedidoDb;
  status: StatusPedido;
  payment_method: FormaPagamentoDb;
  payment_status: StatusPagamento;
  subtotal_cents: number;
  delivery_fee_cents: number | null;
  discount_cents: number;
  total_cents: number;
  cost_cents: number;
  troco_para_cents: number | null;
  address_json: EnderecoPedido | null;
  notes: string;
  source: "site" | "manual";
  cancel_reason: string | null;
  created_at: string;
  confirmed_at: string | null;
  paid_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  refunded_at: string | null;
};

export type ItemPedido = {
  id: string;
  order_id: string;
  product_id: string;
  product_name_snapshot: string;
  unit_price_cents: number;
  unit_cost_cents: number;
  quantity: number;
  addons_cents: number;
  options_json: { grupo: string; nome: string }[];
  observacao: string;
  total_cents: number;
};

export type Receita = {
  id: string;
  order_id: string | null;
  tipo: "order" | "manual" | "outros";
  descricao: string;
  amount_cents: number;
  payment_method: FormaPagamentoDb;
  ocorrido_em: string;
  observacao: string;
  created_at: string;
};

export type CategoriaDespesa = {
  id: string;
  nome: string;
  ordem: number;
  ativo: boolean;
};

export type Despesa = {
  id: string;
  category_id: string | null;
  descricao: string;
  amount_cents: number;
  payment_method: FormaPagamentoDb;
  fornecedor: string;
  observacao: string;
  ocorrido_em: string;
  created_at: string;
};

export type ProdutoAdmin = {
  id: string;
  nome: string;
  categoria: string;
  price_cents: number;
  cost_cents: number;
  ativo: boolean;
};

export type ClienteAdmin = {
  id: string;
  nome: string;
  telefone: string;
  pedidos: number;
  total_cents: number;
  ultimo_pedido_at: string | null;
};

export type ZonaEntrega = {
  id: string;
  cidade: string;
  bairro: string;
  fee_cents: number | null;
  pedido_minimo_cents: number | null;
  prazo_minutos: number | null;
  ativo: boolean;
};

export type SessaoCaixa = {
  id: string;
  aberto_em: string;
  fechado_em: string | null;
  abertura_cents: number;
  contado_cents: number | null;
  observacao: string;
};

export type ResumoPeriodo = {
  pedidos: number;
  cancelados: number;
  pedidos_faturados: number;
  faturamento_cents: number;
  recebimentos_cents: number;
  pendente_cents: number;
  despesas_cents: number;
  custo_cents: number;
  lucro_bruto_cents: number;
  lucro_liquido_cents: number;
  ticket_medio_cents: number;
};

export const RESUMO_VAZIO: ResumoPeriodo = {
  pedidos: 0,
  cancelados: 0,
  pedidos_faturados: 0,
  faturamento_cents: 0,
  recebimentos_cents: 0,
  pendente_cents: 0,
  despesas_cents: 0,
  custo_cents: 0,
  lucro_bruto_cents: 0,
  lucro_liquido_cents: 0,
  ticket_medio_cents: 0,
};

export type ResumoCaixa = {
  abertura_cents: number;
  dinheiro_cents: number;
  pix_cents: number;
  debito_cents: number;
  credito_cents: number;
  despesas_dinheiro_cents: number;
  sangria_cents: number;
  suprimento_cents: number;
  esperado_cents: number;
  contado_cents: number | null;
  diferenca_cents: number | null;
};
