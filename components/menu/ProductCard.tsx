'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { formatPrice, type Product } from '@/lib/catalog';
import { ProductImage } from '../ui/ProductImage';

export default function ProductCard({
  product,
  onOpen,
  onAdd,
}: {
  product: Product;
  onOpen: (product: Product) => void;
  onAdd: (product: Product) => void;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.article
      layout
      initial={reduce ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? undefined : { opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="group glass flex flex-col overflow-hidden rounded-[var(--radius-card)] transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1.5 hover:border-flame/45 hover:shadow-[0_28px_60px_-24px_rgba(0,0,0,0.95),0_0_44px_-14px_rgba(255,106,0,0.6)]"
    >
      <button
        type="button"
        onClick={() => onOpen(product)}
        aria-label={`Ver detalhes de ${product.name}`}
        className="relative aspect-[4/3] w-full shrink-0 overflow-hidden"
      >
        <ProductImage
          product={product}
          sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 23vw"
          className="transition-transform duration-500 group-hover:scale-105"
        />
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-ink to-transparent" />
        {!product.available && (
          <span className="absolute inset-0 grid place-items-center bg-ink/75 text-sm font-extrabold uppercase tracking-[0.18em] text-gold">
            Esgotado
          </span>
        )}
      </button>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="text-lg font-extrabold leading-tight text-cream">{product.name}</h3>

        <p className="text-2xl font-extrabold leading-none">
          <span className="mr-1 align-super text-xs font-bold text-flame-soft">R$</span>
          <span className="text-gold">{formatPrice(product.price).replace('R$', '').trim()}</span>
        </p>

        {product.description && (
          <p className="line-clamp-3 text-sm leading-relaxed text-muted">{product.description}</p>
        )}

        <button
          type="button"
          onClick={() => onAdd(product)}
          disabled={!product.available}
          className="mt-auto w-full rounded-full bg-flame/15 px-5 py-3 text-sm font-extrabold text-gold ring-1 ring-inset ring-flame/35 transition-all duration-200 hover:bg-flame hover:text-ink disabled:cursor-not-allowed disabled:bg-ink-3 disabled:text-muted/60 disabled:ring-flame/10"
        >
          {product.available ? 'Adicionar' : 'Indisponível'}
        </button>
      </div>
    </motion.article>
  );
}
