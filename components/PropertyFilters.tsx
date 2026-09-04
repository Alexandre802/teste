'use client';

import { useId, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Building2, Gem, Home, Search, SlidersHorizontal, Waves, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import {
  categorias,
  faixasDePreco,
  faixasDeQuartos,
  filtrosIniciais,
  ordenacoes,
  type CategoriaId,
  type Filtros,
} from '@/lib/properties';
import { usePrefereMenosMovimento } from '@/lib/use-reduced-motion';

const icones: Record<CategoriaId, LucideIcon> = {
  casas: Home,
  apartamentos: Building2,
  'alto-padrao': Gem,
  piscina: Waves,
};

type Props = {
  filtros: Filtros;
  aoMudar: (mudanca: Partial<Filtros>) => void;
};

/** Linha de categorias — fica sobre o fundo creme, como na referência. */
export const CategoryChips = ({ filtros, aoMudar }: Props) => (
  <div className="relative">
    <div
      role="group"
      aria-label="Categorias de imóveis"
      className="rolagem-invisivel -mx-5 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:justify-center sm:gap-2.5 sm:px-0"
    >
      {categorias.map(({ id, rotulo }) => {
        const Icone = icones[id];
        const ativa = filtros.categoria === id;

        return (
          <button
            key={id}
            type="button"
            onClick={() => aoMudar({ categoria: id })}
            aria-pressed={ativa}
            className={`flex min-h-[44px] shrink-0 items-center gap-2 rounded-full border px-3.5 text-[0.82rem] font-medium whitespace-nowrap transition-all duration-300 sm:min-h-[46px] sm:px-5 sm:text-[0.9rem] ${
              ativa
                ? 'border-dourado bg-carvao text-dourado-claro shadow-[0_10px_24px_-18px_rgba(0,0,0,0.9)]'
                : 'border-[#c9b48c]/60 bg-transparent text-[#4a3f31] hover:border-dourado hover:text-[#2a2118]'
            }`}
          >
            <Icone
              aria-hidden="true"
              strokeWidth={1.5}
              className={`size-[18px] ${ativa ? 'text-dourado-claro' : 'text-dourado'}`}
            />
            {rotulo}
          </button>
        );
      })}
    </div>

    {/* Sinaliza que a linha rola no celular, onde as quatro não cabem. */}
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 -right-5 w-12 bg-gradient-to-l from-creme to-transparent sm:hidden"
    />
  </div>
);

type BuscaProps = Props & {
  /** Quantos imóveis os filtros atuais devolveram. */
  resultados: number;
};

/** Campo de busca, botão "Filtrar" e o painel que ele abre. */
export const SearchAndFilters = ({ filtros, aoMudar, resultados }: BuscaProps) => {
  const [aberto, setAberto] = useState(false);
  const painelId = useId();
  const menosMovimento = usePrefereMenosMovimento();

  const limpo =
    filtros.busca === '' &&
    filtros.quartosMinimos === filtrosIniciais.quartosMinimos &&
    filtros.precoMaximo === filtrosIniciais.precoMaximo &&
    filtros.ordenacao === filtrosIniciais.ordenacao;

  const limpar = () =>
    aoMudar({
      busca: '',
      quartosMinimos: filtrosIniciais.quartosMinimos,
      precoMaximo: filtrosIniciais.precoMaximo,
      ordenacao: filtrosIniciais.ordenacao,
    });

  const painel = (
    <div className="mt-3 rounded-card border border-dourado/20 bg-card px-4 py-5 sm:px-6">
      <div className="grid gap-5 sm:grid-cols-3">
        <GrupoDeOpcoes
          rotulo="Ordenar por"
          opcoes={ordenacoes.map((o) => ({ rotulo: o.rotulo, ativo: filtros.ordenacao === o.id, aoClicar: () => aoMudar({ ordenacao: o.id }) }))}
        />
        <GrupoDeOpcoes
          rotulo="Quartos"
          opcoes={faixasDeQuartos.map((q) => ({ rotulo: q.rotulo, ativo: filtros.quartosMinimos === q.valor, aoClicar: () => aoMudar({ quartosMinimos: q.valor }) }))}
        />
        <GrupoDeOpcoes
          rotulo="Preço"
          opcoes={faixasDePreco.map((f) => ({ rotulo: f.rotulo, ativo: filtros.precoMaximo === f.valor, aoClicar: () => aoMudar({ precoMaximo: f.valor }) }))}
        />
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-dourado/15 pt-4">
        <p className="text-[0.8rem] text-texto">
          {resultados === 1 ? '1 imóvel encontrado' : `${resultados} imóveis encontrados`}
        </p>

        <button
          type="button"
          onClick={limpar}
          disabled={limpo}
          className="flex items-center gap-1.5 text-[0.8rem] font-medium text-dourado-claro underline-offset-4 transition hover:underline disabled:cursor-not-allowed disabled:text-texto/50 disabled:no-underline"
        >
          <X aria-hidden="true" strokeWidth={1.6} className="size-3.5" />
          Limpar filtros
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex gap-2 sm:gap-2.5">
        <div className="relative flex min-h-[60px] min-w-0 flex-1 items-center rounded-botao border border-dourado/30 bg-carvao-claro">
          <Search
            aria-hidden="true"
            strokeWidth={1.5}
            className="pointer-events-none absolute left-3 size-[19px] text-branco/85 sm:left-4 sm:size-[22px]"
          />
          <label htmlFor="busca-imoveis" className="sr-only">
            Buscar imóveis por localização ou nome
          </label>
          <input
            id="busca-imoveis"
            type="search"
            value={filtros.busca}
            onChange={(evento) => aoMudar({ busca: evento.target.value })}
            placeholder="Buscar por localização ou nome"
            autoComplete="off"
            className="h-full w-full min-w-0 bg-transparent py-4 pr-2.5 pl-10 text-[0.78rem] text-branco placeholder:text-texto/70 focus:outline-none sm:pr-4 sm:pl-13 sm:text-[0.95rem]"
          />
        </div>

        <button
          type="button"
          onClick={() => setAberto((estava) => !estava)}
          aria-expanded={aberto}
          aria-controls={painelId}
          aria-label="Filtrar imóveis"
          className={`flex min-h-[60px] shrink-0 items-center gap-2 rounded-botao border px-3 text-[0.8rem] font-medium transition-colors duration-300 sm:gap-2.5 sm:px-6 sm:text-[0.95rem] ${
            aberto
              ? 'border-dourado bg-carvao-claro text-dourado-claro'
              : 'border-dourado/30 bg-carvao-claro text-branco hover:border-dourado/60'
          }`}
        >
          <SlidersHorizontal aria-hidden="true" strokeWidth={1.5} className="size-[19px] sm:size-[20px]" />
          {/* Abaixo de 380 px a palavra não cabe junto com a frase da busca. */}
          <span className="hidden min-[380px]:inline">Filtrar</span>
        </button>
      </div>

      <div id={painelId}>
        {menosMovimento ? (
          aberto ? painel : null
        ) : (
          <AnimatePresence initial={false}>
            {aberto ? (
              <motion.div
                key="painel"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                {painel}
              </motion.div>
            ) : null}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

type Opcao = { rotulo: string; ativo: boolean; aoClicar: () => void };

const GrupoDeOpcoes = ({ rotulo, opcoes }: { rotulo: string; opcoes: Opcao[] }) => (
  <fieldset className="min-w-0">
    <legend className="sobrescrito mb-2.5 text-dourado">{rotulo}</legend>
    <div className="flex flex-wrap gap-2">
      {opcoes.map((opcao) => (
        <button
          key={opcao.rotulo}
          type="button"
          onClick={opcao.aoClicar}
          aria-pressed={opcao.ativo}
          className={`min-h-[38px] rounded-full border px-3.5 text-[0.78rem] transition-colors duration-300 ${
            opcao.ativo
              ? 'border-dourado bg-dourado/12 text-dourado-claro'
              : 'border-dourado/20 text-texto hover:border-dourado/50 hover:text-branco'
          }`}
        >
          {opcao.rotulo}
        </button>
      ))}
    </div>
  </fieldset>
);
