export default function TituloPagina({
  titulo,
  descricao,
  acao,
}: {
  titulo: string;
  descricao?: string;
  acao?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3 sm:mb-6">
      <div>
        <h1 className="text-xl font-extrabold tracking-tight text-[var(--admin-tinta)] sm:text-2xl">
          {titulo}
        </h1>
        {descricao && (
          <p className="mt-0.5 text-sm text-[var(--admin-tinta-suave)]">{descricao}</p>
        )}
      </div>
      {acao}
    </div>
  );
}
