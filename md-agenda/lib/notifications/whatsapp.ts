/**
 * Mensagem do WhatsApp — fonte única.
 *
 * O texto que o Maicon recebe é montado exatamente aqui, tanto para o link
 * wa.me quanto para a Cloud API. Nenhum componente monta template por conta
 * própria; o formato está travado por teste.
 */

import type { Appointment, Settings } from '@/types'
import { formatPhoneBR, formatPriceBRL, toInternationalPhone } from '@/lib/format'
import { formatDateBR, formatDuration, toDateStr, toTimeStr } from '@/lib/time'

export function buildAppointmentMessage(
  appointment: Pick<
    Appointment,
    | 'code'
    | 'customerName'
    | 'customerPhone'
    | 'serviceNameSnapshot'
    | 'servicePriceSnapshot'
    | 'serviceDurationSnapshot'
    | 'startsAt'
    | 'notes'
  >,
  settings: Pick<Settings, 'businessName' | 'timezone'>,
): string {
  const startsAt = new Date(appointment.startsAt)
  const linhas: string[] = [
    `NOVO AGENDAMENTO — ${settings.businessName}`,
    '',
    'Cliente:',
    appointment.customerName,
    '',
    'Telefone:',
    formatPhoneBR(appointment.customerPhone),
    '',
    'Serviço:',
    appointment.serviceNameSnapshot,
    '',
    'Data:',
    formatDateBR(toDateStr(startsAt, settings.timezone)),
    '',
    'Horário:',
    toTimeStr(startsAt, settings.timezone),
    '',
    'Duração:',
    formatDuration(appointment.serviceDurationSnapshot),
    '',
    'Valor:',
    formatPriceBRL(appointment.servicePriceSnapshot),
  ]

  if (appointment.notes && appointment.notes.trim().length > 0) {
    linhas.push('', 'Observação:', appointment.notes.trim())
  }

  linhas.push('', 'Código:', appointment.code)

  return linhas.join('\n')
}

/** Aviso de cancelamento feito pelo cliente. */
export function buildCancellationMessage(
  appointment: Pick<
    Appointment,
    'code' | 'customerName' | 'customerPhone' | 'serviceNameSnapshot' | 'startsAt'
  >,
  settings: Pick<Settings, 'businessName' | 'timezone'>,
): string {
  const startsAt = new Date(appointment.startsAt)
  return [
    `AGENDAMENTO CANCELADO — ${settings.businessName}`,
    '',
    'Cliente:',
    appointment.customerName,
    '',
    'Telefone:',
    formatPhoneBR(appointment.customerPhone),
    '',
    'Serviço:',
    appointment.serviceNameSnapshot,
    '',
    'Data:',
    formatDateBR(toDateStr(startsAt, settings.timezone)),
    '',
    'Horário:',
    toTimeStr(startsAt, settings.timezone),
    '',
    'Código:',
    appointment.code,
  ].join('\n')
}

/**
 * Link wa.me. É o caminho garantido: funciona sem credencial nenhuma.
 * Sem número configurado devolve null — e a interface não mostra o botão.
 */
export function getWhatsappAppointmentUrl(
  message: string,
  destinationPhone: string | null,
): string | null {
  if (!destinationPhone) return null
  const digits = toInternationalPhone(destinationPhone)
  if (digits.length < 12) return null
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}
