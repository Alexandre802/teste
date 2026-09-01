import 'server-only'

/**
 * Consultas do painel.
 *
 * Números do dashboard saem do banco, não de estimativa: cada card conta
 * linhas reais do intervalo pedido.
 */

import type { Appointment, Settings } from '@/types'
import { getStore } from '@/lib/db'
import { addDays, dateTimeToUtc, toDateStr } from '@/lib/time'

export interface DashboardData {
  settings: Settings
  today: string
  todayAppointments: Appointment[]
  counts: {
    total: number
    confirmed: number
    pending: number
    cancelled: number
    completed: number
  }
  nextAppointment: Appointment | null
  week: { date: string; total: number }[]
  unreadNotifications: number
}

export async function loadDashboard(now = new Date()): Promise<DashboardData> {
  const store = getStore()
  const settings = await store.getSettings()
  const today = toDateStr(now, settings.timezone)

  const dayStart = dateTimeToUtc(today, '00:00', settings.timezone)
  const dayEnd = dateTimeToUtc(addDays(today, 1), '00:00', settings.timezone)
  const weekStart = dateTimeToUtc(addDays(today, -6), '00:00', settings.timezone)

  const [todayAppointments, weekAppointments, upcoming, notifications] = await Promise.all([
    store.listAppointments({ fromISO: dayStart.toISOString(), toISO: dayEnd.toISOString() }),
    store.listAppointments({ fromISO: weekStart.toISOString(), toISO: dayEnd.toISOString() }),
    store.listAppointments({
      fromISO: now.toISOString(),
      toISO: dateTimeToUtc(addDays(today, 30), '00:00', settings.timezone).toISOString(),
      statuses: ['pending', 'confirmed'],
    }),
    store.listNotifications(50),
  ])

  const counts = {
    total: todayAppointments.filter((item) => item.status !== 'cancelled').length,
    confirmed: todayAppointments.filter((item) => item.status === 'confirmed').length,
    pending: todayAppointments.filter((item) => item.status === 'pending').length,
    cancelled: todayAppointments.filter((item) => item.status === 'cancelled').length,
    completed: todayAppointments.filter((item) => item.status === 'completed').length,
  }

  const week = Array.from({ length: 7 }, (_, index) => {
    const date = addDays(today, index - 6)
    return {
      date,
      total: weekAppointments.filter(
        (item) =>
          item.status !== 'cancelled' &&
          toDateStr(new Date(item.startsAt), settings.timezone) === date,
      ).length,
    }
  })

  return {
    settings,
    today,
    todayAppointments,
    counts,
    nextAppointment: upcoming[0] ?? null,
    week,
    unreadNotifications: notifications.filter((item) => !item.read).length,
  }
}

export type AgendaView = 'hoje' | 'semana' | 'mes'

export interface AgendaRange {
  fromISO: string
  toISO: string
  label: string
  days: string[]
}

/** Janela de datas de cada visualização do calendário. */
export function agendaRange(
  view: AgendaView,
  anchor: string,
  timezone: string,
): AgendaRange {
  if (view === 'hoje') {
    return {
      fromISO: dateTimeToUtc(anchor, '00:00', timezone).toISOString(),
      toISO: dateTimeToUtc(addDays(anchor, 1), '00:00', timezone).toISOString(),
      label: anchor,
      days: [anchor],
    }
  }

  if (view === 'semana') {
    const [year, month, day] = anchor.split('-').map(Number)
    const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay()
    const start = addDays(anchor, -weekday)
    return {
      fromISO: dateTimeToUtc(start, '00:00', timezone).toISOString(),
      toISO: dateTimeToUtc(addDays(start, 7), '00:00', timezone).toISOString(),
      label: start,
      days: Array.from({ length: 7 }, (_, index) => addDays(start, index)),
    }
  }

  const [year, month] = anchor.split('-').map(Number)
  const start = `${year}-${String(month).padStart(2, '0')}-01`
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate()
  return {
    fromISO: dateTimeToUtc(start, '00:00', timezone).toISOString(),
    toISO: dateTimeToUtc(addDays(start, daysInMonth), '00:00', timezone).toISOString(),
    label: start,
    days: Array.from({ length: daysInMonth }, (_, index) => addDays(start, index)),
  }
}
