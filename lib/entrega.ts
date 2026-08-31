/**
 * Regras de entrega da casa.
 *
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │ TUDO AQUI ESTÁ `null` DE PROPÓSITO.                                   │
 * │                                                                       │
 * │ Nenhum destes valores foi confirmado pelo proprietário. Enquanto      │
 * │ estiverem em `null`, o site NÃO mostra taxa, NÃO mostra pedido        │
 * │ mínimo e NÃO promete prazo — mostrar número inventado é pior do que   │
 * │ não mostrar nada, porque o cliente cobra o que leu.                   │
 * │                                                                       │
 * │ Para ligar: troque o `null` pelo valor real e pronto. A interface, a  │
 * │ soma do carrinho e a mensagem do WhatsApp acompanham sozinhas.        │
 * └──────────────────────────────────────────────────────────────────────┘
 */

export interface RegrasEntrega {
  /** Valor mínimo do pedido para entregar, em reais. */
  pedidoMinimo: number | null;
  /** Taxa fixa de entrega, em reais. `0` seria "entrega grátis sempre". */
  taxa: number | null;
  /** A partir deste subtotal a taxa zera. */
  gratisAPartirDe: number | null;
  /** Bairros atendidos. `null` = a casa ainda não delimitou a área. */
  bairrosAtendidos: string[] | null;
  /** Faixa de tempo estimada, em minutos: [mínimo, máximo]. */
  estimativaMinutos: [number, number] | null;
}

export const regrasEntrega: RegrasEntrega = {
  pedidoMinimo: null,
  taxa: null,
  gratisAPartirDe: null,
  bairrosAtendidos: null,
  estimativaMinutos: null,
};

/** Há alguma regra de entrega configurada? Enquanto false, o site fica calado. */
export const entregaConfigurada =
  regrasEntrega.pedidoMinimo !== null ||
  regrasEntrega.taxa !== null ||
  regrasEntrega.bairrosAtendidos !== null ||
  regrasEntrega.estimativaMinutos !== null;

/**
 * Taxa que se aplica a este subtotal.
 *
 * `null` significa "não configurada" — diferente de `0`, que significa
 * "grátis". Quem consome precisa distinguir os dois: um esconde a linha, o
 * outro escreve "Entrega grátis".
 */
export function taxaPara(subtotal: number): number | null {
  const { taxa, gratisAPartirDe } = regrasEntrega;
  if (taxa === null) return null;
  if (gratisAPartirDe !== null && subtotal >= gratisAPartirDe) return 0;
  return taxa;
}

/** Subtotal + taxa. Sem taxa configurada, devolve o subtotal intacto. */
export function totalComEntrega(subtotal: number, modo: 'entrega' | 'retirada'): number {
  if (modo !== 'entrega') return subtotal;
  return subtotal + (taxaPara(subtotal) ?? 0);
}

/** Quanto falta para bater o pedido mínimo. `null` quando não há mínimo ou já bateu. */
export function faltaParaMinimo(subtotal: number, modo: 'entrega' | 'retirada'): number | null {
  const { pedidoMinimo } = regrasEntrega;
  if (modo !== 'entrega' || pedidoMinimo === null || subtotal >= pedidoMinimo) return null;
  return pedidoMinimo - subtotal;
}

/** O pedido pode ser fechado? Sem mínimo configurado, sempre pode. */
export function podeFechar(subtotal: number, modo: 'entrega' | 'retirada'): boolean {
  return faltaParaMinimo(subtotal, modo) === null;
}

/** "30 a 50 min", ou null enquanto a casa não confirmar o prazo. */
export function prazoEstimado(): string | null {
  const faixa = regrasEntrega.estimativaMinutos;
  return faixa ? `${faixa[0]} a ${faixa[1]} min` : null;
}

/**
 * O bairro digitado está na área atendida?
 *
 * Sem lista configurada devolve `null` — "não sei", que a interface trata
 * como "segue o pedido". Recusar entrega por uma lista que ninguém confirmou
 * perderia venda de bairro que a casa atende.
 */
export function bairroAtendido(bairro: string): boolean | null {
  const lista = regrasEntrega.bairrosAtendidos;
  if (!lista || lista.length === 0) return null;
  const alvo = normalizar(bairro);
  return lista.some((b) => normalizar(b) === alvo);
}

/** Sem acento, minúsculo, espaços colapsados — para comparar bairro digitado. */
function normalizar(valor: string): string {
  return valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}
