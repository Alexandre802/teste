import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppButton } from '@/components/layout/WhatsAppButton';
import { Hero } from '@/components/sections/Hero';
import { Stats } from '@/components/sections/Stats';
import { About } from '@/components/sections/About';
import { Structure } from '@/components/sections/Structure';
import { Modalities } from '@/components/sections/Modalities';
import { Plans } from '@/components/sections/Plans';
import { CtaBanner } from '@/components/sections/CtaBanner';
import { Testimonials } from '@/components/sections/Testimonials';
import { Differentials } from '@/components/sections/Differentials';
import { Gallery } from '@/components/sections/Gallery';
import { TrialCTA } from '@/components/sections/TrialCTA';
import { Location } from '@/components/sections/Location';
import { Faq } from '@/components/sections/Faq';
import { mensagens } from '@/data/academy';
import { fotos } from '@/data/gallery';

/**
 * Página única. A ordem conta uma história: quem chega vê a academia, entende
 * a estrutura, escolhe o treino, chega nos planos, lê quem já treina aqui,
 * agenda a experimental e descobre onde fica.
 */
export default function Home() {
  return (
    <>
      <Header />

      <main>
        <Hero />
        <Stats />
        <About />
        <Structure />
        <Modalities />
        <Plans />

        <CtaBanner
          sobrescrito="Matrícula"
          titulo="Seu próximo treino começa aqui."
          texto="Escolha seu plano e venha viver a experiência Allp Fit."
          foto={fotos.esteiras}
          rotuloPrimario="Quero começar"
          hrefPrimario="#aula-experimental"
          mensagemWhatsapp={mensagens.matricula}
        />

        <Testimonials />
        <Differentials />
        <Gallery />
        <TrialCTA />
        <Location />
        <Faq />

        <CtaBanner
          destaque
          sobrescrito="Allp Fit"
          titulo="A sua evolução começa aqui."
          texto="Venha conhecer a Allp Fit, no Centro de Londrina."
          foto={fotos.tetoLed}
          rotuloPrimario="Ver planos"
          hrefPrimario="#planos"
          mensagemWhatsapp={mensagens.planos}
        />
      </main>

      <Footer />
      <WhatsAppButton />
    </>
  );
}
