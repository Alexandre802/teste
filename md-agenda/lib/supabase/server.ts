import 'server-only'

import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { supabaseAnonKey, supabaseUrl } from '@/lib/config'

/** Cliente ligado aos cookies da requisição — é o que sustenta a sessão do painel. */
export async function serverAuthClient() {
  const url = supabaseUrl()
  const key = supabaseAnonKey()
  if (!url || !key) return null

  const cookieStore = await cookies()

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options)
          }
        } catch {
          // Server Component não pode escrever cookie; a renovação acontece
          // na Server Action ou na rota que fez a chamada.
        }
      },
    },
  })
}
