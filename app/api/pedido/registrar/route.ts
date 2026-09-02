import { NextResponse } from 'next/server';
import { caixaConfigurado } from '@/lib/admin/config';
import { formaDoSite } from '@/lib/admin/rotulos';
import { supabaseAnonimo } from '@/lib/admin/supabase-server';
import { sanearEndereco, type Endereco } from '@/lib/endereco';
import { identificadorAnonimo, limitarTaxa, log } from '@/lib/seguranca';
import type { EscolhaPagamento } from '@/lib/pagamento';

export const runtime = 'nodejs';

/**
 * Registra o pedido do site no fluxo de caixa, ANTES de o WhatsApp abrir.
 *
 * É o passo que faz a dona não precisar cadastrar venda nenhuma à mão: o
 * pedido já chega no painel como PENDENTE no instante em que o cliente
 * fecha a sacola.
 *
 * O que esta rota manda para o banco: id do produto e quantidade. Só isso.
 * Preço, custo, taxa de entrega e total são recalculados dentro de
 * `comida_caseira_create_order`, a partir da tabela de produtos e das áreas
 * de entrega cadastradas. Um `preço` adulterado no corpo da requisição é
 * simplesmente ignorado — não existe caminho em que o navegador diga quanto
 * custa alguma coisa.
 *
 * Idempotência: o `checkoutToken` é único no banco. Dois toques em "Enviar
 * pedido" — ou uma retentativa depois de a rede cair no meio — reaproveitam
 * o mesmo pedido e devolvem o mesmo número.
 */

interface Corpo {
  checkoutToken?: string;
  lines?: { productId?: string; qty?: number; note?: string }[];
  mode?: 'entrega' | 'retirada';
  note?: string;
  customer?: { name?: string; phone?: string } | null;
  address?: Partial<Endereco> | null;
  payment?: Partial<EscolhaPagamento> | null;
}

/**
 * Mensagens que podem chegar ao cliente sem revisão.
 *
 * A exceção do banco vira texto na tela, e texto de exceção costuma carregar
 * nome de tabela e de coluna. Só o que está nesta lista passa; o resto vira
 * uma frase genérica e o detalhe fica no log do servidor.
 */
const MENSAGENS_PUBLICAS = [
  'produto indisponível',
  'pedido abaixo do mínimo de entrega',
  'pedido sem itens',
  'endereço obrigatório na entrega',
  'quantidade inválida',
];

function mensagemSegura(bruta: string | undefined): string {
  const texto = (bruta ?? '').toLowerCase();
  const conhecida = MENSAGENS_PUBLICAS.find((m) => texto.includes(m));
  if (!conhecida) return 'Não foi possível registrar seu pedido. Tente novamente.';
  if (conhecida === 'produto indisponível') {
    return 'Um dos itens da sacola saiu do cardápio. Confira a sacola e tente de novo.';
  }
  if (conhecida === 'pedido abaixo do mínimo de entrega') {
    return 'O pedido está abaixo do mínimo para entrega neste bairro.';
  }
  if (conhecida === 'endereço obrigatório na entrega') {
    return 'Falta completar o endereço de entrega.';
  }
  return 'Confira os itens da sacola e tente de novo.';
}

/** O site pergunta antes de fechar o pedido se há para onde registrar. */
export function GET() {
  return NextResponse.json({ configurado: caixaConfigurado });
}

export async function POST(request: Request) {
  if (!caixaConfigurado) {
    // Sem banco configurado o site segue pelo WhatsApp, que nunca dependeu
    // dele. Dizer a verdade aqui é o que permite ao navegador decidir entre
    // "siga" e "pare" — em vez de fingir que gravou.
    return NextResponse.json({ configurado: false });
  }

  const taxa = limitarTaxa(`registrar:${identificadorAnonimo(request)}`, 12, 60_000);
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
    return NextResponse.json({ erro: 'Pedido em formato inválido.' }, { status: 400 });
  }

  const token = String(corpo.checkoutToken ?? '').trim().slice(0, 80);
  if (!token) {
    return NextResponse.json({ erro: 'Pedido sem identificador.' }, { status: 400 });
  }

  const itens = (corpo.lines ?? [])
    .filter((l) => typeof l?.productId === 'string' && l.productId.trim() !== '')
    .map((l) => ({
      product_id: String(l.productId).trim().slice(0, 80),
      quantity: Math.floor(Number(l.qty) || 0),
      note: String(l.note ?? '').trim().slice(0, 200),
    }))
    .filter((l) => l.quantity > 0);

  if (itens.length === 0) {
    return NextResponse.json({ erro: 'A sacola está vazia.' }, { status: 400 });
  }

  const entrega = corpo.mode !== 'retirada';
  const endereco = entrega ? sanearEndereco(corpo.address) : null;
  if (entrega && !endereco) {
    return NextResponse.json({ erro: 'Falta completar o endereço de entrega.' }, { status: 400 });
  }

  const forma = formaDoSite(String(corpo.payment?.forma ?? ''));
  const trocoReais = Number(corpo.payment?.trocoPara);
  const trocoCentavos =
    forma === 'cash' && corpo.payment?.precisaTroco === true && Number.isFinite(trocoReais) && trocoReais > 0
      ? Math.round(trocoReais * 100)
      : null;

  const supabase = supabaseAnonimo();
  if (!supabase) {
    return NextResponse.json({ erro: 'Fluxo de caixa indisponível.' }, { status: 503 });
  }

  const { data, error } = await supabase.rpc('comida_caseira_create_order', {
    p_checkout_token: token,
    p_order_type: entrega ? 'delivery' : 'pickup',
    p_payment_method: forma,
    p_customer_name: String(corpo.customer?.name ?? '').trim().slice(0, 120),
    p_customer_phone: String(corpo.customer?.phone ?? '').trim().slice(0, 20),
    p_address: endereco
      ? {
          rua: endereco.rua,
          numero: endereco.numero,
          bairro: endereco.bairro,
          complemento: endereco.complemento,
          referencia: endereco.referencia,
          cep: endereco.cep,
        }
      : null,
    p_notes: String(corpo.note ?? '').trim().slice(0, 500),
    p_items: itens,
    p_change_for_cents: trocoCentavos,
  });

  if (error) {
    log.erro('pedido/registrar', error.message);
    return NextResponse.json({ erro: mensagemSegura(error.message) }, { status: 422 });
  }

  const criado = data as {
    order_id: string;
    order_number: number;
    subtotal_cents: number;
    delivery_fee_cents: number;
    total_cents: number;
    duplicate: boolean;
  };

  return NextResponse.json({
    configurado: true,
    orderId: criado.order_id,
    orderNumber: criado.order_number,
    subtotalCents: criado.subtotal_cents,
    deliveryFeeCents: criado.delivery_fee_cents,
    totalCents: criado.total_cents,
    duplicado: criado.duplicate,
  });
}
