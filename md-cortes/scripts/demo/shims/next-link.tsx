'use client';

import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from 'react';
import { irPara } from './next-navigation';

interface Props extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  href: string;
  children: ReactNode;
  prefetch?: boolean;
  replace?: boolean;
  scroll?: boolean;
}

/**
 * O mesmo <Link> do Next, mas trocando a rota em memória.
 *
 * O preventDefault é o que importa: sem ele o navegador tentaria navegar de
 * verdade, e dentro do quadro da prévia — que tem uma <base> própria — isso
 * levaria para fora da página em vez de trocar de tela.
 */
export default function Link({ href, children, prefetch, replace, scroll, onClick, ...resto }: Props) {
  void prefetch;
  void replace;
  void scroll;

  const aoClicar = (evento: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(evento);
    if (evento.defaultPrevented) return;
    evento.preventDefault();
    irPara(href);
  };

  return (
    <a href={href} onClick={aoClicar} {...resto}>
      {children}
    </a>
  );
}
