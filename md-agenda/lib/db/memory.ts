/**
 * Banco local em memória.
 *
 * Existe para desenvolvimento sem Supabase e para a suíte automatizada. Só é
 * escolhido quando MD_AGENDA_LOCAL_STORE=1 e não há Supabase configurado, e
 * enquanto está ativo a interface avisa na tela que os dados não são
 * permanentes. Ele guarda de verdade e recusa conflito de verdade — o que a
 * exclusion constraint do Postgres faz no ambiente real, aqui um mutex faz.
 */

import { randomUUID } from 'node:crypto'
import type {
  Appointment,
  AppointmentStatus,
  AppointmentWithToken,
  BlockedPeriod,
  BusinessHour,
  CustomerSummary,
  Notification,
  Service,
  Settings,
} from '@/types'
import { BLOCKING_STATUSES } from '@/types'
import { generateAppointmentCode } from '@/lib/format'
import { DEFAULT_SETTINGS, defaultBusinessHours } from './defaults'
import type {
  AppointmentRange,
  CreateAppointmentInput,
  CreateAppointmentResult,
  DataStore,
  RescheduleResult,
  ServiceInput,
} from './store'

interface StoredAppointment extends Appointment {
  accessToken: string
}

interface MemoryState {
  services: Service[]
  hours: BusinessHour[]
  blocks: BlockedPeriod[]
  appointments: StoredAppointment[]
  notifications: Notification[]
  settings: Settings
  lock: Promise<unknown>
}

const STATE_KEY = Symbol.for('md-agenda.memory-state')

function freshState(): MemoryState {
  return {
    services: [],
    hours: defaultBusinessHours(),
    blocks: [],
    appointments: [],
    notifications: [],
    settings: { ...DEFAULT_SETTINGS },
    lock: Promise.resolve(),
  }
}

function state(): MemoryState {
  const holder = globalThis as unknown as Record<symbol, MemoryState | undefined>
  if (!holder[STATE_KEY]) holder[STATE_KEY] = freshState()
  return holder[STATE_KEY]!
}

/** Serializa checagem e gravação — dois pedidos simultâneos não se cruzam. */
async function withLock<T>(work: () => T | Promise<T>): Promise<T> {
  const current = state()
  const run = current.lock.then(work, work)
  current.lock = run.then(
    () => undefined,
    () => undefined,
  )
  return run
}

function overlapsBlocking(
  appointments: StoredAppointment[],
  startsAt: string,
  endsAt: string,
  ignoreId?: string,
): boolean {
  const start = new Date(startsAt).getTime()
  const end = new Date(endsAt).getTime()
  return appointments.some((appointment) => {
    if (appointment.id === ignoreId) return false
    if (!BLOCKING_STATUSES.includes(appointment.status)) return false
    return (
      new Date(appointment.startsAt).getTime() < end &&
      start < new Date(appointment.endsAt).getTime()
    )
  })
}

function strip(appointment: StoredAppointment): Appointment {
  const { accessToken: _accessToken, ...rest } = appointment
  return rest
}

function uniqueCode(appointments: StoredAppointment[]): string {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const code = generateAppointmentCode()
    if (!appointments.some((appointment) => appointment.code === code)) return code
  }
  return `MD-${randomUUID().slice(0, 5).toUpperCase()}`
}

