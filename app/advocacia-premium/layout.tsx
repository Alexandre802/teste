import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import './premium.css';

/**
 * Camada própria da rota /advocacia-premium.
 *
 * No App Router um layout aninhado não substitui a raiz: o `<html>` e o
 * `<body>` continuam vindo de app/layout.tsx, que é o site da lanchonete e
 * pinta o fundo de laranja. Por isso o shell abaixo cobre a página inteira com
 * o próprio fundo, e premium.css usa `:has()` para devolver o escuro ao body
 * enquanto esta rota estiver montada.
 *
 * As fontes entram por next/font: ficam auto-hospedadas no domínio, o que
 * dispensa buscar googleapis em runtime e não depende do `style-src` da CSP.
 */

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400'],
  display: 'swap',
  variable: '--font-cormorant',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Almeida & Costa | Advocacia e Consultoria Jurídica',
  description:
    'Projeto demonstrativo — orientação jurídica com análise, responsabilidade e acompanhamento próximo.',
  alternates: { canonical: '/advocacia-premium' },
  // peça de demonstração comercial: não deve concorrer no índice de busca
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: '#030405',
  colorScheme: 'dark',
};

export default function PremiumLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`premium ${cormorant.variable} ${inter.variable}`}>{children}</div>
  );
}
