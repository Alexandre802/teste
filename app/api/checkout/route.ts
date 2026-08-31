import { NextResponse } from 'next/server';
import { identificadorAnonimo, limitarTaxa, log } from '@/lib/seguranca';
import { business } from '@/lib/business';
import {
  MP_ACCESS_TOKEN,
  MP_SANDBOX,
  itemsTotal,
  motivoPagamentoIndisponivel,
  paymentsEnabled,
  paymentsMisconfigured,
  taxaComoItem,
  toCheckoutItems,
} from '@/lib/payments';
import { enderecoEmLinha, sanearEndereco, type Endereco } from '@/lib/endereco';
import { ROTULO_FORMA, type EscolhaPagamento } from '@/lib/pagamento';
import type { CartLine, Customer, FulfillmentMode } from '@/lib/store';

export const runtime = 'nodejs';

interface Body {
  lines: CartLine[];
  mode: FulfillmentMode;
  note?: string;
  customer?: Customer | null;
  address?: Partial<Endereco> | null;
  payment?: EscolhaPagamento | null;
  reference?: string;
}

if (paymentsMisconfigured) {
  log.erro(
    'checkout',
    'MP_ACCESS_TOKEN está definido mas MP_WEBHOOK_SECRET não. O pagamento online fica DESLIGADO ' +
      'até o segredo ser configurado — sem ele não dá para confirmar pagamento com segurança.',
  );
}

/**
 * O pagamento online está disponível?
 *
 * O navegador não pode descobrir isso sozinho: a chave do gateway é secreta.
 * A tela de pagamento consulta esta rota para decidir se mostra "pagar agora"
 * — e some com a opção quando não há gateway, em vez de oferecer um botão que
 * não cobra nada.
 */
export async function GET() {
  return NextResponse.json(
    { online: paymentsEnabled },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}

/**
 * Abre o pagamento no Mercado Pago (Pix e cartão).
 *
 * Sem gateway configurado a rota responde 503 e diz o porquê. Ela NÃO devolve
 * mais um "modo demonstração" que o site apresentava como pagamento — cliente
 * real não pode ver "pago" sem ter pago.
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

  if (!paymentsEnabled) {
    log.aviso('checkout', 'pagamento online indisponível:', motivoPagamentoIndisponivel());
    return NextResponse.json(
      {
        error:
          'O pagamento online não está disponível neste site. Finalize o pedido pelo WhatsApp e ' +
          'acerte o pagamento direto com a casa.',
        online: false,
      },
      { status: 503 },
    );
  }

  let body: Body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Corpo inválido' }, { status: 400 });
  }

  const modo: FulfillmentMode = body.mode === 'retirada' ? 'retirada' : 'entrega';
  const itens = toCheckoutItems(body.lines ?? []);
  if (itens.length === 0) {
    return NextResponse.json({ error: 'Sacola vazia' }, { status: 400 });
  }

  const endereco = modo === 'entrega' ? sanearEndereco(body.address) : null;
  if (modo === 'entrega' && !endereco) {
    return NextResponse.json(
      { error: 'Endereço de entrega incompleto. Informe rua, número e bairro.' },
      { status: 400 },
    );
  }

  const subtotal = itemsTotal(itens);
  const frete = taxaComoItem(subtotal, modo);
  const items = frete ? [...itens, frete] : itens;
  const total = itemsTotal(items);

  const forma = body.payment?.forma === 'cartao' ? 'cartao' : 'pix';
  const origin = new URL(request.url).origin;

  /**
   * Identificador do pedido. É o que amarra o pagamento ao pedido e o que
   * permite ao webhook recusar processar o mesmo pedido duas vezes.
   */
  const referencia = (body.reference ?? '').replace(/[^A-Z0-9-]/gi, '').slice(0, 24) || novaRef();

  const preference = {
    items,
    external_reference: referencia,
    payer: body.customer
      ? {
          name: String(body.customer.name ?? '').slice(0, 80),
          phone: { number: String(body.customer.phone ?? '').replace(/\D/g, '').slice(0, 15) },
        }
      : undefined,
    // Pix aprova na hora; cartão passa pelo checkout do Mercado Pago.
    payment_methods:
      forma === 'pix'
        ? { excluded_payment_types: [{ id: 'credit_card' }, { id: 'debit_card' }, { id: 'ticket' }] }
        : { excluded_payment_types: [{ id: 'ticket' }] },
    back_urls: {
      success: `${origin}/?pagamento=aprovado&pedido=${referencia}`,
      pending: `${origin}/?pagamento=pendente&pedido=${referencia}`,
      failure: `${origin}/?pagamento=recusado&pedido=${referencia}`,
    },
    auto_return: 'approved',
    statement_descriptor: business.name.slice(0, 22),
    notification_url: `${origin}/api/webhook/mercadopago`,
    metadata: {
      referencia,
      mode: modo,
      note: String(body.note ?? '').slice(0, 400),
      forma: ROTULO_FORMA[forma],
      customer_name: String(body.customer?.name ?? '').slice(0, 80),
      customer_phone: String(body.customer?.phone ?? '').replace(/\D/g, '').slice(0, 15),
      customer_address: endereco ? enderecoEmLinha(endereco) : '',
      endereco_rua: endereco?.rua ?? '',
      endereco_numero: endereco?.numero ?? '',
      endereco_bairro: endereco?.bairro ?? '',
      endereco_complemento: endereco?.complemento ?? '',
      endereco_referencia: endereco?.referencia ?? '',
      endereco_cep: endereco?.cep ?? '',
      items: items.map((i) => `${i.quantity}x ${i.title}`).join(' | ').slice(0, 900),
    },
  };

  const res = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
      // o Mercado Pago usa esta chave para não duplicar a preferência se a
      // mesma requisição chegar duas vezes
      'X-Idempotency-Key': referencia,
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
    online: true,
    total,
    reference: referencia,
    preferenceId: pref.id,
    checkoutUrl: MP_SANDBOX ? pref.sandbox_init_point : pref.init_point,
  });
}

function novaRef(): string {
  return `${Date.now().toString(36).toUpperCase().slice(-6)}-${Math.random()
    .toString(36)
    .toUpperCase()
    .slice(2, 5)}`;
}
