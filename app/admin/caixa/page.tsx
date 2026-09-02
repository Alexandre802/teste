import { PainelCaixa } from "@/components/admin/PainelCaixa";
import {
  buscarCaixaAberto,
  buscarCaixasFechados,
  buscarResumoCaixa,
} from "@/lib/admin/consultas";

export const dynamic = "force-dynamic";

export default async function PaginaCaixa() {
  const aberto = await buscarCaixaAberto();
  const [resumo, fechados] = await Promise.all([
    aberto ? buscarResumoCaixa(aberto.id) : Promise.resolve(null),
    buscarCaixasFechados(),
  ]);

  return (
    <div className="space-y-5">
      <header>
        <h1 className="fonte-titulo text-2xl font-extrabold text-tinta">
          Caixa
        </h1>
        <p className="mt-0.5 text-sm text-tinta-media">
          Abertura, sangria, suprimento e conferência da gaveta
        </p>
      </header>

      <PainelCaixa sessao={aberto} resumo={resumo} fechados={fechados} />
    </div>
  );
}
