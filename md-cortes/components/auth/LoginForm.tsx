'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Icone } from '@/components/ui/Icone';
import { useSessao } from '@/lib/hooks/use-sessao';

interface Props {
  aoEntrar: () => void;
}

/**
 * "Acesse sua conta".
 *
 * Usuário e senha, e nada mais. Não há atalho de perfil, não há entrada de
 * demonstração, não há caminho que dispense a senha: quem decide se entra é o
 * Supabase Auth, do outro lado.
 *
 * O campo aceita "gabriel" ou "gabriel@mdcortes.app" — a conversão acontece no
 * adapter, que completa o domínio quando falta o @.
 */
export function LoginForm({ aoEntrar }: Props) {
  const { entrar } = useSessao();
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [verSenha, setVerSenha] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const enviar = async (evento: React.FormEvent) => {
    evento.preventDefault();
    if (enviando) return;
    if (!usuario.trim() || !senha) {
      setErro('Preencha usuário e senha.');
      return;
    }
    setErro(null);
    setEnviando(true);
    try {
      await entrar(usuario, senha);
      aoEntrar();
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Usuário ou senha inválidos');
      setSenha('');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form onSubmit={enviar} className="w-full" noValidate>
      <h1 className="text-center text-[2rem] leading-tight font-extrabold text-neve">
        Acesse sua conta
      </h1>
      <p className="mt-1.5 text-center text-[0.88rem] text-fumaca">
        Entre com o usuário e a senha da sua conta
      </p>

      <div className="mt-8 flex flex-col gap-3">
        <label className="sr-only" htmlFor="login-usuario">
          Usuário
        </label>
        <div className="flex items-center gap-3 rounded-campo border border-grafite bg-carvao-alto px-4 transition-colors focus-within:border-ouro/55">
          <Icone nome="pessoa" tamanho={19} className="shrink-0 text-ouro/80" />
          <input
            id="login-usuario"
            type="text"
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            placeholder="Usuário"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            className="w-full bg-transparent py-3.5 text-[1rem] text-neve outline-none placeholder:text-fumaca-fraca"
          />
        </div>

        <label className="sr-only" htmlFor="login-senha">
          Senha
        </label>
        <div className="flex items-center gap-3 rounded-campo border border-grafite bg-carvao-alto px-4 transition-colors focus-within:border-ouro/55">
          <Icone nome="cadeado" tamanho={19} className="shrink-0 text-ouro/80" />
          <input
            id="login-senha"
            type={verSenha ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full bg-transparent py-3.5 text-[1rem] text-neve outline-none placeholder:text-fumaca-fraca"
          />
          <button
            type="button"
            onClick={() => setVerSenha((v) => !v)}
            aria-label={verSenha ? 'Ocultar senha' : 'Mostrar senha'}
            className="-mr-1 shrink-0 rounded-lg p-1.5 text-fumaca-fraca transition-colors hover:text-neve"
          >
            <Icone nome={verSenha ? 'olho-fechado' : 'olho'} tamanho={18} />
          </button>
        </div>
      </div>

      <div className="mt-3 min-h-[1.5rem]">
        {erro ? (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            role="alert"
            className="flex items-center justify-center gap-1.5 text-center text-[0.85rem] font-medium text-alerta"
          >
            <Icone nome="alerta" tamanho={15} className="shrink-0" />
            {erro}
          </motion.p>
        ) : null}
      </div>

      <motion.button
        type="submit"
        disabled={enviando}
        whileTap={{ scale: 0.985 }}
        className="btn-ouro mt-3 flex h-[3.4rem] w-full items-center justify-center gap-2 text-[1.05rem] disabled:opacity-90"
      >
        {enviando ? (
          <>
            <span className="block h-4 w-4 animate-spin rounded-full border-2 border-noite/25 border-t-noite" />
            Entrando…
          </>
        ) : (
          <>
            <Icone nome="seta-direita" tamanho={19} strokeWidth={2.4} />
            Entrar
          </>
        )}
      </motion.button>

      <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-[0.76rem] text-fumaca-fraca">
        <Icone nome="escudo" tamanho={13} className="shrink-0" />
        Cada perfil tem login próprio. O acesso é verificado no servidor.
      </p>

    </form>
  );
}
