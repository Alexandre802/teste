import Link from 'next/link';
import { IconeSeta } from './Icons';

/**
 * Título de seção com o link "Ver todas" à direita, como na referência:
 * título escuro e pesado à esquerda, ação em azul à direita, alinhados pela
 * linha de base.
 */
export default function SectionHeader({
  titulo,
  legenda,
  verTodasHref,
  verTodasTexto = 'Ver todas',
  id,
}: {
  titulo: string;
  legenda?: string;
  verTodasHref?: string;
  verTodasTexto?: string;
  id?: string;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <h2 id={id} className="text-xl font-bold tracking-tight text-ink sm:text-[1.375rem]">
          {titulo}
        </h2>
        {legenda ? <p className="mt-0.5 text-sm text-ink-3">{legenda}</p> : null}
      </div>

      {verTodasHref ? (
        <Link
          href={verTodasHref}
          className="group flex shrink-0 items-center gap-1 text-sm font-semibold text-brand-500 hover:text-brand-700"
        >
          {verTodasTexto}
          <IconeSeta className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      ) : null}
    </div>
  );
}
