'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { categories, productsByCategory, type CategoryId, type Product } from '@/lib/catalog';
import { useShop } from '@/lib/store';
import CategoryTabs from './CategoryTabs';
import ProductCard from './ProductCard';
import ProductModal from './ProductModal';
import { Reveal } from '../ui/Reveal';

export default function MenuSection() {
  const [active, setActive] = useState<CategoryId>('tradicionais');
  // `product` permanece após fechar, para o modal animar a saída com conteúdo
  const [modal, setModal] = useState<{ product: Product | null; open: boolean }>({
    product: null,
    open: false,
  });
  const add = useShop((s) => s.add);

  const list = useMemo(() => productsByCategory(active), [active]);
  const blurb = categories.find((c) => c.id === active)?.blurb;

  return (
    <section id="cardapio" className="scroll-mt-24 py-20 sm:py-28">
      <div className="mx-auto w-full max-w-[86rem] px-5 sm:px-8">
        <Reveal className="text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.35em] text-flame-soft">Produtos</p>
          <h2 className="mt-3 text-[clamp(2.2rem,6vw,4rem)] font-extrabold leading-none tracking-tight text-cream">
            Nossos Lanches
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base text-muted sm:text-lg">
            Escolha seu favorito e peça do seu jeito.
          </p>
        </Reveal>

        <div className="mt-10">
          <CategoryTabs active={active} onChange={setActive} />
        </div>

        {blurb && (
          <p className="mt-5 text-center text-sm text-muted" aria-live="polite">
            {blurb}
          </p>
        )}

        <div className="mt-9 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {list.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpen={(p) => setModal({ product: p, open: true })}
                onAdd={(p) => add(p.id, 1)}
              />
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
