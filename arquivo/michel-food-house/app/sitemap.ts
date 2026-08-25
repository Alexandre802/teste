import type { MetadataRoute } from 'next';
import { business } from '@/lib/business';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: business.siteUrl, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${business.siteUrl}/#cardapio`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${business.siteUrl}/#sobre`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${business.siteUrl}/#promocoes`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${business.siteUrl}/#contato`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
  ];
}
