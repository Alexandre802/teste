import { business } from './business';

const TOKEN = process.env.WHATSAPP_TOKEN ?? '';
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID ?? '';
/** Número da lanchonete que recebe o aviso de pedido. */
const STORE_NUMBER = process.env.WHATSAPP_STORE_NUMBER ?? business.whatsapp;
const API_VERSION = process.env.WHATSAPP_API_VERSION ?? 'v21.0';
/** Template aprovado no Meta Business para avisos fora da janela de 24 h. */
const TEMPLATE = process.env.WHATSAPP_TEMPLATE_NAME ?? '';
const TEMPLATE_LANG = process.env.WHATSAPP_TEMPLATE_LANG ?? 'pt_BR';

export const whatsappApiEnabled = Boolean(TOKEN && PHONE_NUMBER_ID);
export const whatsappTemplateEnabled = Boolean(TEMPLATE);
export const storeNumber = STORE_NUMBER;

async function post(payload: Record<string, unknown>): Promise<boolean> {
  if (!whatsappApiEnabled) {
    console.warn('[whatsapp] Cloud API não configurada — mensagem não enviada.');
    return false;
  }
  try {
    const res = await fetch(`https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messaging_product: 'whatsapp', ...payload }),
    });
    if (!res.ok) {
      console.error('[whatsapp] envio falhou', res.status, await res.text());
      return false;
    }
    return true;
  } catch (erro) {
    console.error('[whatsapp] erro de rede', erro);
    return false;
  }
}

/**
 * Texto livre.
 *
 * Só é entregue dentro da janela de 24 h: o WhatsApp exige que o destinatário
 * tenha mandado mensagem ao número da API nas últimas 24 horas. Para avisar a
 * loja de um pedido novo isso quase nunca vale — use `notifyStore`, que manda
 * template quando há um configurado.
 */
export async function sendWhatsappText(to: string, body: string): Promise<boolean> {
  return post({
    to: to.replace(/\D/g, ''),
    type: 'text',
    text: { preview_url: false, body },
  });
}

/**
 * Mensagem de template aprovado. É o único formato que o WhatsApp entrega
 * fora da janela de 24 h — o caso do aviso de pedido novo para a loja.
 *
 * Parâmetro de template não aceita quebra de linha nem tabulação: a API
 * rejeita a mensagem inteira. Por isso cada parâmetro chega aqui em uma linha
 * só, e a função ainda higieniza por segurança.
 */
export async function sendWhatsappTemplate(to: string, params: string[]): Promise<boolean> {
  if (!TEMPLATE) return false;
  const limpos = params.map((p) => p.replace(/\s+/g, ' ').trim().slice(0, 900));
  return post({
    to: to.replace(/\D/g, ''),
    type: 'template',
    template: {
      name: TEMPLATE,
      language: { code: TEMPLATE_LANG },
      components: [
        {
          type: 'body',
          parameters: limpos.map((text) => ({ type: 'text', text })),
        },
      ],
    },
  });
}

export type ResultadoAviso = 'template' | 'texto' | 'nao-configurado' | 'falhou';

/**
 * Avisa a lanchonete de um pedido novo.
 *
 * Tenta o template primeiro, porque é o que funciona fora da janela de 24 h.
 * Sem template configurado, cai no texto livre — que só chega se alguém do
 * número da loja tiver escrito para o número da API nas últimas 24 horas.
 */
export async function notifyStore(
  params: string[],
  textoCompleto: string,
): Promise<ResultadoAviso> {
  if (!whatsappApiEnabled) return 'nao-configurado';
  if (TEMPLATE && (await sendWhatsappTemplate(STORE_NUMBER, params))) return 'template';
  if (await sendWhatsappText(STORE_NUMBER, textoCompleto)) return 'texto';
  return 'falhou';
}
