import { NextResponse } from 'next/server';
import { business } from '@/lib/business';
import { formatPrice, productsById } from '@/lib/catalog';
import {
  notifyStore,
  storeNumber,
  whatsappApiEnabled,
  whatsappTemplateEnabled,
} from '@/lib/whatsapp-api';
import { identificadorAnonimo, limitarTaxa } from '@/lib/seguranca';
import { enderecoEmLinha, enderecoEmLinhas, sanearEndereco, type Endereco } from '@/lib/endereco';
import { taxaPara } from '@/lib/entrega';
import { ROTULO_FORMA, pagamentoEmLinhas, type EscolhaPagamento, type FormaPagamento } from '@/lib/pagamento';

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
  productId?: string;
  qty?: number;
  note?: string;
}

interface Corpo {
  lines?: Item[];
  mode?: 'entrega' | 'retirada';
  note?: string;
  reference?: string;
  customer?: { name?: string; phone?: string; address?: string; email?: string };
  address?: Partial<Endereco> | null;
  payment?: Partial<EscolhaPagamento> | null;
}

/** Nunca confia na forma vinda do navegador sem conferir contra o conjunto real. */
function lerPagamento(bruto: Corpo['payment'], total: number): EscolhaPagamento {
  const formas: FormaPagamento[] = ['pix', 'cartao', 'dinheiro'];
  const forma = formas.includes(bruto?.forma as FormaPagamento)
    ? (bruto!.forma as FormaPagamento)
    : 'dinheiro';
  const precisaTroco = forma === 'dinheiro' && bruto?.precisaTroco === true;
  const bruteTroco = Number(bruto?.trocoPara);
  // troco menor que o total é inconsistente: cai para "sem troco" em vez de
  // mandar um número que confunde quem está na moto
  const trocoPara =
    precisaTroco && Number.isFinite(bruteTroco) && bruteTroco >= total ? bruteTroco : null;

  return {
    forma,
    momento: bruto?.momento === 'online' && forma !== 'dinheiro' ? 'online' : 'na-entrega',
    precisaTroco: precisaTroco && trocoPara !== null,
    trocoPara,
  };
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

  if (!Array.isArray(corpo.lines)) {
    return NextResponse.json({ erro: 'Pedido sem itens.' }, { status: 400 });
  }

  const itens = corpo.lines
    .slice(0, 100)
    .map((l) => {
      const produto = productsById.get(String(l?.productId ?? ''));
      const qty = Math.min(50, Math.max(1, Math.floor(Number(l?.qty) || 0)));
      if (!produto || !produto.available) return null;
      return { produto, qty, note: String(l?.note ?? '').slice(0, 200) };
    })
    .filter((x): x is { produto: NonNullable<ReturnType<typeof productsById.get>>; qty: number; note: string } =>
      x !== null,
    );

  if (itens.length === 0) {
    return NextResponse.json({ erro: 'Pedido sem itens válidos.' }, { status: 400 });
  }

  const entrega = corpo.mode !== 'retirada';
  const modo = entrega ? 'entrega' : 'retirada';
  const subtotal = itens.reduce((s, i) => s + i.produto.price * i.qty, 0);
  const frete = entrega ? taxaPara(subtotal) : null;
  const total = subtotal + (frete ?? 0);

  const endereco = entrega ? sanearEndereco(corpo.address) : null;
  if (entrega && !endereco && !corpo.customer?.address?.trim()) {
    return NextResponse.json(
      { erro: 'Endereço de entrega incompleto. Informe rua, número e bairro.' },
      { status: 400 },
    );
  }

  const pagamento = lerPagamento(corpo.payment, total);
  const cliente = corpo.customer ?? {};
  const referencia = String(corpo.reference ?? '').replace(/[^A-Z0-9-]/gi, '').slice(0, 24);

  const resumoItens = itens.map((i) => `${i.qty}x ${i.produto.name}`).join(' · ');
  const destino = entrega
    ? endereco
      ? enderecoEmLinha(endereco)
      : (cliente.address ?? '').trim() || 'endereço não informado'
    : 'Retirada no local';

  const dadosCliente =
    [String(cliente.name ?? '').trim(), String(cliente.phone ?? '').trim(), destino]
      .filter(Boolean)
      .join(' · ') || 'sem dados do cliente';

  // texto completo, usado dentro da janela de 24 h
  const texto = [
    `🍔 *Novo pedido pelo site* — ${business.name}`,
    referencia ? `Pedido nº ${referencia}` : '',
    '',
    ...itens.flatMap((i) => [
      `${i.qty}x ${i.produto.name} — ${formatPrice(i.produto.price * i.qty)}`,
      ...(i.note ? [`   obs: ${i.note}`] : []),
    ]),
    '',
    ...(frete !== null
      ? [
          `Subtotal: ${formatPrice(subtotal)}`,
          frete === 0 ? 'Entrega: grátis' : `Taxa de entrega: ${formatPrice(frete)}`,
        ]
      : []),
    `Total: ${formatPrice(total)}`,
    '',
    `Tipo: ${entrega ? 'Entrega' : 'Retirada'}`,
    cliente.name ? `Cliente: ${String(cliente.name).slice(0, 80)}` : '',
    cliente.phone ? `Telefone: ${String(cliente.phone).slice(0, 20)}` : '',
    ...(entrega
      ? endereco
        ? enderecoEmLinhas(endereco)
        : [`Endereço: ${(cliente.address ?? '').trim()}`]
      : ['Retirada no local — sem endereço de entrega.']),
    ...pagamentoEmLinhas(pagamento, total),
    corpo.note?.trim() ? `Observações: ${String(corpo.note).trim().slice(0, 400)}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  // parâmetros do template: uma linha cada
  const resultado = await notifyStore(
    [
      `${ROTULO_FORMA[pagamento.forma]} · ${entrega ? 'Entrega' : 'Retirada'}`,
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
    referencia,
    subtotal,
    taxaEntrega: frete,
    total,
    modo,
  });
}
