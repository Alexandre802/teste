"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  LogOut,
  MoreHorizontal,
  Plus,
  Receipt,
  ShoppingBag,
  TrendingDown,
} from "lucide-react";

import { MENU } from "@/components/admin/navegacao";
import { Modal } from "@/components/ui/Modal";
import { IndicadorConexao } from "@/components/admin/IndicadorConexao";
import { criarClienteNavegador } from "@/lib/supabase/client";
import { restaurant } from "@/data/restaurant";

/**
 * Casca do painel: barra lateral no computador, barra inferior no celular.
 * O botão central + abre o atalho de nova receita e nova despesa.
 */
export function CascaAdmin({
  nome,
  papel,
  children,
}: {
  nome: string;
  papel: string;
  children: React.ReactNode;
}) {
  const caminho = usePathname();
  const router = useRouter();
  const [maisAberto, setMaisAberto] = useState(false);
  const [atalhoAberto, setAtalhoAberto] = useState(false);
  const [saindo, setSaindo] = useState(false);

  const ativo = (href: string) =>
    href === "/admin" ? caminho === "/admin" : caminho.startsWith(href);

  const sair = async () => {
    if (saindo) return;
    setSaindo(true);
    const supabase = criarClienteNavegador();
    await supabase?.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  };

  const barraInferior = [
    { nome: "Resumo", href: "/admin", icone: LayoutDashboard },
    { nome: "Pedidos", href: "/admin/pedidos", icone: ShoppingBag },
    null, // lugar do botão +
    { nome: "Despesas", href: "/admin/despesas", icone: TrendingDown },
  ];

  return (
    <div className="min-h-dvh bg-nevoa lg:flex">
      {/* ---------------------------------------------------- computador */}
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-borda bg-white lg:flex">
        <div className="flex items-center gap-2.5 border-b border-borda px-5 py-4">
          <Image src={restaurant.logo} alt="" width={40} height={40} className="h-10 w-10" />
          <div className="min-w-0 leading-tight">
            <p className="fonte-titulo truncate text-[15px] font-extrabold text-laranja">
              Comida Caseira
            </p>
            <p className="truncate text-[11px] text-tinta-suave">Fluxo de caixa</p>
          </div>
        </div>

        <nav aria-label="Painel" className="flex-1 overflow-y-auto p-3">
          <ul className="space-y-0.5">
            {MENU.map((item) => {
              const Icone = item.icone;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={ativo(item.href) ? "page" : undefined}
                    className={`flex min-h-[46px] items-center gap-3 rounded-carta px-3 text-[15px] font-medium transition-colors ${
                      ativo(item.href)
                        ? "bg-creme font-semibold text-laranja-queimado"
                        : "text-tinta-media hover:bg-nevoa hover:text-tinta"
                    }`}
                  >
                    <Icone className="h-5 w-5 shrink-0" aria-hidden="true" />
                    {item.nome}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-borda p-3">
          <p className="px-3 pb-2 text-[12px] leading-tight text-tinta-suave">
            <span className="block truncate font-semibold text-tinta">{nome}</span>
            {papel}
          </p>
          <button
            type="button"
            onClick={sair}
            disabled={saindo}
            className="flex min-h-[46px] w-full items-center gap-3 rounded-carta px-3 text-[15px] font-medium text-tinta-media transition-colors hover:bg-vermelho/5 hover:text-vermelho disabled:opacity-60"
          >
            <LogOut className="h-5 w-5" aria-hidden="true" />
            {saindo ? "Saindo…" : "Sair"}
          </button>
        </div>
      </aside>

      {/* ------------------------------------------------------- conteúdo */}
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-borda bg-white/95 px-4 py-3 backdrop-blur lg:px-8">
          <div className="flex items-center gap-2.5 lg:hidden">
            <Image src={restaurant.logo} alt="" width={36} height={36} className="h-9 w-9" />
            <span className="fonte-titulo text-[15px] font-extrabold text-laranja">
              Comida Caseira
            </span>
          </div>
          <span className="hidden text-sm font-semibold text-tinta-media lg:block">
            Olá, {nome.split(" ")[0]}
          </span>
          <IndicadorConexao />
        </header>

        <main id="conteudo" className="px-4 pb-28 pt-5 lg:px-8 lg:pb-10">
          {children}
        </main>
      </div>

      {/* --------------------------------------------------------- celular */}
      <nav
        aria-label="Painel"
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-borda bg-white pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        {barraInferior.map((item, indice) =>
          item ? (
            <Link
              key={item.href}
              href={item.href}
              aria-current={ativo(item.href) ? "page" : undefined}
              className={`flex min-h-[60px] flex-col items-center justify-center gap-1 text-[11px] font-semibold ${
                ativo(item.href) ? "text-laranja" : "text-tinta-suave"
              }`}
            >
              <item.icone className="h-5 w-5" aria-hidden="true" />
              {item.nome}
            </Link>
          ) : (
            <div key={`espaco-${indice}`} className="flex items-center justify-center">
              <button
                type="button"
                onClick={() => setAtalhoAberto(true)}
                aria-label="Novo lançamento"
                className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-laranja text-white shadow-carta"
              >
                <Plus className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
          ),
        )}
        <button
          type="button"
          onClick={() => setMaisAberto(true)}
          className="flex min-h-[60px] flex-col items-center justify-center gap-1 text-[11px] font-semibold text-tinta-suave"
        >
          <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
          Mais
        </button>
      </nav>

      <Modal
        aberto={atalhoAberto}
        aoFechar={() => setAtalhoAberto(false)}
        titulo="Novo lançamento"
      >
        <ul className="space-y-2 p-4">
          <li>
            <Link
              href="/admin/receitas?nova=1"
              onClick={() => setAtalhoAberto(false)}
              className="flex min-h-[56px] items-center gap-3 rounded-carta border border-borda px-4 text-[15px] font-semibold text-tinta"
            >
              <Receipt className="h-5 w-5 text-verde-positivo" aria-hidden="true" />
              Nova receita
            </Link>
          </li>
          <li>
            <Link
              href="/admin/despesas?nova=1"
              onClick={() => setAtalhoAberto(false)}
              className="flex min-h-[56px] items-center gap-3 rounded-carta border border-borda px-4 text-[15px] font-semibold text-tinta"
            >
              <TrendingDown className="h-5 w-5 text-vermelho" aria-hidden="true" />
              Nova despesa
            </Link>
          </li>
        </ul>
      </Modal>

      <Modal
        aberto={maisAberto}
        aoFechar={() => setMaisAberto(false)}
        titulo="Menu"
      >
        <ul className="p-3">
          {MENU.map((item) => {
            const Icone = item.icone;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMaisAberto(false)}
                  className="flex min-h-[52px] items-center gap-3 rounded-carta px-3 text-[15px] font-medium text-tinta"
                >
                  <Icone className="h-5 w-5 text-laranja" aria-hidden="true" />
                  {item.nome}
                </Link>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              onClick={() => {
                setMaisAberto(false);
                void sair();
              }}
              className="flex min-h-[52px] w-full items-center gap-3 rounded-carta px-3 text-[15px] font-medium text-vermelho"
            >
              <LogOut className="h-5 w-5" aria-hidden="true" />
              Sair
            </button>
          </li>
        </ul>
      </Modal>
    </div>
  );
}
