'use client'

/**
 * Realtime do painel.
 *
 * Com Supabase configurado, agendamento novo aparece sem recarregar a página.
 * O rótulo "ao vivo" só acende depois que a inscrição confirma — sem conexão,
 * a tela diz que está desatualizada em vez de fingir tempo real.
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Radio, RefreshCw } from 'lucide-react'
import { browserClient } from '@/lib/supabase/client'

export function RealtimeRefresher({
  supabaseUrl,
  supabaseAnonKey,
}: {
  supabaseUrl: string | null
  supabaseAnonKey: string | null
}) {
  const router = useRouter()
  const [live, setLive] = useState(false)

  useEffect(() => {
    if (!supabaseUrl || !supabaseAnonKey) return

    const supabase = browserClient(supabaseUrl, supabaseAnonKey)
    const channel = supabase
      .channel('md-agenda-painel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => {
        router.refresh()
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, () => {
        router.refresh()
      })
      .subscribe((status) => {
        setLive(status === 'SUBSCRIBED')
      })

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [supabaseUrl, supabaseAnonKey, router])

  return (
    <div className="flex items-center gap-3 text-[12px]">
      {live ? (
        <span className="inline-flex items-center gap-1.5 text-success">
          <Radio size={13} aria-hidden />
          Ao vivo
        </span>
      ) : (
        <span className="text-muted">Atualização manual</span>
      )}
      <button
        type="button"
        onClick={() => router.refresh()}
        className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-muted transition-colors hover:border-line-strong hover:text-ink"
      >
        <RefreshCw size={13} aria-hidden />
        Atualizar
      </button>
    </div>
  )
}
