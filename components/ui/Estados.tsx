import type { ReactNode } from "react";
import { AlertCircle, Info, PackageOpen } from "lucide-react";

/** Lista sem nada para mostrar. */
export function EstadoVazio({
  titulo,
  descricao,
  acao,
}: {
  titulo: string;
  descricao: string;
  acao?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-bloco border border-dashed border-borda bg-nevoa px-6 py-12 text-center">
      <PackageOpen className="h-9 w-9 text-tinta-suave" aria-hidden="true" />
      <p className="fonte-titulo mt-4 text-lg font-bold text-tinta">{titulo}</p>
      <p className="mt-1 max-w-sm text-sm text-tinta-media">{descricao}</p>
      {acao && <div className="mt-5">{acao}</div>}
    </div>
  );
}

/** Algo deu errado e o cliente precisa saber, sem jargao. */
export function EstadoErro({ mensagem }: { mensagem: string }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-carta border border-vermelho/25 bg-vermelho/5 px-4 py-3"
    >
      <AlertCircle
        className="mt-0.5 h-5 w-5 shrink-0 text-vermelho"
        aria-hidden="true"
      />
      <p className="text-sm text-vermelho">{mensagem}</p>
    </div>
  );
}

/** Aviso honesto: algo ainda nao foi confirmado pela casa. */
export function AvisoInformativo({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-carta border border-laranja/25 bg-creme px-4 py-3">
      <Info
        className="mt-0.5 h-5 w-5 shrink-0 text-laranja-queimado"
        aria-hidden="true"
      />
      <p className="text-sm text-laranja-queimado">{children}</p>
    </div>
  );
}

/** Esqueleto de carregamento com a forma do card do cardapio. */
export function EsqueletoProduto() {
  return (
    <div className="flex gap-4 rounded-bloco border border-borda bg-white p-3">
      <div className="h-[92px] w-[112px] shrink-0 animate-pulse rounded-carta bg-nevoa" />
      <div className="flex-1 space-y-2 py-1">
        <div className="h-4 w-2/3 animate-pulse rounded bg-nevoa" />
        <div className="h-3 w-full animate-pulse rounded bg-nevoa" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-nevoa" />
      </div>
    </div>
  );
}
