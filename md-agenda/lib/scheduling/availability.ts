import 'server-only'

/**
 * Ponte entre o banco e o motor de disponibilidade.
 *
 * Toda pergunta sobre horário livre — do cliente, da API ou do painel — passa
 * por aqui. É o único lugar que junta expediente, bloqueios e agendamentos.
 */

import { BLOCKING_STATUSES, type BusinessHour, type Service, type Settings, type Slot } from '@/types'
import { getStore } from '@/lib/db'
import { addDays, dateTimeToUtc, toDateStr, weekdayOf } from '@/lib/time'
import { blockedToIntervals, checkSlot, computeSlots, toInterval, type Interval } from './engine'

export interface DayContext {
  settings: Settings
  hours: BusinessHour | null
  busy: Interval[]
  blocked: Interval[]
}

/** Carrega tudo que o motor precisa para um dia — uma ida ao banco por coleção. */
export async function loadDayContext(date: string): Promise<DayContext> {
  const store = getStore()
  const [settings, hoursList] = await Promise.all([store.getSettings(), store.listBusinessHours()])

  const dayStart = dateTimeToUtc(date, '00:00', settings.timezone)
  const dayEnd = dateTimeToUtc(addDays(date, 1), '00:00', settings.timezone)

  // A janela abre um dia para trás: um serviço iniciado ontem à noite pode
  // invadir a madrugada de hoje.
  const [appointments, blocks] = await Promise.all([
    store.listAppointments({
      fromISO: new Date(dayStart.getTime() - 86_400_000).toISOString(),
      toISO: dayEnd.toISOString(),
      statuses: BLOCKING_STATUSES,
    }),
    store.listBlockedPeriods({
      fromISO: dayStart.toISOString(),
      toISO: dayEnd.toISOString(),
    }),
  ])

  return {
    settings,
    hours: hoursList.find((hour) => hour.weekday === weekdayOf(date)) ?? null,
    busy: appointments.map((appointment) => toInterval(appointment.startsAt, appointment.endsAt)),
    blocked: blockedToIntervals(blocks),
  }
}

export interface DayAvailability {
  date: string
  slots: Slot[]
  isOpen: boolean
  settings: Settings
}

export async function getDayAvailability(
  service: Pick<Service, 'durationMinutes'>,
  date: string,
  now = new Date(),
  ignoreAppointmentId?: string,
): Promise<DayAvailability> {
  const context = await loadDayContext(date)
  let busy = context.busy

  if (ignoreAppointmentId) {
    const existing = await getStore().getAppointmentById(ignoreAppointmentId)
    if (existing) {
      const start = new Date(existing.startsAt).getTime()
      const end = new Date(existing.endsAt).getTime()
      busy = busy.filter((interval) => interval.start !== start || interval.end !== end)
    }
  }

  const slots = computeSlots({
    date,
    serviceDurationMinutes: service.durationMinutes,
    hours: context.hours,
    busy,
    blocked: context.blocked,
    rules: {
      slotIntervalMinutes: context.settings.slotIntervalMinutes,
      minimumBookingNoticeMinutes: context.settings.minimumBookingNoticeMinutes,
      timezone: context.settings.timezone,
    },
    now,
  })

  return {
    date,
    slots,
    isOpen: Boolean(context.hours?.isOpen),
    settings: context.settings,
  }
}

export type SlotRejection =
  | 'closed'
  | 'outside_hours'
  | 'break'
  | 'notice'
  | 'busy'
  | 'blocked'
  | 'window'
  | 'past'

/** Revalidação no servidor, imediatamente antes de gravar. */
export async function validateSlot(params: {
  date: string
  time: string
  durationMinutes: number
  now?: Date
  ignoreAppointmentId?: string
}): Promise<{ ok: true; startsAt: Date; endsAt: Date; settings: Settings } | { ok: false; reason: SlotRejection }> {
  const now = params.now ?? new Date()
  const context = await loadDayContext(params.date)
  const startsAt = dateTimeToUtc(params.date, params.time, context.settings.timezone)
  const endsAt = new Date(startsAt.getTime() + params.durationMinutes * 60_000)

  let busy = context.busy
  if (params.ignoreAppointmentId) {
    const existing = await getStore().getAppointmentById(params.ignoreAppointmentId)
    if (existing) {
      const start = new Date(existing.startsAt).getTime()
      const end = new Date(existing.endsAt).getTime()
      busy = busy.filter((interval) => interval.start !== start || interval.end !== end)
    }
  }

  const result = checkSlot({
    startsAt,
    durationMinutes: params.durationMinutes,
    hours: context.hours,
    busy,
    blocked: context.blocked,
    rules: {
      slotIntervalMinutes: context.settings.slotIntervalMinutes,
      minimumBookingNoticeMinutes: context.settings.minimumBookingNoticeMinutes,
      timezone: context.settings.timezone,
    },
    bookingWindowDays: context.settings.bookingWindowDays,
    now,
  })

  if (!result.ok) return { ok: false, reason: result.reason ?? 'busy' }
  return { ok: true, startsAt, endsAt, settings: context.settings }
}

/** Datas que a faixa do cliente mostra, já sabendo quais estão fechadas. */
export async function getCalendarStrip(
  from: string,
  days: number,
  now = new Date(),
): Promise<{ date: string; open: boolean; withinWindow: boolean }[]> {
  const store = getStore()
  const [settings, hours] = await Promise.all([store.getSettings(), store.listBusinessHours()])
  const today = toDateStr(now, settings.timezone)
  const byWeekday = new Map(hours.map((hour) => [hour.weekday, hour]))

  return Array.from({ length: days }, (_, index) => {
    const date = addDays(from, index)
    const offsetDays = Math.round(
      (Date.parse(`${date}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86_400_000,
    )
    return {
      date,
      open: byWeekday.get(weekdayOf(date))?.isOpen ?? false,
      withinWindow: offsetDays >= 0 && offsetDays <= settings.bookingWindowDays,
    }
  })
}

export const REJECTION_MESSAGE: Record<SlotRejection, string> = {
  closed: 'A barbearia não atende nesta data.',
  outside_hours: 'Esse horário está fora do expediente.',
  break: 'Esse horário cai no intervalo do Maicon.',
  notice: 'Esse horário está próximo demais. Escolha um horário mais adiante.',
  busy: 'Esse horário acabou de ser reservado. Escolha outro horário.',
  blocked: 'O Maicon bloqueou esse horário. Escolha outro horário.',
  window: 'Ainda não é possível agendar tão longe. Escolha uma data mais próxima.',
  past: 'Esse horário já passou. Escolha outro horário.',
}
