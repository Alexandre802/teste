'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { categories, groupsByCategory, type CategoryId, type Product } from '@/lib/catalog';
import { useShop } from '@/lib/store';
import CategoryTabs from './CategoryTabs';
import ProductCard from './ProductCard';
import ProductModal from './ProductModal';
import { Reveal } from '../ui/Reveal';
import { SplitHeading } from '../ui/Motion';

/**
 * Seção de pedidos.
 *
 * A categoria escolhida vem quebrada em subgrupos nomeados — "X Frango",
 * "X Frangão", "Hot Dog" — em vez de uma grade única. Lista longa dividida em
 * blocos curtos é o que torna 34 lanches navegáveis.
 */
export default function MenuSection() {
  const [active, setActive] = useState<CategoryId>('tradicionais');
  const [modal, setModal] = useState<{ product: Product | null; open: boolean }>({
    product: null,
    open: false,
  });
  const add = useShop((s) => s.add);

  const groups = useMemo(() => groupsByCategory(active), [active]);
  const blurb = categories.find((c) => c.id === active)?.blurb;

  return (
    <section id="cardapio" className="scroll-mt-24 py-16 sm:py-24">
      <div className="mx-auto w-full max-w-[86rem] px-5 sm:px-8">
        <Reveal className="text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.35em] text-white/75">
            Produtos
          </p>
          <SplitHeading text="Nossos Lanches" className="mt-3 text-[clamp(2rem,5.5vw,3.6rem)] font-extrabold leading-none tracking-tight text-white" />
          <p className="mx-auto mt-3 max-w-lg text-white/90">
            Escolha seu favorito e peça do seu jeito.
          </p>
        </Reveal>

        <div className="sticky top-[4.75rem] z-30 mx-auto mt-8 w-fit max-w-full rounded-full border border-white/30 bg-ember-deep/85 px-2 py-2 shadow-[0_12px_30px_-12px_rgba(90,32,5,0.8)] backdrop-blur-xl">
          <CategoryTabs active={active} onChange={setActive} />
        </div>

        {blurb && (
          <p className="mt-4 text-center text-sm text-muted" aria-live="polite">
            {blurb}
          </p>
        )}

        <div className="mt-8 flex flex-col gap-10">
          <AnimatePresence mode="wait" initial={false}>
            {groups.map((group) => (
              <div key={`${active}-${group.name}`}>
                <div className="mb-4 flex items-center gap-3">
                  <h3 className="text-lg font-extrabold text-white sm:text-xl">{group.name}</h3>
                  <span className="h-px flex-1 bg-white/30" aria-hidden="true" />
                  <span className="text-xs font-bold text-white/70">
                    {group.items.length} {group.items.length === 1 ? 'opção' : 'opções'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {group.items.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onOpen={(p) => setModal({ product: p, open: true })}
                      onAdd={(p) => add(p.id, 1)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <ProductModal
        product={modal.product}
        open={modal.open}
        onClose={() => setModal((m) => ({ ...m, open: false }))}
      />
    </section>
  );
}
