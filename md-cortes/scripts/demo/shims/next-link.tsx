'use client';

import type { AnchorHTMLAttributes, ReactNode } from 'react';

interface Props extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  href: string;
  children: ReactNode;
  prefetch?: boolean;
  replace?: boolean;
  scroll?: boolean;
}

/** O mesmo <Link> do Next, mas apontando para a rota no fim do endereço. */
export default function Link({ href, children, prefetch, replace, scroll, ...resto }: Props) {
  void prefetch;
  void replace;
  void scroll;
  return (
    <a href={`#${href}`} {...resto}>
      {children}
    </a>
  );
}
