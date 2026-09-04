'use client';

import Image from 'next/image';
import { useState } from 'react';
import { BedDouble, Heart, MapPin, Ruler, Waves } from 'lucide-react';
import { formatarPreco, type Imovel } from '@/lib/properties';

type Props = {
  imovel: Imovel;
  favorito: boolean;
  aoFavoritar: (id: string) => void;
};

export const PropertyCard = ({ imovel, favorito, aoFavoritar }: Props) => {
  // Só para a animação de toque do coração; o estado real vem de fora.
  const [pulando, setPulando] = useState(false);

  const alternar = () => {
    aoFavoritar(imovel.id);
    setPulando(true);
  };

  return (
    <article className="group flex flex-col overflow-hidden rounded-card border border-dourado/15 bg-card transition-all duration-[380ms] ease-out hover:-translate-y-1 hover:border-dourado/35 hover:shadow-[0_18px_40px_-24px_rgba(0,0,0,0.9)]">
      <div className="relative aspect-[16/9] overflow-hidden">
        <Image
          src={imovel.imagem}
          alt={imovel.alt}
          fill
          sizes="(min-width: 1536px) 22vw, (min-width: 1024px) 30vw, (min-width: 380px) 46vw, 92vw"
          className="object-cover transition-transform duration-[420ms] ease-out group-hover:scale-[1.025]"
        />

        <button
          type="button"
          onClick={alternar}
          aria-pressed={favorito}
          aria-label={
            favorito
              ? `Remover ${imovel.nome} dos favoritos`
              : `Salvar ${imovel.nome} nos favoritos`
          }
          className="absolute top-2.5 right-2.5 flex size-9 items-center justify-center rounded-full bg-preto/35 backdrop-blur-sm transition-colors duration-300 hover:bg-preto/55 sm:size-10"
        >
          <Heart
            aria-hidden="true"
            strokeWidth={1.6}
            onAnimationEnd={() => setPulando(false)}
            className={`size-[19px] transition-colors duration-300 sm:size-5 ${
              favorito ? 'fill-dourado-claro text-dourado-claro' : 'fill-transparent text-branco'
            } ${pulando ? 'coracao-pulou' : ''}`}
          />
        </button>
      </div>

      <div className="flex flex-1 flex-col px-3.5 pt-3.5 pb-4 sm:px-5 sm:pt-4 sm:pb-5">
        <h3 className="font-serif text-[1.2rem] leading-tight font-light text-branco min-[430px]:text-[1.32rem] sm:text-[1.6rem]">
          {imovel.nome}
        </h3>

        <p className="mt-1.5 flex items-center gap-1.5 text-[0.8rem] text-texto sm:text-sm">
          <MapPin aria-hidden="true" strokeWidth={1.5} className="size-3.5 shrink-0 text-dourado" />
          {imovel.cidade}, {imovel.estado}
        </p>

        <ul className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[0.72rem] text-texto sm:gap-x-4 sm:text-[0.8rem]">
          <li className="flex items-center gap-1.5">
            <BedDouble aria-hidden="true" strokeWidth={1.4} className="size-4 shrink-0 text-dourado" />
            {imovel.quartos} quartos
          </li>
          {imovel.piscina ? (
            <li className="flex items-center gap-1.5">
              <Waves aria-hidden="true" strokeWidth={1.4} className="size-4 shrink-0 text-dourado" />
              Piscina
            </li>
          ) : null}
          <li className="flex items-center gap-1.5">
            <Ruler aria-hidden="true" strokeWidth={1.4} className="size-4 shrink-0 text-dourado" />
            {imovel.area} m²
          </li>
        </ul>

        <hr className="mt-3.5 border-0 border-t border-dourado/20 sm:mt-4" />

        <p className="mt-3 text-[1.05rem] font-medium tracking-wide text-dourado-medio sm:text-[1.2rem]">
          {formatarPreco(imovel.preco)}
        </p>
      </div>
    </article>
  );
};
