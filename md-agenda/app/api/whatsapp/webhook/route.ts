import { whatsappVerifyToken } from '@/lib/config'
import { jsonError, jsonOk } from '@/lib/api'

export const dynamic = 'force-dynamic'

/**
 * Webhook da Cloud API.
 *
 * Sem WHATSAPP_VERIFY_TOKEN configurado a rota falha fechada — não existe
 * verificação "de mentirinha" que aceita qualquer chamada. O produto continua
 * funcionando por wa.me enquanto a Cloud API não estiver ligada.
 */
export async function GET(request: Request) {
  const expected = whatsappVerifyToken()
  if (!expected) {
    return jsonError('Webhook do WhatsApp não configurado.', 503)
  }

  const url = new URL(request.url)
  const mode = url.searchParams.get('hub.mode')
  const token = url.searchParams.get('hub.verify_token')
  const challenge = url.searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === expected && challenge) {
    return new Response(challenge, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    })
  }

  return jsonError('Verificação recusada.', 403)
}

/**
 * Recebe eventos de entrega/leitura. Hoje só confirma o recebimento: o
 * agendamento não depende deste canal.
 */
export async function POST(request: Request) {
  if (!whatsappVerifyToken()) return jsonError('Webhook do WhatsApp não configurado.', 503)
  try {
    await request.text()
  } catch {
    // Corpo ilegível não muda a resposta: a Meta espera 200 para não reenviar.
  }
  return jsonOk({ received: true })
}
