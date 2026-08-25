import type { MetadataRoute } from 'next';
import { academy } from '@/data/academy';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${academy.urlCanonica}/sitemap.xml`,
    host: academy.urlCanonica,
  };
}
