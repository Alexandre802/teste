import { getStore } from '@/lib/db'
import { getDayAvailability } from '@/lib/scheduling/availability'
import { availabilityQuerySchema, firstIssueMessage } from '@/lib/validation'
import { handleRouteError, jsonError, jsonOk } from '@/lib/api'

export const dynamic = 'force-dynamic'

/**
 * Horários de um dia para um serviço.
 *
 * A resposta sai do mesmo motor que valida a gravação — o cliente nunca vê
 * uma lista que o servidor recusaria depois.
 */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const parsed = availabilityQuerySchema.safeParse({
    serviceId: url.searchParams.get('serviceId') ?? '',
    date: url.searchParams.get('date') ?? '',
  })

  if (!parsed.success) return jsonError(firstIssueMessage(parsed.error), 400)

  try {
    const service = await getStore().getService(parsed.data.serviceId)
    if (!service || !service.active) {
      return jsonError('Esse serviço não está mais disponível.', 404)
    }

    const availability = await getDayAvailability(service, parsed.data.date)

    return jsonOk({
      date: availability.date,
      isOpen: availability.isOpen,
      slots: availability.slots,
      durationMinutes: service.durationMinutes,
    })
  } catch (error) {
    return handleRouteError('GET /api/disponibilidade', error)
  }
}
