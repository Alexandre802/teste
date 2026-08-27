'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Marca } from '@/components/layout/Marca';
import { LoginForm } from '@/components/auth/LoginForm';
import { Icone } from '@/components/ui/Icone';
import { modoAtual } from '@/lib/data';
import { useSessao } from '@/lib/hooks/use-sessao';

export default function PaginaDeLogin() {
  const router = useRouter();
  const { perfil, carregando } = useSessao();

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

      <div className="relative w-full max-w-sm">
        {!pronto ? (
          <div className="flex justify-center py-10">
            <span className="block h-7 w-7 animate-spin rounded-full border-2 border-grafite border-t-ouro" />
          </div>
        ) : modoAtual === 'nao-configurado' ? (
          <FaltaConfigurar />
        ) : (
          <LoginForm aoEntrar={() => router.replace('/inicio')} />
        )}
      </div>
    </main>
  );
}

/**
 * A build saiu sem as chaves do Supabase.
 *
 * Aqui não se entra, e não há botão que contorne. Sem banco não existe senha
 * para validar, e a alternativa — deixar passar com uma senha qualquer — é
 * justamente o que este sistema não pode fazer.
 */
function FaltaConfigurar() {
  return (
    <div className="cartao p-5 text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-ouro/25 bg-ouro/8 text-ouro">
        <Icone nome="nuvem" tamanho={22} />
      </span>
      <h1 className="mt-3.5 text-[1.25rem] font-bold text-neve">Sistema não configurado</h1>
      <p className="mx-auto mt-2 max-w-[20rem] text-[0.85rem] leading-relaxed text-fumaca">
        Esta versão do aplicativo saiu sem a conexão com o banco, então não há como validar
        senha nenhuma. Gere a build de novo com as variáveis do Supabase preenchidas.
      </p>
    </div>
  );
}
