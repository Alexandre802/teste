'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Icone } from '@/components/ui/Icone';
import { useSessao } from '@/lib/hooks/use-sessao';

const PERFIS = [
  { usuario: 'maicon', nome: 'Maicon', cargo: 'Desenvolvedor' },
  { usuario: 'gabriel', nome: 'Gabriel', cargo: 'Funcionário 1' },
  { usuario: 'nino', nome: 'Nino', cargo: 'Funcionário 2' },
];

interface Props {
  aoEntrar: () => void;
  aoConfigurarNuvem: () => void;
}

/**
 * "Acesse sua conta".
 *
 * Os três nomes embaixo são atalho de digitação, não porta de entrada: tocar em
 * um deles só preenche o campo de usuário. Sem a senha, ninguém passa — que é
 * exatamente a diferença que o pedido faz questão de marcar em relação a uma
 * tela de "escolha o perfil".
 */
export function LoginForm({ aoEntrar, aoConfigurarNuvem }: Props) {
  const { entrar, modo } = useSessao();
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
      setErro(e instanceof Error ? e.message : 'Não foi possível entrar.');
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
        Cada perfil possui login separado
      </p>

      <div className="mt-7 flex flex-col gap-3">
        <label className="sr-only" htmlFor="login-usuario">
          Usuário ou e-mail
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
            placeholder="Usuário ou e-mail"
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

      {erro ? (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          role="alert"
          className="mt-3 flex items-center justify-center gap-1.5 text-center text-[0.82rem] text-alerta"
        >
          <Icone nome="alerta" tamanho={14} />
          {erro}
        </motion.p>
      ) : (
        <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[0.78rem] text-fumaca-fraca">
          <Icone nome="escudo" tamanho={13} />
          Só é possível acessar os perfis com login
        </p>
      )}

      <section className="mt-7">
        <h2 className="flex items-center gap-2 text-[0.85rem] font-semibold text-neve">
          <Icone nome="equipe" tamanho={16} className="text-ouro" />
          Perfis autorizados
        </h2>
        <div className="mt-2.5 grid grid-cols-3 gap-2">
          {PERFIS.map((p) => {
            const escolhido = usuario.trim().toLowerCase().split('@')[0] === p.usuario;
            return (
              <button
                key={p.usuario}
                type="button"
                onClick={() => setUsuario(p.usuario)}
                className={`flex flex-col items-center gap-1.5 rounded-2xl border px-2 py-3 transition-colors ${
                  escolhido
                    ? 'border-ouro/55 bg-ouro/10'
                    : 'border-grafite bg-carvao hover:border-ouro/30'
                }`}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-ouro/35 text-ouro">
                  <Icone nome="pessoa" tamanho={17} />
                </span>
                <span className="text-[0.8rem] font-semibold text-neve">{p.nome}</span>
                <span className="text-[0.68rem] leading-tight text-fumaca-fraca">{p.cargo}</span>
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-center text-[0.72rem] text-fumaca-fraca">
          Tocar em um nome só preenche o campo — a senha continua obrigatória.
        </p>
      </section>

      <motion.button
        type="submit"
        disabled={enviando}
        whileTap={{ scale: 0.985 }}
        className="btn-ouro mt-6 flex h-[3.4rem] w-full items-center justify-center gap-2 text-[1.05rem] disabled:opacity-90"
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

      <button
        type="button"
        onClick={aoConfigurarNuvem}
        className="mt-4 flex w-full items-start gap-2 rounded-xl border border-grafite bg-carvao/70 px-3 py-2.5 text-left text-[0.74rem] leading-snug text-fumaca-fraca transition-colors hover:border-ouro/30"
      >
        <Icone nome="nuvem" tamanho={14} className="mt-0.5 shrink-0 text-ouro/70" />
        <span className="flex-1">
          {modo === 'local' ? (
            <>
              <strong className="font-semibold text-fumaca">Modo local.</strong> Os cortes ficam
              só neste aparelho. Toque aqui para conectar os três celulares ao mesmo banco.
            </>
          ) : (
            <>
              <strong className="font-semibold text-fumaca">Conectado à nuvem.</strong> Toque aqui
              para ver o projeto ou mandar o acesso para outro celular.
            </>
          )}
        </span>
        <Icone nome="seta-direita" tamanho={14} className="mt-0.5 shrink-0" />
      </button>
    </form>
  );
}
