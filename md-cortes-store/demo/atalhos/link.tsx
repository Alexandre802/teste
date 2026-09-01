"use client";

/** Substitui `next/link`: mesma API, destino em hash. */
import type { AnchorHTMLAttributes, ReactNode } from "react";

interface Props extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: string;
  children: ReactNode;
  prefetch?: boolean;
  replace?: boolean;
  scroll?: boolean;
}

export default function Link({ href, children, prefetch: _p, replace: _r, scroll: _s, ...resto }: Props) {
  return (
    <a href={`#${href.startsWith("/") ? href : `/${href}`}`} {...resto}>
      {children}
    </a>
  );
}
