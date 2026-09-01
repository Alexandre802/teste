import { getStore } from '@/lib/db'
import { canCustomerCancel } from '@/lib/scheduling/booking'
import { firstIssueMessage, lookupSchema } from '@/lib/validation'
import { normalizeCode } from '@/lib/format'
import { LIMITS, clientIp, hit } from '@/lib/rate-limit'
import {
  PayloadTooLargeError,
  handleRouteError,
  jsonError,
  jsonOk,
  readJsonBody,
  tooManyRequests,
} from '@/lib/api'

export const dynamic = 'force-dynamic'

/**
 * Consulta sem conta.
 *
 * Telefone sozinho não abre a agenda de ninguém: é preciso o código do
 * agendamento, que só quem agendou recebe. Com o par correto, devolvemos
 * aquele agendamento e os próximos daquele mesmo telefone.
 *
 * A resposta é sempre a mesma para código errado e telefone errado, e o
 * limitador segura a força bruta no código.
 */
export async function POST(request: Request) {
  const ip = clientIp(request.headers)
  const limited = hit(`consulta:${ip}`, LIMITS.lookup.limit, LIMITS.lookup.windowMs)
  if (!limited.allowed) return tooManyRequests(limited.retryAfterSeconds)

  let payload: unknown
  try {
    payload = await readJsonBody(request, 2_000)
  } catch (error) {
    if (error instanceof PayloadTooLargeError) return jsonError('Dados grandes demais.', 413)
    return jsonError('Não conseguimos entender os dados enviados.', 400)
  }

  const parsed = lookupSchema.safeParse(payload)
  if (!parsed.success) return jsonError(firstIssueMessage(parsed.error), 400)

  const notFound = jsonError('Não encontramos um agendamento com esse telefone e código.', 404)

  try {
    const store = getStore()
    const found = await store.findAppointmentByCode(normalizeCode(parsed.data.code))
    if (!found || found.customerPhone !== parsed.data.phone) return notFound

    const settings = await store.getSettings()
    const now = new Date()
    const upcoming = await store.listAppointmentsByPhone(
      parsed.data.phone,
      new Date(now.getTime() - 12 * 3_600_000).toISOString(),
    )

    const list = [
      found,
      ...upcoming.filter((appointment) => appointment.id !== found.id),
    ].map((appointment) => ({
      id: appointment.id,
      code: appointment.code,
      customerName: appointment.customerName,
      serviceNameSnapshot: appointment.serviceNameSnapshot,
      servicePriceSnapshot: appointment.servicePriceSnapshot,
      serviceDurationSnapshot: appointment.serviceDurationSnapshot,
      startsAt: appointment.startsAt,
      endsAt: appointment.endsAt,
      status: appointment.status,
      notes: appointment.notes,
      canCancel: canCustomerCancel(appointment, settings, now),
    }))

    return jsonOk({
      appointments: list,
      cancelBeforeMinutes: settings.cancelBeforeMinutes,
      barberName: settings.barberName,
    })
  } catch (error) {
    return handleRouteError('POST /api/agendamentos/consulta', error)
  }
}
