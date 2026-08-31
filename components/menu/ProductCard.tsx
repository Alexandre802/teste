'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { formatPrice, resumo, type Product } from '@/lib/catalog';
import { ProductImage } from '../ui/ProductImage';
import { useTilt } from '../ui/Motion';

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
  const { ref: tiltRef, onMove, onLeave, rotateX, rotateY } = useTilt(6);
  const [feito, setFeito] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const adicionar = () => {
    onAdd(product);
    setFeito(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setFeito(false), 1100);
  };

  return (
    <motion.article
      // `layout` e a inclinação seguindo o mouse ficam de fora quando o
      // sistema pede menos movimento: os dois animam o tempo todo, e é
      // exatamente esse tipo de movimento contínuo que incomoda quem tem
      // sensibilidade vestibular.
      layout={!reduce}
      initial={reduce ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? undefined : { opacity: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      ref={tiltRef}
      onMouseMove={reduce ? undefined : onMove}
      onMouseLeave={reduce ? undefined : onLeave}
      style={reduce ? undefined : { rotateX, rotateY, transformPerspective: 900 }}
      whileHover={reduce ? undefined : { y: -6 }}
      className="glass group flex flex-col overflow-hidden rounded-[var(--radius-card)] shadow-[0_10px_26px_-16px_rgba(110,40,5,0.6)] transition-shadow duration-300 hover:shadow-[0_26px_50px_-18px_rgba(110,40,5,0.8)]"
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
          <p className="text-[0.75rem] leading-snug text-white/80">
            {resumo(product.description)}
          </p>
        )}

        <button
          type="button"
          onClick={adicionar}
          disabled={!product.available}
          className={`mt-auto w-full rounded-full px-3 py-2 text-xs font-extrabold transition-colors duration-200 disabled:cursor-not-allowed disabled:bg-white/20 disabled:text-white/55 ${
            feito ? 'bg-ember-deep text-white' : 'bg-white text-ember hover:bg-white/90'
          }`}
        >
          {!product.available ? 'Indisponível' : feito ? 'Na sacola ✓' : 'Adicionar'}
        </button>
      </div>
    </motion.article>
  );
}
