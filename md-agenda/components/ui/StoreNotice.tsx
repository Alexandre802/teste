import { storeKindOrNull } from '@/lib/db'
import { Alert } from './Feedback'

/**
 * Enquanto o produto roda no banco local, a tela diz isso — em vez de deixar
 * alguém acreditar que os agendamentos estão guardados de verdade.
 */
export function StoreNotice() {
  const kind = storeKindOrNull()

  if (kind === 'supabase' || kind === null) return null

  return (
    <Alert tone="warning" title="Modo local, sem banco de dados">
      Os agendamentos ficam apenas na memória do servidor e somem quando ele
      reinicia. Configure o Supabase antes de abrir para clientes.
    </Alert>
  )
}

export function DatabaseMissingNotice() {
  return (
    <Alert tone="danger" title="Agendamento indisponível">
      O banco de dados ainda não foi configurado, então nenhum horário pode ser
      guardado. Configure o Supabase em <code>.env.local</code> para liberar o
      agendamento.
    </Alert>
  )
}
