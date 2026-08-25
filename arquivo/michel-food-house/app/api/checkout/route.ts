import { NextResponse } from 'next/server';
import { identificadorAnonimo, limitarTaxa, log } from '@/lib/seguranca';
import { business } from '@/lib/business';
import { MP_ACCESS_TOKEN, itemsTotal, paymentsEnabled, toCheckoutItems } from '@/lib/payments';
import type { CartLine, Customer, FulfillmentMode } from '@/lib/store';

export const runtime = 'nodejs';

interface Body {
  lines: CartLine[];
  mode: FulfillmentMode;
  note?: string;
  customer?: Customer | null;
  method: 'pix' | 'cartao' | 'na-entrega';
}

/**
 * Abre o pagamento no Mercado Pago (Pix e cartão de crédito/débito).
 *
 * Sem MP_ACCESS_TOKEN configurado a rota responde `demo: true` — o site
 * continua utilizável de ponta a ponta para teste, sem fingir que cobrou.
 */
export async function POST(request: Request) {
  // criar cobrança é a rota mais cara: teto apertado
  const taxa = limitarTaxa(`checkout:${identificadorAnonimo(request)}`, 6, 60_000);
  if (!taxa.ok) {
    return NextResponse.json(
      { error: `Muitas tentativas de pagamento. Aguarde ${taxa.esperaS}s.` },
      { status: 429, headers: { 'Retry-After': String(taxa.esperaS) } },
    );
  }

  let body: Body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Corpo inválido' }, { status: 400 });
  }

  const items = toCheckoutItems(body.lines ?? []);
  if (items.length === 0) {
    return NextResponse.json({ error: 'Sacola vazia' }, { status: 400 });
  }

  const total = itemsTotal(items);

  if (!paymentsEnabled) {
    return NextResponse.json({
      demo: true,
      total,
      message:
        'O gateway ainda não foi conectado. Defina MP_ACCESS_TOKEN no ambiente para cobrar de verdade por Pix e cartão. Por ora, você pode simular o pagamento e enviar o pedido pelo WhatsApp.',
    });
  }

  const origin = new URL(request.url).origin;

  const preference = {
    items,
    payer: body.customer
      ? { name: body.customer.name, phone: { number: body.customer.phone.replace(/\D/g, '') } }
      : undefined,
    // Pix aprova na hora; cartão passa pelo checkout do Mercado Pago.
    payment_methods:
      body.method === 'pix'
        ? { excluded_payment_types: [{ id: 'credit_card' }, { id: 'debit_card' }, { id: 'ticket' }] }
        : { excluded_payment_types: [{ id: 'ticket' }] },
    back_urls: {
      success: `${origin}/?pagamento=aprovado`,
      pending: `${origin}/?pagamento=pendente`,
      failure: `${origin}/?pagamento=recusado`,
    },
    auto_return: 'approved',
    statement_descriptor: business.name.slice(0, 22),
    notification_url: `${origin}/api/webhook/mercadopago`,
    metadata: {
      mode: body.mode,
      note: body.note ?? '',
      customer_name: body.customer?.name ?? '',
      customer_phone: body.customer?.phone ?? '',
      customer_address: body.customer?.address ?? '',
      items: items.map((i) => `${i.quantity}x ${i.title}`).join(' | '),
    },
  };

  const res = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(preference),
  });

  if (!res.ok) {
    const detail = await res.text();
    log.erro('checkout', 'Mercado Pago respondeu', res.status, detail);
    return NextResponse.json({ error: 'Não foi possível abrir o pagamento.' }, { status: 502 });
  }

  const pref = (await res.json()) as { id: string; init_point: string; sandbox_init_point: string };

  return NextResponse.json({
    demo: false,
    total,
    preferenceId: pref.id,
    checkoutUrl: process.env.MP_SANDBOX === '1' ? pref.sandbox_init_point : pref.init_point,
  });
}
