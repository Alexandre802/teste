'use client';

import { featuredProducts, formatPrice } from '@/lib/catalog';
import { useShop } from '@/lib/store';
import { ProductImage } from '../ui/ProductImage';
import { Reveal } from '../ui/Reveal';
import { SplitHeading } from '../ui/Motion';
import { ArrowRight } from '../ui/Icons';

/**
 * Destaques do cardápio.
 *
 * Duas coisas mudaram quando as fotografias reais chegaram:
 *
 *  1. A peça grande deixou de ser "texto por cima da foto". As fotos têm o
 *     lanche centralizado sobre a tábua, e qualquer sobreposição cobria
 *     justamente o produto. Agora é lado a lado: foto de um lado, texto do
 *     outro. Também resolve o corte — encaixar 600×400 num bloco alto exigia
 *     cortar o topo do pão ou a base.
 *
 *  2. Saiu o selo "Mais pedido" e a frase sobre "os pedidos que mais saem".
 *     A casa não passou número de venda nenhum, e afirmar isso era inventar
 *     dado — o cliente confere no balcão.
 */
export default function Featured() {
  const add = useShop((s) => s.add);
  const [principal, ...demais] = featuredProducts;

  if (!principal) return null;

  return (
    <section aria-labelledby="favoritos-titulo" className="py-20 sm:py-24">
      <div className="mx-auto w-full max-w-[86rem] px-5 sm:px-8">
        <Reveal>
          <p className="text-xs font-extrabold uppercase tracking-[0.35em] text-white/75">
            Destaques
          </p>
          <SplitHeading
            id="favoritos-titulo"
            text="Conheça nossos lanches"
            className="mt-3 text-[clamp(2rem,5.5vw,3.5rem)] font-extrabold leading-none tracking-tight text-white"
          />
          <p className="mt-4 max-w-xl text-muted">
            Fotografias dos lanches da casa, do jeito que saem da chapa. É isso que chega até você.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-5 lg:grid-cols-[1.35fr_1fr]">
          {/* ── peça grande: foto e texto lado a lado ── */}
          <Reveal className="h-full">
            <article className="glass group flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] sm:flex-row sm:items-center lg:flex-col lg:items-stretch">
              {/* A foto mantém a proporção nativa 3/2 e a altura do bloco a
                  acompanha — nunca o contrário. Esticar 600×400 para preencher
                  uma coluna alta cortava as laterais do lanche e borrava a
                  imagem, que é o oposto do que estas fotos existem para fazer. */}
              <div className="relative aspect-[3/2] w-full shrink-0 overflow-hidden sm:w-1/2 lg:w-full">
                <ProductImage
                  product={principal}
                  sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 26vw"
                  priority
                  className="transition-transform duration-500 ease-out group-hover:scale-[1.035]"
                />
              </div>

              {/* O texto é que estica para o bloco acompanhar a altura da
                  coluna vizinha. A foto nunca estica: ela mantém 3/2 e o
                  espaço que sobra vira respiro do texto. */}
              <div className="flex flex-1 flex-col justify-center gap-4 p-7 sm:p-8">
                <h3 className="text-[clamp(1.6rem,3.5vw,2.4rem)] font-extrabold leading-none text-white">
                  {principal.name}
                </h3>
                {principal.description && (
                  <p className="text-sm leading-relaxed text-white/85">{principal.description}</p>
                )}
                <div className="mt-1 flex flex-wrap items-center gap-4">
                  <span className="text-3xl font-extrabold text-white tabular-nums">
                    {formatPrice(principal.price)}
                  </span>
                  <button
                    type="button"
                    onClick={() => add(principal.id, 1)}
                    className="inline-flex items-center gap-2 rounded-full bg-cream px-6 py-3 text-sm font-extrabold text-cocoa transition-transform hover:-translate-y-0.5"
                  >
                    Adicionar <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </article>
          </Reveal>

          {/* ── os demais ── */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {demais.slice(0, 4).map((product, i) => (
              <Reveal key={product.id} delay={0.06 * i} className="h-full">
                <article className="glass group flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] transition-transform duration-300 hover:-translate-y-1">
                  <div className="relative aspect-[3/2] w-full shrink-0 overflow-hidden">
                    <ProductImage
                      product={product}
                      sizes="(max-width: 640px) 92vw, (max-width: 1280px) 40vw, 20vw"
                      className="transition-transform duration-500 ease-out group-hover:scale-[1.035]"
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-1 p-4">
                    <h3 className="font-extrabold leading-tight text-white">{product.name}</h3>
                    <p className="text-xl font-extrabold text-white tabular-nums">
                      {formatPrice(product.price)}
                    </p>
                    <button
                      type="button"
                      onClick={() => add(product.id, 1)}
                      className="mt-auto self-start pt-1.5 text-xs font-bold text-white/75 underline underline-offset-2 hover:text-white"
                    >
                      adicionar
                    </button>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
