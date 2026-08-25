import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroCarousel from '@/components/home/HeroCarousel';
import BenefitsBar from '@/components/home/BenefitsBar';
import SpeciesCategories from '@/components/home/SpeciesCategories';
import PromoBanners from '@/components/home/PromoBanners';
import DepartmentCards from '@/components/home/DepartmentCards';
import ProductSection from '@/components/home/ProductSection';
import ServicesSection from '@/components/home/ServicesSection';
import WhatsAppFloatingButton from '@/components/ui/WhatsAppFloatingButton';
import { secoes } from '@/data/sections';
import { produtosDaCategoria, produtosDestaque } from '@/data/products';

/**
 * A home. A ordem das seções de produtos vem de data/sections.ts — para criar,
 * renomear ou reordenar uma seção, mexa lá, não aqui.
 */
export default function Home() {
  return (
    <>
      <Header />

      <main id="conteudo">
        <HeroCarousel />
        <BenefitsBar />
        <SpeciesCategories />
        <PromoBanners />
        <DepartmentCards />

        <ProductSection
          id="destaques"
          titulo="Produtos em destaque"
          produtos={produtosDestaque}
          verTodasHref="/#departamentos"
          prioridadeImagens
        />

        {secoes.map((secao) => (
          <ProductSection
            key={secao.id}
            id={secao.id}
            titulo={secao.titulo}
            legenda={secao.legenda}
            produtos={produtosDaCategoria(secao.categoria)}
            ancoraEspecie={secao.ancoraEspecie}
            verTodasHref="/#departamentos"
          />
        ))}

        <ServicesSection />
      </main>

      <Footer />
      <WhatsAppFloatingButton />
    </>
  );
}
