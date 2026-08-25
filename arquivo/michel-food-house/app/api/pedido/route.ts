import { NextResponse } from 'next/server';
import { business } from '@/lib/business';
import { formatPrice, productsById } from '@/lib/catalog';
import { notifyStore, storeNumber, whatsappApiEnabled, whatsappTemplateEnabled } from '@/lib/whatsapp-api';
import { identificadorAnonimo, limitarTaxa } from '@/lib/seguranca';

export const runtime = 'nodejs';

/**
 * Avisa a lanchonete de um pedido novo, em todo pedido fechado no site.
 *
 * O total é recalculado aqui a partir do catálogo, com base só nos ids e nas
 * quantidades. O que o navegador manda de preço é ignorado — assim um payload
 * adulterado não faz a cozinha ver um valor que não existe.
 *
 * O aviso nunca derruba o pedido: se o WhatsApp falhar ou não estiver
 * configurado, a rota responde 200 dizendo o que aconteceu, e o cliente segue
 * pelo deeplink wa.me normalmente.
 */

interface Item {
  productId: string;
  qty: number;
  note?: string;
}

interface Corpo {
  lines?: Item[];
  mode?: 'entrega' | 'retirada';
  note?: string;
  paymentStatus?: 'pago' | 'pagar-na-entrega';
  customer?: { name?: string; phone?: string; address?: string; email?: string };
}

export async function POST(request: Request) {
  // teto por solicitante: sem isso dá para inundar o WhatsApp da casa com
  // pedidos falsos e queimar a cota da API
  const taxa = limitarTaxa(`pedido:${identificadorAnonimo(request)}`, 8, 60_000);
  if (!taxa.ok) {
    return NextResponse.json(
      { erro: `Muitos pedidos seguidos. Tente de novo em ${taxa.esperaS}s.` },
      { status: 429, headers: { 'Retry-After': String(taxa.esperaS) } },
    );
  }

  let corpo: Corpo;
  try {
    corpo = await request.json();
  } catch {
    return NextResponse.json({ erro: 'Requisição inválida.' }, { status: 400 });
  }

  const itens = (corpo.lines ?? [])
    .map((l) => {
      const produto = productsById.get(String(l.productId));
      const qty = Math.min(50, Math.max(1, Math.floor(Number(l.qty) || 0)));
      return produto ? { produto, qty, note: String(l.note ?? '').slice(0, 200) } : null;
    })
    .filter((x): x is { produto: NonNullable<ReturnType<typeof productsById.get>>; qty: number; note: string } =>
      x !== null,
    );

  if (itens.length === 0) {
    return NextResponse.json({ erro: 'Pedido sem itens válidos.' }, { status: 400 });
  }

  const total = itens.reduce((s, i) => s + i.produto.price * i.qty, 0);
  const entrega = corpo.mode !== 'retirada';
  const cliente = corpo.customer ?? {};

  const resumoItens = itens.map((i) => `${i.qty}x ${i.produto.name}`).join(' · ');
  const dadosCliente =
    [
      cliente.name?.trim(),
      cliente.phone?.trim(),
      entrega ? cliente.address?.trim() : null,
    ]
      .filter(Boolean)
      .join(' · ') || 'sem dados do cliente';

  const pagamento =
    corpo.paymentStatus === 'pago' ? 'pago pelo site' : 'a combinar na entrega';

  // texto completo, usado dentro da janela de 24 h
  const texto = [
    `🍔 *Novo pedido pelo site* — ${business.name}`,
    '',
    ...itens.flatMap((i) => [
      `${i.qty}x ${i.produto.name} — ${formatPrice(i.produto.price * i.qty)}`,
      ...(i.note ? [`   obs: ${i.note}`] : []),
    ]),
    '',
    `Total: ${formatPrice(total)}`,
    `Tipo: ${entrega ? 'Entrega' : 'Retirada'}`,
    `Pagamento: ${pagamento}`,
    cliente.name ? `Cliente: ${cliente.name}` : '',
    cliente.phone ? `Telefone: ${cliente.phone}` : '',
    entrega && cliente.address ? `Endereço: ${cliente.address}` : '',
    corpo.note?.trim() ? `Obs. do pedido: ${corpo.note.trim()}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  // parâmetros do template: uma linha cada
  const resultado = await notifyStore(
    [
      `${pagamento} · ${entrega ? 'Entrega' : 'Retirada'}`,
      resumoItens,
      formatPrice(total),
      dadosCliente,
    ],
    texto,
  );

  return NextResponse.json({
    ok: true,
    enviado: resultado === 'template' || resultado === 'texto',
    via: resultado,
    destino: storeNumber,
    apiConfigurada: whatsappApiEnabled,
    templateConfigurado: whatsappTemplateEnabled,
    total,
  });
}
