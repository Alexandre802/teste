'use client';

import { useState } from 'react';
import Link from 'next/link';
import { criarConta, entrar, recuperarSenha, type ResultadoAuth } from '@/lib/auth';
import { linkWhatsApp } from '@/lib/whatsapp';
import { IconeWhatsApp } from '@/components/ui/Icons';

type Modo = 'entrar' | 'criar' | 'recuperar';

const titulos: Record<Modo, { titulo: string; acao: string }> = {
  entrar: { titulo: 'Entrar na minha conta', acao: 'Entrar' },
  criar: { titulo: 'Criar conta', acao: 'Criar conta' },
  recuperar: { titulo: 'Recuperar senha', acao: 'Enviar link' },
};

/**
 * Tela de login. A validação de formato (e-mail válido, senha com 6+
 * caracteres) roda aqui; quem decide se a credencial vale é lib/auth.ts, que
 * hoje responde "não configurado" — ver o comentário lá.
 */
export default function LoginForm() {
  const [modo, setModo] = useState<Modo>('entrar');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const { titulo, acao } = titulos[modo];

  async function aoEnviar(evento: React.FormEvent) {
    evento.preventDefault();
    setErro(null);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      setErro('Digite um e-mail válido.');
      return;
    }
    if (modo !== 'recuperar' && senha.length < 6) {
      setErro('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }

    setEnviando(true);
    const resultado: ResultadoAuth =
      modo === 'entrar'
        ? await entrar(email, senha)
        : modo === 'criar'
          ? await criarConta(email, senha)
          : await recuperarSenha(email);
    setEnviando(false);

    if (!resultado.ok) setErro(resultado.mensagem);
  }

  return (
    <div className="w-full max-w-[26rem]">
      <div className="card-flat p-6 sm:p-8">
        <h1 className="text-xl font-extrabold tracking-tight text-ink sm:text-2xl">{titulo}</h1>
        <p className="mt-1 text-[13px] text-ink-3">
          {modo === 'recuperar'
            ? 'Informe o e-mail cadastrado e enviaremos um link para criar uma nova senha.'
            : 'Acompanhe seus pedidos e compre mais rápido na próxima vez.'}
        </p>

        <form onSubmit={aoEnviar} noValidate className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-[13px] font-semibold text-ink-2">
              E-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@email.com"
              className="mt-1.5 w-full rounded-lg border border-line-2 px-4 py-3 text-[15px] text-ink outline-none transition-colors placeholder:text-ink-3/70 focus:border-brand-500"
            />
          </div>

          {modo !== 'recuperar' ? (
            <div>
              <label htmlFor="senha" className="block text-[13px] font-semibold text-ink-2">
                Senha
              </label>
              <input
                id="senha"
                name="senha"
                type="password"
                autoComplete={modo === 'criar' ? 'new-password' : 'current-password'}
                required
                minLength={6}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Pelo menos 6 caracteres"
                className="mt-1.5 w-full rounded-lg border border-line-2 px-4 py-3 text-[15px] text-ink outline-none transition-colors placeholder:text-ink-3/70 focus:border-brand-500"
              />
            </div>
          ) : null}

          {erro ? (
            <p role="alert" className="rounded-lg bg-brand-50 px-4 py-3 text-[13px] leading-snug text-brand-800">
              {erro}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={enviando}
            className="w-full rounded-full bg-brand-500 py-3 text-[15px] font-bold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
          >
            {enviando ? 'Enviando...' : acao}
          </button>
        </form>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-2 text-[13px]">
          {modo !== 'criar' ? (
            <button
              type="button"
              onClick={() => { setModo('criar'); setErro(null); }}
              className="font-bold text-brand-500 hover:underline"
            >
              Criar conta
            </button>
          ) : (
            <button
              type="button"
              onClick={() => { setModo('entrar'); setErro(null); }}
              className="font-bold text-brand-500 hover:underline"
            >
              Já tenho conta
            </button>
          )}

          {modo !== 'recuperar' ? (
            <button
              type="button"
              onClick={() => { setModo('recuperar'); setErro(null); }}
              className="text-ink-3 hover:text-brand-500 hover:underline"
            >
              Esqueci minha senha
            </button>
          ) : (
            <button
              type="button"
              onClick={() => { setModo('entrar'); setErro(null); }}
              className="text-ink-3 hover:text-brand-500 hover:underline"
            >
              Voltar para o login
            </button>
          )}
        </div>
      </div>

      <a
        href={linkWhatsApp()}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 flex items-center justify-center gap-2 rounded-full bg-wa px-4 py-3 text-[15px] font-bold text-white transition-colors hover:bg-wa-dark"
      >
        <IconeWhatsApp className="h-5 w-5" />
        Pedir pelo WhatsApp
      </a>

      <p className="mt-4 text-center text-[13px] text-ink-3">
        <Link href="/" className="font-semibold text-brand-500 hover:underline">
          Voltar para a loja
        </Link>
      </p>
    </div>
  );
}
