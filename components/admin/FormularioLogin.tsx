'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { caixaConfigurado } from '@/lib/admin/config';
import { supabaseBrowser } from '@/lib/admin/supabase-browser';
import { Botao } from './ui/Botao';
import { Aviso } from './ui/Estados';
import MarcaPainel from './MarcaPainel';

/**
 * Entrada do painel.
 *
 * Não existe "criar conta" nem "cadastre-se": administrador é criado no
 * Supabase e ligado à casa por SQL (ver a migration 0006). Formulário público
 * de cadastro num sistema financeiro é uma porta que não precisa existir.
 *
 * Também não existe "entrar com Google" nem "entrar com Facebook". Este
 * projeto já teve botões desses que davam o usuário por autenticado sem
 * verificar nada; método que não funciona de verdade não aparece na tela.
 */
export default function FormularioLogin() {
  const router = useRouter();
  const parametros = useSearchParams();
  const proximo = parametros.get('proximo') || '/admin';

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [entrando, setEntrando] = useState(false);
  const [erro, setErro] = useState('');

  const entrar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (entrando) return;

    const supabase = supabaseBrowser();
    if (!supabase) {
      setErro('O fluxo de caixa ainda não foi configurado neste ambiente.');
      return;
    }

    setErro('');
    setEntrando(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: senha,
    });

    if (error) {
      setEntrando(false);
      // Mensagem única para e-mail errado e senha errada: dizer qual dos dois
      // falhou entrega a quem tenta adivinhar que aquele e-mail existe.
      setErro(
        error.message === 'Invalid login credentials'
          ? 'E-mail ou senha incorretos.'
          : 'Não foi possível entrar agora. Tente de novo em instantes.',
      );
      return;
    }

    // `replace`: o botão voltar do navegador não deve retornar ao login
    router.replace(proximo.startsWith('/admin') ? proximo : '/admin');
    // o proxy decide pelo cookie, que acabou de ser gravado
    router.refresh();
  };

  return (
    <main className="admin-app flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-7 flex flex-col items-center gap-3 text-center">
          <MarcaPainel tamanho="grande" />
          <div>
            <h1 className="text-lg font-extrabold tracking-tight text-[var(--admin-tinta)]">
              COMIDA CASEIRA
            </h1>
            <p className="text-sm text-[var(--admin-tinta-suave)]">Painel administrativo</p>
          </div>
        </div>

        <form onSubmit={entrar} className="admin-card flex flex-col gap-4 p-5 sm:p-6">
          {!caixaConfigurado && (
            <Aviso tipo="info">
              O painel ainda não está ligado ao banco de dados. Configure
              <code className="mx-1 rounded bg-white/60 px-1 text-[11px]">NEXT_PUBLIC_SUPABASE_URL</code>
              e
              <code className="mx-1 rounded bg-white/60 px-1 text-[11px]">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
              para entrar.
            </Aviso>
          )}

          <div>
            <label htmlFor="email" className="admin-rotulo">
              E-mail
            </label>
            <div className="relative">
              <Mail
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden
              />
              <input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="admin-campo pl-9"
              />
            </div>
          </div>

          <div>
            <label htmlFor="senha" className="admin-rotulo">
              Senha
            </label>
            <div className="relative">
              <Lock
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden
              />
              <input
                id="senha"
                type={mostrarSenha ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                className="admin-campo pl-9 pr-11"
              />
              <button
                type="button"
                onClick={() => setMostrarSenha((v) => !v)}
                aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                aria-pressed={mostrarSenha}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              >
                {mostrarSenha ? (
                  <EyeOff className="h-4 w-4" aria-hidden />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden />
                )}
              </button>
            </div>
          </div>

          {erro && <Aviso tipo="erro">{erro}</Aviso>}

          <Botao
            type="submit"
            tamanho="lg"
            className="w-full"
            carregando={entrando}
            textoCarregando="Entrando…"
            disabled={!caixaConfigurado}
          >
            ENTRAR
          </Botao>
        </form>

        <p className="mt-5 text-center text-xs leading-relaxed text-[var(--admin-tinta-suave)]">
          Acesso restrito à equipe da casa. Não há cadastro público —
          <br />
          quem cria conta de administrador é a proprietária.
        </p>
      </div>
    </main>
  );
}
