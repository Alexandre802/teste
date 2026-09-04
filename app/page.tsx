import { HeroScrollExperience } from '@/components/HeroScrollExperience';
import { PropertySection } from '@/components/PropertySection';
import { AboutSection } from '@/components/AboutSection';
import { ContactSection } from '@/components/ContactSection';
import { Footer } from '@/components/Footer';

export default function Home() {
  return (
    <>
      <main>
        <HeroScrollExperience />
        <PropertySection />
        <AboutSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
