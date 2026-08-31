import { formatPrice, productsById } from './catalog';
import { taxaPara } from './entrega';
import type { CartLine, FulfillmentMode } from './store';

/**
 * Mercado Pago — configuração e montagem dos itens da cobrança.
 *
 * ── Por que o gateway se desliga sozinho sem MP_WEBHOOK_SECRET ──
 *
 * O webhook é quem diz "este pedido foi pago". Sem segredo, a assinatura não
 * pode ser conferida e qualquer pessoa que descubra a URL consegue mandar um
 * "pagamento aprovado" forjado — a cozinha produz e ninguém pagou.
 *
 * Antes o código apenas pulava a checagem quando o segredo faltava. Agora,
 * em PRODUÇÃO, gateway com token e sem segredo de webhook fica DESLIGADO: o
 * site volta a fechar pedido pelo WhatsApp, que é seguro, em vez de cobrar
 * sem conseguir confirmar. Em desenvolvimento a checagem continua opcional,
 * para dar para testar com o sandbox.
 */

export const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN ?? '';
export const MP_WEBHOOK_SECRET = process.env.MP_WEBHOOK_SECRET ?? '';
export const MP_SANDBOX = process.env.MP_SANDBOX === '1';

const PRODUCAO = process.env.NODE_ENV === 'production';

const temToken = MP_ACCESS_TOKEN.length > 0;
const temSegredo = MP_WEBHOOK_SECRET.length > 0;

/** O pagamento online pode ser oferecido ao cliente? */
export const paymentsEnabled = temToken && (!PRODUCAO || temSegredo);

/**
 * Token configurado mas segredo faltando, em produção. É erro de configuração,
 * não ausência de configuração — merece aviso no log do servidor.
 */
export const paymentsMisconfigured = temToken && PRODUCAO && !temSegredo;

/** Motivo de o pagamento online estar fora, para log e diagnóstico. */
export function motivoPagamentoIndisponivel(): string | null {
  if (paymentsEnabled) return null;
  if (!temToken) return 'MP_ACCESS_TOKEN não configurado';
  return 'MP_WEBHOOK_SECRET não configurado — obrigatório em produção';
}

export interface CheckoutItem {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
  currency_id: 'BRL';
}

/**
 * Itens da cobrança, montados a partir do catálogo do servidor.
 *
 * Só o id e a quantidade vêm do navegador. Preço e nome saem daqui — um
 * payload adulterado não consegue cobrar R$ 0,01 por um X Tudo.
 */
export function toCheckoutItems(lines: CartLine[]): CheckoutItem[] {
  return lines.flatMap((line) => {
    const product = productsById.get(String(line.productId));
    if (!product || !product.available) return [];
    const quantity = Math.min(50, Math.max(1, Math.floor(Number(line.qty) || 0)));
    return [
      {
        id: product.id,
        title: product.name,
        quantity,
        unit_price: Number(product.price.toFixed(2)),
        currency_id: 'BRL' as const,
      },
    ];
  });
}

/** Linha extra da taxa de entrega, quando a casa tiver configurado uma. */
export function taxaComoItem(
  subtotal: number,
  mode: FulfillmentMode,
): CheckoutItem | null {
  if (mode !== 'entrega') return null;
  const taxa = taxaPara(subtotal);
  if (taxa === null || taxa <= 0) return null;
  return {
    id: 'taxa-entrega',
    title: 'Taxa de entrega',
    quantity: 1,
    unit_price: Number(taxa.toFixed(2)),
    currency_id: 'BRL',
  };
}

export function itemsTotal(items: CheckoutItem[]): number {
  return items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);
}

export function summarize(items: CheckoutItem[]): string {
  return (
    items.map((i) => `${i.quantity}x ${i.title}`).join(', ') + ` — ${formatPrice(itemsTotal(items))}`
  );
}
