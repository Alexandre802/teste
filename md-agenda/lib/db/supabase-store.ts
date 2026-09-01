import 'server-only'

/**
 * Implementação Supabase do contrato de armazenamento.
 *
 * A garantia final contra agendamento duplo não está aqui: está no banco, na
 * exclusion constraint sobre o intervalo [starts_at, ends_at) dos status que
 * ocupam agenda. Quando o Postgres recusa (SQLSTATE 23P01), esta camada
 * traduz para `conflict` e a API responde que o horário acabou de ser tomado.
 */

import type { PostgrestError } from '@supabase/supabase-js'
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
import { generateAppointmentCode } from '@/lib/format'
import { adminClient } from '@/lib/supabase/admin'
import { DEFAULT_SETTINGS, defaultBusinessHours } from './defaults'
import type {
  AppointmentRange,
  CreateAppointmentInput,
  CreateAppointmentResult,
  DataStore,
  RescheduleResult,
  ServiceInput,
} from './store'

const EXCLUSION_VIOLATION = '23P01'
const UNIQUE_VIOLATION = '23505'

type Row = Record<string, unknown>

function fail(context: string, error: PostgrestError): never {
  throw new Error(`Supabase (${context}): ${error.message}`)
}

function toService(row: Row): Service {
  return {
    id: String(row.id),
    name: String(row.name),
    description: (row.description as string | null) ?? null,
    priceCents: Number(row.price_cents),
    durationMinutes: Number(row.duration_minutes),
    active: Boolean(row.active),
    sortOrder: Number(row.sort_order ?? 0),
  }
}

function toBusinessHour(row: Row): BusinessHour {
  return {
    weekday: Number(row.weekday),
    isOpen: Boolean(row.is_open),
    opensAt: trimTime(row.opens_at),
    closesAt: trimTime(row.closes_at),
    breakStart: trimTime(row.break_start),
    breakEnd: trimTime(row.break_end),
  }
}

/** O Postgres devolve "09:00:00"; a agenda trabalha com "09:00". */
function trimTime(value: unknown): string | null {
  if (typeof value !== 'string' || value.length < 4) return null
  return value.slice(0, 5)
}

function toBlockedPeriod(row: Row): BlockedPeriod {
  return {
    id: String(row.id),
    startsAt: new Date(String(row.starts_at)).toISOString(),
    endsAt: new Date(String(row.ends_at)).toISOString(),
    reason: (row.reason as string | null) ?? null,
  }
}

function toAppointment(row: Row): Appointment {
  return {
    id: String(row.id),
    code: String(row.code),
    customerName: String(row.customer_name),
    customerPhone: String(row.customer_phone),
    serviceId: (row.service_id as string | null) ?? null,
    serviceNameSnapshot: String(row.service_name_snapshot),
    servicePriceSnapshot: Number(row.service_price_snapshot),
    serviceDurationSnapshot: Number(row.service_duration_snapshot),
    startsAt: new Date(String(row.starts_at)).toISOString(),
    endsAt: new Date(String(row.ends_at)).toISOString(),
    status: row.status as AppointmentStatus,
    notes: (row.notes as string | null) ?? null,
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at)).toISOString(),
    cancelledAt: row.cancelled_at ? new Date(String(row.cancelled_at)).toISOString() : null,
    cancelReason: (row.cancel_reason as string | null) ?? null,
  }
}

function toNotification(row: Row): Notification {
  return {
    id: String(row.id),
    type: row.type as Notification['type'],
    title: String(row.title),
    body: String(row.body),
    appointmentId: (row.appointment_id as string | null) ?? null,
    read: Boolean(row.read),
    createdAt: new Date(String(row.created_at)).toISOString(),
  }
}

function toSettings(row: Row | null): Settings {
  if (!row) return { ...DEFAULT_SETTINGS }
  return {
    slotIntervalMinutes: Number(row.slot_interval_minutes ?? DEFAULT_SETTINGS.slotIntervalMinutes),
    minimumBookingNoticeMinutes: Number(
      row.minimum_booking_notice_minutes ?? DEFAULT_SETTINGS.minimumBookingNoticeMinutes,
    ),
    bookingWindowDays: Number(row.booking_window_days ?? DEFAULT_SETTINGS.bookingWindowDays),
    cancelBeforeMinutes: Number(row.cancel_before_minutes ?? DEFAULT_SETTINGS.cancelBeforeMinutes),
    autoConfirmAppointments: Boolean(row.auto_confirm_appointments),
    barberName: String(row.barber_name ?? DEFAULT_SETTINGS.barberName),
    barberPhotoUrl: (row.barber_photo_url as string | null) ?? null,
    barberTagline: (row.barber_tagline as string | null) ?? null,
    businessName: String(row.business_name ?? DEFAULT_SETTINGS.businessName),
    businessAddress: (row.business_address as string | null) ?? null,
    businessPhone: (row.business_phone as string | null) ?? null,
    whatsappNumber: (row.whatsapp_number as string | null) ?? null,
    timezone: String(row.timezone ?? DEFAULT_SETTINGS.timezone),
  }
}

