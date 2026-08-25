'use client';

import Link from 'next/link';
import { totalDeItens, useCarrinho } from '@/lib/cart';
import { useHydrated } from '@/lib/use-hydrated';
import { IconeCarrinho } from '@/components/ui/Icons';

/** Ícone de carrinho com o contador redondo no canto, como na referência. */
export default function CartButton({ className = '' }: { className?: string }) {
  const itens = useCarrinho((e) => e.itens);
  const hidratado = useHydrated();
  const total = hidratado ? totalDeItens(itens) : 0;

  return (
    <Link
      href="/carrinho"
      aria-label={`Carrinho, ${total} ${total === 1 ? 'item' : 'itens'}`}
      className={`relative grid h-11 w-11 place-items-center rounded-full text-white transition-colors hover:bg-white/10 ${className}`}
    >
      <IconeCarrinho className="h-[26px] w-[26px]" />
      <span
        aria-hidden="true"
        className="absolute -right-0.5 -top-0.5 grid h-[22px] min-w-[22px] place-items-center rounded-full bg-white px-1 text-[11px] font-bold text-brand-700"
      >
        {total > 99 ? '99+' : total}
      </span>
    </Link>
  );
}
