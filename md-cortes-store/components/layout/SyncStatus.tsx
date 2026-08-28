"use client";

import { Check, CloudOff, RefreshCw, TriangleAlert } from "lucide-react";
import { useStore } from "@/lib/store";

/**
 * Estado da sincronização, sempre visível.
 *
 * Vale por si: se uma venda ainda não subiu, Maicon precisa saber disso sem
 * ter que procurar — e precisa saber que ela não se perdeu.
 */
export function SyncStatus({ compacto = false }: { compacto?: boolean }) {
  const estado = useStore((s) => s.syncState);
  const pendentes = useStore((s) => s.outbox.length);
  const online = useStore((s) => s.online);

  const { icone, texto, cor } = (() => {
    if (pendentes > 0) {
      return {
        icone: <CloudOff size={14} />,
        texto: `${pendentes} aguardando sincronização`,
        cor: "bg-laranja-suave text-laranja",
      };
    }
    if (!online) {
      return { icone: <CloudOff size={14} />, texto: "Sem conexão", cor: "bg-areia text-cinza" };
    }
    if (estado === "sincronizando") {
      return {
        icone: <RefreshCw size={14} className="animate-spin" />,
        texto: "Sincronizando",
        cor: "bg-azul-suave text-azul",
      };
    }
    if (estado === "erro") {
      return {
        icone: <TriangleAlert size={14} />,
        texto: "Falha ao sincronizar",
        cor: "bg-vermelho-suave text-vermelho",
      };
    }
    return { icone: <Check size={14} />, texto: "Sincronizado", cor: "bg-verde-suave text-verde" };
  })();

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-[12px] font-semibold ${cor}`}
      title={texto}
    >
      {icone}
      {compacto ? null : texto}
    </span>
  );
}
