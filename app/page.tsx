import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/hero/Hero';
import ClienteDeVolta from '@/components/account/ClienteDeVolta';
import MenuSection from '@/components/menu/MenuSection';
import Featured from '@/components/sections/Featured';
import About from '@/components/sections/About';
import Reviews from '@/components/sections/Reviews';
import Gallery from '@/components/sections/Gallery';
import Promocoes from '@/components/sections/Promocoes';
import Location from '@/components/sections/Location';
import BuscaLocal from '@/components/sections/BuscaLocal';
import CartFab from '@/components/cart/CartFab';

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <ClienteDeVolta />
        <MenuSection />
        <Featured />
        <About />
        <Reviews />
        <Gallery />
        <Promocoes />
        <Location />
        <BuscaLocal />
      </main>
      <Footer />
      <CartFab />
    </>
  );
}
