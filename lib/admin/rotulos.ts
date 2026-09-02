/**
 * Rótulos em português e cores de estado.
 *
 * Fica tudo num arquivo só porque status escrito à mão em cada tela é como
 * "Saiu p/ entrega" aparece numa lista e "Em rota" na outra, para o mesmo
 * pedido.
 *
 * Cores seguem a convenção do painel: verde = dinheiro que entrou,
 * vermelho = saiu ou deu errado, âmbar = esperando, azul = informação.
 */

import type {
  FormaPagamentoDb,
  StatusPagamento,
  StatusPedido,
  TipoPedido,
  PapelUsuario,
  TipoLancamento,
} from './tipos';

export interface Aparencia {
  rotulo: string;
  /** Classes Tailwind da "pílula" de status. */
  classe: string;
}

export const STATUS_PEDIDO: Record<StatusPedido, Aparencia> = {
  pending: { rotulo: 'Pendente', classe: 'bg-amber-100 text-amber-800 ring-amber-200' },
  confirmed: { rotulo: 'Confirmado', classe: 'bg-sky-100 text-sky-800 ring-sky-200' },
  preparing: { rotulo: 'Preparando', classe: 'bg-violet-100 text-violet-800 ring-violet-200' },
  out_for_delivery: { rotulo: 'Saiu para entrega', classe: 'bg-indigo-100 text-indigo-800 ring-indigo-200' },
  completed: { rotulo: 'Concluído', classe: 'bg-emerald-100 text-emerald-800 ring-emerald-200' },
  cancelled: { rotulo: 'Cancelado', classe: 'bg-rose-100 text-rose-800 ring-rose-200' },
};

export const STATUS_PAGAMENTO: Record<StatusPagamento, Aparencia> = {
  pending: { rotulo: 'A receber', classe: 'bg-amber-100 text-amber-800 ring-amber-200' },
  paid: { rotulo: 'Pago', classe: 'bg-emerald-100 text-emerald-800 ring-emerald-200' },
  refunded: { rotulo: 'Estornado', classe: 'bg-rose-100 text-rose-800 ring-rose-200' },
  cancelled: { rotulo: 'Cancelado', classe: 'bg-slate-100 text-slate-700 ring-slate-200' },
};

export const FORMA_PAGAMENTO: Record<FormaPagamentoDb, string> = {
  pix: 'PIX',
  cash: 'Dinheiro',
  debit: 'Débito',
  credit: 'Crédito',
  card: 'Cartão',
};

/** Ordem fixa nos gráficos: a mesma fatia fica sempre na mesma cor. */
export const FORMAS_EM_ORDEM: FormaPagamentoDb[] = ['pix', 'cash', 'debit', 'credit', 'card'];

export const COR_FORMA: Record<FormaPagamentoDb, string> = {
  pix: '#10b981',
  cash: '#f59e0b',
  debit: '#3b82f6',
  credit: '#ef4444',
  card: '#8b5cf6',
};

export const TIPO_PEDIDO: Record<TipoPedido, string> = {
  delivery: 'Entrega',
  pickup: 'Retirada',
};

export const PAPEL: Record<PapelUsuario, string> = {
  owner: 'Proprietária',
  manager: 'Gerente',
  cashier: 'Caixa',
};

export const TIPO_LANCAMENTO: Record<TipoLancamento, string> = {
  order: 'Pedido',
  manual: 'Receita manual',
  refund: 'Estorno',
  other: 'Outros',
};

/**
 * Próximos passos possíveis a partir do status atual.
 *
 * A tela de detalhe só mostra o que faz sentido: não existe "Saiu para
 * entrega" num pedido cancelado, nem "Confirmar" num já concluído.
 */
export function proximosStatus(atual: StatusPedido, tipo: TipoPedido): StatusPedido[] {
  switch (atual) {
    case 'pending':
      return ['confirmed', 'cancelled'];
    case 'confirmed':
      return ['preparing', 'cancelled'];
    case 'preparing':
      // retirada não passa por "saiu para entrega": o cliente é quem vem
      return tipo === 'delivery' ? ['out_for_delivery', 'completed', 'cancelled'] : ['completed', 'cancelled'];
    case 'out_for_delivery':
      return ['completed', 'cancelled'];
    case 'completed':
    case 'cancelled':
      return [];
  }
}

/** Forma de pagamento do site (`pix`/`cartao`/`dinheiro`) → forma do banco. */
export function formaDoSite(forma: string): FormaPagamentoDb {
  if (forma === 'pix') return 'pix';
  if (forma === 'dinheiro') return 'cash';
  // "cartão" sem mais detalhe: fica `card` até a maquininha dizer qual é
  return 'card';
}
