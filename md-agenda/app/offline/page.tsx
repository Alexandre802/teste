import Link from 'next/link'
import { WifiOff } from 'lucide-react'
import { Wordmark } from '@/components/ui/Logo'

export const metadata = { title: 'Sem conexão', robots: { index: false } }

export default function OfflinePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center gap-6 px-6 text-center">
      <Wordmark size="lg" />
      <span className="grid h-14 w-14 place-items-center rounded-full border border-line text-muted">
        <WifiOff size={22} aria-hidden />
      </span>
      <div>
        <h1 className="text-[22px] text-display">Você está sem conexão</h1>
        <p className="mt-2 text-sm text-muted">
          Assim que a internet voltar, seus horários carregam normalmente. Nenhum agendamento é
          confirmado sem conexão.
        </p>
      </div>
      <Link
        href="/"
        className="rounded-[12px] border border-line-gold px-5 py-3 text-[15px] text-gold"
      >
        Tentar de novo
      </Link>
    </main>
  )
}
