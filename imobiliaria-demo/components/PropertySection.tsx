'use client';

import { useMemo, useState } from 'react';
import { SearchX } from 'lucide-react';

import { filtrarImoveis, filtrosIniciais, imoveis, type Filtros } from '@/lib/properties';
import { SectionHeading } from './ui/SectionHeading';
import { Reveal } from './ui/Reveal';
import { CategoryChips, SearchAndFilters } from './PropertyFilters';
import { PropertyCard } from './PropertyCard';

export const PropertySection = () => {
  const [filtros, setFiltros] = useState<Filtros>(filtrosIniciais);
  const [favoritos, setFavoritos] = useState<string[]>([]);

  const aoMudar = (mudanca: Partial<Filtros>) =>
    setFiltros((atuais) => ({ ...atuais, ...mudanca }));

  const encontrados = useMemo(() => filtrarImoveis(imoveis, filtros), [filtros]);

  const alternarFavorito = (id: string) =>
    setFavoritos((atuais) =>
      atuais.includes(id) ? atuais.filter((salvo) => salvo !== id) : [...atuais, id],
    );

  return (
    <section id="imoveis" className="bg-carvao">
      {/* Abertura em creme, como na referência. */}
      <div className="textura-papel bg-creme px-5 pt-20 pb-10 sm:pt-24">
        <SectionHeading
          tom="claro"
          sobrescrito="Imóveis selecionados"
          titulo={
            <>
              Encontre opções <span className="text-dourado">exclusivas.</span>
            </>
          }
          className="mx-auto max-w-3xl"
        />

        <div className="mx-auto mt-9 max-w-4xl">
          <CategoryChips filtros={filtros} aoMudar={aoMudar} />
        </div>
      </div>

      {/*
        A barra de busca fica na emenda entre o creme e o escuro: metade dela
        sobre cada fundo. A faixa creme aqui tem altura fixa para não crescer
        junto com o painel de filtros.
      */}
      <div className="relative px-5">
        <div
          aria-hidden="true"
          className="textura-papel absolute inset-x-0 top-0 h-8 bg-creme"
        />
        <div className="relative mx-auto max-w-6xl">
          <SearchAndFilters
            filtros={filtros}
            aoMudar={aoMudar}
            resultados={encontrados.length}
          />
        </div>
      </div>

      <div className="px-5 pt-8 pb-24 sm:pt-10">
        <div className="mx-auto max-w-6xl">
          {encontrados.length > 0 ? (
            <ul className="grid grid-cols-1 gap-4 min-[380px]:grid-cols-2 sm:gap-5 lg:grid-cols-3 2xl:grid-cols-4">
              {encontrados.map((imovel, indice) => (
                <li key={imovel.id} className="flex">
                  <Reveal delay={Math.min(indice, 5) * 0.08} className="flex w-full">
                    <div className="flex w-full">
                      <PropertyCard
                        imovel={imovel}
                        favorito={favoritos.includes(imovel.id)}
                        aoFavoritar={alternarFavorito}
                      />
                    </div>
                  </Reveal>
                </li>
              ))}
            </ul>
          ) : (
            <VazioHonesto categoria={filtros.categoria} aoLimpar={() => setFiltros(filtrosIniciais)} />
          )}
        </div>
      </div>
    </section>
  );
};

const VazioHonesto = ({
  categoria,
  aoLimpar,
}: {
  categoria: Filtros['categoria'];
  aoLimpar: () => void;
}) => (
  <Reveal className="mx-auto max-w-md rounded-card border border-dourado/20 bg-card px-6 py-12 text-center">
    <SearchX
      aria-hidden="true"
      strokeWidth={1.2}
      className="mx-auto size-9 text-dourado/70"
    />

    <p className="mt-5 font-serif text-2xl font-light text-branco">
      Nenhum imóvel com esses filtros.
    </p>

    <p className="mt-3 text-[0.9rem] leading-relaxed text-texto">
      {categoria === 'apartamentos'
        ? 'Este acervo demonstrativo reúne apenas casas. Os apartamentos entram assim que o acervo do cliente for carregado.'
        : 'Tente outra categoria, outro termo de busca ou volte aos filtros originais.'}
    </p>

    <button
      type="button"
      onClick={aoLimpar}
      className="botao-contorno mt-7 inline-flex min-h-[46px] items-center justify-center rounded-botao px-6 text-[0.9rem] font-medium transition duration-300 hover:-translate-y-0.5 hover:border-dourado-claro hover:text-dourado-claro"
    >
      Ver todos os imóveis
    </button>
  </Reveal>
);
