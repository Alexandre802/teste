import 'server-only'

/**
 * Notificação do Maicon.
 *
 * Grava a notificação interna (que o Realtime empurra para o painel) e, se a
 * Cloud API estiver configurada, tenta o envio externo. O agendamento já está
 * gravado quando esta função roda: nada aqui pode derrubá-lo.
 */

import type { Appointment, Settings } from '@/types'
import { whatsappNumber } from '@/lib/config'
import { getStore } from '@/lib/db'
import { firstName } from '@/lib/format'
import { toDateStr, toTimeStr, formatDateBR } from '@/lib/time'
import { buildAppointmentMessage, buildCancellationMessage } from './whatsapp'
import { sendWhatsappTextMessage } from './whatsapp-api'

/** Número de destino: o do painel tem precedência sobre o do ambiente. */
export function destinationNumber(settings: Settings): string | null {
  return settings.whatsappNumber ?? whatsappNumber()
}

function whenLabel(appointment: Appointment, settings: Settings, now: Date): string {
  const date = toDateStr(new Date(appointment.startsAt), settings.timezone)
  const today = toDateStr(now, settings.timezone)
  const time = toTimeStr(new Date(appointment.startsAt), settings.timezone)
  if (date === today) return `hoje às ${time}`
  return `${formatDateBR(date)} às ${time}`
}

/**
 * Devolve se o WhatsApp saiu de verdade pela Cloud API. A tela de sucesso usa
 * isso para não prometer um envio automático que não aconteceu.
 */
export async function notifyNewAppointment(
  appointment: Appointment,
  settings: Settings,
  now = new Date(),
): Promise<{ whatsappSent: boolean }> {
  const store = getStore()

  await store.createNotification({
    type: 'appointment_created',
    title: 'Novo agendamento',
    body: `${firstName(appointment.customerName)} marcou ${appointment.serviceNameSnapshot} para ${whenLabel(appointment, settings, now)}.`,
    appointmentId: appointment.id,
  })

  const destination = destinationNumber(settings)
  if (!destination) return { whatsappSent: false }

  const message = buildAppointmentMessage(appointment, settings)
  const result = await sendWhatsappTextMessage(destination, message)
  return { whatsappSent: result.status === 'sent' }
}

export async function notifyCancellation(
  appointment: Appointment,
  settings: Settings,
  now = new Date(),
): Promise<void> {
  const store = getStore()

  await store.createNotification({
    type: 'appointment_cancelled',
    title: 'Agendamento cancelado',
    body: `${firstName(appointment.customerName)} cancelou ${appointment.serviceNameSnapshot} de ${whenLabel(appointment, settings, now)}.`,
    appointmentId: appointment.id,
  })

  const destination = destinationNumber(settings)
  if (!destination) return

  await sendWhatsappTextMessage(destination, buildCancellationMessage(appointment, settings))
}
