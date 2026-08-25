import { PRECOS_CONFIRMADOS, type Produto } from '@/data/products';

const brl = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export function moeda(valor: number): string {
  return brl.format(valor);
}

/**
 * Um produto só mostra preço quando a loja confirmou os valores
 * (`PRECOS_CONFIRMADOS` em data/products.ts) E tem preço cadastrado.
 * Enquanto isso o card mostra "Consultar preço" — é melhor mandar o cliente
 * para o WhatsApp do que publicar um valor que a casa não confirmou.
 */
export function precoVisivel(produto: Produto): number | null {
  if (!PRECOS_CONFIRMADOS) return null;
  return produto.preco;
}

export function precoAntigoVisivel(produto: Produto): number | null {
  if (!PRECOS_CONFIRMADOS) return null;
  return produto.precoAntigo ?? null;
}

/** Percentual de desconto arredondado, ou null quando não há promoção. */
export function percentualDesconto(produto: Produto): number | null {
  const preco = precoVisivel(produto);
  const antigo = precoAntigoVisivel(produto);
  if (preco === null || antigo === null || antigo <= preco) return null;
  return Math.round((1 - preco / antigo) * 100);
}

/** Acima de R$ 100 a casa parcela em 6x; abaixo disso, em 3x. */
function maxParcelas(produto: Produto, preco: number): number {
  if (produto.parcelas) return produto.parcelas;
  return preco >= 100 ? 6 : 3;
}

/** "até 6x de R$ 31,65" — mesma frase da peça de referência. */
export function parcelamento(produto: Produto): string | null {
  const preco = precoVisivel(produto);
  if (preco === null) return null;
  const n = maxParcelas(produto, preco);
  return `até ${n}x de ${moeda(preco / n)}`;
}
