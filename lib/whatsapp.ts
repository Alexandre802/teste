import { business, whatsappUrl } from './business';
import { formatPrice, productsById } from './catalog';
import type { CartLine, Customer, FulfillmentMode } from './store';
import { cartTotal } from './store';

export interface OrderMessageInput {
  lines: CartLine[];
  mode: FulfillmentMode;
  customer?: Customer | null;
  /** Observação geral do pedido, além das observações por item. */
  note?: string;
  /** Preenchido quando o pagamento foi confirmado pelo gateway. */
  paymentStatus?: 'pago' | 'pagar-na-entrega';
}

/**
 * Monta a mensagem do pedido. Usada tanto pelo botão do site (deeplink wa.me)
 * quanto pela confirmação automática enviada pelo servidor.
 */
export function buildOrderMessage({
  lines,
  mode,
  customer,
  note,
  paymentStatus,
}: OrderMessageInput): string {
  const parts: string[] = [
    `Olá! Gostaria de fazer um pedido na ${business.name}.`,
    '',
    'Pedido:',
  ];

  for (const line of lines) {
    const product = productsById.get(line.productId);
    if (!product) continue;
    parts.push(`${line.qty}x ${product.name} — ${formatPrice(product.price * line.qty)}`);
    if (line.note.trim()) parts.push(`   obs: ${line.note.trim()}`);
  }

  if (note?.trim()) {
    parts.push('', 'Observações:', note.trim());
  }

  parts.push('', `Total: ${formatPrice(cartTotal(lines))}`);
  parts.push(`Tipo: ${mode === 'entrega' ? 'Entrega' : 'Retirada'}`);

  if (customer?.name) parts.push(`Cliente: ${customer.name}`);
  if (customer?.phone) parts.push(`Telefone: ${customer.phone}`);
  if (mode === 'entrega' && customer?.address) parts.push(`Endereço: ${customer.address}`);
  if (paymentStatus === 'pago') parts.push('Pagamento: confirmado pelo site ✅');
  if (paymentStatus === 'pagar-na-entrega') parts.push('Pagamento: a combinar na entrega');

  return parts.join('\n');
}

/** Link wa.me pronto, com a mensagem já codificada. */
export function orderWhatsappUrl(input: OrderMessageInput): string {
  return whatsappUrl(buildOrderMessage(input));
}
