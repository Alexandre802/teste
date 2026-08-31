/**
 * Forma de pagamento do pedido.
 *
 * Três formas, e a distinção que importa: PAGAR AGORA (pelo site, via
 * Mercado Pago) ou PAGAR NA ENTREGA (direto com a casa). Dinheiro só existe
 * na entrega; Pix e cartão existem nos dois momentos.
 *
 * O que a cozinha recebe tem que ser exato. Antes a mensagem dizia só
 * "a combinar na entrega", e quem estava na moto não sabia se levava
 * maquininha nem quanto de troco. Agora vai a forma escolhida e, no
 * dinheiro, para quanto é o troco.
 */

import { formatPrice } from './catalog';

export type FormaPagamento = 'pix' | 'cartao' | 'dinheiro';

/** Onde o dinheiro troca de mãos. */
export type MomentoPagamento = 'online' | 'na-entrega';

export interface EscolhaPagamento {
  forma: FormaPagamento;
  momento: MomentoPagamento;
  /** Só no dinheiro: o cliente precisa de troco? */
  precisaTroco: boolean;
  /** Só no dinheiro com troco: valor da nota que ele vai entregar, em reais. */
  trocoPara: number | null;
}

export const ESCOLHA_PADRAO: EscolhaPagamento = {
  forma: 'pix',
  momento: 'na-entrega',
  precisaTroco: false,
  trocoPara: null,
};

export const ROTULO_FORMA: Record<FormaPagamento, string> = {
  pix: 'Pix',
  cartao: 'Cartão',
  dinheiro: 'Dinheiro',
};

/** Dinheiro não tem como ser cobrado pelo site. */
export function aceitaOnline(forma: FormaPagamento): boolean {
  return forma !== 'dinheiro';
}

/**
 * Converte texto digitado em reais. Aceita "50", "50,00", "R$ 50,00" e
 * "50.00" — o cliente digita do jeito dele, não do jeito do sistema.
 */
export function lerValor(texto: string): number | null {
  const limpo = texto.replace(/[^\d,.]/g, '').replace(/\.(?=\d{3}\b)/g, '').replace(',', '.');
  if (!limpo) return null;
  const n = Number(limpo);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/**
 * Confere o troco contra o total. Devolve a mensagem de erro, ou null.
 *
 * Troco menor que o total é o erro que mais aparece: o cliente lê "troco
 * para" como "quanto quero de volta". Melhor barrar na hora do que o
 * entregador descobrir na porta.
 */
export function validarTroco(escolha: EscolhaPagamento, total: number): string | null {
  if (escolha.forma !== 'dinheiro' || !escolha.precisaTroco) return null;
  if (escolha.trocoPara === null) return 'Informe para quanto precisa de troco.';
  if (escolha.trocoPara < total) {
    return `O valor precisa ser maior que o total do pedido (${formatPrice(total)}).`;
  }
  return null;
}

export function escolhaValida(escolha: EscolhaPagamento, total: number): boolean {
  return validarTroco(escolha, total) === null;
}

/** Quanto o entregador devolve. */
export function valorDoTroco(escolha: EscolhaPagamento, total: number): number | null {
  if (escolha.forma !== 'dinheiro' || !escolha.precisaTroco || escolha.trocoPara === null) {
    return null;
  }
  return Math.max(0, escolha.trocoPara - total);
}

/**
 * Linhas do pagamento na mensagem do WhatsApp.
 *
 * Formato fixo, porque a casa vai ler isto dezenas de vezes por noite:
 *
 *   Pagamento: Dinheiro
 *   Troco para: R$ 50,00 (levar R$ 8,00 de troco)
 *
 * `pagoOnline` só é verdade depois que o gateway confirmou. Escolher "Pix" e
 * não pagar não vira "pago" em lugar nenhum.
 */
export function pagamentoEmLinhas(
  escolha: EscolhaPagamento,
  total: number,
  pagoOnline = false,
): string[] {
  const linhas = [`Pagamento: ${ROTULO_FORMA[escolha.forma]}`];

  if (pagoOnline) {
    linhas.push('Situação: pago pelo site ✅');
  } else if (escolha.forma === 'dinheiro') {
    if (escolha.precisaTroco && escolha.trocoPara !== null) {
      const volta = valorDoTroco(escolha, total);
      const sufixo = volta !== null && volta > 0 ? ` (levar ${formatPrice(volta)} de troco)` : '';
      linhas.push(`Troco para: ${formatPrice(escolha.trocoPara)}${sufixo}`);
    } else {
      linhas.push('Troco: não precisa');
    }
  } else {
    linhas.push('Situação: a pagar na entrega');
  }

  return linhas;
}

/** Versão de uma linha só, para resumo e parâmetro de template. */
export function pagamentoEmLinha(
  escolha: EscolhaPagamento,
  total: number,
  pagoOnline = false,
): string {
  return pagamentoEmLinhas(escolha, total, pagoOnline).join(' · ');
}
