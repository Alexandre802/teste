import 'server-only'

/**
 * WhatsApp Cloud API — extra.
 *
 * O produto não depende dela. Sem token configurado esta função devolve
 * 'not_configured' e o fluxo segue pelo wa.me, que sempre funciona. Falha de
 * envio nunca derruba o agendamento já gravado.
 */

import {
  isWhatsappCloudApiConfigured,
  whatsappPhoneNumberId,
  whatsappToken,
} from '@/lib/config'
import { toInternationalPhone } from '@/lib/format'

export type CloudApiResult =
  | { status: 'sent'; messageId: string | null }
  | { status: 'not_configured' }
  | { status: 'failed'; error: string }

export async function sendWhatsappTextMessage(
  destinationPhone: string,
  message: string,
): Promise<CloudApiResult> {
  if (!isWhatsappCloudApiConfigured()) return { status: 'not_configured' }

  const phoneNumberId = whatsappPhoneNumberId()
  const token = whatsappToken()

  try {
    const response = await fetch(
      `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: toInternationalPhone(destinationPhone),
          type: 'text',
          text: { preview_url: false, body: message },
        }),
        signal: AbortSignal.timeout(8000),
      },
    )

    if (!response.ok) {
      const detail = await response.text()
      return { status: 'failed', error: `HTTP ${response.status}: ${detail.slice(0, 200)}` }
    }

    const payload = (await response.json()) as { messages?: { id?: string }[] }
    return { status: 'sent', messageId: payload.messages?.[0]?.id ?? null }
  } catch (error) {
    return { status: 'failed', error: error instanceof Error ? error.message : 'erro desconhecido' }
  }
}
