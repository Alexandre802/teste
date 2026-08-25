'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { IconeUsuario } from '@/components/ui/Icons';

/**
 * Ícone de conta do cabeçalho.
 *
 * Deslogado, é só um link para /login — igual à referência. Logado, vira um
 * botão com o primeiro nome do cliente e um menuzinho para sair. A sessão é
 * buscada no cliente, então até ela chegar mostramos o estado deslogado: é o
 * que mantém a home estática.
 */
export default function ContaButton() {
  const { data: sessao, status } = useSession();
  const [aberto, setAberto] = useState(false);
  const caixa = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;
    function aoClicarFora(e: MouseEvent) {
      if (!caixa.current?.contains(e.target as Node)) setAberto(false);
    }
    function aoTeclar(e: KeyboardEvent) {
      if (e.key === 'Escape') setAberto(false);
    }
    document.addEventListener('mousedown', aoClicarFora);
    document.addEventListener('keydown', aoTeclar);
    return () => {
      document.removeEventListener('mousedown', aoClicarFora);
      document.removeEventListener('keydown', aoTeclar);
    };
  }, [aberto]);

  if (status !== 'authenticated' || !sessao?.user) {
    return (
      <Link
        href="/login"
        aria-label="Entrar na minha conta"
        className="grid h-11 w-11 place-items-center rounded-full text-white transition-colors hover:bg-white/10"
      >
        <IconeUsuario className="h-[26px] w-[26px]" />
      </Link>
    );
  }

  const nome = sessao.user.name?.trim().split(/\s+/)[0] ?? 'Minha conta';

  return (
    <div ref={caixa} className="relative">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
        aria-haspopup="menu"
        className="flex h-11 items-center gap-2 rounded-full px-2 text-white transition-colors hover:bg-white/10"
      >
        <IconeUsuario className="h-[26px] w-[26px] shrink-0" />
        <span className="hidden max-w-[7rem] truncate text-[13px] font-semibold sm:block">{nome}</span>
      </button>

      {aberto ? (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-56 overflow-hidden rounded-xl border border-line bg-white py-1 shadow-[0_10px_30px_rgba(0,41,80,0.16)]"
        >
          <p className="border-b border-line px-4 py-2.5">
            <span className="block truncate text-[13px] font-bold text-ink">{sessao.user.name ?? 'Cliente'}</span>
            {sessao.user.email ? (
              <span className="block truncate text-[12px] text-ink-3">{sessao.user.email}</span>
            ) : null}
          </p>
          <Link
            href="/carrinho"
            role="menuitem"
            onClick={() => setAberto(false)}
            className="block px-4 py-2.5 text-[14px] text-ink-2 hover:bg-brand-50 hover:text-brand-700"
          >
            Meu carrinho
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => signOut({ callbackUrl: '/' })}
            className="block w-full px-4 py-2.5 text-left text-[14px] text-ink-2 hover:bg-brand-50 hover:text-brand-700"
          >
            Sair
          </button>
        </div>
      ) : null}
    </div>
  );
}
