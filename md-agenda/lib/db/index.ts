import 'server-only'

import { isLocalStoreEnabled, isSupabaseServerConfigured } from '@/lib/config'
import { memoryStore } from './memory'
import { supabaseStore } from './supabase-store'
import type { DataStore } from './store'

/**
 * Escolhe o armazenamento. Supabase tem precedência: um ambiente com banco
 * real jamais cai no local por acidente.
 *
 * Sem nenhum dos dois configurados, a chamada falha fechada — o produto diz
 * que não está configurado em vez de fingir que gravou.
 */
export function getStore(): DataStore {
  if (isSupabaseServerConfigured()) return supabaseStore
  if (isLocalStoreEnabled()) return memoryStore
  throw new DatabaseNotConfiguredError()
}

export class DatabaseNotConfiguredError extends Error {
  constructor() {
    super('Banco de dados não configurado.')
    this.name = 'DatabaseNotConfiguredError'
  }
}

export function storeKindOrNull(): DataStore['kind'] | null {
  if (isSupabaseServerConfigured()) return 'supabase'
  if (isLocalStoreEnabled()) return 'local'
  return null
}

export type { DataStore } from './store'
