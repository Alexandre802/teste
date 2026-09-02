import { Suspense } from "react";

import { FiltroPeriodo } from "@/components/admin/FiltroPeriodo";
import { ListaDespesas } from "@/components/admin/ListaDespesas";
import { EsqueletoLista } from "@/components/admin/EstadoPainel";
import { buscarCategoriasDespesa, buscarDespesas } from "@/lib/admin/consultas";
import { resolverPeriodo, type ChavePeriodo } from "@/lib/admin/periodo";

export const dynamic = "force-dynamic";

export default async function PaginaDespesas({
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
          Despesas
        </h1>
        <p className="mt-0.5 text-sm text-tinta-media">
          Tudo que sai do caixa, por categoria
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
  const [despesas, categorias] = await Promise.all([
    buscarDespesas(periodo),
    buscarCategoriasDespesa(),
  ]);
  return (
    <ListaDespesas
      despesas={despesas}
      categorias={categorias}
      rotuloPeriodo={periodo.rotulo}
      arquivo={`despesas-${periodo.de}`}
      abrirNova={abrirNova}
    />
  );
}
