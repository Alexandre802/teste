'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { formatPrice, type Product } from '@/lib/catalog';
import { ProductImage } from '../ui/ProductImage';

/**
 * Card compacto. A grade mostra 2 no celular e até 5 no desktop, então tudo
 * aqui é curto: foto baixa, nome em uma ou duas linhas, preço em destaque e
 * descrição limitada a duas linhas — o texto completo fica no modal.
 */
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
      initial={reduce ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? undefined : { opacity: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="glass group flex flex-col overflow-hidden rounded-[var(--radius-card)] transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_22px_44px_-18px_rgba(110,40,5,0.7)]"
    >
      <button
        type="button"
        onClick={() => onOpen(product)}
        aria-label={`Ver detalhes de ${product.name}`}
        className="relative aspect-[5/3] w-full shrink-0 overflow-hidden"
      >
        <ProductImage
          product={product}
          sizes="(max-width: 640px) 46vw, (max-width: 1024px) 30vw, 19vw"
          className="transition-transform duration-500 group-hover:scale-105"
        />
        {!product.available && (
          <span className="absolute inset-0 grid place-items-center bg-ember-deep/70 text-[11px] font-extrabold uppercase tracking-[0.16em] text-white">
            Esgotado
          </span>
        )}
      </button>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <h4 className="text-[0.9rem] font-extrabold leading-tight text-white">{product.name}</h4>

        <p className="text-lg font-extrabold leading-none text-white tabular-nums">
          {formatPrice(product.price)}
        </p>

        {product.description && (
          <p className="line-clamp-2 text-[0.75rem] leading-snug text-white/80">
            {product.description}
          </p>
        )}

        <button
          type="button"
          onClick={() => onAdd(product)}
          disabled={!product.available}
          className="mt-auto w-full rounded-full bg-white px-3 py-2 text-xs font-extrabold text-ember transition-colors duration-200 hover:bg-white/90 disabled:cursor-not-allowed disabled:bg-white/20 disabled:text-white/55"
        >
          {product.available ? 'Adicionar' : 'Indisponível'}
        </button>
      </div>
    </motion.article>
  );
}
