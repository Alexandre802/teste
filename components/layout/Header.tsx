'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { business } from '@/data/business';
import { IconeCaminhao, IconeLocal, IconeMenu } from '@/components/ui/Icons';
import CartButton from './CartButton';
import ContaButton from './ContaButton';
import MobileMenu from './MobileMenu';
import SearchBar from './SearchBar';

/**
 * Cabeçalho da referência, em três faixas:
 *   1. azul institucional (#034782) — hambúrguer, marca, selo PremieR, conta e carrinho
 *   2. a mesma faixa azul, com a busca ocupando quase toda a largura
 *   3. azul de ação (#04559D) — entrega à esquerda, cidade à direita
 *
 * Fica fixo no topo: em uma página longa como esta, busca e carrinho precisam
 * estar sempre a um toque de distância.
 */
export default function Header() {
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50">
        <div className="bg-brand-700">
          <div className="shell py-2.5 sm:py-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setMenuAberto(true)}
                aria-label="Abrir menu"
                aria-expanded={menuAberto}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-lg text-white transition-colors hover:bg-white/10"
              >
                <IconeMenu className="h-6 w-6" />
              </button>

              <Link href="/" className="flex min-w-0 items-center gap-2 sm:gap-3">
                <Image
                  src="/marca/cachorro-gato.webp"
                  alt=""
                  width={116}
                  height={88}
                  priority
                  className="h-11 w-11 rounded-lg object-cover sm:h-[3.5rem] sm:w-[4.25rem]"
                />
                <span className="min-w-0">
                  <span className="block truncate text-[10px] font-semibold leading-tight tracking-[0.18em] text-white/85 sm:text-[13px]">
                    {business.nomeLinha1}
                  </span>
                  <span className="block truncate text-[15px] font-extrabold leading-tight tracking-tight text-white sm:text-2xl lg:text-[1.75rem]">
                    {business.nomeLinha2}
                  </span>
                </span>
              </Link>

              {/* selo da marca parceira — fica só onde há largura para ele */}
              <span aria-hidden="true" className="mx-1 hidden h-11 w-px bg-white/25 lg:block" />
              <span className="hidden shrink-0 rounded-lg bg-brand-800 px-4 py-2 text-center leading-none lg:block">
                <span className="block text-[1.375rem] font-bold italic tracking-tight text-white">
                  PremieR
                </span>
                <span className="mt-1 block border-t border-white/35 pt-1 text-[10px] font-semibold tracking-[0.14em] text-white">
                  SUPER PREMIUM
                </span>
              </span>

              <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-1">
                <ContaButton />
                <CartButton />
              </div>
            </div>

            <div className="mt-2.5 sm:mt-3">
              <SearchBar />
            </div>
          </div>
        </div>

        <div className="bg-brand-500">
          <div className="shell flex items-center justify-between gap-3 py-2 text-white">
            <p className="flex min-w-0 items-center gap-2 text-[12px] font-semibold sm:text-sm">
              <IconeCaminhao className="h-5 w-5 shrink-0" />
              <span className="truncate">
                {business.entrega.chamada}
                <span className="hidden sm:inline"> • {business.entrega.prazo}</span>
              </span>
            </p>
            <p className="flex shrink-0 items-center gap-1.5 text-[12px] font-semibold sm:text-sm">
              <IconeLocal className="h-5 w-5" />
              {business.cidadeUf}
            </p>
          </div>
        </div>
      </header>

      <MobileMenu aberto={menuAberto} aoFechar={() => setMenuAberto(false)} />
    </>
  );
}
