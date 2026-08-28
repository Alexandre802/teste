"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCatalogo } from "@/hooks/useCatalogo";
import { PageHeader } from "@/components/ui/PageHeader";
import { SeletorVariante } from "@/components/estoque/SeletorVariante";
import { FormularioEntrada } from "@/components/estoque/FormularioEntrada";

export default function EntradaPage() {
  return (
    <Suspense fallback={null}>
      <Entrada />
    </Suspense>
  );
}

function Entrada() {
  const router = useRouter();
  const parametros = useSearchParams();
  const catalogo = useCatalogo();
  const [variantId, setVariantId] = useState<string | null>(parametros.get("variante"));

  const view = useMemo(
    () => catalogo.find((v) => v.variant.id === variantId) ?? null,
    [catalogo, variantId],
  );

  return (
    <>
      <PageHeader
        title="Entrada de estoque"
        onBack={() => (view ? setVariantId(null) : router.push("/estoque"))}
      />
      {view ? (
        <FormularioEntrada
          view={view}
          onTrocar={() => setVariantId(null)}
          onPronto={() => router.push("/estoque")}
        />
      ) : (
        <SeletorVariante catalogo={catalogo} onEscolher={setVariantId} />
      )}
    </>
  );
}
