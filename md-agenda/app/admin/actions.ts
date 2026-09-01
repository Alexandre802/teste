'use server'

/**
 * Ações do painel.
 *
 * Toda função começa por `requireAdmin()` — não existe caminho que escreva no
 * banco sem sessão. As validações são as mesmas da área pública: reagendar
 * passa pelo mesmo motor de disponibilidade que o cliente enfrenta.
 */

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { APPOINTMENT_STATUSES, type AppointmentStatus, type BusinessHour } from '@/types'
import { getStore } from '@/lib/db'
import { requireAdmin } from '@/lib/auth/guard'
import { signInAdmin, signOutAdmin } from '@/lib/auth/admin'
import { REJECTION_MESSAGE, validateSlot } from '@/lib/scheduling/availability'
import { dateTimeToUtc } from '@/lib/time'
import {
  blockInputSchema,
  businessHourInputSchema,
  firstIssueMessage,
  rescheduleSchema,
  serviceInputSchema,
  settingsInputSchema,
} from '@/lib/validation'
import { parsePriceToCents } from '@/lib/format'
import { LIMITS, hit } from '@/lib/rate-limit'

export interface ActionState {
  ok?: boolean
  message?: string
  error?: string
}

const PAINEL_PATHS = ['/admin', '/admin/agenda', '/admin/clientes', '/admin/servicos', '/admin/configuracoes']

function revalidatePainel() {
  for (const path of PAINEL_PATHS) revalidatePath(path)
  revalidatePath('/')
}

function text(formData: FormData, key: string): string {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

function optionalText(formData: FormData, key: string): string | null {
  const value = text(formData, key)
  return value.length > 0 ? value : null
}

function checkbox(formData: FormData, key: string): boolean {
  return formData.get(key) === 'on' || formData.get(key) === 'true'
}

function integer(formData: FormData, key: string, fallback: number): number {
  const parsed = Number(text(formData, key))
  return Number.isFinite(parsed) ? Math.round(parsed) : fallback
}

// ---------------------------------------------------------------- login

export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = text(formData, 'email')
  const password = String(formData.get('password') ?? '')

  const limited = hit(`login:${email.toLowerCase()}`, LIMITS.login.limit, LIMITS.login.windowMs)
  if (!limited.allowed) {
    return { error: 'Muitas tentativas seguidas. Aguarde alguns minutos e tente de novo.' }
  }

  if (!email || !password) return { error: 'Informe e-mail e senha.' }

  const result = await signInAdmin(email, password)
  if (!result.ok) return { error: result.message }

  redirect('/admin')
}

export async function logoutAction(): Promise<void> {
  await signOutAdmin()
  redirect('/admin/login')
}

// ---------------------------------------------------------- agendamentos

export async function setStatusAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin()

  const id = text(formData, 'id')
  const status = text(formData, 'status') as AppointmentStatus
  if (!id || !APPOINTMENT_STATUSES.includes(status)) {
    return { error: 'Não entendi essa mudança de status.' }
  }

  const updated = await getStore().setAppointmentStatus(id, status, optionalText(formData, 'reason'))
  if (!updated) return { error: 'Agendamento não encontrado.' }

  revalidatePainel()
  return { ok: true, message: 'Status atualizado.' }
}

export async function rescheduleAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin()

  const parsed = rescheduleSchema.safeParse({
    appointmentId: text(formData, 'id'),
    date: text(formData, 'date'),
    time: text(formData, 'time'),
  })
  if (!parsed.success) return { error: firstIssueMessage(parsed.error) }

  const store = getStore()
  const appointment = await store.getAppointmentById(parsed.data.appointmentId)
  if (!appointment) return { error: 'Agendamento não encontrado.' }

  // O painel não fura a própria agenda: o horário novo passa pelas mesmas
  // regras que o cliente enfrenta, ignorando apenas o próprio agendamento.
  const validation = await validateSlot({
    date: parsed.data.date,
    time: parsed.data.time,
    durationMinutes: appointment.serviceDurationSnapshot,
    ignoreAppointmentId: appointment.id,
  })

  if (!validation.ok && validation.reason !== 'notice') {
    // No painel, "ocupado" é a agenda dele mesmo — a mensagem do cliente
    // ("acabou de ser reservado") não faz sentido aqui.
    return {
      error:
        validation.reason === 'busy'
          ? 'Esse horário já está ocupado na agenda.'
          : REJECTION_MESSAGE[validation.reason],
    }
  }

  const startsAt = dateTimeToUtc(parsed.data.date, parsed.data.time, (await store.getSettings()).timezone)
  const endsAt = new Date(startsAt.getTime() + appointment.serviceDurationSnapshot * 60_000)

  const result = await store.rescheduleAppointment(
    appointment.id,
    startsAt.toISOString(),
    endsAt.toISOString(),
  )

  if (!result.ok) {
    return {
      error:
        result.reason === 'conflict'
          ? 'Esse horário já está ocupado na agenda.'
          : 'Agendamento não encontrado.',
    }
  }

  revalidatePainel()
  return { ok: true, message: 'Agendamento remarcado.' }
}

// -------------------------------------------------------------- serviços

export async function saveServiceAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin()

  const priceCents = parsePriceToCents(text(formData, 'price'))
  if (priceCents === null) return { error: 'Informe um preço válido.' }

  const parsed = serviceInputSchema.safeParse({
    name: text(formData, 'name'),
    description: optionalText(formData, 'description'),
    priceCents,
    durationMinutes: integer(formData, 'durationMinutes', 0),
    active: checkbox(formData, 'active'),
    sortOrder: integer(formData, 'sortOrder', 0),
  })
  if (!parsed.success) return { error: firstIssueMessage(parsed.error) }

  const id = text(formData, 'id')
  const store = getStore()
  const input = { ...parsed.data, description: parsed.data.description ?? null }

  if (id) {
    const updated = await store.updateService(id, input)
    if (!updated) return { error: 'Serviço não encontrado.' }
  } else {
    await store.createService(input)
  }

  revalidatePainel()
  return { ok: true, message: id ? 'Serviço atualizado.' : 'Serviço criado.' }
}

