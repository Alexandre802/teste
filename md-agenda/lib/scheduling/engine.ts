/**
 * Motor de disponibilidade.
 *
 * Função pura: recebe configuração, expediente, ocupações e o instante atual,
 * devolve os horários daquele dia. Cliente, API e painel usam esta mesma
 * função — a regra de agenda não é reescrita em lugar nenhum.
 */

import type { BlockedPeriod, BusinessHour, Slot } from '@/types'
import {
  DEFAULT_TIMEZONE,
  dateTimeToUtc,
  minutesToTime,
  timeToMinutes,
  toTimeStr,
  weekdayOf,
} from '@/lib/time'

export interface Interval {
  /** epoch em milissegundos */
  start: number
  end: number
}

export interface SlotRules {
  slotIntervalMinutes: number
  minimumBookingNoticeMinutes: number
  timezone: string
}

export interface ComputeSlotsInput {
  /** Data "YYYY-MM-DD" no fuso da barbearia. */
  date: string
  serviceDurationMinutes: number
  hours: BusinessHour | null
  /** Agendamentos que ocupam a agenda, em intervalos epoch. */
  busy: Interval[]
  /** Bloqueios criados pelo barbeiro, em intervalos epoch. */
  blocked: Interval[]
  rules: SlotRules
  now: Date
}

function overlaps(a: Interval, b: Interval): boolean {
  return a.start < b.end && b.start < a.end
}

/** Converte um período do banco em intervalo epoch. */
export function toInterval(startsAt: string, endsAt: string): Interval {
  return { start: new Date(startsAt).getTime(), end: new Date(endsAt).getTime() }
}

export function blockedToIntervals(blocks: BlockedPeriod[]): Interval[] {
  return blocks.map((block) => toInterval(block.startsAt, block.endsAt))
}

/**
 * Gera os horários de um dia.
 *
 * Um horário só entra como disponível quando o serviço inteiro cabe dentro do
 * expediente, não encosta no intervalo de almoço, não colide com agendamento
 * nem bloqueio e respeita a antecedência mínima.
 */
export function computeSlots(input: ComputeSlotsInput): Slot[] {
  const { date, serviceDurationMinutes, hours, busy, blocked, rules, now } = input
  const timezone = rules.timezone || DEFAULT_TIMEZONE

  if (!hours || !hours.isOpen) return []
  if (serviceDurationMinutes <= 0) return []

  const opensAt = timeToMinutes(hours.opensAt)
  const closesAt = timeToMinutes(hours.closesAt)
  if (opensAt === null || closesAt === null || closesAt <= opensAt) return []

  const step = Math.max(5, rules.slotIntervalMinutes || 30)
  const breakStart = timeToMinutes(hours.breakStart)
  const breakEnd = timeToMinutes(hours.breakEnd)
  const hasBreak = breakStart !== null && breakEnd !== null && breakEnd > breakStart

  const earliestStart = now.getTime() + rules.minimumBookingNoticeMinutes * 60_000

  const slots: Slot[] = []

  for (let minute = opensAt; minute + serviceDurationMinutes <= closesAt; minute += step) {
    const time = minutesToTime(minute)
    const startsAt = dateTimeToUtc(date, time, timezone)
    const endsAt = new Date(startsAt.getTime() + serviceDurationMinutes * 60_000)
    const candidate: Interval = { start: startsAt.getTime(), end: endsAt.getTime() }

    let reason: Slot['reason'] = null

    if (hasBreak && minute < breakEnd! && breakStart! < minute + serviceDurationMinutes) {
      reason = 'break'
    } else if (candidate.start < earliestStart) {
      reason = 'notice'
    } else if (blocked.some((interval) => overlaps(candidate, interval))) {
      reason = 'blocked'
    } else if (busy.some((interval) => overlaps(candidate, interval))) {
      reason = 'busy'
    }

    slots.push({
      time,
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      available: reason === null,
      reason,
    })
  }

  return slots
}

export interface AvailabilityCheck {
  ok: boolean
  reason?: 'closed' | 'outside_hours' | 'break' | 'notice' | 'busy' | 'blocked' | 'window' | 'past'
}

/**
 * Confere um horário específico. É o que a API chama antes de gravar —
 * o navegador nunca decide sozinho se um horário está livre.
 */
