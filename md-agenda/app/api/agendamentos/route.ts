import { z } from 'zod'
import { createBooking } from '@/lib/scheduling/booking'
import { createAppointmentSchema, firstIssueMessage } from '@/lib/validation'
import { LIMITS, clientIp, hit } from '@/lib/rate-limit'
import {
  PayloadTooLargeError,
  handleRouteError,
  jsonError,
  jsonOk,
  readJsonBody,
  tooManyRequests,
} from '@/lib/api'
import { buildAppointmentMessage, getWhatsappAppointmentUrl } from '@/lib/notifications/whatsapp'
import { destinationNumber } from '@/lib/notifications/notify'

export const dynamic = 'force-dynamic'

/**
 * Cria o agendamento.
 *
 * O navegador só propõe. Aqui o servidor confere serviço, preço, duração,
 * expediente, bloqueio, antecedência, janela e colisão antes de gravar — e o
 * banco ainda recusa sobreposição por conta própria.
 */
export async function POST(request: Request) {
  const ip = clientIp(request.headers)

  const byIp = hit(`agendar:ip:${ip}`, LIMITS.createByIp.limit, LIMITS.createByIp.windowMs)
  if (!byIp.allowed) return tooManyRequests(byIp.retryAfterSeconds)

  let payload: unknown
  try {
    payload = await readJsonBody(request)
  } catch (error) {
    if (error instanceof PayloadTooLargeError) return jsonError('Dados grandes demais.', 413)
    return jsonError('Não conseguimos entender os dados enviados.', 400)
  }

  const parsed = createAppointmentSchema.safeParse(payload)
  if (!parsed.success) return jsonError(firstIssueMessage(parsed.error as z.ZodError), 400)

  const byPhone = hit(
    `agendar:tel:${parsed.data.customerPhone}`,
    LIMITS.createByPhone.limit,
    LIMITS.createByPhone.windowMs,
  )
  if (!byPhone.allowed) {
    return jsonError(
      'Você já tem agendamentos suficientes registrados agora. Fale com a barbearia para marcar mais.',
      429,
      { retryAfterSeconds: byPhone.retryAfterSeconds },
    )
  }

  try {
    const result = await createBooking({
      serviceId: parsed.data.serviceId,
      date: parsed.data.date,
      time: parsed.data.time,
      customerName: parsed.data.customerName,
      customerPhone: parsed.data.customerPhone,
      notes: parsed.data.notes ?? null,
    })

    if (!result.ok) {
      const status = result.code === 'service_not_found' ? 404 : 409
      return jsonError(result.message, status, { code: result.code })
    }

    const { appointment, settings, whatsappSent } = result
    const message = buildAppointmentMessage(appointment, settings)

    return jsonOk(
      {
        appointment: {
          id: appointment.id,
          code: appointment.code,
          accessToken: appointment.accessToken,
          customerName: appointment.customerName,
          customerPhone: appointment.customerPhone,
          serviceNameSnapshot: appointment.serviceNameSnapshot,
          servicePriceSnapshot: appointment.servicePriceSnapshot,
          serviceDurationSnapshot: appointment.serviceDurationSnapshot,
          startsAt: appointment.startsAt,
          endsAt: appointment.endsAt,
          status: appointment.status,
          notes: appointment.notes,
        },
        // Caminho garantido: funciona sem nenhuma credencial configurada.
        whatsappUrl: getWhatsappAppointmentUrl(message, destinationNumber(settings)),
        // Só é `true` quando a Cloud API confirmou a entrega. A tela de
        // sucesso não promete envio automático sem isso.
        whatsappSent,
        barberName: settings.barberName,
      },
      { status: 201 },
    )
  } catch (error) {
    return handleRouteError('POST /api/agendamentos', error)
  }
}
