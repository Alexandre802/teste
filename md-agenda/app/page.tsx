import type { Metadata } from 'next'
import { getStore, storeKindOrNull } from '@/lib/db'
import { getOpenWeekdays, getPublicSettings } from '@/lib/settings'
import { siteUrl } from '@/lib/config'
import { todayStr } from '@/lib/time'
import { destinationNumber } from '@/lib/notifications/notify'
import { toInternationalPhone } from '@/lib/format'
import type { Service } from '@/types'
import { BookingFlow } from '@/components/client/BookingFlow'
import { BottomNav } from '@/components/client/BottomNav'
import { Hero } from '@/components/client/Hero'
import { HowItWorks } from '@/components/client/HowItWorks'
import { SiteFooter } from '@/components/client/SiteFooter'
import { SiteHeader } from '@/components/client/SiteHeader'
import { EmptyState } from '@/components/ui/Feedback'
import { DatabaseMissingNotice, StoreNotice } from '@/components/ui/StoreNotice'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  alternates: { canonical: '/' },
}

export default async function Home() {
  const settings = await getPublicSettings()
  const ready = storeKindOrNull() !== null

  let services: Service[] = []
  if (ready) {
    try {
      services = await getStore().listServices()
    } catch {
      services = []
    }
  }

  const openWeekdays = await getOpenWeekdays()
  const today = todayStr(settings.timezone)
  const destination = destinationNumber(settings)
  const whatsappUrl = destination ? `https://wa.me/${toInternationalPhone(destination)}` : null

  const podeAgendar = ready && services.length > 0 && openWeekdays.length > 0

  const hero = (
    <>
      <Hero
        barberName={settings.barberName}
        photoUrl={settings.barberPhotoUrl}
        tagline={settings.barberTagline}
      />
      <StoreNotice />
    </>
  )

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BarberShop',
    name: settings.businessName,
    url: siteUrl(),
    // Só entra o que foi confirmado no painel — nada é preenchido por suposição.
    ...(settings.businessAddress
      ? { address: { '@type': 'PostalAddress', streetAddress: settings.businessAddress } }
      : {}),
    ...(settings.businessPhone ? { telephone: settings.businessPhone } : {}),
    ...(settings.barberPhotoUrl ? { image: settings.barberPhotoUrl } : {}),
    potentialAction: {
      '@type': 'ReserveAction',
      target: { '@type': 'EntryPoint', urlTemplate: siteUrl() },
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-lg px-4 pb-28 sm:pb-10">
        <SiteHeader businessName={settings.businessName} />

        <div className="grid gap-6 pt-2">
          {podeAgendar ? (
            // Hero e "como funciona" entram como partes do fluxo: na tela de
            // confirmação eles saem, e a confirmação fica sozinha.
            <BookingFlow
              services={services}
              today={today}
              openWeekdays={openWeekdays}
              bookingWindowDays={settings.bookingWindowDays}
              barberName={settings.barberName}
              hero={hero}
              rodape={<HowItWorks barberName={settings.barberName} />}
            />
          ) : (
            <>
              {hero}
              {!ready ? (
                <DatabaseMissingNotice />
              ) : services.length === 0 ? (
                <EmptyState
                  title="Nenhum serviço cadastrado ainda."
                  description={`Assim que ${settings.barberName} cadastrar os serviços no painel, o agendamento abre aqui.`}
                />
              ) : (
                <EmptyState
                  title="A agenda ainda não está aberta."
                  description={`${settings.barberName} precisa configurar os dias e horários de atendimento no painel.`}
                />
              )}
              <HowItWorks barberName={settings.barberName} />
            </>
          )}
        </div>

        <SiteFooter
          businessName={settings.businessName}
          address={settings.businessAddress}
          phone={settings.businessPhone}
        />
      </div>

      <BottomNav whatsappUrl={whatsappUrl} />
    </>
  )
}
