'use client';

import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

/**
 * Modal do painel.
 *
 * Escrito com cuidado desproporcional ao tamanho porque a lista de problemas
 * que este componente tem que evitar veio de sistemas anteriores:
 *
 *  ✓ o X fecha;
 *  ✓ clicar fora fecha — a menos que `fecharAoClicarFora` esteja desligado,
 *    que é o caso de formulário com dados digitados;
 *  ✓ Esc fecha;
 *  ✓ o scroll do fundo volta ao normal ao fechar, INCLUSIVE com dois modais
 *    abertos (a trava é contada, não um liga/desliga — foi assim que a página
 *    ficava travada até recarregar);
 *  ✓ vai para um portal no fim do `body`, então nenhum `overflow` ou
 *    `z-index` de cartão consegue escondê-lo;
 *  ✓ o Tab circula dentro do modal e o foco volta para onde estava ao fechar.
 *
 * Tudo pendurado no ciclo de vida do React, e não num listener registrado uma
 * vez na primeira montagem — que é como o Esc parava de funcionar depois da
 * segunda abertura.
 */

/** Trava de rolagem contada: dois modais abertos, um fechado, o fundo continua travado. */
let travas = 0;
let overflowAnterior = '';

function travarFundo() {
  if (typeof document === 'undefined') return;
  if (travas === 0) {
    overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
  travas += 1;
}

function destravarFundo() {
  if (typeof document === 'undefined') return;
  travas = Math.max(0, travas - 1);
  if (travas === 0) document.body.style.overflow = overflowAnterior;
}

const FOCAVEIS =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Modal({
  aberto,
  aoFechar,
  titulo,
  descricao,
  children,
  rodape,
  largura = 'md',
  fecharAoClicarFora = true,
}: {
  aberto: boolean;
  aoFechar: () => void;
  titulo: string;
  descricao?: string;
  children: React.ReactNode;
  rodape?: React.ReactNode;
  largura?: 'sm' | 'md' | 'lg';
  fecharAoClicarFora?: boolean;
}) {
  const painelRef = useRef<HTMLDivElement>(null);
  const tituloId = useId();
  const descricaoId = useId();

  useEffect(() => {
    if (!aberto) return;

    const anterior = document.activeElement as HTMLElement | null;
    travarFundo();

    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        aoFechar();
        return;
      }

      if (e.key !== 'Tab') return;

      const alvos = painelRef.current?.querySelectorAll<HTMLElement>(FOCAVEIS);
      if (!alvos || alvos.length === 0) return;

      const primeiro = alvos[0];
      const ultimo = alvos[alvos.length - 1];

      if (e.shiftKey && document.activeElement === primeiro) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primeiro.focus();
      }
    };

    document.addEventListener('keydown', aoTeclar);

    // foca o painel, não o primeiro campo: no celular focar um input abre o
    // teclado por cima do modal antes de a pessoa ler o título
    painelRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', aoTeclar);
      destravarFundo();
      anterior?.focus?.();
    };
  }, [aberto, aoFechar]);

  if (!aberto || typeof document === 'undefined') return null;

  const larguras = { sm: 'sm:max-w-md', md: 'sm:max-w-xl', lg: 'sm:max-w-3xl' };

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-end justify-center sm:items-center sm:p-6">
      {/*
        Fundo escurecido. `aria-hidden` porque um botão "Fechar" invisível
        duplicaria o X para quem usa leitor de tela.
      */}
      <div
        aria-hidden
        onClick={fecharAoClicarFora ? aoFechar : undefined}
        className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]"
      />

      <div
        ref={painelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        aria-describedby={descricao ? descricaoId : undefined}
        tabIndex={-1}
        className={`relative flex max-h-[92dvh] w-full flex-col rounded-t-2xl bg-white shadow-xl outline-none sm:rounded-2xl ${larguras[largura]}`}
      >
        <header className="flex items-start justify-between gap-4 border-b border-[var(--admin-borda)] px-5 py-4">
          <div className="min-w-0">
            <h2 id={tituloId} className="text-base font-bold text-[var(--admin-tinta)]">
              {titulo}
            </h2>
            {descricao && (
              <p id={descricaoId} className="mt-0.5 text-sm text-[var(--admin-tinta-suave)]">
                {descricao}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={aoFechar}
            aria-label="Fechar"
            className="-mr-1 shrink-0 rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5">{children}</div>

        {rodape && (
          <footer className="border-t border-[var(--admin-borda)] px-5 py-4">{rodape}</footer>
        )}
      </div>
    </div>,
    document.body,
  );
}
