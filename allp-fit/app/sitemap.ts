import type { MetadataRoute } from 'next';
import { academy } from '@/data/academy';

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
