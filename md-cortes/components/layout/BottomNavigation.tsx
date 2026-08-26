'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Icone, type NomeDoIcone } from '@/components/ui/Icone';

interface Item {
  href: string;
  rotulo: string;
  icone: NomeDoIcone;
}

const BASE: Item[] = [
  { href: '/inicio', rotulo: 'Início', icone: 'casa' },
  { href: '/lancamentos', rotulo: 'Lançamentos', icone: 'lista' },
  { href: '/perfil', rotulo: 'Perfil', icone: 'pessoa' },
];

const ADMIN: Item[] = [
  { href: '/inicio', rotulo: 'Início', icone: 'casa' },
  { href: '/equipe', rotulo: 'Equipe', icone: 'equipe' },
  { href: '/lancamentos', rotulo: 'Lançamentos', icone: 'lista' },
  { href: '/perfil', rotulo: 'Perfil', icone: 'pessoa' },
];

/**
 * A barra de baixo — o que faz o MD_cortes parecer aplicativo e não página.
 *
 * Fica fixa, respeita a faixa de gestos do iPhone e destaca a aba atual com um
 * fundo dourado que desliza entre os itens em vez de piscar.
 */
export function BottomNavigation({ admin = false }: { admin?: boolean }) {
  const caminho = usePathname();
  const itens = admin ? ADMIN : BASE;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-grafite/80 bg-noite-alta/92 backdrop-blur-xl"
      style={{ paddingBottom: 'var(--seguro-baixo)' }}
      aria-label="Navegação principal"
    >
      <ul className="mx-auto flex max-w-2xl items-stretch lg:max-w-5xl">
        {itens.map((item) => {
          // Com trailingSlash ligado o caminho chega como "/inicio/".
          const ativo = caminho.replace(/\/+$/, '') === item.href;
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={ativo ? 'page' : undefined}
                className="relative flex h-[4.25rem] flex-col items-center justify-center gap-1"
              >
                {ativo ? (
                  <motion.span
                    layoutId="aba-ativa"
                    className="absolute inset-x-2 inset-y-2 rounded-2xl bg-ouro/10"
                    transition={{ type: 'spring', stiffness: 480, damping: 40 }}
                  />
                ) : null}
                <span className={`relative ${ativo ? 'text-ouro' : 'text-fumaca-fraca'}`}>
                  <Icone nome={item.icone} tamanho={21} preenchido={false} />
                </span>
                <span
                  className={`relative text-[0.68rem] font-medium ${
                    ativo ? 'text-ouro' : 'text-fumaca-fraca'
                  }`}
                >
                  {item.rotulo}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
