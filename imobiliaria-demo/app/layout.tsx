import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Manrope } from 'next/font/google';
import './globals.css';

const serif = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--fonte-serif',
  display: 'swap',
});

const sans = Manrope({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--fonte-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Imobiliária de Alto Padrão | Projeto Demonstrativo',
  description:
    'Imóveis exclusivos, casas de alto padrão e atendimento imobiliário personalizado.',
  applicationName: 'imobiliaria-demo',
  // Demonstrativo: fora do índice, para não ser confundido com uma
  // imobiliária real nem competir com o site de nenhum cliente.
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export const viewport: Viewport = {
  themeColor: '#090909',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${serif.variable} ${sans.variable}`}>
      <body className="bg-preto text-texto antialiased">{children}</body>
    </html>
  );
}
