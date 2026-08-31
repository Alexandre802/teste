import { NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { log } from '@/lib/seguranca';
import { business } from '@/lib/business';
import { formatPrice } from '@/lib/catalog';
import { MP_ACCESS_TOKEN, MP_WEBHOOK_SECRET, paymentsEnabled } from '@/lib/payments';
import { notifyStore, sendWhatsappText } from '@/lib/whatsapp-api';

export const runtime = 'nodejs';

const PRODUCAO = process.env.NODE_ENV === 'production';

/**
 * Confere a assinatura do webhook do Mercado Pago.
 *
 * Antes esta função devolvia `true` quando o segredo não estava configurado —
 * falha ABERTA: qualquer um que descobrisse a URL mandava "pagamento
 * aprovado" e a cozinha produzia de graça. Agora, sem segredo, ela devolve
 * `false` em produção. Fora de produção a checagem é pulada de propósito,
 * para dar para testar com o sandbox.
 */
function assinaturaValida(request: Request, dataId: string): boolean {
  if (!MP_WEBHOOK_SECRET) return !PRODUCAO;

  const header = request.headers.get('x-signature') ?? '';
  const requestId = request.headers.get('x-request-id') ?? '';
  const parts = Object.fromEntries(
    header.split(',').map((kv) => kv.split('=').map((s) => s.trim())),
  ) as { ts?: string; v1?: string };

  if (!parts.ts || !parts.v1) return false;

  const manifest = `id:${dataId};request-id:${requestId};ts:${parts.ts};`;
  const esperado = createHmac('sha256', MP_WEBHOOK_SECRET).update(manifest).digest('hex');

  const a = Buffer.from(esperado, 'hex');
  const b = Buffer.from(parts.v1, 'hex');
  return a.length === b.length && timingSafeEqual(a, b);
}

/* ─────────────────────── proteção contra duplicata ─────────────────────── */

/**
 * Pagamentos já processados nesta instância.
 *
 * O Mercado Pago REENVIA o mesmo evento quando não recebe 200 rápido, e
 * manda `payment.created` e `payment.updated` para o mesmo pagamento. Sem
 * isto, a casa recebia o mesmo pedido duas ou três vezes no WhatsApp.
 *
 * LIMITE CONHECIDO: esta memória é de UMA instância. Em serverless, dois
 * eventos que caiam em instâncias diferentes passam os dois. Isso cobre a
 * repetição imediata, que é o caso comum, mas não garante exatamente-uma-vez.
 * Garantia real exige armazenamento compartilhado (Vercel KV, Upstash Redis
 * ou banco) — está no relatório, não foi inventado aqui.
 */
const processados = new Map<string, number>();
const VALIDADE_MS = 6 * 60 * 60_000;

function jaProcessado(chave: string): boolean {
  const agora = Date.now();
  for (const [k, t] of processados) {
    if (agora - t > VALIDADE_MS) processados.delete(k);
  }
  if (processados.has(chave)) return true;
  processados.set(chave, agora);
  return false;
}

/**
 * Pagamento confirmado → a casa recebe o pedido no WhatsApp automaticamente e
 * o cliente recebe a confirmação.
 *
 * Só `status === 'approved'` conta como pago. Pendente e recusado não avisam
 * ninguém: pedido só entra na fila com dinheiro confirmado.
 */
export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as
    | { type?: string; action?: string; data?: { id?: string } }
    | null;

  const paymentId = payload?.data?.id;
  if (!paymentId || (payload?.type && payload.type !== 'payment')) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  if (!assinaturaValida(request, String(paymentId))) {
    log.aviso('webhook', 'assinatura inválida ou ausente — evento recusado');
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
    // 200 de propósito: reenviar não vai ajudar se o pagamento não existe
    return NextResponse.json({ ok: false }, { status: 200 });
  }

  const payment = (await res.json()) as {
    id?: number | string;
    status: string;
    status_detail?: string;
    transaction_amount: number;
    payment_method_id: string;
    external_reference?: string;
    metadata?: Record<string, string>;
  };

  if (payment.status !== 'approved') {
    return NextResponse.json({ ok: true, status: payment.status });
  }

  // a chave é o pagamento, não o pedido: um pedido pode ter tido uma tentativa
  // recusada antes da aprovada, e as duas são eventos legítimos
  const chave = `pagamento:${payment.id ?? paymentId}`;
  if (jaProcessado(chave)) {
    log.info('webhook', 'evento repetido ignorado');
    return NextResponse.json({ ok: true, duplicado: true });
  }

  const meta = payment.metadata ?? {};
  const referencia = payment.external_reference ?? meta.referencia ?? '';
  const entrega = meta.mode !== 'retirada';

  const linhas = [
    `🍔 *Novo pedido pago* — ${business.name}`,
    referencia ? `Pedido nº ${referencia}` : '',
    '',
    `Itens: ${meta.items ?? '—'}`,
    `Total: ${formatPrice(payment.transaction_amount)}`,
    `Pagamento: ${meta.forma || payment.payment_method_id}`,
    'Situação: pago pelo site ✅',
    `Tipo: ${entrega ? 'Entrega' : 'Retirada'}`,
    meta.customer_name ? `Cliente: ${meta.customer_name}` : '',
    meta.customer_phone ? `Telefone: ${meta.customer_phone}` : '',
  ];

  if (entrega) {
    if (meta.endereco_rua) {
      linhas.push(`Endereço: ${meta.endereco_rua}, ${meta.endereco_numero || 's/n'}`);
      if (meta.endereco_complemento) linhas.push(`Complemento: ${meta.endereco_complemento}`);
      if (meta.endereco_bairro) linhas.push(`Bairro: ${meta.endereco_bairro}`);
      if (meta.endereco_cep) linhas.push(`CEP: ${meta.endereco_cep}`);
      if (meta.endereco_referencia) linhas.push(`Referência: ${meta.endereco_referencia}`);
    } else if (meta.customer_address) {
      linhas.push(`Endereço: ${meta.customer_address}`);
    }
  } else {
    linhas.push('Retirada no local — sem endereço de entrega.');
  }

  if (meta.note) linhas.push('', `Observações: ${meta.note}`);

  // parâmetros do template em uma linha cada — o WhatsApp rejeita quebra de
  // linha dentro de parâmetro
  await notifyStore(
    [
      `pago · ${meta.forma || payment.payment_method_id} · ${entrega ? 'Entrega' : 'Retirada'}`,
      String(meta.items ?? '—'),
      formatPrice(payment.transaction_amount),
      [
        meta.customer_name,
        meta.customer_phone,
        entrega ? meta.customer_address : 'Retirada no local',
      ]
        .filter(Boolean)
        .join(' · ') || 'sem dados do cliente',
    ],
    linhas.filter(Boolean).join('\n'),
  );

  if (meta.customer_phone) {
    const primeiro = meta.customer_name ? `, ${meta.customer_name.split(' ')[0]}` : '';
    await sendWhatsappText(
      `55${meta.customer_phone.replace(/\D/g, '')}`,
      `Oi${primeiro}! Recebemos seu pagamento de ${formatPrice(payment.transaction_amount)} e seu ` +
        `pedido${referencia ? ` nº ${referencia}` : ''} já entrou na fila da ${business.name}. ` +
        'Qualquer coisa é só responder aqui. 🍔',
    );
  }

  return NextResponse.json({ ok: true, referencia });
}
