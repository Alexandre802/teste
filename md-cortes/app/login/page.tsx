'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Marca } from '@/components/layout/Marca';
import { LoginForm } from '@/components/auth/LoginForm';
import { PrimeiroAcesso } from '@/components/auth/PrimeiroAcesso';
import { ConfigNuvem } from '@/components/auth/ConfigNuvem';
import { Icone } from '@/components/ui/Icone';
import { configVeioDaBuild, dados, modoAtual } from '@/lib/data';
import { useSessao } from '@/lib/hooks/use-sessao';

export default function PaginaDeLogin() {
  const router = useRouter();
  const { perfil, carregando } = useSessao();
  const [nuvemAberta, setNuvemAberta] = useState(false);
  const [senhasDefinidas, setSenhasDefinidas] = useState(false);

  // localStorage só existe no navegador. Lido por useSyncExternalStore, o HTML
  // da build e a hidratação combinam, sem um efeito empurrando estado.
  const precisaDefinirSenhas = useSyncExternalStore(
    () => () => {},
    () => dados.precisaConfigurar(),
    () => false,
  );

  useEffect(() => {
    if (!carregando && perfil) router.replace('/inicio');
  }, [carregando, perfil, router]);

  const pronto = !carregando && !perfil;

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-5 py-10">
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

      {modoAtual === 'local' ? (
        <div className="relative mb-5 w-full max-w-sm rounded-2xl border border-ouro/30 bg-ouro/[0.06] px-4 py-3">
          <p className="flex items-center gap-2 text-[0.8rem] font-bold text-ouro">
            <Icone nome="alerta" tamanho={15} className="shrink-0" />
            Demonstração
          </p>
          <p className="mt-1 text-[0.76rem] leading-snug text-fumaca">
            Esta é uma prévia sem servidor: as senhas são as que você definir agora, neste
            aparelho. O sistema publicado usa login real do Supabase, e só entra quem tem conta.
          </p>
        </div>
      ) : null}

      <div className="relative w-full max-w-sm">
        {!pronto ? (
          <div className="flex justify-center py-10">
            <span className="block h-7 w-7 animate-spin rounded-full border-2 border-grafite border-t-ouro" />
          </div>
        ) : modoAtual === 'nao-configurado' ? (
          <FaltaConfigurar aoConfigurar={() => setNuvemAberta(true)} />
        ) : modoAtual === 'local' && precisaDefinirSenhas && !senhasDefinidas ? (
          <PrimeiroAcesso aoConcluir={() => setSenhasDefinidas(true)} />
        ) : (
          <LoginForm
            aoEntrar={() => router.replace('/inicio')}
            // O botão de configurar só faz sentido quando a build saiu sem as
            // chaves. Com elas embutidas, não há o que configurar pelo celular.
            aoConfigurarNuvem={configVeioDaBuild() ? undefined : () => setNuvemAberta(true)}
          />
        )}
      </div>

      <ConfigNuvem aberto={nuvemAberta} aoFechar={() => setNuvemAberta(false)} />
    </main>
  );
}

/**
 * A build saiu sem as chaves do Supabase.
 *
 * Aqui não se entra. O caminho antigo era cair no modo local, e aí um sistema
 * que deve exigir senha de verdade passaria a aceitar a senha que a própria
 * pessoa acabou de inventar. Melhor uma porta fechada com o motivo escrito.
 */
function FaltaConfigurar({ aoConfigurar }: { aoConfigurar: () => void }) {
  return (
    <div className="cartao p-5 text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-ouro/25 bg-ouro/8 text-ouro">
        <Icone nome="nuvem" tamanho={22} />
      </span>
      <h1 className="mt-3.5 text-[1.25rem] font-bold text-neve">Sistema não configurado</h1>
      <p className="mx-auto mt-2 max-w-[20rem] text-[0.85rem] leading-relaxed text-fumaca">
        O MD_cortes ainda não está ligado ao banco, então não há como validar
        senha nenhuma — e ninguém entra até que esteja.
      </p>
      <button
        type="button"
        onClick={aoConfigurar}
        className="btn-ouro-fantasma mt-4 flex h-11 w-full items-center justify-center gap-2 text-[0.9rem]"
      >
        <Icone nome="nuvem" tamanho={16} />
        Configurar agora
      </button>
    </div>
  );
}
