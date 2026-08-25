import { beneficios } from '@/data/banners';
import { icones } from '@/components/ui/Icons';

/**
 * Os seis cards claros logo abaixo do banner. Seis colunas no desktop, três no
 * tablet, duas no celular — a mesma composição da referência, só reflowada.
 */
export default function BenefitsBar() {
  return (
    <section aria-label="Por que comprar na Casa de Ração Bandeira Branca" className="shell pt-4">
      <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-6">
        {beneficios.map((item) => {
          const Icone = icones[item.icone];
          return (
            <li
              key={item.titulo}
              className="card-flat flex flex-col items-center gap-2 px-3 py-4 text-center"
            >
              <Icone className="h-8 w-8 text-brand-700" />
              <span className="text-[13px] font-bold leading-tight text-ink">{item.titulo}</span>
              <span className="text-[12px] leading-tight text-ink-3">{item.texto}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
