import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { business, fullAddress } from '@/lib/business';
import { allSearchTerms, restaurantJsonLd } from '@/lib/seo';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jakarta',
});

export const metadata: Metadata = {
  metadataBase: new URL(business.siteUrl),
  title: {
    default: `${business.name} | Lanches em Jacareí`,
    template: `%s | ${business.name}`,
  },
  description: business.description,
  keywords: allSearchTerms,
  applicationName: business.name,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: business.siteUrl,
    siteName: business.name,
    title: `${business.name} | Lanches em Jacareí`,
    description: business.description,
    images: [{ url: '/og.png', width: 1200, height: 630, alt: `${business.name} — ${business.slogan}` }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${business.name} | Lanches em Jacareí`,
    description: business.description,
    images: ['/og.png'],
  },
  robots: { index: true, follow: true },
  other: { 'geo.placename': `${business.address.city}, ${business.address.state}`, 'geo.region': 'BR-SP' },
};

export const viewport: Viewport = {
  themeColor: '#f2620c',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={jakarta.variable}>
      <body className="antialiased">
        <a
          href="#cardapio"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-white focus:px-5 focus:py-3 focus:font-bold focus:text-cocoa"
        >
          Pular para o cardápio
        </a>
        {children}
        <script
          type="application/ld+json"
          // JSON-LD gerado a partir de lib/business.ts + lib/catalog.ts.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantJsonLd()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: business.name,
              url: business.siteUrl,
              description: `${business.name} — ${fullAddress}`,
            }),
          }}
        />
      </body>
    </html>
  );
}
