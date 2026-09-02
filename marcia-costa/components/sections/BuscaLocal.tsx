import Link from "next/link";

import { gruposDePalavras } from "@/data/palavras-chave";

/**
 * Os termos de busca do site, em conteúdo VISÍVEL.
 *
 * É de propósito que esta seção apareça na tela. Esconder palavra-chave em
 * div invisível, texto branco no branco ou `sr-only` é cloaking: o buscador
 * enxerga uma página e o cliente enxerga outra. Isso não melhora posição e
 * pode custar o domínio inteiro.
 *
 * Cada grupo abre com uma frase de verdade sobre o que a casa faz — é ela que
 * dá contexto ao buscador — e os termos vêm como uma lista legível logo
 * abaixo, do jeito que alguém realmente leria.
 */
export function BuscaLocal() {
  return (
    <section
      id="o-que-entregamos"
      className="border-t border-borda bg-nevoa py-10 sm:py-14"
    >
      <div className="mx-auto max-w-6xl px-4">
        <p className="text-[11px] font-bold uppercase tracking-wide text-laranja">
          O que entregamos, e onde
        </p>
        <h2 className="fonte-titulo mt-1 text-2xl font-extrabold text-tinta sm:text-3xl">
          Marmitex de comida caseira no Vale do Paraíba
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-tinta-media">
          Se você procura marmitex feito na hora, com bife, frango ou omelete,
          arroz, feijão e acompanhamentos, para entrega em Jacareí e São José
          dos Campos, é isso que a Comida Caseira da Márcia Costa prepara todos
          os dias.
        </p>

        <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {gruposDePalavras.map((grupo) => (
            <div key={grupo.id}>
              <h3 className="fonte-titulo text-[15px] font-bold text-tinta">
                {grupo.titulo}
              </h3>
              <p className="mt-1 text-[13px] leading-relaxed text-tinta-media">
                {grupo.chamada}
              </p>
              <ul className="mt-2.5 flex flex-wrap gap-1.5">
                {grupo.termos.map((termo) => (
                  <li
                    key={termo}
                    className="rounded-full border border-borda bg-white px-2.5 py-1 text-[12px] text-tinta-media"
                  >
                    {termo}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-8 text-sm text-tinta-media">
          Achou o que procurava?{" "}
          <Link
            href="/cardapio"
            className="font-semibold text-laranja underline underline-offset-2"
          >
            Abra o cardápio e monte seu pedido
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
