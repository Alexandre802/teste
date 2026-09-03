import HeroPremium from '@/components/advocacia-premium/HeroPremium';
import LawyerScrollExperience from '@/components/advocacia-premium/LawyerScrollExperience';
import PracticeAreasEditorial from '@/components/advocacia-premium/PracticeAreasEditorial';
import PrinciplesLight from '@/components/advocacia-premium/PrinciplesLight';
import ProcessWords from '@/components/advocacia-premium/ProcessWords';
import OfficeSection from '@/components/advocacia-premium/OfficeSection';
import ProfessionalsSection from '@/components/advocacia-premium/ProfessionalsSection';
import LocationSection from '@/components/advocacia-premium/LocationSection';
import FinalCta from '@/components/advocacia-premium/FinalCta';
import PremiumNav from '@/components/advocacia-premium/PremiumNav';
import PremiumCursor from '@/components/advocacia-premium/PremiumCursor';
import TransicaoDocumento from '@/components/advocacia-premium/TransicaoDocumento';

/**
 * Demonstrativo premium — Almeida & Costa.
 *
 * A ordem das seções é o roteiro: abertura vazia que se constrói, a sequência
 * conduzida pela rolagem, o respiro claro no meio do escuro e o fechamento com
 * uma ação só.
 */
export default function AdvocaciaPremiumPage() {
  return (
    <>
      <PremiumCursor />
      <PremiumNav />

      <main>
        <HeroPremium />
        <LawyerScrollExperience />
        <TransicaoDocumento />
        <PracticeAreasEditorial />
        <PrinciplesLight />
        <ProcessWords />
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