export const memoryStore: DataStore = {
  kind: 'local',

  async listServices(includeInactive = false) {
    return state()
      .services.filter((service) => includeInactive || service.active)
      .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
      .map((service) => ({ ...service }))
  },

  async getService(id) {
    return state().services.find((service) => service.id === id) ?? null
  },

  async createService(input: ServiceInput) {
    const service: Service = { id: randomUUID(), ...input }
    state().services.push(service)
    return { ...service }
  },

  async updateService(id, input) {
    const service = state().services.find((item) => item.id === id)
    if (!service) return null
    Object.assign(service, input)
    return { ...service }
  },

  async listBusinessHours() {
    return state().hours.map((hour) => ({ ...hour }))
  },

  async saveBusinessHours(hours) {
    const current = state()
    for (const hour of hours) {
      const existing = current.hours.find((item) => item.weekday === hour.weekday)
      if (existing) Object.assign(existing, hour)
      else current.hours.push({ ...hour })
    }
    current.hours.sort((a, b) => a.weekday - b.weekday)
    return current.hours.map((hour) => ({ ...hour }))
  },

  async listBlockedPeriods(range) {
    const blocks = state().blocks
    if (!range) return blocks.map((block) => ({ ...block }))
    const from = new Date(range.fromISO).getTime()
    const to = new Date(range.toISO).getTime()
    return blocks
      .filter(
        (block) =>
          new Date(block.startsAt).getTime() < to && from < new Date(block.endsAt).getTime(),
      )
      .map((block) => ({ ...block }))
  },

  async createBlockedPeriod(input) {
    const block: BlockedPeriod = { id: randomUUID(), ...input }
    state().blocks.push(block)
    return { ...block }
  },

  async deleteBlockedPeriod(id) {
    const current = state()
    current.blocks = current.blocks.filter((block) => block.id !== id)
  },

  async listAppointments(range: AppointmentRange) {
    const from = new Date(range.fromISO).getTime()
    const to = new Date(range.toISO).getTime()
    return state()
      .appointments.filter((appointment) => {
        const start = new Date(appointment.startsAt).getTime()
        if (start < from || start >= to) return false
        if (range.statuses && !range.statuses.includes(appointment.status)) return false
        return true
      })
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
      .map(strip)
  },

  async getAppointmentById(id) {
    const found = state().appointments.find((appointment) => appointment.id === id)
    return found ? strip(found) : null
  },

  async findAppointmentByCode(code) {
    const found = state().appointments.find(
      (appointment) => appointment.code.toUpperCase() === code.toUpperCase(),
    )
    return found ? { ...found } : null
  },

  async listAppointmentsByPhone(phone, fromISO) {
    const floor = fromISO ? new Date(fromISO).getTime() : Number.NEGATIVE_INFINITY
    return state()
      .appointments.filter(
        (appointment) =>
          appointment.customerPhone === phone &&
          new Date(appointment.startsAt).getTime() >= floor,
      )
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
      .map(strip)
  },

  async createAppointment(input: CreateAppointmentInput): Promise<CreateAppointmentResult> {
    return withLock(() => {
      const current = state()
      if (overlapsBlocking(current.appointments, input.startsAt, input.endsAt)) {
        return { ok: false as const, reason: 'conflict' as const }
      }
      const now = new Date().toISOString()
      const appointment: StoredAppointment = {
        id: randomUUID(),
        code: uniqueCode(current.appointments),
        accessToken: randomUUID().replace(/-/g, ''),
        ...input,
        createdAt: now,
        updatedAt: now,
        cancelledAt: null,
        cancelReason: null,
      }
      current.appointments.push(appointment)
      return { ok: true as const, appointment: { ...appointment } as AppointmentWithToken }
    })
  },

  async setAppointmentStatus(id, status: AppointmentStatus, cancelReason = null) {
    const appointment = state().appointments.find((item) => item.id === id)
    if (!appointment) return null
    appointment.status = status
    appointment.updatedAt = new Date().toISOString()
    if (status === 'cancelled') {
      appointment.cancelledAt = new Date().toISOString()
      appointment.cancelReason = cancelReason
    }
    return strip(appointment)
  },

  async rescheduleAppointment(id, startsAt, endsAt): Promise<RescheduleResult> {
    return withLock(() => {
      const current = state()
      const appointment = current.appointments.find((item) => item.id === id)
      if (!appointment) return { ok: false as const, reason: 'not_found' as const }
      if (overlapsBlocking(current.appointments, startsAt, endsAt, id)) {
        return { ok: false as const, reason: 'conflict' as const }
      }
      appointment.startsAt = startsAt
      appointment.endsAt = endsAt
      appointment.updatedAt = new Date().toISOString()
      return { ok: true as const, appointment: strip(appointment) }
    })
  },

  async listNotifications(limit = 30) {
    return state()
      .notifications.slice()
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit)
      .map((notification) => ({ ...notification }))
  },

  async createNotification(input) {
    const notification: Notification = {
      id: randomUUID(),
      read: false,
      createdAt: new Date().toISOString(),
      ...input,
    }
    state().notifications.push(notification)
    return { ...notification }
  },

  async markNotificationsRead(ids) {
    for (const notification of state().notifications) {
      if (!ids || ids.includes(notification.id)) notification.read = true
    }
  },

  async getSettings() {
    return { ...state().settings }
  },

  async updateSettings(input) {
    const current = state()
    current.settings = { ...current.settings, ...input }
    return { ...current.settings }
  },

  async listCustomers(): Promise<CustomerSummary[]> {
    const byPhone = new Map<string, CustomerSummary>()
    for (const appointment of state().appointments) {
      const existing = byPhone.get(appointment.customerPhone)
      const isVisit = appointment.status !== 'cancelled'
      if (!existing) {
        byPhone.set(appointment.customerPhone, {
          name: appointment.customerName,
          phone: appointment.customerPhone,
          lastVisit: isVisit ? appointment.startsAt : null,
          appointmentCount: 1,
        })
        continue
      }
      existing.appointmentCount += 1
      if (isVisit && (!existing.lastVisit || appointment.startsAt > existing.lastVisit)) {
        existing.lastVisit = appointment.startsAt
        existing.name = appointment.customerName
      }
    }
    return [...byPhone.values()].sort((a, b) =>
      (b.lastVisit ?? '').localeCompare(a.lastVisit ?? ''),
    )
  },
}

/** Usado apenas pela rota local de preparo de cenário. */
export function resetMemoryStore() {
  const holder = globalThis as unknown as Record<symbol, MemoryState | undefined>
  holder[STATE_KEY] = freshState()
}
