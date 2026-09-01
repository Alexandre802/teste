import type { BusinessHour, Settings } from '@/types'
import { DEFAULT_TIMEZONE } from '@/lib/time'

/**
 * Padrões técnicos do sistema — não são dados da barbearia.
 *
 * Preço, horário de funcionamento, telefone e política de cancelamento reais
 * do Maicon não estão aqui e não são inventados em lugar nenhum: entram pelo
 * painel, em /admin/configuracoes.
 */
export const DEFAULT_SETTINGS: Settings = {
  slotIntervalMinutes: 30,
  minimumBookingNoticeMinutes: 60,
  bookingWindowDays: 30,
  cancelBeforeMinutes: 120,
  autoConfirmAppointments: false,
  barberName: 'Maicon',
  barberPhotoUrl: null,
  barberTagline: null,
  businessName: 'MD_agenda',
  businessAddress: null,
  businessPhone: null,
  whatsappNumber: null,
  timezone: DEFAULT_TIMEZONE,
}

/**
 * Semana começa fechada de propósito. Enquanto o Maicon não confirmar o
 * expediente, o site não oferece horário nenhum — em vez de chutar um.
 */
export function defaultBusinessHours(): BusinessHour[] {
  return Array.from({ length: 7 }, (_, weekday) => ({
    weekday,
    isOpen: false,
    opensAt: null,
    closesAt: null,
    breakStart: null,
    breakEnd: null,
  }))
}
