import HeroPremium from '@/components/advocacia-premium/HeroPremium';
import LawyerScrollExperience from '@/components/advocacia-premium/LawyerScrollExperience';
import ProcessWords from '@/components/advocacia-premium/ProcessWords';
import PracticeAreasEditorial from '@/components/advocacia-premium/PracticeAreasEditorial';
import PrinciplesLight from '@/components/advocacia-premium/PrinciplesLight';
import OfficeSection from '@/components/advocacia-premium/OfficeSection';
import ProfessionalsSection from '@/components/advocacia-premium/ProfessionalsSection';
import LocationSection from '@/components/advocacia-premium/LocationSection';
import FinalCta from '@/components/advocacia-premium/FinalCta';
import PremiumNav from '@/components/advocacia-premium/PremiumNav';
import PremiumCursor from '@/components/advocacia-premium/PremiumCursor';

/**
 * Demonstrativo premium — Almeida & Costa.
 *
 * A ordem das seções é o roteiro: abertura vazia que se constrói, a sequência
 * conduzida pela rolagem e, imediatamente depois dela, as quatro palavras.
 *
 * A sequência termina apagando o próprio conteúdo sobre #030405 e o
 * ProcessWords começa no mesmo #030405 — a emenda é invisível e não há mais
 * seção intermediária entre uma e outra. O componente TransicaoDocumento
 * continua no repositório, mas não é renderizado: a virada por tela branca
 * que ele fazia abria um vazio no meio da experiência.
 */
export default function AdvocaciaPremiumPage() {
  return (
    <>
      <PremiumCursor />
      <PremiumNav />

      <main>
        <HeroPremium />
        <LawyerScrollExperience />
        <ProcessWords />
        <PracticeAreasEditorial />
        <PrinciplesLight />
        <OfficeSection />
        <ProfessionalsSection />
        <LocationSection />
        <FinalCta />
      </main>

      <footer className="rodape">
        <p>Projeto demonstrativo — Alexandre Soluções Digitais.</p>
        <p>
          Conteúdo, perfis e dados de contato meramente demonstrativos. Nenhum
          número de OAB foi atribuído.
        </p>
      </footer>
    </>
  );
}
