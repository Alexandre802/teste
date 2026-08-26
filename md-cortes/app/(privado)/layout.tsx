'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { Marca } from '@/components/layout/Marca';
import { ProvedorDaCentral } from '@/lib/hooks/use-central';
import { useSessao } from '@/lib/hooks/use-sessao';

/**
 * Portão das telas internas.
 *
 * Esconder botão não é permissão: quem garante que o Gabriel não lê os dados do
 * Nino é a RLS do Postgres. Este guarda existe pela experiência — evitar que
 * alguém sem sessão fique olhando um painel vazio — e não pela segurança.
 */
export default function LayoutPrivado({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { perfil, carregando, ehAdmin } = useSessao();

  useEffect(() => {
    if (!carregando && !perfil) router.replace('/login');
  }, [carregando, perfil, router]);

  if (carregando || !perfil) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-6">
        <Marca tamanho="medio" />
        <span className="block h-6 w-6 animate-spin rounded-full border-2 border-grafite border-t-ouro" />
      </div>
    );
  }

  return (
    <ProvedorDaCentral>
      <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col lg:max-w-5xl">
        <div className="respiro-barra flex-1">{children}</div>
        <BottomNavigation admin={ehAdmin} />
      </div>
    </ProvedorDaCentral>
  );
}
