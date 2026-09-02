import type { ReactNode } from "react";
import { AlertTriangle, Inbox } from "lucide-react";

/** Lista sem nada. Nunca deixamos a tela em branco sem explicar. */
export function PainelVazio({
  titulo,
  descricao,
  acao,
}: {
  titulo: string;
  descricao?: string;
  acao?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-bloco border border-dashed border-borda bg-white px-6 py-12 text-center">
      <Inbox className="h-8 w-8 text-tinta-suave" aria-hidden="true" />
      <p className="fonte-titulo mt-3 text-[16px] font-bold text-tinta">
        {titulo}
      </p>
      {descricao && (
        <p className="mt-1 max-w-sm text-sm text-tinta-media">{descricao}</p>
      )}
      {acao && <div className="mt-5">{acao}</div>}
    </div>
  );
}

/** Algo falhou ao carregar. Diz o que aconteceu, sem despejar erro técnico. */
export function PainelErro({ mensagem }: { mensagem: string }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-bloco border border-vermelho/25 bg-vermelho/5 px-4 py-4"
    >
      <AlertTriangle
        className="mt-0.5 h-5 w-5 shrink-0 text-vermelho"
        aria-hidden="true"
      />
      <div>
        <p className="text-sm font-semibold text-vermelho">
          Não conseguimos carregar estes dados.
        </p>
        <p className="mt-1 text-[13px] text-vermelho/90">{mensagem}</p>
      </div>
    </div>
  );
}

/** Esqueleto enquanto o servidor responde. */
export function EsqueletoCards({ quantidade = 4 }: { quantidade?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {Array.from({ length: quantidade }).map((_, indice) => (
        <div
          key={indice}
          className="h-28 animate-pulse rounded-bloco border border-borda bg-white"
        />
      ))}
    </div>
  );
}

export function EsqueletoLista({ linhas = 5 }: { linhas?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: linhas }).map((_, indice) => (
        <div
          key={indice}
          className="h-16 animate-pulse rounded-carta border border-borda bg-white"
        />
      ))}
    </div>
  );
}
