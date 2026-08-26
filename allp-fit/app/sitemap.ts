import type { MetadataRoute } from 'next';
import { academy } from '@/data/academy';

/** Rota estática — também permite a exportação usada na prévia. */
export const dynamic = 'force-static';

/**
 * O site é uma página só; as seções entram como âncoras para o buscador
 * entender a estrutura da página.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: academy.urlCanonica,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
  ];
}
