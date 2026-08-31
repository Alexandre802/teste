import { business, whatsappUrl } from './business';
import { formatPrice, productsById } from './catalog';
import { enderecoEmLinha, enderecoEmLinhas, enderecoValido, type Endereco } from './endereco';
import { pagamentoEmLinhas, type EscolhaPagamento } from './pagamento';
import { taxaPara } from './entrega';
import type { CartLine, Customer, FulfillmentMode } from './store';
import { cartTotal, orderTotal } from './store';

export interface OrderMessageInput {
  lines: CartLine[];
  mode: FulfillmentMode;
  customer?: Customer | null;
  /** Endereço estruturado. Ignorado na retirada. */
  address?: Endereco | null;
  /** Forma de pagamento escolhida. */
  payment?: EscolhaPagamento | null;
  /** Observação geral do pedido, além das observações por item. */
  note?: string;
  /** Só vira `true` depois que o gateway confirmou de fato. */
  paidOnline?: boolean;
  /** Identificador do pedido, para a casa referenciar. */
  reference?: string;
}

/**
 * Monta a mensagem do pedido, usada pelo deeplink wa.me e pelo aviso
 * automático que o servidor manda para a casa.
 *
 * A ordem das linhas é fixa e pensada para quem lê no celular, em pé, na
 * cozinha: primeiro o que produzir, depois quanto cobrar, depois para onde
 * vai e como paga. Endereço em linhas separadas porque é onde se erra número.
 */
export function buildOrderMessage({
  lines,
  mode,
  customer,
  address,
  payment,
  note,
  paidOnline = false,
  reference,
}: OrderMessageInput): string {
  const entrega = mode === 'entrega';
  const subtotal = cartTotal(lines);
  const total = orderTotal(lines, mode);
  const taxa = entrega ? taxaPara(subtotal) : null;

  const partes: string[] = [
    `Olá! Gostaria de fazer um pedido na ${business.name}.`,
    '',
    'Pedido:',
  ];

  for (const line of lines) {
    const product = productsById.get(line.productId);
    if (!product) continue;
    partes.push(`${line.qty}x ${product.name} — ${formatPrice(product.price * line.qty)}`);
    if (line.note.trim()) partes.push(`   obs: ${line.note.trim()}`);
  }

  partes.push('');

  // A linha da taxa só aparece quando a casa configurou uma. Sem valor
  // confirmado, o cliente vê só o total dos itens — nunca um frete inventado.
  if (taxa !== null) {
    partes.push(`Subtotal: ${formatPrice(subtotal)}`);
    partes.push(taxa === 0 ? 'Entrega: grátis' : `Taxa de entrega: ${formatPrice(taxa)}`);
  }
  partes.push(`Total: ${formatPrice(total)}`);

  partes.push('', `Tipo: ${entrega ? 'Entrega' : 'Retirada'}`);

  if (customer?.name) partes.push(`Cliente: ${customer.name}`);
  if (customer?.phone) partes.push(`Telefone: ${formatarTelefone(customer.phone)}`);

  if (entrega) {
    if (address && enderecoValido(address)) {
      partes.push(...enderecoEmLinhas(address));
    } else if (customer?.address?.trim()) {
      // pedido antigo, gravado antes do endereço ter campos
      partes.push(`Endereço: ${customer.address.trim()}`);
    }
  } else {
    partes.push('Retirada no local — sem endereço de entrega.');
  }

  if (payment) partes.push(...pagamentoEmLinhas(payment, total, paidOnline));

  if (note?.trim()) partes.push('', `Observações: ${note.trim()}`);
  if (reference) partes.push('', `Pedido nº ${reference}`);

  return partes.join('\n');
}

/** Link wa.me pronto, com a mensagem já codificada. */
export function orderWhatsappUrl(input: OrderMessageInput): string {
  return whatsappUrl(buildOrderMessage(input));
}

/**
 * Resumo do destino em uma linha, para parâmetro de template do WhatsApp —
 * que não aceita quebra de linha.
 */
export function destinoEmLinha(
  mode: FulfillmentMode,
  customer?: Customer | null,
  address?: Endereco | null,
): string {
  if (mode !== 'entrega') return 'Retirada no local';
  if (address && enderecoValido(address)) return enderecoEmLinha(address);
  if (customer?.address?.trim()) return customer.address.trim();
  return 'endereço não informado';
}

/** (12) 98844-7711 a partir de dígitos soltos. Devolve o original se não reconhecer. */
export function formatarTelefone(bruto: string): string {
  const d = bruto.replace(/\D/g, '').replace(/^55/, '');
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return bruto;
}
