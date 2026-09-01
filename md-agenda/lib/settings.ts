import 'server-only'

import { cache } from 'react'
import type { Settings } from '@/types'
import { getStore } from '@/lib/db'
import { DEFAULT_SETTINGS } from '@/lib/db/defaults'

/**
 * Configuração para as telas públicas.
 *
 * Sem banco configurado devolve os padrões técnicos — a página ainda renderiza
 * e diz que o agendamento está indisponível, em vez de quebrar inteira.
 */
export const getPublicSettings = cache(async (): Promise<Settings> => {
  try {
    return await getStore().getSettings()
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
})

export const getOpenWeekdays = cache(async (): Promise<number[]> => {
  try {
    const hours = await getStore().listBusinessHours()
    return hours.filter((hour) => hour.isOpen).map((hour) => hour.weekday)
  } catch {
    return []
  }
})
