import { formatPrice, productsById } from './catalog';
import type { CartLine } from './store';

export const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN ?? '';
export const paymentsEnabled = MP_ACCESS_TOKEN.length > 0;

export interface CheckoutItem {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
  currency_id: 'BRL';
}

export function toCheckoutItems(lines: CartLine[]): CheckoutItem[] {
  return lines.flatMap((line) => {
    const product = productsById.get(line.productId);
    if (!product) return [];
    return [
      {
        id: product.id,
        title: product.name,
        quantity: line.qty,
        unit_price: Number(product.price.toFixed(2)),
        currency_id: 'BRL' as const,
      },
    ];
  });
}

export function itemsTotal(items: CheckoutItem[]): number {
  return items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);
}

export function summarize(items: CheckoutItem[]): string {
  return items.map((i) => `${i.quantity}x ${i.title}`).join(', ') + ` — ${formatPrice(itemsTotal(items))}`;
}