export async function toggleServiceAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin()

  const id = text(formData, 'id')
  const active = checkbox(formData, 'active')
  if (!id) return { error: 'Serviço não encontrado.' }

  await getStore().updateService(id, { active })
  revalidatePainel()
  return { ok: true, message: active ? 'Serviço ativado.' : 'Serviço desativado.' }
}

// --------------------------------------------------------------- agenda

export async function createBlockAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin()

  const allDay = checkbox(formData, 'allDay')
  const parsed = blockInputSchema.safeParse({
    date: text(formData, 'date'),
    startTime: allDay ? '00:00' : text(formData, 'startTime'),
    endTime: allDay ? '23:59' : text(formData, 'endTime'),
    reason: optionalText(formData, 'reason'),
  })
  if (!parsed.success) return { error: firstIssueMessage(parsed.error) }

  const store = getStore()
  const { timezone } = await store.getSettings()
  const startsAt = dateTimeToUtc(parsed.data.date, parsed.data.startTime, timezone)
  const endsAt = dateTimeToUtc(parsed.data.date, parsed.data.endTime, timezone)

  if (endsAt <= startsAt) return { error: 'O fim do bloqueio precisa vir depois do início.' }

  await store.createBlockedPeriod({
    startsAt: startsAt.toISOString(),
    endsAt: endsAt.toISOString(),
    reason: parsed.data.reason ?? null,
  })

  revalidatePainel()
  return { ok: true, message: 'Bloqueio criado. Esse horário sumiu da agenda dos clientes.' }
}

export async function deleteBlockAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin()

  const id = text(formData, 'id')
  if (!id) return { error: 'Bloqueio não encontrado.' }

  await getStore().deleteBlockedPeriod(id)
  revalidatePainel()
  return { ok: true, message: 'Bloqueio removido.' }
}

// -------------------------------------------------------- configurações

export async function saveSettingsAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin()

  const parsed = settingsInputSchema.safeParse({
    slotIntervalMinutes: integer(formData, 'slotIntervalMinutes', 30),
    minimumBookingNoticeMinutes: integer(formData, 'minimumBookingNoticeMinutes', 60),
    bookingWindowDays: integer(formData, 'bookingWindowDays', 30),
    cancelBeforeMinutes: integer(formData, 'cancelBeforeMinutes', 120),
    autoConfirmAppointments: checkbox(formData, 'autoConfirmAppointments'),
    barberName: text(formData, 'barberName'),
    barberPhotoUrl: optionalText(formData, 'barberPhotoUrl'),
    barberTagline: optionalText(formData, 'barberTagline'),
    businessName: text(formData, 'businessName'),
    businessAddress: optionalText(formData, 'businessAddress'),
    businessPhone: optionalText(formData, 'businessPhone'),
    whatsappNumber: optionalText(formData, 'whatsappNumber'),
  })
  if (!parsed.success) return { error: firstIssueMessage(parsed.error) }

  const photoUrl = parsed.data.barberPhotoUrl
  if (photoUrl && !/^https:\/\//.test(photoUrl)) {
    return { error: 'A foto precisa de um endereço https://.' }
  }

  await getStore().updateSettings({
    ...parsed.data,
    barberPhotoUrl: photoUrl ?? null,
    barberTagline: parsed.data.barberTagline ?? null,
    businessAddress: parsed.data.businessAddress ?? null,
    businessPhone: parsed.data.businessPhone ?? null,
    whatsappNumber: parsed.data.whatsappNumber ?? null,
  })

  revalidatePainel()
  return { ok: true, message: 'Configurações salvas.' }
}

export async function saveBusinessHoursAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin()

  const hours: BusinessHour[] = []

  for (let weekday = 0; weekday < 7; weekday += 1) {
    const isOpen = checkbox(formData, `open-${weekday}`)
    const candidate = {
      weekday,
      isOpen,
      opensAt: isOpen ? text(formData, `opens-${weekday}`) || null : null,
      closesAt: isOpen ? text(formData, `closes-${weekday}`) || null : null,
      breakStart: isOpen ? text(formData, `breakStart-${weekday}`) || null : null,
      breakEnd: isOpen ? text(formData, `breakEnd-${weekday}`) || null : null,
    }

    const parsed = businessHourInputSchema.safeParse(candidate)
    if (!parsed.success) return { error: `Confira os horários de ${weekday}.` }

    if (isOpen) {
      if (!candidate.opensAt || !candidate.closesAt) {
        return { error: 'Dia aberto precisa de horário de abertura e de fechamento.' }
      }
      if (candidate.closesAt <= candidate.opensAt) {
        return { error: 'O fechamento precisa vir depois da abertura.' }
      }
      const hasBreakStart = Boolean(candidate.breakStart)
      const hasBreakEnd = Boolean(candidate.breakEnd)
      if (hasBreakStart !== hasBreakEnd) {
        return { error: 'O intervalo precisa de início e fim.' }
      }
      if (hasBreakStart && candidate.breakEnd! <= candidate.breakStart!) {
        return { error: 'O fim do intervalo precisa vir depois do início.' }
      }
    }

    hours.push(parsed.data)
  }

  await getStore().saveBusinessHours(hours)
  revalidatePainel()
  return { ok: true, message: 'Expediente salvo.' }
}

export async function markNotificationsReadAction(): Promise<void> {
  await requireAdmin()
  await getStore().markNotificationsRead()
  revalidatePainel()
}