export function checkSlot(params: {
  startsAt: Date
  durationMinutes: number
  hours: BusinessHour | null
  busy: Interval[]
  blocked: Interval[]
  rules: SlotRules
  bookingWindowDays: number
  now: Date
}): AvailabilityCheck {
  const { startsAt, durationMinutes, hours, busy, blocked, rules, bookingWindowDays, now } = params
  const timezone = rules.timezone || DEFAULT_TIMEZONE
  const endsAt = new Date(startsAt.getTime() + durationMinutes * 60_000)
  const candidate: Interval = { start: startsAt.getTime(), end: endsAt.getTime() }

  if (candidate.start <= now.getTime()) return { ok: false, reason: 'past' }

  const horizon = now.getTime() + bookingWindowDays * 86_400_000
  if (candidate.start > horizon) return { ok: false, reason: 'window' }

  if (candidate.start < now.getTime() + rules.minimumBookingNoticeMinutes * 60_000) {
    return { ok: false, reason: 'notice' }
  }

  if (!hours || !hours.isOpen) return { ok: false, reason: 'closed' }

  const opensAt = timeToMinutes(hours.opensAt)
  const closesAt = timeToMinutes(hours.closesAt)
  if (opensAt === null || closesAt === null) return { ok: false, reason: 'closed' }

  const startMinute = timeToMinutes(toTimeStr(startsAt, timezone))
  if (startMinute === null) return { ok: false, reason: 'outside_hours' }
  if (startMinute < opensAt || startMinute + durationMinutes > closesAt) {
    return { ok: false, reason: 'outside_hours' }
  }

  const breakStart = timeToMinutes(hours.breakStart)
  const breakEnd = timeToMinutes(hours.breakEnd)
  if (
    breakStart !== null &&
    breakEnd !== null &&
    breakEnd > breakStart &&
    startMinute < breakEnd &&
    breakStart < startMinute + durationMinutes
  ) {
    return { ok: false, reason: 'break' }
  }

  if (blocked.some((interval) => overlaps(candidate, interval))) {
    return { ok: false, reason: 'blocked' }
  }
  if (busy.some((interval) => overlaps(candidate, interval))) {
    return { ok: false, reason: 'busy' }
  }

  return { ok: true }
}

/** O horário informado precisa bater com a grade configurada. */
export function isOnGrid(
  startsAt: Date,
  hours: BusinessHour | null,
  rules: SlotRules,
): boolean {
  const opensAt = timeToMinutes(hours?.opensAt)
  if (opensAt === null) return false
  const startMinute = timeToMinutes(toTimeStr(startsAt, rules.timezone || DEFAULT_TIMEZONE))
  if (startMinute === null) return false
  const step = Math.max(5, rules.slotIntervalMinutes || 30)
  return (startMinute - opensAt) % step === 0 && startMinute >= opensAt
}

/** Lista de datas que o cliente pode escolher, respeitando a janela. */
export function bookableDates(params: {
  from: string
  days: number
  bookingWindowDays: number
  today: string
  hours: BusinessHour[]
}): { date: string; open: boolean; withinWindow: boolean }[] {
  const { from, days, bookingWindowDays, today, hours } = params
  const byWeekday = new Map(hours.map((hour) => [hour.weekday, hour]))
  const result: { date: string; open: boolean; withinWindow: boolean }[] = []

  const [fromYear, fromMonth, fromDay] = from.split('-').map(Number)
  const [todayYear, todayMonth, todayDay] = today.split('-').map(Number)
  const fromMs = Date.UTC(fromYear, fromMonth - 1, fromDay)
  const todayMs = Date.UTC(todayYear, todayMonth - 1, todayDay)

  for (let index = 0; index < days; index += 1) {
    const dayMs = fromMs + index * 86_400_000
    const current = new Date(dayMs)
    const date = `${current.getUTCFullYear()}-${String(current.getUTCMonth() + 1).padStart(2, '0')}-${String(current.getUTCDate()).padStart(2, '0')}`
    const offset = Math.round((dayMs - todayMs) / 86_400_000)
    result.push({
      date,
      open: byWeekday.get(weekdayOf(date))?.isOpen ?? false,
      withinWindow: offset >= 0 && offset <= bookingWindowDays,
    })
  }

  return result
}
