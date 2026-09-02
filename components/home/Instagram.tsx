import Image from "next/image";
import { Instagram as IconeInstagram } from "lucide-react";

import { restaurant, temInstagram } from "@/data/restaurant";
import { produtosDisponiveis } from "@/data/menu";

/**
 * Feed do Instagram montado com as fotografias que a propria casa enviou.
 * Sem perfil cadastrado em NEXT_PUBLIC_INSTAGRAM a secao inteira nao aparece:
 * link que nao leva a lugar nenhum nao entra na tela.
 */
export function FeedInstagram() {
  if (!temInstagram) return null;

  const fotos = produtosDisponiveis()
    .filter((produto) => produto.image)
    .slice(0, 6);

  if (fotos.length === 0) return null;

  const perfil = `https://instagram.com/${restaurant.instagram}`;

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-laranja">
            @{restaurant.instagram}
          </p>
          <h2 className="fonte-titulo mt-1 text-2xl font-extrabold text-tinta sm:text-3xl">
            Siga no Instagram
          </h2>
        </div>
        <a
          href={perfil}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-carta bg-creme px-4 text-sm font-semibold text-laranja-queimado hover:bg-creme-forte"
        >
          <IconeInstagram className="h-4 w-4" aria-hidden="true" />
          Seguir
        </a>
      </div>

      <ul className="mt-6 grid grid-cols-3 gap-2 sm:gap-3">
        {fotos.map((produto) => (
          <li key={produto.id}>
            <a
              href={perfil}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Ver ${produto.name} no Instagram da casa`}
              className="group relative block aspect-square overflow-hidden rounded-carta"
            >
              <Image
                src={produto.image as string}
                alt={produto.name}
                fill
                sizes="(max-width: 640px) 33vw, 200px"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