function settingsToRow(input: Partial<Settings>): Row {
  const row: Row = {}
  const map: Record<keyof Settings, string> = {
    slotIntervalMinutes: 'slot_interval_minutes',
    minimumBookingNoticeMinutes: 'minimum_booking_notice_minutes',
    bookingWindowDays: 'booking_window_days',
    cancelBeforeMinutes: 'cancel_before_minutes',
    autoConfirmAppointments: 'auto_confirm_appointments',
    barberName: 'barber_name',
    barberPhotoUrl: 'barber_photo_url',
    barberTagline: 'barber_tagline',
    businessName: 'business_name',
    businessAddress: 'business_address',
    businessPhone: 'business_phone',
    whatsappNumber: 'whatsapp_number',
    timezone: 'timezone',
  }
  for (const [key, column] of Object.entries(map)) {
    const value = input[key as keyof Settings]
    if (value !== undefined) row[column] = value
  }
  return row
}

const SETTINGS_ID = 1

export const supabaseStore: DataStore = {
  kind: 'supabase',

  async listServices(includeInactive = false) {
    let query = adminClient().from('services').select('*').order('sort_order').order('name')
    if (!includeInactive) query = query.eq('active', true)
    const { data, error } = await query
    if (error) fail('listServices', error)
    return (data ?? []).map(toService)
  },

  async getService(id) {
    const { data, error } = await adminClient().from('services').select('*').eq('id', id).maybeSingle()
    if (error) fail('getService', error)
    return data ? toService(data) : null
  },

  async createService(input: ServiceInput) {
    const { data, error } = await adminClient()
      .from('services')
      .insert({
        name: input.name,
        description: input.description,
        price_cents: input.priceCents,
        duration_minutes: input.durationMinutes,
        active: input.active,
        sort_order: input.sortOrder,
      })
      .select('*')
      .single()
    if (error) fail('createService', error)
    return toService(data)
  },

  async updateService(id, input) {
    const patch: Row = {}
    if (input.name !== undefined) patch.name = input.name
    if (input.description !== undefined) patch.description = input.description
    if (input.priceCents !== undefined) patch.price_cents = input.priceCents
    if (input.durationMinutes !== undefined) patch.duration_minutes = input.durationMinutes
    if (input.active !== undefined) patch.active = input.active
    if (input.sortOrder !== undefined) patch.sort_order = input.sortOrder

    const { data, error } = await adminClient()
      .from('services')
      .update(patch)
      .eq('id', id)
      .select('*')
      .maybeSingle()
    if (error) fail('updateService', error)
    return data ? toService(data) : null
  },

  async listBusinessHours() {
    const { data, error } = await adminClient().from('business_hours').select('*').order('weekday')
    if (error) fail('listBusinessHours', error)
    const rows = (data ?? []).map(toBusinessHour)
    if (rows.length === 7) return rows
    const byWeekday = new Map(rows.map((hour) => [hour.weekday, hour]))
    return defaultBusinessHours().map((fallback) => byWeekday.get(fallback.weekday) ?? fallback)
  },

  async saveBusinessHours(hours) {
    const { error } = await adminClient()
      .from('business_hours')
      .upsert(
        hours.map((hour) => ({
          weekday: hour.weekday,
          is_open: hour.isOpen,
          opens_at: hour.opensAt,
          closes_at: hour.closesAt,
          break_start: hour.breakStart,
          break_end: hour.breakEnd,
        })),
        { onConflict: 'weekday' },
      )
    if (error) fail('saveBusinessHours', error)
    return this.listBusinessHours()
  },

  async listBlockedPeriods(range) {
    let query = adminClient().from('blocked_periods').select('*').order('starts_at')
    if (range) query = query.lt('starts_at', range.toISO).gt('ends_at', range.fromISO)
    const { data, error } = await query
    if (error) fail('listBlockedPeriods', error)
    return (data ?? []).map(toBlockedPeriod)
  },

  async createBlockedPeriod(input) {
    const { data, error } = await adminClient()
      .from('blocked_periods')
      .insert({ starts_at: input.startsAt, ends_at: input.endsAt, reason: input.reason })
      .select('*')
      .single()
    if (error) fail('createBlockedPeriod', error)
    return toBlockedPeriod(data)
  },

  async deleteBlockedPeriod(id) {
    const { error } = await adminClient().from('blocked_periods').delete().eq('id', id)
    if (error) fail('deleteBlockedPeriod', error)
  },

  async listAppointments(range: AppointmentRange) {
    let query = adminClient()
      .from('appointments')
      .select('*')
      .gte('starts_at', range.fromISO)
      .lt('starts_at', range.toISO)
      .order('starts_at')
    if (range.statuses) query = query.in('status', range.statuses)
    const { data, error } = await query
    if (error) fail('listAppointments', error)
    return (data ?? []).map(toAppointment)
  },

  async getAppointmentById(id) {
    const { data, error } = await adminClient()
      .from('appointments')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (error) fail('getAppointmentById', error)
    return data ? toAppointment(data) : null
  },

  async findAppointmentByCode(code) {
    const { data, error } = await adminClient()
      .from('appointments')
      .select('*')
      .eq('code', code.toUpperCase())
      .maybeSingle()
    if (error) fail('findAppointmentByCode', error)
    if (!data) return null
    return { ...toAppointment(data), accessToken: String(data.access_token) } as AppointmentWithToken
  },

  async listAppointmentsByPhone(phone, fromISO) {
    let query = adminClient()
      .from('appointments')
      .select('*')
      .eq('customer_phone', phone)
      .order('starts_at')
    if (fromISO) query = query.gte('starts_at', fromISO)
    const { data, error } = await query
    if (error) fail('listAppointmentsByPhone', error)
    return (data ?? []).map(toAppointment)
  },

  async createAppointment(input: CreateAppointmentInput): Promise<CreateAppointmentResult> {
    // Códigos são curtos de propósito (o cliente dita por telefone); colisão é
    // rara e resolvida com nova tentativa.
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const { data, error } = await adminClient()
        .from('appointments')
        .insert({
          code: generateAppointmentCode(),
          customer_name: input.customerName,
          customer_phone: input.customerPhone,
          service_id: input.serviceId,
          service_name_snapshot: input.serviceNameSnapshot,
          service_price_snapshot: input.servicePriceSnapshot,
          service_duration_snapshot: input.serviceDurationSnapshot,
          starts_at: input.startsAt,
          ends_at: input.endsAt,
          status: input.status,
          notes: input.notes,
        })
        .select('*')
        .single()

      if (!error) {
        return {
          ok: true,
          appointment: {
            ...toAppointment(data),
            accessToken: String(data.access_token),
          } as AppointmentWithToken,
        }
      }

      if (error.code === EXCLUSION_VIOLATION) return { ok: false, reason: 'conflict' }
      if (error.code === UNIQUE_VIOLATION && error.message.includes('code')) continue
      fail('createAppointment', error)
    }
    throw new Error('Não foi possível gerar um código único para o agendamento.')
  },

  async setAppointmentStatus(id, status: AppointmentStatus, cancelReason = null) {
    const patch: Row = { status, updated_at: new Date().toISOString() }
    if (status === 'cancelled') {
      patch.cancelled_at = new Date().toISOString()
      patch.cancel_reason = cancelReason
    }
    const { data, error } = await adminClient()
      .from('appointments')
      .update(patch)
      .eq('id', id)
      .select('*')
      .maybeSingle()
    if (error) fail('setAppointmentStatus', error)
    return data ? toAppointment(data) : null
  },

  async rescheduleAppointment(id, startsAt, endsAt): Promise<RescheduleResult> {
    const { data, error } = await adminClient()
      .from('appointments')
      .update({ starts_at: startsAt, ends_at: endsAt, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .maybeSingle()
    if (error) {
      if (error.code === EXCLUSION_VIOLATION) return { ok: false, reason: 'conflict' }
      fail('rescheduleAppointment', error)
    }
    if (!data) return { ok: false, reason: 'not_found' }
    return { ok: true, appointment: toAppointment(data) }
  },

  async listNotifications(limit = 30) {
    const { data, error } = await adminClient()
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) fail('listNotifications', error)
    return (data ?? []).map(toNotification)
  },

  async createNotification(input) {
    const { data, error } = await adminClient()
      .from('notifications')
      .insert({
        type: input.type,
        title: input.title,
        body: input.body,
        appointment_id: input.appointmentId,
      })
      .select('*')
      .single()
    if (error) fail('createNotification', error)
    return toNotification(data)
  },

  async markNotificationsRead(ids) {
    let query = adminClient().from('notifications').update({ read: true })
    query = ids && ids.length > 0 ? query.in('id', ids) : query.eq('read', false)
    const { error } = await query
    if (error) fail('markNotificationsRead', error)
  },

  async getSettings() {
    const { data, error } = await adminClient()
      .from('settings')
      .select('*')
      .eq('id', SETTINGS_ID)
      .maybeSingle()
    if (error) fail('getSettings', error)
    return toSettings(data)
  },

  async updateSettings(input) {
    const { data, error } = await adminClient()
      .from('settings')
      .update(settingsToRow(input))
      .eq('id', SETTINGS_ID)
      .select('*')
      .maybeSingle()
    if (error) fail('updateSettings', error)
    return toSettings(data)
  },

  async listCustomers(): Promise<CustomerSummary[]> {
    const { data, error } = await adminClient()
      .from('customers_overview')
      .select('*')
      .order('last_visit', { ascending: false, nullsFirst: false })
    if (error) fail('listCustomers', error)
    return (data ?? []).map((row: Row) => ({
      name: String(row.name),
      phone: String(row.phone),
      lastVisit: row.last_visit ? new Date(String(row.last_visit)).toISOString() : null,
      appointmentCount: Number(row.appointment_count ?? 0),
    }))
  },
}
