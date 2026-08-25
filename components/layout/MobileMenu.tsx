'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { business } from '@/data/business';
import { linkWhatsApp } from '@/lib/whatsapp';
import { IconeFechar, IconeSeta, IconeWhatsApp } from '@/components/ui/Icons';

/** Os itens do menu lateral, na ordem combinada. */
const itens = [
  { rotulo: 'Início', href: '/' },
  { rotulo: 'Produtos', href: '/#departamentos' },
  { rotulo: 'Cachorros', href: '/#cachorros' },
  { rotulo: 'Gatos', href: '/#gatos' },
  { rotulo: 'Peixes', href: '/#peixes' },
  { rotulo: 'Aves', href: '/#aves' },
  { rotulo: 'Coelhos', href: '/#coelhos' },
  { rotulo: 'Répteis', href: '/#repteis' },
  { rotulo: 'Promoções', href: '/#promocoes' },
  { rotulo: 'Atendimento', href: '/#servicos' },
  { rotulo: 'Suporte', href: '/#servicos' },
];

/**
 * Gaveta lateral do menu hambúrguer. Funciona igual no celular e no desktop.
 * Fecha no Esc, no clique fora e ao escolher um item; enquanto está aberta o
 * fundo não rola e o foco fica preso dentro dela.
 */
export default function MobileMenu({
  aberto,
  aoFechar,
}: {
  aberto: boolean;
  aoFechar: () => void;
}) {
  const painel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;

    const anterior = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';
    painel.current?.querySelector<HTMLElement>('a, button')?.focus();

    function aoTeclar(evento: KeyboardEvent) {
      if (evento.key === 'Escape') {
        aoFechar();
        return;
      }
      if (evento.key !== 'Tab' || !painel.current) return;

      // prende o foco: Tab no último volta ao primeiro e vice-versa
      const focaveis = painel.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      );
      if (focaveis.length === 0) return;
      const primeiro = focaveis[0];
      const ultimo = focaveis[focaveis.length - 1];
      if (evento.shiftKey && document.activeElement === primeiro) {
        evento.preventDefault();
        ultimo.focus();
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault();
        primeiro.focus();
      }
    }

    document.addEventListener('keydown', aoTeclar);
    return () => {
      document.removeEventListener('keydown', aoTeclar);
      document.body.style.overflow = '';
      anterior?.focus();
    };
  }, [aberto, aoFechar]);

  return (
    <>
      <div
        onClick={aoFechar}
        aria-hidden="true"
        className={`fixed inset-0 z-[60] bg-brand-900/45 transition-opacity duration-200 ${
          aberto ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <div
        ref={painel}
        role="dialog"
        aria-modal={aberto || undefined}
        aria-label="Menu de navegação"
        /* fechado, a gaveta fica fora da tela — sem `inert` seus links
           continuariam no Tab e no leitor de tela */
        inert={!aberto}
        className={`fixed left-0 top-0 z-[70] flex h-full w-[86%] max-w-[20rem] flex-col bg-white transition-transform duration-200 ease-out ${
          aberto ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between bg-brand-700 px-4 py-4 text-white">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.16em] text-white/80">
              {business.nomeLinha1}
            </p>
            <p className="text-lg font-extrabold leading-tight">{business.nomeLinha2}</p>
          </div>
          <button
            type="button"
            onClick={aoFechar}
            aria-label="Fechar menu"
            className="grid h-10 w-10 place-items-center rounded-full hover:bg-white/10"
          >
            <IconeFechar className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-2">
          <ul>
            {itens.map((item) => (
              <li key={item.rotulo}>
                <Link
                  href={item.href}
                  onClick={aoFechar}
                  className="flex items-center justify-between border-b border-line px-4 py-3 text-[15px] font-semibold text-ink-2 hover:bg-brand-50 hover:text-brand-700"
                >
                  {item.rotulo}
                  <IconeSeta className="h-4 w-4 text-ink-3" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-2 border-t border-line p-4">
          <a
            href={linkWhatsApp()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={aoFechar}
            className="flex items-center justify-center gap-2 rounded-full bg-wa px-4 py-3 text-[15px] font-bold text-white transition-colors hover:bg-wa-dark"
          >
            <IconeWhatsApp className="h-5 w-5" />
            Falar no WhatsApp
          </a>
          <Link
            href="/login"
            onClick={aoFechar}
            className="flex items-center justify-center gap-2 rounded-full border border-brand-500 px-4 py-3 text-[15px] font-bold text-brand-500 transition-colors hover:bg-brand-50"
          >
            Minha conta
          </Link>
        </div>
      </div>
    </>
  );
}
