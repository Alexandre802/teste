'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Marca } from '@/components/layout/Marca';
import { useSessao } from '@/lib/hooks/use-sessao';

/**
 * Tela de abertura. Decide para onde ir e sai da frente.
 *
 * É também o que aparece por um instante quando o app é aberto pelo ícone da
 * tela de início — daí a marca centralizada em vez de uma página em branco.
 */
export default function Abertura() {
  const router = useRouter();
  const { perfil, carregando } = useSessao();

  useEffect(() => {
    if (carregando) return;
    router.replace(perfil ? '/inicio' : '/login');
  }, [carregando, perfil, router]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-7">
      <Marca tamanho="grande" />
      <span className="block h-6 w-6 animate-spin rounded-full border-2 border-grafite border-t-ouro" />
      <span className="sr-only">Carregando o MD_cortes…</span>
    </main>
  );
}
