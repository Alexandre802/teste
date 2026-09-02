/**
 * Espelho em TypeScript do schema de `supabase/migrations`.
 *
 * Escrito à mão de propósito: o schema é pequeno e estável, e um arquivo
 * gerado de 2 mil linhas esconderia justamente a parte que importa aqui —
 * quais campos são dinheiro (sempre `_cents`) e quais podem ser nulos.
 */

export type StatusPedido =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'out_for_delivery'
  | 'completed'
  | 'cancelled';

export type StatusPagamento = 'pending' | 'paid' | 'refunded' | 'cancelled';

/**
 * `card` = cartão sem dizer se é débito ou crédito.
 *
 * Existe porque o site pergunta "Cartão" e ponto — quem sabe a bandeira é a
 * maquininha. O painel refina na hora de marcar como pago. Chutar "crédito"
 * no momento do pedido sujaria o relatório de formas de pagamento.
 */
export type FormaPagamentoDb = 'pix' | 'cash' | 'debit' | 'credit' | 'card';

export type TipoPedido = 'delivery' | 'pickup';
export type OrigemPedido = 'site' | 'manual';
export type TipoLancamento = 'order' | 'manual' | 'refund' | 'other';
export type TipoMovimentoCaixa = 'sangria' | 'suprimento';
export type PapelUsuario = 'owner' | 'manager' | 'cashier';

export interface EnderecoPedido {
  rua?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  complemento?: string;
  referencia?: string;
  cep?: string;
}

export interface Pedido {
  id: string;
  order_number: number;
  customer_id: string | null;
  customer_name: string;
  customer_phone: string;
  order_type: TipoPedido;
  status: StatusPedido;
  payment_method: FormaPagamentoDb;
  payment_status: StatusPagamento;
  subtotal_cents: number;
  delivery_fee_cents: number;
  discount_cents: number;
  total_cents: number;
  cost_cents: number | null;
  change_for_cents: number | null;
  address: EnderecoPedido | null;
  notes: string;
  cancel_reason: string | null;
  source: OrigemPedido;
  checkout_token: string | null;
  created_at: string;
  confirmed_at: string | null;
  paid_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  refunded_at: string | null;
}

export interface ItemPedido {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price_cents: number;
  unit_cost_cents: number | null;
  addons_cents: number;
  options: unknown[];
  note: string;
  total_cents: number;
}

export interface PedidoComItens extends Pedido {
  itens: ItemPedido[];
}

export interface Lancamento {
  id: string;
  order_id: string | null;
  kind: TipoLancamento;
  /** Negativo quando `kind = 'refund'`. */
  amount_cents: number;
  method: FormaPagamentoDb;
  description: string;
  notes: string;
  occurred_at: string;
  created_at: string;
}

export interface CategoriaDespesa {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  sort_order: number;
}

export interface Despesa {
  id: string;
  category_id: string | null;
  description: string;
  amount_cents: number;
  method: FormaPagamentoDb;
  supplier: string;
  notes: string;
  occurred_at: string;
  created_at: string;
  categoria?: { name: string } | null;
}

export interface ProdutoAdmin {
  id: string;
  name: string;
  category: string;
  price_cents: number;
  /** `null` = custo ainda não informado. Diferente de zero. */
  cost_cents: number | null;
  active: boolean;
}

export interface AreaEntrega {
  id: string;
  city: string;
  /** `null` = regra coringa da cidade. */
  district: string | null;
  fee_cents: number;
  min_order_cents: number;
  active: boolean;
  sort_order: number;
}

export interface ClienteStats {
  id: string;
  name: string;
  phone: string;
  orders_count: number;
  paid_cents: number;
  total_cents: number;
  last_order_at: string | null;
}

export interface SessaoCaixa {
  id: string;
  opened_at: string;
  opening_cents: number;
  closed_at: string | null;
  expected_cents: number | null;
  counted_cents: number | null;
  difference_cents: number | null;
  notes: string;
}

export interface MovimentoCaixa {
  id: string;
  session_id: string | null;
  type: TipoMovimentoCaixa;
  amount_cents: number;
  reason: string;
  created_at: string;
}

export interface UsuarioAdmin {
  user_id: string;
  name: string;
  email: string;
  role: PapelUsuario;
  active: boolean;
}

/* ───────────────────── retorno de comida_caseira_report ───────────────────── */

export interface Relatorio {
  from: string;
  to: string;
  bucket: 'day' | 'week' | 'month';
  orders: {
    total: number;
    billed: number;
    pending: number;
    cancelled: number;
  };
  money: {
    gross_cents: number;
    received_cents: number;
    pending_cents: number;
    expenses_cents: number;
    cost_cents: number;
    delivery_fee_cents: number;
    gross_profit_cents: number;
    net_profit_cents: number;
    ticket_cents: number;
  };
  series: { bucket: string; pedidos: number; valor_cents: number }[];
  by_method: { forma: FormaPagamentoDb; quantidade: number; valor_cents: number }[];
  by_type: { tipo: TipoPedido; quantidade: number; valor_cents: number }[];
  top_products: { product_id: string; nome: string; quantidade: number; valor_cents: number }[];
  by_hour: { hora: number; quantidade: number; valor_cents: number }[];
  expenses_by_category: { categoria: string; valor_cents: number; quantidade: number }[];
}

export interface ResumoCaixa {
  session: SessaoCaixa;
  cash_in_cents: number;
  other_methods: Partial<Record<FormaPagamentoDb, number>>;
  cash_out_cents: number;
  sangria_cents: number;
  suprimento_cents: number;
  expected_cents: number;
  counted_cents?: number;
  difference_cents?: number;
}
