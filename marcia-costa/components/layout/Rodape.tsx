import Link from "next/link";
import Image from "next/image";
import { Instagram, MessageCircle } from "lucide-react";

import { restaurant, temInstagram } from "@/data/restaurant";
import { cidadesAtendidas } from "@/data/deliveryZones";
import { linkConversa } from "@/lib/whatsapp";

export function Rodape() {
  const conversa = linkConversa();
  const ano = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-borda bg-nevoa">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              <Image
                src={restaurant.logo}
                alt=""
                width={48}
                height={48}
                className="h-11 w-11"
              />
              <span className="fonte-titulo text-lg font-extrabold text-laranja">
                {restaurant.name}
              </span>
            </div>
            <p className="mt-3 text-sm text-tinta-media">
              {restaurant.description}
            </p>
            <p className="mt-2 text-sm text-tinta-media">
              Entregamos em {cidadesAtendidas.join(" e ")}.
            </p>
          </div>

          <nav aria-label="Rodapé">
            <h2 className="fonte-titulo text-sm font-bold uppercase tracking-wide text-tinta">
              Navegar
            </h2>
            <ul className="mt-3 space-y-1">
              {[
                { nome: "Cardápio", href: "/cardapio" },
                { nome: "Sobre", href: "/#diferenciais" },
                { nome: "Contato", href: "/#informacoes" },
              ].map((item) => (
                <li key={item.nome}>
                  <Link
                    href={item.href}
                    className="inline-flex min-h-[44px] items-center text-sm text-tinta-media hover:text-laranja"
                  >
                    {item.nome}
                  </Link>
                </li>
              ))}
              {temInstagram && (
                <li>
                  <a
                    href={`https://instagram.com/${restaurant.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[44px] items-center gap-2 text-sm text-tinta-media hover:text-laranja"
                  >
                    <Instagram className="h-4 w-4" aria-hidden="true" />
                    Instagram
                  </a>
                </li>
              )}
              {conversa && (
                <li>
                  <a
                    href={conversa}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[44px] items-center gap-2 text-sm text-tinta-media hover:text-whatsapp-escuro"
                  >
                    <MessageCircle className="h-4 w-4" aria-hidden="true" />
                    WhatsApp
                  </a>
                </li>
              )}
            </ul>
          </nav>
        </div>

        <p className="mt-10 border-t border-borda pt-6 text-[13px] text-tinta-suave">
          © {ano} {restaurant.name}. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
