'use client';

import { useEffect, useRef, useState } from 'react';
import { useCarrinho } from '@/lib/cart';
import { moeda, parcelamento, percentualDesconto, precoAntigoVisivel, precoVisivel } from '@/lib/format';
import type { Produto } from '@/data/products';
import ProductImage from './ProductImage';
import { IconeCarrinho, IconeCheck, IconeCoracao } from './Icons';

/**
 * O card da referência: selo de desconto no alto à esquerda, foto com bastante
 * respiro, nome em duas linhas, preço em azul, parcelamento em cinza e o botão
 * redondo de carrinho à direita, na mesma linha do preço.
 *
 * Sem preço confirmado (ver `PRECOS_CONFIRMADOS` em data/products.ts) o mesmo
 * espaço mostra "Consultar" — a altura do card não muda.
 */
export default function ProductCard({
  produto,
  prioridadeImagem = false,
}: {
  produto: Produto;
  prioridadeImagem?: boolean;
}) {
  const adicionar = useCarrinho((e) => e.adicionar);
  const [adicionado, setAdicionado] = useState(false);
  const [favorito, setFavorito] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const preco = precoVisivel(produto);
  const precoAntigo = precoAntigoVisivel(produto);
  const desconto = percentualDesconto(produto);
  const parcelas = parcelamento(produto);

  function aoAdicionar() {
    adicionar(produto.id);
    setAdicionado(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdicionado(false), 1600);
  }

  return (
    <article className="group relative flex h-full flex-col rounded-card border border-line bg-white p-3 transition-colors hover:border-brand-100 sm:p-4">
      {/* selo de desconto — só existe quando há preço antigo confirmado */}
      {desconto !== null ? (
        <span className="absolute left-3 top-3 z-10 rounded-full bg-brand-500 px-2.5 py-1 text-[11px] font-bold text-white sm:left-4 sm:top-4">
          {desconto}% OFF
        </span>
      ) : null}

      <button
        type="button"
        onClick={() => setFavorito((v) => !v)}
        aria-pressed={favorito}
        aria-label={favorito ? `Remover ${produto.nome} dos favoritos` : `Salvar ${produto.nome} nos favoritos`}
        className="absolute right-2 top-2 z-10 grid h-9 w-9 place-items-center rounded-full text-ink-3/50 transition-colors hover:bg-surface-2 hover:text-brand-500 aria-pressed:text-brand-500"
      >
        <IconeCoracao className={`h-[18px] w-[18px] ${favorito ? 'fill-current' : ''}`} />
      </button>

      <div className="relative mx-auto aspect-square w-full max-w-[190px] py-2">
        <ProductImage produto={produto} priority={prioridadeImagem} />
      </div>

      <h3 className="clamp-2 min-h-[2.6em] text-[14px] leading-[1.3] text-ink-2 sm:text-[15px]">
        {produto.nome}
        {produto.medida ? <span className="text-ink-2"> {produto.medida}</span> : null}
      </h3>

      <div className="mt-auto flex items-end justify-between gap-2 pt-3">
        <div className="min-w-0">
          {preco !== null ? (
            <>
              <p className="flex flex-wrap items-baseline gap-x-2">
                <span className="text-[19px] font-bold leading-tight text-brand-500 sm:text-xl">
                  {moeda(preco)}
                </span>
                {precoAntigo !== null ? (
                  <span className="text-[13px] text-ink-3 line-through">{moeda(precoAntigo)}</span>
                ) : null}
              </p>
              {parcelas ? <p className="mt-0.5 text-[13px] text-ink-3">{parcelas}</p> : null}
            </>
          ) : (
            <>
              <p className="whitespace-nowrap text-[17px] font-bold leading-tight text-brand-500 sm:text-[19px]">
                Consultar
              </p>
              <p className="mt-0.5 text-[13px] text-ink-3">preço no WhatsApp</p>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={aoAdicionar}
          disabled={!produto.estoque}
          aria-label={`Adicionar ${produto.nome} ao carrinho`}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-500 text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-ink-3/30"
        >
          {adicionado ? <IconeCheck className="h-5 w-5" /> : <IconeCarrinho className="h-5 w-5" />}
        </button>
      </div>

      {/* confirmação para quem usa leitor de tela; visualmente o ícone já muda */}
      <span aria-live="polite" className="sr-only">
        {adicionado ? `${produto.nome} adicionado ao carrinho` : ''}
      </span>

      {!produto.estoque ? (
        <span className="mt-2 text-[12px] font-semibold text-ink-3">Sem estoque no momento</span>
      ) : null}
    </article>
  );
}
