import { Suspense } from "react";

import { FiltroPeriodo } from "@/components/admin/FiltroPeriodo";
import { ListaReceitas } from "@/components/admin/ListaReceitas";
import { EsqueletoLista } from "@/components/admin/EstadoPainel";
import { buscarReceitas } from "@/lib/admin/consultas";
import { resolverPeriodo, type ChavePeriodo } from "@/lib/admin/periodo";

export const dynamic = "force-dynamic";

export default async function PaginaReceitas({
  searchParams,
}: {
  searchParams: Promise<{ p?: string; de?: string; ate?: string; nova?: string }>;
}) {
  const parametros = await searchParams;
  const periodo = resolverPeriodo(
    (parametros.p ?? "hoje") as ChavePeriodo,
    parametros.de,
    parametros.ate,
  );

  return (
    <div className="space-y-5">
      <header>
        <h1 className="fonte-titulo text-2xl font-extrabold text-tinta">
          Receitas
        </h1>
        <p className="mt-0.5 text-sm text-tinta-media">
          Pedidos pagos entram sozinhos. Venda no balcão você lança aqui.
        </p>
      </header>

      <FiltroPeriodo />

      <Suspense fallback={<EsqueletoLista />}>
        <Conteudo periodo={periodo} abrirNova={parametros.nova === "1"} />
      </Suspense>
    </div>
  );
}

async function Conteudo({
  periodo,
  abrirNova,
}: {
  periodo: ReturnType<typeof resolverPeriodo>;
  abrirNova: boolean;
}) {
  const receitas = await buscarReceitas(periodo);
  return (
    <ListaReceitas
      receitas={receitas}
      rotuloPeriodo={periodo.rotulo}
      arquivo={`receitas-${periodo.de}`}
      abrirNova={abrirNova}
    />
  );
}
