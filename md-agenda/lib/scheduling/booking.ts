import 'server-only'

/**
 * Criação e cancelamento de agendamento.
 *
 * O navegador propõe; aqui o servidor confere tudo de novo — serviço ativo,
 * preço, duração, expediente, bloqueio, antecedência, janela e colisão — e só
 * então grava. É a última palavra antes do banco.
 */

import type { Appointment, AppointmentWithToken, Settings } from '@/types'
import { getStore } from '@/lib/db'
import { notifyCancellation, notifyNewAppointment } from '@/lib/notifications/notify'
import { REJECTION_MESSAGE, validateSlot, type SlotRejection } from './availability'

export interface BookingRequest {
  serviceId: string
  date: string
  time: string
  customerName: string
  customerPhone: string
  notes: string | null
}

export type BookingResult =
  | { ok: true; appointment: AppointmentWithToken; settings: Settings; whatsappSent: boolean }
  | { ok: false; code: 'service_not_found'; message: string }
  | { ok: false; code: 'slot_unavailable'; message: string; reason: SlotRejection }
  | { ok: false; code: 'conflict'; message: string }

const CONFLICT_MESSAGE = 'Esse horário acabou de ser reservado. Escolha outro horário.'

export async function createBooking(
  request: BookingRequest,
  now = new Date(),
): Promise<BookingResult> {
  const store = getStore()

  const service = await store.getService(request.serviceId)
  if (!service || !service.active) {
    return {
      ok: false,
      code: 'service_not_found',
      message: 'Esse serviço não está mais disponível.',
    }
  }

  const validation = await validateSlot({
    date: request.date,
    time: request.time,
    durationMinutes: service.durationMinutes,
    now,
  })

  if (!validation.ok) {
    return {
      ok: false,
      code: 'slot_unavailable',
      message: REJECTION_MESSAGE[validation.reason],
      reason: validation.reason,
    }
  }

  const { settings, startsAt, endsAt } = validation

  const created = await store.createAppointment({
    customerName: request.customerName,
    customerPhone: request.customerPhone,
    serviceId: service.id,
    // Snapshot: se o Maicon mudar o preço amanhã, este agendamento continua
    // mostrando o que foi combinado hoje.
    serviceNameSnapshot: service.name,
    servicePriceSnapshot: service.priceCents,
    serviceDurationSnapshot: service.durationMinutes,
    startsAt: startsAt.toISOString(),
    endsAt: endsAt.toISOString(),
    status: settings.autoConfirmAppointments ? 'confirmed' : 'pending',
    notes: request.notes,
  })

  if (!created.ok) {
    return { ok: false, code: 'conflict', message: CONFLICT_MESSAGE }
  }

  // Notificar não pode derrubar um agendamento já gravado.
  let whatsappSent = false
  try {
    const notified = await notifyNewAppointment(created.appointment, settings, now)
    whatsappSent = notified.whatsappSent
  } catch (error) {
    console.error('[md-agenda] falha ao notificar novo agendamento', error)
  }

  return { ok: true, appointment: created.appointment, settings, whatsappSent }
}

export type CancelResult =
  | { ok: true; appointment: Appointment }
  | { ok: false; code: 'not_found' | 'too_late' | 'already_cancelled' | 'finished'; message: string }

export async function cancelBooking(
  appointment: Appointment,
  settings: Settings,
  reason: string | null,
  now = new Date(),
): Promise<CancelResult> {
  if (appointment.status === 'cancelled') {
    return { ok: false, code: 'already_cancelled', message: 'Esse agendamento já está cancelado.' }
  }
  if (appointment.status === 'completed' || appointment.status === 'no_show') {
    return { ok: false, code: 'finished', message: 'Esse agendamento já foi encerrado.' }
  }

  const limit = new Date(appointment.startsAt).getTime() - settings.cancelBeforeMinutes * 60_000
  if (now.getTime() > limit) {
    return {
      ok: false,
      code: 'too_late',
      message: `Entre em contato com ${settings.barberName} para cancelar.`,
    }
  }

  const updated = await getStore().setAppointmentStatus(appointment.id, 'cancelled', reason)
  if (!updated) {
    return { ok: false, code: 'not_found', message: 'Agendamento não encontrado.' }
  }

  try {
    await notifyCancellation(updated, settings, now)
  } catch (error) {
    console.error('[md-agenda] falha ao notificar cancelamento', error)
  }

  return { ok: true, appointment: updated }
}

/** O cliente ainda pode cancelar sozinho? Usado para exibir ou não o botão. */
export function canCustomerCancel(
  appointment: Appointment,
  settings: Settings,
  now = new Date(),
): boolean {
  if (appointment.status !== 'pending' && appointment.status !== 'confirmed') return false
  return (
    now.getTime() <=
    new Date(appointment.startsAt).getTime() - settings.cancelBeforeMinutes * 60_000
  )
}
