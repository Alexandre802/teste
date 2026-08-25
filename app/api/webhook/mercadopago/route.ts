import { NextResponse } from 'next/server';
import { log } from '@/lib/seguranca';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { business } from '@/lib/business';
import { formatPrice } from '@/lib/catalog';
import { MP_ACCESS_TOKEN, paymentsEnabled } from '@/lib/payments';
import { notifyStore, sendWhatsappText } from '@/lib/whatsapp-api';

export const runtime = 'nodejs';

const WEBHOOK_SECRET = process.env.MP_WEBHOOK_SECRET ?? '';

/**
 * Confere a assinatura do webhook do Mercado Pago.
 * Sem MP_WEBHOOK_SECRET a checagem é pulada — configure em produção, senão
 * qualquer um pode forjar "pagamento aprovado".
 */
function signatureValid(request: Request, dataId: string): boolean {
  if (!WEBHOOK_SECRET) return true;

  const header = request.headers.get('x-signature') ?? '';
  const requestId = request.headers.get('x-request-id') ?? '';
  const parts = Object.fromEntries(
    header.split(',').map((kv) => kv.split('=').map((s) => s.trim())),
  ) as { ts?: string; v1?: string };

  if (!parts.ts || !parts.v1) return false;

  const manifest = `id:${dataId};request-id:${requestId};ts:${parts.ts};`;
  const expected = createHmac('sha256', WEBHOOK_SECRET).update(manifest).digest('hex');

  const a = Buffer.from(expected, 'hex');
  const b = Buffer.from(parts.v1, 'hex');
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Pagamento confirmado → a lanchonete recebe o pedido no WhatsApp
 * automaticamente, e o cliente recebe a confirmação.
 */
export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as
    | { type?: string; action?: string; data?: { id?: string } }
    | null;

  const paymentId = payload?.data?.id;
  if (!paymentId || (payload?.type && payload.type !== 'payment')) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  if (!signatureValid(request, String(paymentId))) {
    return NextResponse.json({ error: 'Assinatura inválida' }, { status: 401 });
  }

  if (!paymentsEnabled) {
    return NextResponse.json({ ok: true, skipped: 'gateway não configurado' });
  }

  const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` },
  });
  if (!res.ok) {
    log.erro('webhook', 'não consegui ler o pagamento', res.status);
    return NextResponse.json({ ok: false }, { status: 200 });
  }

  const payment = (await res.json()) as {
    status: string;
    transaction_amount: number;
    payment_method_id: string;
    metadata?: Record<string, string>;
  };

  if (payment.status !== 'approved') {
    return NextResponse.json({ ok: true, status: payment.status });
  }

  const meta = payment.metadata ?? {};
  const lines = [
    `🍔 *Novo pedido pago* — ${business.name}`,
    '',
    `Itens: ${meta.items ?? '—'}`,
    `Total: ${formatPrice(payment.transaction_amount)}`,
    `Pagamento: ${payment.payment_method_id} · aprovado ✅`,
    `Tipo: ${meta.mode === 'retirada' ? 'Retirada' : 'Entrega'}`,
    meta.customer_name ? `Cliente: ${meta.customer_name}` : '',
    meta.customer_phone ? `Telefone: ${meta.customer_phone}` : '',
    meta.mode !== 'retirada' && meta.customer_address ? `Endereço: ${meta.customer_address}` : '',
    meta.note ? `Obs.: ${meta.note}` : '',
  ].filter(Boolean);

  // parâmetros do template em uma linha cada — o WhatsApp rejeita quebra de
  // linha dentro de parâmetro
  await notifyStore(
    [
      `pago · ${meta.mode === 'retirada' ? 'Retirada' : 'Entrega'}`,
      String(meta.items ?? '—'),
      formatPrice(payment.transaction_amount),
      [meta.customer_name, meta.customer_phone, meta.customer_address].filter(Boolean).join(' · ') || 'sem dados do cliente',
    ],
    lines.join('\n'),
  );

  if (meta.customer_phone) {
    await sendWhatsappText(
      `55${meta.customer_phone.replace(/\D/g, '')}`,
      `Oi${meta.customer_name ? `, ${meta.customer_name.split(' ')[0]}` : ''}! Recebemos seu pagamento de ${formatPrice(payment.transaction_amount)} e seu pedido já entrou na fila da ${business.name}. Qualquer coisa é só responder aqui. 🍔`,
    );
  }

  return NextResponse.json({ ok: true });
}
