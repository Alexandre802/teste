'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { linkWhatsApp } from '@/lib/whatsapp';
import { IconeWhatsApp } from '@/components/ui/Icons';
import { IconeFacebook, IconeGoogle } from './IconesProvedor';

type Modo = 'entrar' | 'criar' | 'recuperar';

const titulos: Record<Modo, { titulo: string; acao: string; apoio: string }> = {
  entrar: {
    titulo: 'Entrar na minha conta',
    acao: 'Entrar',
    apoio: 'Acompanhe seus pedidos e compre mais rápido na próxima vez.',
  },
  criar: {
    titulo: 'Criar conta',
    acao: 'Criar conta',
    apoio: 'Leva um minuto. Depois é só escolher os produtos e pedir.',
  },
  recuperar: {
    titulo: 'Recuperar senha',
    acao: 'Enviar link',
    apoio: 'Informe o e-mail cadastrado e enviaremos um link para criar uma nova senha.',
  },
};

/**
 * Tela de login: Google, Facebook ou e-mail e senha.
 *
 * Os botões sociais só aparecem para os provedores que têm chave configurada
 * (ver auth.ts) — botão que existe aqui é botão que funciona. A validação de
 * formato roda no navegador; quem decide se a credencial vale é o Auth.js.
 */
export default function LoginForm({
  google,
  facebook,
  contaPorEmailDisponivel,
  erroDaUrl,
}: {
  google: boolean;
  facebook: boolean;
  contaPorEmailDisponivel: boolean;
  erroDaUrl?: string;
}) {
  const router = useRouter();
  const [modo, setModo] = useState<Modo>('entrar');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(erroDaUrl ?? null);
  const [enviando, setEnviando] = useState(false);

  const { titulo, acao, apoio } = titulos[modo];
  const temSocial = google || facebook;

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

    if (!contaPorEmailDisponivel) {
      setErro(
        modo === 'criar'
          ? 'A criação de conta por e-mail ainda não está disponível. Entre com o Google ou o Facebook, ou faça seu pedido pelo WhatsApp.'
          : 'O login por e-mail ainda não está disponível. Entre com o Google ou o Facebook, ou faça seu pedido pelo WhatsApp.',
      );
      return;
    }

    setEnviando(true);
    const r = await signIn('credentials', { email, senha, redirect: false });
    setEnviando(false);

    if (r?.error) {
      setErro('E-mail ou senha incorretos.');
      return;
    }
    if (r?.ok) {
      // `refresh` antes do `push`: sem ele o cabeçalho continuaria mostrando o
      // estado deslogado até a próxima navegação
      router.refresh();
      router.push('/');
    }
  }

  function entrarCom(provedor: 'google' | 'facebook') {
    signIn(provedor, { callbackUrl: '/' });
  }

  return (
    <div className="w-full max-w-[26rem]">
      <div className="card-flat p-6 sm:p-8">
        <h1 className="text-xl font-extrabold tracking-tight text-ink sm:text-2xl">{titulo}</h1>
        <p className="mt-1 text-[13px] text-ink-3">{apoio}</p>

        {temSocial && modo !== 'recuperar' ? (
          <>
            <div className="mt-6 space-y-2">
              {google ? (
                <button
                  type="button"
                  onClick={() => entrarCom('google')}
                  className="flex w-full items-center justify-center gap-3 rounded-full border border-line-2 bg-white py-3 text-[15px] font-bold text-ink-2 transition-colors hover:bg-surface-2"
                >
                  <IconeGoogle className="h-5 w-5" />
                  Continuar com Google
                </button>
              ) : null}
              {facebook ? (
                <button
                  type="button"
                  onClick={() => entrarCom('facebook')}
                  className="flex w-full items-center justify-center gap-3 rounded-full border border-line-2 bg-white py-3 text-[15px] font-bold text-ink-2 transition-colors hover:bg-surface-2"
                >
                  <IconeFacebook className="h-5 w-5" />
                  Continuar com Facebook
                </button>
              ) : null}
            </div>

            <div className="my-5 flex items-center gap-3" aria-hidden="true">
              <span className="h-px flex-1 bg-line" />
              <span className="text-[12px] font-semibold uppercase tracking-wider text-ink-3">ou</span>
              <span className="h-px flex-1 bg-line" />
            </div>
          </>
        ) : null}

        {/* `method="post"` é rede de proteção: se o JavaScript falhar em carregar,
            o navegador faz o envio nativo — e num GET a senha iria parar na URL,
            no histórico e nos logs do servidor. */}
        <form method="post" onSubmit={aoEnviar} noValidate className={temSocial && modo !== 'recuperar' ? 'space-y-4' : 'mt-6 space-y-4'}>
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
            {enviando ? 'Entrando...' : acao}
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
