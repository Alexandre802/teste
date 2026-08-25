import Link from 'next/link';
import { departamentos, paraSecao } from '@/data/categories';
import { icones } from '@/components/ui/Icons';
import SectionHeader from '@/components/ui/SectionHeader';

/**
 * "Departamentos populares": cartão horizontal com ícone à esquerda e nome à
 * direita, quatro por linha no desktop. Cada um leva à sua seção de produtos.
 */
export default function DepartmentCards() {
  return (
    <section id="departamentos" aria-labelledby="titulo-departamentos" className="shell pt-8">
      <SectionHeader
        id="titulo-departamentos"
        titulo="Departamentos populares"
        verTodasHref="/#racao-cachorro"
      />
      <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
        {departamentos.map((departamento) => {
          const Icone = icones[departamento.icone];
          return (
            <li key={departamento.nome}>
              <Link
                href={paraSecao(departamento.ancora)}
                className="card-flat flex h-full items-center gap-3 p-3 transition-colors hover:border-brand-100 hover:bg-brand-50"
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-surface-2">
                  <Icone className="h-6 w-6 text-brand-700" />
                </span>
                <span className="text-[13px] font-semibold leading-snug text-ink sm:text-[14px]">
                  {departamento.nome}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
