'use client';

import { Loader2 } from 'lucide-react';

/**
 * Botão do painel.
 *
 * `carregando` faz três coisas de uma vez, e é por isso que existe em vez de
 * cada tela cuidar disso sozinha: desabilita, troca o texto e mostra o
 * girador. Botão financeiro que aceita o segundo clique grava a despesa duas
 * vezes, e ninguém confere isso olhando o extrato depois.
 */

type Variante = 'primario' | 'secundario' | 'fantasma' | 'perigo' | 'sucesso';

const VARIANTES: Record<Variante, string> = {
  primario:
    'bg-[var(--admin-laranja)] text-white hover:bg-[#d8540a] disabled:bg-[var(--admin-laranja)]/50',
  secundario:
    'bg-white text-[var(--admin-tinta)] ring-1 ring-inset ring-[var(--admin-borda)] hover:bg-slate-50',
  fantasma: 'bg-transparent text-[var(--admin-tinta-suave)] hover:bg-slate-100 hover:text-[var(--admin-tinta)]',
  perigo: 'bg-[var(--admin-vermelho)] text-white hover:bg-[#c93b40] disabled:bg-[var(--admin-vermelho)]/50',
  sucesso: 'bg-[var(--admin-verde)] text-white hover:bg-[#0b8148] disabled:bg-[var(--admin-verde)]/50',
};

const TAMANHOS = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
};

export function Botao({
  children,
  variante = 'primario',
  tamanho = 'md',
  carregando = false,
  textoCarregando,
  className = '',
  disabled,
  ...resto
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: Variante;
  tamanho?: keyof typeof TAMANHOS;
  carregando?: boolean;
  /** "Salvando…", "Enviando…". Sem isto, mostra o conteúdo normal. */
  textoCarregando?: string;
}) {
  return (
    <button
      {...resto}
      disabled={disabled || carregando}
      aria-busy={carregando || undefined}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors disabled:cursor-not-allowed ${VARIANTES[variante]} ${TAMANHOS[tamanho]} ${className}`}
    >
      {carregando && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {carregando && textoCarregando ? textoCarregando : children}
    </button>
  );
}
