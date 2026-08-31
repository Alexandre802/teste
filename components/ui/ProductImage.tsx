import Image from 'next/image';
import { BurgerMark } from './Icons';
import type { Product } from '@/lib/catalog';

/**
 * Fotografia profissional confirmada depois do primeiro lote.
 *
 * O Americano corresponde à foto real que havia ficado sem associação no
 * primeiro import. A imagem mostra pão de hambúrguer, ovo, presunto/bacon,
 * tomate, alface e batata palha, compatível com a descrição do cardápio.
 */
const PHOTO_OVERRIDES: Partial<Record<Product['id'], string>> = {
  americano: '/images/lanches/lanche-michel-02.webp',
};

/**
 * Foto do produto — ou o placeholder da marca.
 *
 * Produto sem fotografia confirmada NUNCA recebe a foto de outro item: cai no
 * placeholder. As fotos profissionais da casa sempre têm prioridade sobre os
 * recortes antigos do cardápio.
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
  const src = PHOTO_OVERRIDES[product.id] ?? product.image;

  if (!src) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center bg-white/12 ${className}`}
        aria-hidden="true"
      >
        <div className="flex flex-col items-center gap-1.5 opacity-70">
          <BurgerMark className="h-8 w-8 text-white/80" />
          <span className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-white/70">
            Michel Food House
          </span>
        </div>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={`${product.name} — Michel Food House, lanches em Jacareí`}
      fill
      sizes={sizes}
      priority={priority}
      className={`object-cover ${className}`}
    />
  );
}
