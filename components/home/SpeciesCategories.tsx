import { especies } from '@/data/categories';
import CategoryCard from '@/components/ui/CategoryCard';
import SectionHeader from '@/components/ui/SectionHeader';

/**
 * "Categorias por espécie". Cada ícone é um link de âncora: clicar em Peixes
 * rola até a seção de produtos para peixes. No celular a fileira vira um trilho
 * que se arrasta com o dedo, sem apertar os alvos de toque.
 */
export default function SpeciesCategories() {
  return (
    <section aria-labelledby="titulo-especies" className="shell pt-8">
      <SectionHeader
        id="titulo-especies"
        titulo="Categorias por espécie"
        verTodasHref="#departamentos"
      />
      <ul className="rail sm:grid sm:grid-cols-6 sm:gap-4 sm:overflow-visible">
        {especies.map((especie) => (
          <li key={especie.id} className="w-[5.5rem] sm:w-auto">
            <CategoryCard nome={especie.nome} icone={especie.icone} href={especie.ancora} />
          </li>
        ))}
      </ul>
    </section>
  );
}
