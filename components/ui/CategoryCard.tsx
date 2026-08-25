import Link from 'next/link';
import { icones, type NomeIcone } from './Icons';

/**
 * Ícone azul dentro de círculo cinza-claro com o nome embaixo — a fileira de
 * espécies da referência. É um link de âncora: leva à seção daquela espécie.
 */
export default function CategoryCard({
  nome,
  icone,
  href,
}: {
  nome: string;
  icone: NomeIcone;
  href: string;
}) {
  const Icone = icones[icone];

  return (
    <Link
      href={href}
      className="group flex flex-col items-center gap-2 rounded-xl p-1 text-center"
    >
      <span className="grid h-16 w-16 place-items-center rounded-full bg-surface-2 transition-colors group-hover:bg-brand-100 sm:h-[4.5rem] sm:w-[4.5rem]">
        <Icone className="h-9 w-9 text-brand-700 sm:h-10 sm:w-10" />
      </span>
      <span className="text-[13px] font-semibold text-ink sm:text-sm">{nome}</span>
    </Link>
  );
}
