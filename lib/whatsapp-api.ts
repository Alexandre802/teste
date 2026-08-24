import { business } from './business';

const TOKEN = process.env.WHATSAPP_TOKEN ?? '';
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID ?? '';
/** Número da lanchonete que recebe o aviso de pedido pago. */
const STORE_NUMBER = process.env.WHATSAPP_STORE_NUMBER ?? business.whatsapp;
const API_VERSION = process.env.WHATSAPP_API_VERSION ?? 'v21.0';

export const whatsappApiEnabled = Boolean(TOKEN && PHONE_NUMBER_ID);

/**
 * Envia texto pela WhatsApp Cloud API (Meta).
 *
 * Exige WHATSAPP_TOKEN e WHATSAPP_PHONE_NUMBER_ID de um número comercial
 * verificado. Sem isso a função não lança: registra e devolve `false`, para
 * um pedido nunca falhar por causa da notificação.
 *
 * Nota importante: a API só envia mensagens a partir do número DA LOJA.
 * Não existe forma de disparar uma mensagem em nome do cliente — quem manda
 * do número dele é ele mesmo, pelo deeplink wa.me do site.
 */
export async function sendWhatsappText(to: string, body: string): Promise<boolean> {
  if (!whatsappApiEnabled) {
    console.warn('[whatsapp] Cloud API não configurada — mensagem não enviada.');
    return false;
  }

  const res = await fetch(`https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: to.replace(/\D/g, ''),
      type: 'text',
      text: { preview_url: false, body },
    }),
  });

  if (!res.ok) {
    console.error('[whatsapp] envio falhou', res.status, await res.text());
    return false;
  }
  return true;
}

export function notifyStore(body: string) {
  return sendWhatsappText(STORE_NUMBER, body);
}
