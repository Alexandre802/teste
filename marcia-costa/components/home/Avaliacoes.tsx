"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { ExternalLink, Star } from "lucide-react";

import { avaliacoes, mediaDasNotas, temAvaliacoes } from "@/data/avaliacoes";
import { restaurant, temLinkDeAvaliacao } from "@/data/restaurant";

/**
 * Avaliações da casa, animadas com Remotion.
 *
 * A peça só toca quando a seção aparece na tela, e não toca de jeito nenhum
 * para quem pediu menos animação no sistema.
 */
const AvaliacoesPlayer = dynamic(
  () => import("@/components/home/AvaliacoesPlayer"),
  {
    ssr: false,
    loading: () => (
      <div className="aspect-square w-full animate-pulse bg-creme" />
    ),
  },
);

export function Avaliacoes() {
  const caixa = useRef<HTMLDivElement>(null);
  const [visivel, setVisivel] = useState(false);
  const [menosAnimacao, setMenosAnimacao] = useState(false);

  useEffect(() => {
    const consulta = window.matchMedia("(prefers-reduced-motion: reduce)");
    const aplicar = () => setMenosAnimacao(consulta.matches);
    aplicar();
    consulta.addEventListener("change", aplicar);
    return () => consulta.removeEventListener("change", aplicar);
  }, []);

  useEffect(() => {
    const alvo = caixa.current;
    if (!alvo) return;
    const observador = new IntersectionObserver(
      ([entrada]) => setVisivel(entrada.isIntersecting),
      { threshold: 0.35 },
    );
    observador.observe(alvo);
    return () => observador.disconnect();
  }, []);

  const media = mediaDasNotas();

  return (
    <section id="avaliacoes" className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-laranja">
            Quem já pediu
          </p>
          <h2 className="fonte-titulo mt-1 text-2xl font-extrabold text-tinta sm:text-3xl">
            Avaliações
          </h2>
          {media !== null && (
            <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-tinta-media">
              <Star
                className="h-4 w-4 fill-laranja text-laranja"
                aria-hidden="true"
              />
              {media.toFixed(1).replace(".", ",")} de 5 em {avaliacoes.length}{" "}
              {avaliacoes.length === 1 ? "avaliação" : "avaliações"}
            </p>
          )}
        </div>

        {temLinkDeAvaliacao && (
          <a
            href={restaurant.googleAvaliacoes}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[48px] items-center gap-2 rounded-carta bg-creme px-5 text-[15px] font-semibold text-laranja-queimado hover:bg-creme-forte"
          >
            Avaliar no Google
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        )}
      </div>

      <div
        ref={caixa}
        className="mt-6 overflow-hidden rounded-gigante border border-borda bg-creme shadow-carta sm:mx-auto sm:max-w-xl"
      >
        <AvaliacoesPlayer tocando={visivel && !menosAnimacao} />
      </div>

      {/* Lista em texto: a animação é enfeite, o conteúdo precisa estar no HTML
          para leitor de tela e para buscador. */}
      {temAvaliacoes ? (
        <ul className="sr-only">
          {avaliacoes.map((avaliacao) => (
            <li key={avaliacao.id}>
              {avaliacao.nome} deu nota {avaliacao.nota} de 5 no{" "}
              {avaliacao.origem}: “{avaliacao.texto}”
            </li>
          ))}
        </ul>
      ) : (
        <p className="mx-auto mt-4 max-w-xl text-center text-sm leading-relaxed text-tinta-media">
          Ainda não publicamos avaliações aqui. Nenhum depoimento é inventado
          neste site: assim que a casa receber os primeiros, eles aparecem nesta
          seção com o nome de quem escreveu.
        </p>
      )}
    </section>
  );
}
