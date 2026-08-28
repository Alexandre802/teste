"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DollarSign, House, MoreHorizontal, Package, Plus } from "lucide-react";

interface ItemNav {
  href: string;
  label: string;
  icon: typeof House;
  destaque?: boolean;
}

const ITENS: ItemNav[] = [
  { href: "/", label: "Início", icon: House },
  { href: "/estoque", label: "Estoque", icon: Package },
  { href: "/venda", label: "Venda", icon: Plus, destaque: true },
  { href: "/financeiro", label: "Financeiro", icon: DollarSign },
  { href: "/mais", label: "Mais", icon: MoreHorizontal },
];

function ativo(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Barra fixa de cinco itens, com a venda no centro. */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-borda bg-branco/97 shadow-barra backdrop-blur"
      style={{ paddingBottom: "var(--area-segura)" }}
    >
      <ul className="mx-auto flex h-[68px] max-w-2xl items-stretch">
        {ITENS.map((item) => {
          const selecionado = ativo(pathname, item.href);
          const Icone = item.icon;
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={selecionado ? "page" : undefined}
                className="flex h-full flex-col items-center justify-center gap-1"
              >
                {item.destaque ? (
                  <span className="flex size-9 items-center justify-center rounded-[11px] bg-ouro text-branco shadow-card">
                    <Icone size={20} strokeWidth={2.4} />
                  </span>
                ) : (
                  <Icone
                    size={22}
                    strokeWidth={selecionado ? 2.2 : 1.8}
                    className={selecionado ? "text-ouro" : "text-cinza-claro"}
                  />
                )}
                <span
                  className={`text-[11px] leading-none ${
                    selecionado || item.destaque ? "font-semibold text-ouro" : "text-cinza"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
