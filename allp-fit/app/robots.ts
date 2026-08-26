import type { MetadataRoute } from 'next';
import { academy } from '@/data/academy';

/** Rota estática — também permite a exportação usada na prévia. */
export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${academy.urlCanonica}/sitemap.xml`,
    host: academy.urlCanonica,
  };
}
