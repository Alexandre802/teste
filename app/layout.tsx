import type { Metadata, Viewport } from 'next';
import { Montserrat } from 'next/font/google';
import { business } from '@/data/business';
import './globals.css';

/* Montserrat é a fonte da peça de referência: geométrica, peso alto nos
   títulos e leitura limpa nos textos de apoio. */
const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat',
  weight: ['400', '500', '600', '700', '800'],
});

const titulo = `${business.nome} | Pet Shop em Jacareí`;

export const metadata: Metadata = {
  metadataBase: new URL(business.siteUrl),
  title: { default: titulo, template: `%s | ${business.nome}` },
  description: business.descricao,
  applicationName: business.nome,
  alternates: { canonical: '/' },
  keywords: [
    'pet shop Jacareí',
    'casa de ração Jacareí',
    'ração PremieR',
    'ração para cachorro',
    'ração para gato',
    'acessórios para pet',
    'Bandeira Branca',
  ],
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: business.siteUrl,
    siteName: business.nome,
    title: titulo,
    description: business.descricao,
    images: [
      {
        url: '/banners/cachorro-e-gato.webp',
        width: 940,
        height: 624,
        alt: 'Cachorro e gato — Casa de Ração Bandeira Branca',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: titulo,
    description: business.descricao,
    images: ['/banners/cachorro-e-gato.webp'],
  },
  robots: { index: true, follow: true },
  other: { 'geo.placename': business.cidadeUf, 'geo.region': 'BR-SP' },
};

export const viewport: Viewport = {
  themeColor: '#034782',
  colorScheme: 'light',
};

/** Ficha da loja para os buscadores. Só entra o que está confirmado. */
function fichaDaLoja() {
  return {
    '@context': 'https://schema.org',
    '@type': 'PetStore',
    name: business.nome,
    description: business.descricao,
    url: business.siteUrl,
    telephone: business.telefone,
    address: {
      '@type': 'PostalAddress',
      addressLocality: business.cidade,
      addressRegion: business.estado,
      addressCountry: 'BR',
      ...(business.enderecoCompleto ? { streetAddress: business.enderecoCompleto } : {}),
    },
    areaServed: business.cidadeUf,
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={montserrat.variable}>
      <body className="antialiased">
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-white focus:px-5 focus:py-3 focus:font-bold focus:text-brand-700"
        >
          Pular para o conteúdo
        </a>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(fichaDaLoja()) }}
        />
      </body>
    </html>
  );
}
