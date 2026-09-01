import type { MetadataRoute } from 'next'
import { getPublicSettings } from '@/lib/settings'

export const dynamic = 'force-dynamic'

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const settings = await getPublicSettings()

  return {
    name: `${settings.businessName} — Agendamento`,
    short_name: settings.businessName,
    description: `Agende seu horário com ${settings.barberName} em menos de um minuto.`,
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    lang: 'pt-BR',
    dir: 'ltr',
    theme_color: '#070d14',
    background_color: '#070d14',
    categories: ['lifestyle', 'productivity'],
    icons: [
      { src: '/icons/192', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/512', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/maskable-192', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/icons/maskable-512', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Meus agendamentos', url: '/meus-agendamentos' },
      { name: 'Novo agendamento', url: '/' },
    ],
  }
}
