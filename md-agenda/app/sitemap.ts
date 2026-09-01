import type { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/config'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl()
  const now = new Date()

  return [
    { url: base, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/meus-agendamentos`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/informacoes`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    {
      url: `${base}/politica-de-privacidade`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]
}
