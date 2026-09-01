/** Validação de payload. O servidor nunca confia no que chega do navegador. */

import { z } from 'zod'
import { isValidPhoneBR, normalizePhone } from '@/lib/format'

const DATE = /^\d{4}-\d{2}-\d{2}$/
const TIME = /^\d{2}:\d{2}$/
const CONTROL_CHARS = /[\u0000-\u001f\u007f]/g

/** Remove controle e espaço redundante; não deixa passar texto sem limite. */
export function sanitizeText(value: string, maxLength: number): string {
  return value
    .replace(CONTROL_CHARS, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength)
}

export const nameSchema = z
  .string()
  .max(200)
  .transform((value) => sanitizeText(value, 80))
  .refine((value) => value.length >= 3, { message: 'Informe seu nome completo.' })
  .refine((value) => /\p{L}/u.test(value), { message: 'Informe um nome válido.' })

export const phoneSchema = z
  .string()
  .max(24)
  .transform((value) => normalizePhone(value))
  .refine(isValidPhoneBR, { message: 'Informe um telefone válido com DDD.' })

export const notesSchema = z
  .string()
  .max(400)
  .transform((value) => sanitizeText(value, 240))
  .nullish()

export const createAppointmentSchema = z.object({
  serviceId: z.string().uuid({ message: 'Serviço inválido.' }),
  date: z.string().regex(DATE, { message: 'Data inválida.' }),
  time: z.string().regex(TIME, { message: 'Horário inválido.' }),
  customerName: nameSchema,
  customerPhone: phoneSchema,
  notes: notesSchema,
})

export const lookupSchema = z.object({
  phone: phoneSchema,
  code: z.string().min(4).max(16),
})

export const cancelSchema = z.object({
  code: z.string().min(4).max(16),
  phone: phoneSchema,
  reason: z.string().max(200).nullish(),
})

export const availabilityQuerySchema = z.object({
  serviceId: z.string().uuid(),
  date: z.string().regex(DATE),
})

export const serviceInputSchema = z.object({
  name: z
    .string()
    .max(200)
    .transform((value) => sanitizeText(value, 60))
    .refine((value) => value.length >= 2, { message: 'Informe o nome do serviço.' }),
  description: z
    .string()
    .max(400)
    .transform((value) => sanitizeText(value, 160))
    .nullish(),
  priceCents: z.number().int().min(0).max(10_000_000),
  durationMinutes: z.number().int().min(5).max(600),
  active: z.boolean(),
  sortOrder: z.number().int().min(0).max(999),
})

export const settingsInputSchema = z.object({
  slotIntervalMinutes: z.number().int().min(5).max(240),
  minimumBookingNoticeMinutes: z.number().int().min(0).max(10_080),
  bookingWindowDays: z.number().int().min(1).max(365),
  cancelBeforeMinutes: z.number().int().min(0).max(10_080),
  autoConfirmAppointments: z.boolean(),
  barberName: z.string().max(200).transform((value) => sanitizeText(value, 60)),
  barberPhotoUrl: z.string().max(500).nullish(),
  barberTagline: z.string().max(200).nullish(),
  businessName: z.string().max(200).transform((value) => sanitizeText(value, 60)),
  businessAddress: z.string().max(200).nullish(),
  businessPhone: z.string().max(30).nullish(),
  whatsappNumber: z.string().max(30).nullish(),
})

export const blockInputSchema = z.object({
  date: z.string().regex(DATE),
  startTime: z.string().regex(TIME),
  endTime: z.string().regex(TIME),
  reason: z.string().max(120).nullish(),
})

export const businessHourInputSchema = z.object({
  weekday: z.number().int().min(0).max(6),
  isOpen: z.boolean(),
  opensAt: z.string().regex(TIME).nullable(),
  closesAt: z.string().regex(TIME).nullable(),
  breakStart: z.string().regex(TIME).nullable(),
  breakEnd: z.string().regex(TIME).nullable(),
})

export const rescheduleSchema = z.object({
  appointmentId: z.string().uuid(),
  date: z.string().regex(DATE),
  time: z.string().regex(TIME),
})

/** Mensagem curta e em português para devolver ao cliente. */
export function firstIssueMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? 'Não conseguimos entender os dados enviados.'
}
