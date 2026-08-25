import type { Produto } from '@/data/products';
import ProductCard from '@/components/ui/ProductCard';
import SectionHeader from '@/components/ui/SectionHeader';

/**
 * Uma seção de produtos. Todas as seções da home usam este componente — o que
 * muda é o título e a lista, definidos em data/sections.ts.
 *
 * No desktop é uma grade de até cinco colunas; no celular vira um trilho que
 * se arrasta com o dedo, com o card em largura fixa para o texto não espremer.
 *
 * `ancoraEspecie` cria um segundo alvo de rolagem na mesma seção, para que
 * `#cachorros` e `#racao-cachorro` levem ambos aqui.
 */
export default function ProductSection({
  id,
  titulo,
  legenda,
  produtos,
  ancoraEspecie,
  verTodasHref,
  prioridadeImagens = false,
}: {
  id: string;
  titulo: string;
  legenda?: string;
  produtos: Produto[];
  ancoraEspecie?: string;
  verTodasHref?: string;
  prioridadeImagens?: boolean;
}) {
  if (produtos.length === 0) return null;

  return (
    <section id={id} aria-labelledby={`titulo-${id}`} className="shell pt-8">
      {ancoraEspecie ? (
        <span id={ancoraEspecie} aria-hidden="true" className="block" />
      ) : null}

      <SectionHeader
        id={`titulo-${id}`}
        titulo={titulo}
        legenda={legenda}
        verTodasHref={verTodasHref}
        verTodasTexto="Ver todas"
      />

      <ul className="rail sm:grid sm:grid-cols-3 sm:gap-3 sm:overflow-visible lg:grid-cols-4">
        {produtos.map((produto, indice) => (
          <li key={produto.id} className="w-[10.75rem] sm:w-auto">
            <ProductCard
              produto={produto}
              prioridadeImagem={prioridadeImagens && indice < 2}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
