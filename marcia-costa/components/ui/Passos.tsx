import Link from "next/link";

/** Indicador 1 Produtos - 2 Pedido - 3 Pagamento, igual as referencias. */
const PASSOS = [
  { numero: 1, nome: "Produtos", href: "/cardapio" },
  { numero: 2, nome: "Pedido", href: "/pedido" },
  { numero: 3, nome: "Pagamento", href: "/pagamento" },
] as const;

export function Passos({ atual }: { atual: 1 | 2 | 3 }) {
  return (
    <nav aria-label="Etapas do pedido" className="border-b border-borda bg-white">
      <ol className="mx-auto flex max-w-3xl items-center justify-between gap-1 px-4 py-3">
        {PASSOS.map((passo, indice) => {
          const ativo = passo.numero === atual;
          const concluido = passo.numero < atual;
          const conteudo = (
            <span className="flex items-center gap-2">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[13px] font-bold ${
                  ativo
                    ? "bg-laranja text-white"
                    : concluido
                      ? "border border-laranja text-laranja"
                      : "border border-borda text-tinta-suave"
                }`}
              >
                {passo.numero}
              </span>
              <span
                className={`text-[13px] font-semibold sm:text-sm ${
                  ativo
                    ? "text-laranja"
                    : concluido
                      ? "text-tinta"
                      : "text-tinta-suave"
                }`}
              >
                {passo.nome}
              </span>
            </span>
          );

          return (
            <li key={passo.numero} className="flex flex-1 items-center gap-1">
              {concluido ? (
                <Link
                  href={passo.href}
                  className="rounded-lg py-1"
                  aria-label={`Voltar para ${passo.nome}`}
                >
                  {conteudo}
                </Link>
              ) : (
                <span aria-current={ativo ? "step" : undefined} className="py-1">
                  {conteudo}
                </span>
              )}
              {indice < PASSOS.length - 1 && (
                <span
                  aria-hidden="true"
                  className="mx-1 hidden h-1 w-1 shrink-0 rounded-full bg-borda sm:block"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
