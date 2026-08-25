/**
 * Botão/link do site. Três pesos:
 *  - 'chama'  → laranja da marca, para a ação principal (converter)
 *  - 'led'    → borda em vidro, para a ação secundária
 *  - 'fantasma' → texto puro
 * O laranja é reservado ao CTA: se tudo brilha, nada chama.
 */
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Variante = 'chama' | 'led' | 'fantasma';
type Tamanho = 'md' | 'lg';

const base =
  'group relative inline-flex items-center justify-center gap-2 rounded-full font-semibold ' +
  'transition-[transform,box-shadow,background-color,border-color] duration-300 ease-out ' +
  'active:translate-y-px motion-reduce:transition-none';

const variantes: Record<Variante, string> = {
  chama:
    'bg-laranja text-white shadow-[0_10px_40px_-12px_rgba(255,75,31,0.9)] ' +
    'hover:-translate-y-0.5 hover:bg-[#ff5f38] hover:shadow-[0_18px_50px_-10px_rgba(255,75,31,0.95)]',
  led:
    'border border-white/15 bg-white/5 text-white backdrop-blur-md ' +
    'hover:-translate-y-0.5 hover:border-ciano/60 hover:bg-white/10 ' +
    'hover:shadow-[0_0_30px_-6px_rgba(0,221,253,0.55)]',
  fantasma: 'text-white/80 hover:text-white',
};

const tamanhos: Record<Tamanho, string> = {
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-[0.95rem] md:text-base',
};

type Comum = { variante?: Variante; tamanho?: Tamanho; children: ReactNode; className?: string };

export function BotaoLink({
  variante = 'chama',
  tamanho = 'md',
  className,
  children,
  ...props
}: Comum & ComponentProps<'a'>) {
  return (
    <a className={cn(base, variantes[variante], tamanhos[tamanho], className)} {...props}>
      {children}
    </a>
  );
}

export function Botao({
  variante = 'chama',
  tamanho = 'md',
  className,
  children,
  ...props
}: Comum & ComponentProps<'button'>) {
  return (
    <button className={cn(base, variantes[variante], tamanhos[tamanho], className)} {...props}>
      {children}
    </button>
  );
}
