'use client'

import { createBrowserClient } from '@supabase/ssr'

/**
 * Cliente do navegador com a chave anônima. Serve para o Realtime do painel.
 * Com RLS ligada, ele não enxerga nada que o cliente anônimo não possa ver.
 */
export function browserClient(url: string, anonKey: string) {
  return createBrowserClient(url, anonKey)
}
