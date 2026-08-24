import Image from 'next/image';
import { BurgerMark } from './Icons';
import type { Product } from '@/lib/catalog';

/**
 * Foto do produto — ou o placeholder da marca.
 *
 * Produto sem fotografia confirmada NUNCA recebe a foto de outro item: cai no
 * placeholder. As fotos disponíveis foram extraídas do cardápio da casa e são
 * de baixa resolução; substituir por ensaio próprio melhora bastante o card.
 */
export function ProductImage({
  product,
  sizes,
  priority = false,
  className = '',
}: {
  product: Product;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  if (!product.image) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center bg-[linear-gradient(145deg,#2a1207,#140802)] ${className}`}
        aria-hidden="true"
      >
        <div className="flex flex-col items-center gap-2 opacity-30">
          <BurgerMark className="h-12 w-12 text-flame" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-flame">
            Michel Food House
          </span>
        </div>
      </div>
    );
  }

  return (
    <Image
      src={product.image}
      alt={`${product.name} — Michel Food House, lanches em Jacareí`}
      fill
      sizes={sizes}
      priority={priority}
      className={`object-cover ${className}`}
    />
  );
}
