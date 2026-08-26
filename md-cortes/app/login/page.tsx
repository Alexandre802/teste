'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Marca } from '@/components/layout/Marca';
import { LoginForm } from '@/components/auth/LoginForm';
import { PrimeiroAcesso } from '@/components/auth/PrimeiroAcesso';
import { ConfigNuvem } from '@/components/auth/ConfigNuvem';
import { dados } from '@/lib/data';
import { useSessao } from '@/lib/hooks/use-sessao';

export default function PaginaDeLogin() {
  const router = useRouter();
  const { perfil, carregando } = useSessao();
  // Quem responde é o localStorage, que só existe no navegador. Lido por
  // useSyncExternalStore, o HTML da build e a hidratação combinam: o servidor
  // devolve `false` (nunca pede senha em HTML estático) e o navegador corrige
  // no primeiro render, sem um efeito que empurra estado.
  const [senhasDefinidas, setSenhasDefinidas] = useState(false);
  const [nuvemAberta, setNuvemAberta] = useState(false);
  const precisaConfigurar = useSyncExternalStore(
    () => () => {},
    () => dados.precisaConfigurar(),
    () => false,
  );
  useEffect(() => {
    if (!carregando && perfil) router.replace('/inicio');
  }, [carregando, perfil, router]);

  const configurar = precisaConfigurar && !senhasDefinidas;
  // A sessão já é resolvida de forma assíncrona: enquanto ela não responde, a
  // tela mostra o giro — e é isso que também cobre o primeiro quadro da
  // hidratação, quando o snapshot do navegador substitui o da build.
  const pronto = !carregando && !perfil;

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-5 py-10">
      {/* Brilho dourado atrás da marca — a única decoração da tela. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-ouro/10 blur-[90px]"
      />

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative mb-8"
      >
        <Marca tamanho="grande" />
      </motion.div>

      <div className="relative w-full max-w-sm">
        {!pronto ? (
          <div className="flex justify-center py-10">
            <span className="block h-7 w-7 animate-spin rounded-full border-2 border-grafite border-t-ouro" />
          </div>
        ) : configurar ? (
          <PrimeiroAcesso aoConcluir={() => setSenhasDefinidas(true)} />
        ) : (
          <LoginForm
            aoEntrar={() => router.replace('/inicio')}
            aoConfigurarNuvem={() => setNuvemAberta(true)}
          />
        )}
      </div>

      <ConfigNuvem aberto={nuvemAberta} aoFechar={() => setNuvemAberta(false)} />
    </main>
  );
}
