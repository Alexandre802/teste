import { NextResponse } from 'next/server';
import { createHmac } from 'node:crypto';
import Anthropic from '@anthropic-ai/sdk';
import { business, fullAddress } from '@/lib/business';
import { categories, formatPrice, products } from '@/lib/catalog';
import { sendWhatsappText, whatsappApiEnabled } from '@/lib/whatsapp-api';
import { comparaSegura, identificadorAnonimo, limitarTaxa, log } from '@/lib/seguranca';

export const runtime = 'nodejs';

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN ?? '';
const aiEnabled = Boolean(process.env.ANTHROPIC_API_KEY);
const APP_SECRET = process.env.WHATSAPP_APP_SECRET ?? '';

/**
 * Confere a assinatura que a Meta manda em X-Hub-Signature-256.
 *
 * Sem isso qualquer pessoa que descubra a URL do webhook consegue forjar
 * mensagem e fazer o bot responder — o que gasta cota da API do WhatsApp e
 * crédito do modelo, e permite injetar texto no prompt do atendente.
 */
function assinaturaValida(corpoBruto: string, cabecalho: string | null): boolean {
  if (!APP_SECRET) return false;
  if (!cabecalho?.startsWith('sha256=')) return false;
  const esperado = createHmac('sha256', APP_SECRET).update(corpoBruto, 'utf8').digest('hex');
  return comparaSegura(cabecalho.slice(7), esperado);
}

/** Cardápio em texto, injetado no prompt para o bot não inventar item ou preço. */
function menuForPrompt(): string {
  return categories
    .map((category) => {
      const items = products
        .filter((p) => p.category === category.id)
        .map((p) => `- ${p.name}: ${formatPrice(p.price)}${p.available ? '' : ' (ESGOTADO)'}${p.description ? ` — ${p.description}` : ''}`)
        .join('\n');
      return `## ${category.label}\n${items}`;
    })
    .join('\n\n');
}

const SYSTEM_PROMPT = `Você é o atendente virtual da ${business.name}, uma lanchonete em ${business.address.city}-${business.address.state}.

Como responder:
- Português do Brasil, tom simpático e direto, como um atendente de bairro. Frases curtas — é WhatsApp.
- No máximo 4 linhas, salvo quando o cliente pedir o cardápio inteiro.
- Emoji com moderação: no máximo um por mensagem.

Regras que você não pode quebrar:
- Só informe preços e itens que estejam no cardápio abaixo. Nunca invente produto, ingrediente, preço, promoção ou prazo de entrega.
- Se não souber (taxa de entrega, tempo de espera, formas de pagamento na entrega, bairros atendidos), diga que vai confirmar com a equipe. Não chute.
- Itens marcados como ESGOTADO não podem ser oferecidos; sugira alternativa parecida.
- O único horário confirmado é que a casa abre às ${business.opensAt}. Não afirme horário de fechamento.
- Para fechar pedido, oriente o cliente a mandar os itens por aqui mesmo ou pedir pelo site.

Dados da casa:
- Endereço: ${fullAddress}
- Telefone/WhatsApp: ${business.phoneDisplay}
- Serviços: ${business.services.join(', ')}
- Avaliação no Google: ${business.rating.value} de 5 (${business.rating.count} avaliações)

Cardápio completo:
${menuForPrompt()}`;

/** Handshake de verificação do webhook da Meta. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  if (mode === 'subscribe' && VERIFY_TOKEN && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse('Forbidden', { status: 403 });
}

interface WhatsappWebhook {
  entry?: {
    changes?: {
      value?: {
        messages?: { from: string; type: string; text?: { body: string } }[];
      };
    }[];
  }[];
}

/**
 * Resposta automática às mensagens recebidas no WhatsApp da lanchonete.
 *
 * A Meta reenvia o evento se não receber 200 rápido, então respondemos
 * imediatamente e tratamos a mensagem depois.
 */
export async function POST(request: Request) {
  // o corpo cru é lido primeiro: a assinatura cobre os bytes exatos, e
  // reserializar o JSON mudaria o resultado
  const corpoBruto = await request.text();

  if (!assinaturaValida(corpoBruto, request.headers.get('x-hub-signature-256'))) {
    log.aviso('whatsapp-bot', 'assinatura inválida — requisição descartada');
    return NextResponse.json({ erro: 'Assinatura inválida.' }, { status: 401 });
  }

  // teto por remetente: contém laço de mensagens e uso abusivo do modelo
  const { ok } = limitarTaxa(`wa:${identificadorAnonimo(request)}`, 20, 60_000);
  if (!ok) return NextResponse.json({ ok: true, limitado: true });

  let payload: WhatsappWebhook | null = null;
  try {
    payload = JSON.parse(corpoBruto) as WhatsappWebhook;
  } catch {
    return NextResponse.json({ erro: 'Corpo inválido.' }, { status: 400 });
  }

  const message = payload?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (!message || message.type !== 'text' || !message.text?.body) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  if (!whatsappApiEnabled || !aiEnabled) {
    log.aviso('whatsapp-bot', 'faltam credenciais (WHATSAPP_* e/ou ANTHROPIC_API_KEY).');
    return NextResponse.json({ ok: true, skipped: true });
  }

  // não bloqueia o 200 devolvido à Meta
  void replyWithAi(message.from, message.text.body).catch((err) =>
    log.erro('whatsapp-bot', 'falhou ao responder', err),
  );

  return NextResponse.json({ ok: true });
}

async function replyWithAi(from: string, text: string) {
  const client = new Anthropic();

  // beta.messages: é onde vivem `betas` e `fallbacks`. O fallback do servidor
  // evita que uma recusa do classificador deixe o cliente sem resposta.
  const response = await client.beta.messages.create({
    model: 'claude-opus-5',
    max_tokens: 2000,
    system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
    // atendimento curto: pensa o necessário, sem gastar latência
    thinking: { type: 'adaptive' },
    output_config: { effort: 'low' },
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    messages: [{ role: 'user', content: text }],
  });

  if (response.stop_reason === 'refusal') {
    await sendWhatsappText(
      from,
      'Desculpa, não consegui responder essa. Um atendente já te chama por aqui.',
    );
    return;
  }

  const reply = response.content
    .filter((block): block is Anthropic.Beta.BetaTextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('\n')
    .trim();

  if (reply) await sendWhatsappText(from, reply);
}
