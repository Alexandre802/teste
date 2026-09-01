import { getStore } from '@/lib/db'
import { cancelBooking } from '@/lib/scheduling/booking'
import { cancelSchema, firstIssueMessage } from '@/lib/validation'
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

/** Cancelamento pelo cliente: exige telefone + código, e respeita o prazo. */
export async function POST(request: Request) {
  const ip = clientIp(request.headers)
  const limited = hit(`cancelar:${ip}`, LIMITS.cancel.limit, LIMITS.cancel.windowMs)
  if (!limited.allowed) return tooManyRequests(limited.retryAfterSeconds)

  let payload: unknown
  try {
    payload = await readJsonBody(request, 2_000)
  } catch (error) {
    if (error instanceof PayloadTooLargeError) return jsonError('Dados grandes demais.', 413)
    return jsonError('Não conseguimos entender os dados enviados.', 400)
  }

  const parsed = cancelSchema.safeParse(payload)
  if (!parsed.success) return jsonError(firstIssueMessage(parsed.error), 400)

  try {
    const store = getStore()
    const found = await store.findAppointmentByCode(normalizeCode(parsed.data.code))
    if (!found || found.customerPhone !== parsed.data.phone) {
      return jsonError('Não encontramos um agendamento com esse telefone e código.', 404)
    }

    const settings = await store.getSettings()
    const result = await cancelBooking(found, settings, parsed.data.reason ?? null)

    if (!result.ok) {
      return jsonError(result.message, result.code === 'too_late' ? 409 : 400, {
        code: result.code,
      })
    }

    return jsonOk({ appointment: { id: result.appointment.id, status: result.appointment.status } })
  } catch (error) {
    return handleRouteError('POST /api/agendamentos/cancelar', error)
  }
}
