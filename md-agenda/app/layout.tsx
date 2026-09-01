import type { Metadata, Viewport } from 'next'
import { DM_Serif_Display, Inter } from 'next/font/google'
import { siteUrl } from '@/lib/config'
import { getPublicSettings } from '@/lib/settings'
import { RegistrarSW } from '@/components/pwa/RegistrarSW'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

/**
 * A serifada aparece só em título de destaque — nome do barbeiro no hero,
 * título da tela de sucesso. O resto do produto é Inter.
 */
const display = DM_Serif_Display({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  variable: '--font-display',
})

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings()
  const base = siteUrl()
  const title = `${settings.businessName} — Agende seu horário com ${settings.barberName}`
  const description = `Escolha o serviço, encontre o melhor horário e pronto. Seu agendamento chega automaticamente para o ${settings.barberName}.`

  return {
    metadataBase: new URL(base),
    title: {
      default: title,
      template: `%s — ${settings.businessName}`,
    },
    description,
    applicationName: settings.businessName,
    alternates: { canonical: '/' },
    robots: { index: true, follow: true },
    manifest: '/manifest.webmanifest',
    appleWebApp: {
      capable: true,
      title: settings.businessName,
      statusBarStyle: 'black-translucent',
    },
    openGraph: {
      type: 'website',
      locale: 'pt_BR',
      url: base,
      siteName: settings.businessName,
      title,
      description,
    },
    twitter: { card: 'summary', title, description },
  }
}

export const viewport: Viewport = {
  themeColor: '#070d14',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${display.variable}`}>
      <body>
        {children}
        <RegistrarSW />
      </body>
    </html>
  )
}
