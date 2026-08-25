import type { Metadata, Viewport } from 'next';
import { Inter, Sora } from 'next/font/google';
import { academy, enderecoCompleto } from '@/data/academy';
import { schemaAcademia, schemaPerguntas } from '@/lib/schema';
import './globals.css';

/* Sora nos títulos (geométrica, esportiva) e Inter no texto corrido. */
const sora = Sora({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-sora',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const titulo = `${academy.nome} | Academia em ${academy.endereco.cidade}`;
const descricao =
  'Conheça a Allp Fit em Londrina. Estrutura completa, equipamentos modernos, musculação, cardio, aulas coletivas e muito mais.';

export const metadata: Metadata = {
  metadataBase: new URL(academy.urlCanonica),
  title: { default: titulo, template: `%s | ${academy.nome}` },
  description: descricao,
  applicationName: academy.nomeCompleto,
  alternates: { canonical: '/' },
  keywords: [
    'academia em Londrina',
    'academia Londrina',
    'academia Centro Londrina',
    'musculação Londrina',
    'academia completa Londrina',
    'academia com spinning Londrina',
    'Allp Fit',
    'Allp Fit Londrina',
  ],
  authors: [{ name: academy.nomeCompleto }],
  creator: academy.nomeCompleto,
  publisher: academy.nomeCompleto,
  category: 'fitness',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: academy.urlCanonica,
    siteName: academy.nomeCompleto,
    title: titulo,
    description: descricao,
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: `${academy.nomeCompleto} — academia no Centro de ${academy.endereco.cidade}`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: titulo,
    description: descricao,
    images: ['/og.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  other: {
    'geo.region': `BR-${academy.endereco.estado}`,
    'geo.placename': academy.endereco.cidade,
    'business:contact_data:street_address': enderecoCompleto,
    'business:contact_data:phone_number': `+${academy.telefone.e164}`,
  },
};

export const viewport: Viewport = {
  themeColor: '#09090f',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${sora.variable} ${inter.variable}`}>
      <body>
        <a
          href="#inicio"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-white focus:px-5 focus:py-3 focus:font-semibold focus:text-void"
        >
          Ir para o conteúdo
        </a>

        {children}

        {/* dados estruturados: mesma informação que já está visível na página */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaAcademia()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaPerguntas()) }}
        />
      </body>
    </html>
  );
}
