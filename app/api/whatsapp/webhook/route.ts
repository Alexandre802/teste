import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { business, fullAddress } from '@/lib/business';
import { categories, formatPrice, products } from '@/lib/catalog';
import { sendWhatsappText, whatsappApiEnabled } from '@/lib/whatsapp-api';

export const runtime = 'nodejs';

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN ?? '';
const aiEnabled = Boolean(process.env.ANTHROPIC_API_KEY);

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
  const payload = (await request.json().catch(() => null)) as WhatsappWebhook | null;

  const message = payload?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (!message || message.type !== 'text' || !message.text?.body) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  if (!whatsappApiEnabled || !aiEnabled) {
    console.warn('[whatsapp-bot] faltam credenciais (WHATSAPP_* e/ou ANTHROPIC_API_KEY).');
    return NextResponse.json({ ok: true, skipped: true });
  }

  // não bloqueia o 200 devolvido à Meta
  void replyWithAi(message.from, message.text.body).catch((err) =>
    console.error('[whatsapp-bot] falhou ao responder', err),
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
