import type { MetadataRoute } from 'next';
import { business } from '@/lib/business';

export default function robots(): MetadataRoute.Robots {
  return {
    // O painel administrativo fica fora do índice. As páginas de /admin também
    // carregam `noindex` na própria meta tag: robots.txt é uma convenção que o
    // rastreador escolhe seguir, a meta é o que vale se o link vazar.
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/', '/admin'] }],
    sitemap: `${business.siteUrl}/sitemap.xml`,
  };
}
