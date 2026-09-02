"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import {
  BookOpen,
  Flame,
  Home,
  Info,
  Instagram,
  Bike,
  MapPin,
  MessageCircle,
  Star,
  X,
} from "lucide-react";

import { restaurant, temInstagram } from "@/data/restaurant";
import { linkConversa } from "@/lib/whatsapp";

type Item = {
  nome: string;
  href: string;
  icone: typeof Home;
  externo?: boolean;
};

export function MenuLateral({
  aberto,
  aoFechar,
}: {
  aberto: boolean;
  aoFechar: () => void;
}) {
  useEffect(() => {
    if (!aberto) return;
    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") aoFechar();
    };
    document.addEventListener("keydown", aoTeclar);
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", aoTeclar);
      document.body.style.overflow = anterior;
    };
  }, [aberto, aoFechar]);

  const conversa = linkConversa();

  const itens: Item[] = [
    { nome: "Início", href: "/", icone: Home },
    { nome: "Cardápio", href: "/cardapio", icone: BookOpen },
    { nome: "Mais pedidos", href: "/#mais-pedidos", icone: Flame },
    { nome: "Delivery", href: "/#delivery", icone: Bike },
    { nome: "Avaliações", href: "/#avaliacoes", icone: Star },
    { nome: "Informações", href: "/#informacoes", icone: Info },
    { nome: "Onde estamos", href: "/#onde-estamos", icone: MapPin },
  ];

  // So entra na lista o que existe de verdade: sem perfil cadastrado, sem link.
  if (temInstagram) {
    itens.push({
      nome: "Instagram",
      href: `https://instagram.com/${restaurant.instagram}`,
      icone: Instagram,
      externo: true,
    });
  }
  if (conversa) {
    itens.push({
      nome: "WhatsApp",
      href: conversa,
      icone: MessageCircle,
      externo: true,
    });
  }

  return (
    <AnimatePresence>
      {aberto && (
        <div className="fixed inset-0 z-50">
          <motion.button
            type="button"
            aria-label="Fechar o menu tocando fora"
            tabIndex={-1}
            onClick={aoFechar}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 h-full w-full cursor-default bg-tinta/50"
          />
          <motion.nav
            aria-label="Menu principal"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="absolute right-0 top-0 flex h-full w-[82%] max-w-xs flex-col bg-white shadow-flutuante"
          >
            <div className="flex items-center justify-between border-b border-borda px-5 py-4">
              <span className="fonte-titulo text-lg font-bold text-tinta">
                Menu
              </span>
              <button
                type="button"
                onClick={aoFechar}
                aria-label="Fechar menu"
                className="flex h-11 w-11 items-center justify-center rounded-full text-tinta-media hover:bg-nevoa"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <ul className="flex-1 overflow-y-auto p-3">
              {itens.map((item) => {
                const Icone = item.icone;
                const classes =
                  "flex min-h-[52px] items-center gap-3 rounded-carta px-3 text-[15px] font-semibold text-tinta transition-colors hover:bg-creme hover:text-laranja-queimado";
                return (
                  <li key={item.nome}>
                    {item.externo ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={aoFechar}
                        className={classes}
                      >
                        <Icone
                          className="h-5 w-5 text-laranja"
                          aria-hidden="true"
                        />
                        {item.nome}
                      </a>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={aoFechar}
                        className={classes}
                      >
                        <Icone
                          className="h-5 w-5 text-laranja"
                          aria-hidden="true"
                        />
                        {item.nome}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>

            <p className="border-t border-borda px-5 py-4 text-[13px] text-tinta-suave">
              {restaurant.name}
            </p>
          </motion.nav>
        </div>
      )}
    </AnimatePresence>
  );
}
