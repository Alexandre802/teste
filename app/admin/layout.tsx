import type { Metadata } from 'next';

/**
 * Tudo sob /admin fica fora dos buscadores.
 *
 * O `robots.ts` já bloqueia o caminho, mas isso é uma convenção que o
 * rastreador escolhe respeitar. A meta tag é o que impede a página de ser
 * indexada se ela chegar ao Google por um link em vez do rastreamento.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
