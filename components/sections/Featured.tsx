'use client';

import { featuredProducts, formatPrice } from '@/lib/catalog';
import { useShop } from '@/lib/store';
import { ProductImage } from '../ui/ProductImage';
import { Reveal } from '../ui/Reveal';
import { ArrowRight } from '../ui/Icons';

export default function Featured() {
  const add = useShop((s) => s.add);
  const [hero, ...rest] = featuredProducts;

  if (!hero) return null;

  return (
    <section aria-labelledby="favoritos-titulo" className="py-20 sm:py-24">
      <div className="mx-auto w-full max-w-[86rem] px-5 sm:px-8">
        <Reveal>
          <p className="text-xs font-extrabold uppercase tracking-[0.35em] text-flame-soft">
            Destaques
          </p>
          <h2 id="favoritos-titulo" className="mt-3 text-[clamp(2rem,5.5vw,3.5rem)] font-extrabold leading-none tracking-tight text-cream">
            Os favoritos da casa
          </h2>
          <p className="mt-4 max-w-xl text-muted">
            Os pedidos que mais saem e os que mais aparecem nas avaliações — o{' '}
            <strong className="font-bold text-cream">Bacon Cheddar</strong> é citado nominalmente
            por quem avalia a casa no Google.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-5 lg:grid-cols-[1.35fr_1fr]">
          {/* peça grande */}
          <Reveal className="h-full">
            <article className="glass group relative h-full min-h-[24rem] overflow-hidden rounded-[var(--radius-card)]">
              <div className="absolute inset-0">
                <ProductImage
                  product={hero}
                  sizes="(max-width: 1024px) 92vw, 52vw"
                  className="transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/65 to-transparent" />

              <div className="relative flex h-full flex-col justify-end p-7 sm:p-9">
                <span className="w-fit rounded-full bg-gold px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-ink">
                  Mais pedido
                </span>
                <h3 className="mt-4 text-[clamp(1.8rem,4.5vw,3rem)] font-extrabold leading-none text-cream">
                  {hero.name}
                </h3>
                {hero.description && (
                  <p className="mt-3 max-w-lg text-sm leading-relaxed text-cream/80">
                    {hero.description}
                  </p>
                )}
                <div className="mt-5 flex flex-wrap items-center gap-4">
                  <span className="text-3xl font-extrabold text-gold">{formatPrice(hero.price)}</span>
                  <button
                    type="button"
                    onClick={() => add(hero.id, 1)}
                    className="inline-flex items-center gap-2 rounded-full bg-cream px-6 py-3 text-sm font-extrabold text-ink transition-transform hover:-translate-y-0.5"
                  >
                    Adicionar <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </article>
          </Reveal>

          {/* grade dos demais */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {rest.slice(0, 4).map((product, i) => (
              <Reveal key={product.id} delay={0.06 * i} className="h-full">
                <article className="glass group flex h-full items-center gap-4 overflow-hidden rounded-[var(--radius-card)] p-4 transition-transform duration-300 hover:-translate-y-1">
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl">
                    <ProductImage
                      product={product}
                      sizes="96px"
                      className="transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-extrabold leading-tight text-cream">{product.name}</h3>
                    <p className="mt-1 text-xl font-extrabold text-gold">
                      {formatPrice(product.price)}
                    </p>
                    <button
                      type="button"
                      onClick={() => add(product.id, 1)}
                      className="mt-1.5 text-xs font-bold text-flame-soft underline underline-offset-2 hover:text-gold"
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
