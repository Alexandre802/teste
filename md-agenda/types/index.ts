/**
 * Tipos de domínio do MD_agenda.
 *
 * Regra que vale para o arquivo inteiro: dinheiro trafega em centavos (inteiro),
 * instantes trafegam em ISO 8601 UTC e horários de funcionamento trafegam como
 * "HH:MM" no fuso da barbearia. Conversão fica em lib/time.ts.
 */

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'no_show'

export const APPOINTMENT_STATUSES: AppointmentStatus[] = [
  'pending',
  'confirmed',
  'completed',
  'cancelled',
  'no_show',
]

/** Status que ocupam a agenda. Os demais liberam o horário. */
export const BLOCKING_STATUSES: AppointmentStatus[] = ['pending', 'confirmed']

export const STATUS_LABEL: Record<AppointmentStatus, string> = {
  pending: 'Aguardando',
  confirmed: 'Confirmado',
  completed: 'Concluído',
  cancelled: 'Cancelado',
  no_show: 'Não compareceu',
}

export interface Service {
  id: string
  name: string
  description: string | null
  priceCents: number
  durationMinutes: number
  active: boolean
  sortOrder: number
}

/** 0 = domingo … 6 = sábado, igual a Date#getDay. */
export interface BusinessHour {
  weekday: number
  isOpen: boolean
  opensAt: string | null
  closesAt: string | null
  breakStart: string | null
  breakEnd: string | null
}

export interface BlockedPeriod {
  id: string
  startsAt: string
  endsAt: string
  reason: string | null
}

export interface Appointment {
  id: string
  code: string
  customerName: string
  customerPhone: string
  serviceId: string | null
  serviceNameSnapshot: string
  servicePriceSnapshot: number
  serviceDurationSnapshot: number
  startsAt: string
  endsAt: string
  status: AppointmentStatus
  notes: string | null
  createdAt: string
  updatedAt: string
  cancelledAt: string | null
  cancelReason: string | null
}

/** Devolvido apenas na criação — é a chave do link direto do cliente. */
export interface AppointmentWithToken extends Appointment {
  accessToken: string
}

export interface Notification {
  id: string
  type: 'appointment_created' | 'appointment_cancelled'
  title: string
  body: string
  appointmentId: string | null
  read: boolean
  createdAt: string
}

export interface Settings {
  slotIntervalMinutes: number
  minimumBookingNoticeMinutes: number
  bookingWindowDays: number
  cancelBeforeMinutes: number
  autoConfirmAppointments: boolean
  barberName: string
  barberPhotoUrl: string | null
  barberTagline: string | null
  businessName: string
  businessAddress: string | null
  businessPhone: string | null
  whatsappNumber: string | null
  timezone: string
}

export interface CustomerSummary {
  name: string
  phone: string
  lastVisit: string | null
  appointmentCount: number
}

export interface Slot {
  /** "HH:MM" no fuso da barbearia. */
  time: string
  startsAt: string
  endsAt: string
  available: boolean
  reason: 'busy' | 'notice' | 'break' | 'blocked' | null
}
