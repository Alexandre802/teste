/**
 * Contrato do armazenamento.
 *
 * Duas implementações atendem a este contrato: o Supabase (produção) e um
 * banco local em memória (desenvolvimento e suíte automatizada). Nenhuma rota
 * conhece qual das duas está ativa — todas falam com esta interface.
 */

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

export interface ServiceInput {
  name: string
  description: string | null
  priceCents: number
  durationMinutes: number
  active: boolean
  sortOrder: number
}

export interface CreateAppointmentInput {
  customerName: string
  customerPhone: string
  serviceId: string
  serviceNameSnapshot: string
  servicePriceSnapshot: number
  serviceDurationSnapshot: number
  startsAt: string
  endsAt: string
  status: AppointmentStatus
  notes: string | null
}

export type CreateAppointmentResult =
  | { ok: true; appointment: AppointmentWithToken }
  | { ok: false; reason: 'conflict' }

export type RescheduleResult =
  | { ok: true; appointment: Appointment }
  | { ok: false; reason: 'conflict' | 'not_found' }

export interface AppointmentRange {
  fromISO: string
  toISO: string
  statuses?: AppointmentStatus[]
}

export interface DataStore {
  readonly kind: 'supabase' | 'local'

  listServices(includeInactive?: boolean): Promise<Service[]>
  getService(id: string): Promise<Service | null>
  createService(input: ServiceInput): Promise<Service>
  updateService(id: string, input: Partial<ServiceInput>): Promise<Service | null>

  listBusinessHours(): Promise<BusinessHour[]>
  saveBusinessHours(hours: BusinessHour[]): Promise<BusinessHour[]>

  listBlockedPeriods(range?: { fromISO: string; toISO: string }): Promise<BlockedPeriod[]>
  createBlockedPeriod(input: {
    startsAt: string
    endsAt: string
    reason: string | null
  }): Promise<BlockedPeriod>
  deleteBlockedPeriod(id: string): Promise<void>

  listAppointments(range: AppointmentRange): Promise<Appointment[]>
  getAppointmentById(id: string): Promise<Appointment | null>
  findAppointmentByCode(code: string): Promise<AppointmentWithToken | null>
  listAppointmentsByPhone(phone: string, fromISO?: string): Promise<Appointment[]>
  createAppointment(input: CreateAppointmentInput): Promise<CreateAppointmentResult>
  setAppointmentStatus(
    id: string,
    status: AppointmentStatus,
    cancelReason?: string | null,
  ): Promise<Appointment | null>
  rescheduleAppointment(id: string, startsAt: string, endsAt: string): Promise<RescheduleResult>

  listNotifications(limit?: number): Promise<Notification[]>
  createNotification(input: {
    type: Notification['type']
    title: string
    body: string
    appointmentId: string | null
  }): Promise<Notification>
  markNotificationsRead(ids?: string[]): Promise<void>

  getSettings(): Promise<Settings>
  updateSettings(input: Partial<Settings>): Promise<Settings>

  listCustomers(): Promise<CustomerSummary[]>
}
