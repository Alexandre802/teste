import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/hero/Hero';
import ClienteDeVolta from '@/components/account/ClienteDeVolta';
import MenuSection from '@/components/menu/MenuSection';
import Bebidas from '@/components/sections/Bebidas';
import Featured from '@/components/sections/Featured';
import About from '@/components/sections/About';
import Reviews from '@/components/sections/Reviews';
import Gallery from '@/components/sections/Gallery';
import Promocoes from '@/components/sections/Promocoes';
import Location from '@/components/sections/Location';
import BuscaLocal from '@/components/sections/BuscaLocal';
import CartFab from '@/components/cart/CartFab';
import { Grain, Marquee, ScrollProgress } from '@/components/ui/Motion';

export default function Home() {
  return (
    <>
      <ScrollProgress />
      <Grain />
      <Header />
      <main>
        <Hero />
        <Marquee
          items={[
            'Lanches bem servidos',
            'Delivery em Jacareí',
            'Abre às 19h',
            'Bandeira Branca I',
            'Retirada na porta',
          ]}
        />
        <ClienteDeVolta />
        <MenuSection />
        <Bebidas />
        <Featured />
        <About />
        <Gallery />
        <Promocoes />
        <Location />
        <BuscaLocal />
        {/* avaliações ficam no fim, depois de tudo que ajuda a decidir o pedido */}
        <Reviews />
      </main>
      <Footer />
      <CartFab />
    </>
  );
}
