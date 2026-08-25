import type { MetadataRoute } from 'next';
import { business } from '@/data/business';

export default function sitemap(): MetadataRoute.Sitemap {
  const agora = new Date();
  return [
    { url: business.siteUrl, lastModified: agora, changeFrequency: 'weekly', priority: 1 },
    { url: `${business.siteUrl}/login`, lastModified: agora, changeFrequency: 'yearly', priority: 0.2 },
  ];
}
