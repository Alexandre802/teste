'use client';

import { SessionProvider } from 'next-auth/react';

/**
 * Contexto de sessão do Auth.js.
 *
 * Sem `session` inicial de propósito: as páginas continuam estáticas e a
 * sessão é buscada no cliente depois que a página abre. Ler a sessão no
 * servidor tornaria a home inteira dinâmica, e ela é um catálogo — vale mais
 * servir instantâneo e preencher o nome do cliente logo em seguida.
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
