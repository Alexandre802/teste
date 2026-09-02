"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

function assinar(aoMudar: () => void) {
  window.addEventListener("online", aoMudar);
  window.addEventListener("offline", aoMudar);
  return () => {
    window.removeEventListener("online", aoMudar);
    window.removeEventListener("offline", aoMudar);
  };
}

const noNavegador = () => navigator.onLine;
// No servidor não há como saber, e assumir "online" evita um piscar de
// "Offline" na primeira pintura de quem está perfeitamente conectado.
const noServidor = () => true;

/**
 * Bolinha de conexão no topo do painel. Verde online, cinza offline.
 * Quando a conexão volta depois de ter caído, a página recarrega para
 * sincronizar o que mudou enquanto o aparelho estava fora do ar.
 */
export function IndicadorConexao() {
  const online = useSyncExternalStore(assinar, noNavegador, noServidor);
  const caiu = useRef(false);

  useEffect(() => {
    if (!online) {
      caiu.current = true;
      return;
    }
    if (caiu.current) {
      caiu.current = false;
      window.location.reload();
    }
  }, [online]);

  return (
    <span
      className="inline-flex items-center gap-1.5 text-[12px] font-semibold"
      aria-live="polite"
    >
      <span
        aria-hidden="true"
        className={`h-2 w-2 rounded-full ${
          online ? "bg-verde-positivo" : "bg-tinta-suave"
        }`}
      />
      <span className={online ? "text-verde-positivo" : "text-tinta-suave"}>
        {online ? "Online" : "Offline"}
      </span>
    </span>
  );
}
