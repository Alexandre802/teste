import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getPublicSettings } from '@/lib/settings'
import { destinationNumber } from '@/lib/notifications/notify'
import { toInternationalPhone } from '@/lib/format'
import { BottomNav } from '@/components/client/BottomNav'
import { LookupPanel } from '@/components/client/LookupPanel'
import { SiteHeader } from '@/components/client/SiteHeader'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Meus agendamentos',
  description: 'Consulte, acompanhe e cancele o seu horário usando telefone e código.',
  alternates: { canonical: '/meus-agendamentos' },
}

export default async function MeusAgendamentosPage() {
  const settings = await getPublicSettings()
  const destination = destinationNumber(settings)
  const whatsappUrl = destination ? `https://wa.me/${toInternationalPhone(destination)}` : null

  return (
    <>
      <div className="mx-auto max-w-lg px-4 pb-28 sm:pb-10">
        <SiteHeader businessName={settings.businessName} />

        <div className="pt-7 pb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[13px] text-muted transition-colors hover:text-ink"
          >
            <ArrowLeft size={15} aria-hidden />
            Voltar ao início
          </Link>
          <h1 className="mt-4 text-[28px] leading-tight text-display">Meus agendamentos</h1>
          <p className="mt-2 text-[14px] text-muted">
            Informe o telefone e o código do agendamento. Sem conta, sem senha — o código é o que
            prova que o horário é seu.
          </p>
        </div>

        <LookupPanel timezone={settings.timezone} barberName={settings.barberName} />
      </div>

      <BottomNav whatsappUrl={whatsappUrl} />
    </>
  )
}
