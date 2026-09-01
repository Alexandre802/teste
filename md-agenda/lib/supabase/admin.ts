import 'server-only'

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { supabaseServiceRoleKey, supabaseUrl } from '@/lib/config'

/**
 * Cliente com service role. Só o servidor. A chave nunca chega ao navegador —
 * ela não tem prefixo NEXT_PUBLIC e este módulo é server-only.
 */
let cached: SupabaseClient | null = null

export function adminClient(): SupabaseClient {
  if (cached) return cached
  const url = supabaseUrl()
  const key = supabaseServiceRoleKey()
  if (!url || !key) {
    throw new Error('Supabase não configurado: falta NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY.')
  }
  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { 'x-application-name': 'md-agenda' } },
  })
  return cached
}
