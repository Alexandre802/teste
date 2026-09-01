import type { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/config'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Painel e rotas de dados não interessam a buscador nenhum.
        disallow: ['/admin', '/admin/', '/api/'],
      },
    ],
    sitemap: `${siteUrl()}/sitemap.xml`,
    host: siteUrl(),
  }
}
