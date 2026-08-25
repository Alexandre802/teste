'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { ancoraDoProduto, buscar, contarResultados } from '@/lib/search';
import { moeda, precoVisivel } from '@/lib/format';
import ProductImage from '@/components/ui/ProductImage';
import { IconeBusca, IconeFechar } from '@/components/ui/Icons';

/**
 * Busca do topo. Varre o catálogo inteiro por nome, marca, categoria, espécie e
 * termos extras — "premier", "ração cachorro", "whiskas" e "peixe" todos
 * funcionam (ver lib/search.ts).
 *
 * Navegação por teclado: ↑ ↓ percorrem, Enter abre, Esc fecha.
 */
export default function SearchBar({ autoFoco = false }: { autoFoco?: boolean }) {
  const [consulta, setConsulta] = useState('');
  const [aberto, setAberto] = useState(false);
  const [selecionado, setSelecionado] = useState(-1);
  const caixa = useRef<HTMLDivElement>(null);
  const campo = useRef<HTMLInputElement>(null);
  const listaId = useId();

  const resultados = consulta.trim().length >= 2 ? buscar(consulta) : [];
  const total = consulta.trim().length >= 2 ? contarResultados(consulta) : 0;
  const mostrando = aberto && consulta.trim().length >= 2;

  useEffect(() => {
    if (autoFoco) campo.current?.focus();
  }, [autoFoco]);

  // clique fora fecha a lista
  useEffect(() => {
    function aoClicar(evento: MouseEvent) {
      if (!caixa.current?.contains(evento.target as Node)) setAberto(false);
    }
    document.addEventListener('mousedown', aoClicar);
    return () => document.removeEventListener('mousedown', aoClicar);
  }, []);

  function aoTeclar(evento: React.KeyboardEvent<HTMLInputElement>) {
    if (evento.key === 'Escape') {
      setAberto(false);
      return;
    }
    if (!mostrando || resultados.length === 0) return;

    if (evento.key === 'ArrowDown') {
      evento.preventDefault();
      setSelecionado((i) => (i + 1) % resultados.length);
    } else if (evento.key === 'ArrowUp') {
      evento.preventDefault();
      setSelecionado((i) => (i <= 0 ? resultados.length - 1 : i - 1));
    } else if (evento.key === 'Enter' && selecionado >= 0) {
      evento.preventDefault();
      const alvo = resultados[selecionado];
      window.location.hash = ancoraDoProduto(alvo).slice(1);
      fechar();
    }
  }

  function fechar() {
    setAberto(false);
    setSelecionado(-1);
  }

  return (
    <div ref={caixa} className="relative w-full">
      <div className="flex items-center gap-2 rounded-full bg-white px-4 py-3 sm:px-5">
        <IconeBusca className="h-5 w-5 shrink-0 text-ink-3" />
        <input
          ref={campo}
          type="search"
          value={consulta}
          onChange={(evento) => {
            setConsulta(evento.target.value);
            setAberto(true);
            setSelecionado(-1);
          }}
          onFocus={() => setAberto(true)}
          onKeyDown={aoTeclar}
          placeholder="Buscar produtos, marcas..."
          aria-label="Buscar produtos e marcas"
          aria-expanded={mostrando}
          aria-controls={listaId}
          role="combobox"
          autoComplete="off"
          className="w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-3 [&::-webkit-search-cancel-button]:hidden"
        />
        {consulta ? (
          <button
            type="button"
            onClick={() => {
              setConsulta('');
              campo.current?.focus();
            }}
            aria-label="Limpar busca"
            className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-ink-3 hover:bg-surface-2"
          >
            <IconeFechar className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {mostrando ? (
        <div
          id={listaId}
          role="listbox"
          aria-label="Resultados da busca"
          className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 max-h-[70vh] overflow-y-auto rounded-xl border border-line bg-white py-1 shadow-[0_10px_30px_rgba(0,41,80,0.16)]"
        >
          {resultados.length === 0 ? (
            <p className="px-4 py-5 text-center text-sm text-ink-3">
              Nada encontrado para <strong className="text-ink-2">“{consulta}”</strong>.
              <br />
              Fale com a gente no WhatsApp — pode ser que tenhamos na loja.
            </p>
          ) : (
            <>
              {resultados.map((produto, indice) => {
                const preco = precoVisivel(produto);
                return (
                  <Link
                    key={produto.id}
                    href={ancoraDoProduto(produto)}
                    role="option"
                    aria-selected={indice === selecionado}
                    onClick={fechar}
                    onMouseEnter={() => setSelecionado(indice)}
                    className={`flex items-center gap-3 px-3 py-2 ${
                      indice === selecionado ? 'bg-brand-50' : ''
                    }`}
                  >
                    <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-line">
                      <ProductImage produto={produto} sizes="48px" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="clamp-2 block text-[13px] leading-snug text-ink-2">
                        {produto.nome} {produto.medida ?? ''}
                      </span>
                      <span className="text-[12px] text-ink-3">{produto.marca}</span>
                    </span>
                    <span className="shrink-0 text-[13px] font-bold text-brand-500">
                      {preco !== null ? moeda(preco) : 'Consultar'}
                    </span>
                  </Link>
                );
              })}
              {total > resultados.length ? (
                <p className="px-4 py-2 text-center text-[12px] text-ink-3">
                  Mostrando {resultados.length} de {total} resultados
                </p>
              ) : null}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
