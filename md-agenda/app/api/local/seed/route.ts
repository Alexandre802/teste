import { isLocalStoreEnabled } from '@/lib/config'
import { memoryStore, resetMemoryStore } from '@/lib/db/memory'
import { resetRateLimit } from '@/lib/rate-limit'
import { jsonError, jsonOk, readJsonBody } from '@/lib/api'
import type { BusinessHour, Settings } from '@/types'

export const dynamic = 'force-dynamic'

/**
 * Preparo de cenário do banco local.
 *
 * Existe só para desenvolvimento e para a suíte automatizada. Exige o banco
 * local ativo (que por sua vez exige ausência de Supabase) e um token
 * dedicado. Em produção, com Supabase configurado, esta rota responde 404 —
 * ela nem sabe escrever no banco real.
 */
export async function POST(request: Request) {
  if (!isLocalStoreEnabled()) return jsonError('Rota indisponível.', 404)

  const expected = process.env.MD_AGENDA_LOCAL_STORE_TOKEN
  if (!expected || request.headers.get('x-seed-token') !== expected) {
    return jsonError('Token inválido.', 401)
  }

  const payload = (await readJsonBody(request, 40_000)) as {
    reset?: boolean
    services?: {
      name: string
      description?: string | null
      priceCents: number
      durationMinutes: number
      active?: boolean
      sortOrder?: number
    }[]
    hours?: BusinessHour[]
    settings?: Partial<Settings>
    blocks?: { startsAt: string; endsAt: string; reason?: string | null }[]
    appointments?: {
      customerName: string
      customerPhone: string
      serviceIndex: number
      startsAt: string
      durationMinutes: number
      status?: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
      notes?: string | null
    }[]
  }

  if (payload.reset) {
    resetMemoryStore()
    // O limitador é por processo: sem zerar, um cenário derruba o seguinte.
    resetRateLimit()
  }

  const createdServices = []
  for (const service of payload.services ?? []) {
    createdServices.push(
      await memoryStore.createService({
        name: service.name,
        description: service.description ?? null,
        priceCents: service.priceCents,
        durationMinutes: service.durationMinutes,
        active: service.active ?? true,
        sortOrder: service.sortOrder ?? 0,
      }),
    )
  }

  if (payload.hours) await memoryStore.saveBusinessHours(payload.hours)
  if (payload.settings) await memoryStore.updateSettings(payload.settings)

  for (const block of payload.blocks ?? []) {
    await memoryStore.createBlockedPeriod({
      startsAt: block.startsAt,
      endsAt: block.endsAt,
      reason: block.reason ?? null,
    })
  }

  const createdAppointments = []
  for (const appointment of payload.appointments ?? []) {
    const service = createdServices[appointment.serviceIndex]
    const result = await memoryStore.createAppointment({
      customerName: appointment.customerName,
      customerPhone: appointment.customerPhone,
      serviceId: service?.id ?? '',
      serviceNameSnapshot: service?.name ?? 'Serviço',
      servicePriceSnapshot: service?.priceCents ?? 0,
      serviceDurationSnapshot: appointment.durationMinutes,
      startsAt: appointment.startsAt,
      endsAt: new Date(
        new Date(appointment.startsAt).getTime() + appointment.durationMinutes * 60_000,
      ).toISOString(),
      status: appointment.status ?? 'confirmed',
      notes: appointment.notes ?? null,
    })
    if (result.ok) createdAppointments.push(result.appointment)
  }

  return jsonOk({
    services: createdServices,
    appointments: createdAppointments.map((appointment) => ({
      id: appointment.id,
      code: appointment.code,
      startsAt: appointment.startsAt,
    })),
  })
}
