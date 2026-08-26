interface Props {
  className?: string;
}

/** Bloco cinza que ocupa o lugar do conteúdo enquanto ele carrega. */
export function Esqueleto({ className = '' }: Props) {
  return <div className={`esqueleto ${className}`} aria-hidden="true" />;
}

/** Três indicadores em espera — mesmo formato dos de verdade, nada pula depois. */
export function EsqueletoIndicadores({ colunas = 3 }: { colunas?: number }) {
  return (
    <div
      className="grid gap-3"
      style={{ gridTemplateColumns: `repeat(${colunas}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: colunas }).map((_, i) => (
        <div key={i} className="cartao p-3.5">
          <Esqueleto className="h-3.5 w-14" />
          <Esqueleto className="mt-3 h-8 w-12" />
          <Esqueleto className="mt-2 h-3 w-10" />
        </div>
      ))}
    </div>
  );
}

export function EsqueletoLista({ linhas = 3 }: { linhas?: number }) {
  return (
    <div className="flex flex-col gap-2.5">
      {Array.from({ length: linhas }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-2xl bg-carvao-alto/60 p-3">
          <Esqueleto className="h-11 w-11 shrink-0 rounded-full" />
          <div className="flex-1">
            <Esqueleto className="h-4 w-32" />
            <Esqueleto className="mt-2 h-3 w-16" />
          </div>
          <Esqueleto className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}

export function EsqueletoGrafico() {
  return (
    <div className="cartao p-4">
      <div className="flex items-center justify-between">
        <Esqueleto className="h-4 w-36" />
        <Esqueleto className="h-7 w-24 rounded-full" />
      </div>
      <Esqueleto className="mt-5 h-40 w-full rounded-xl" />
    </div>
  );
}
