"use client";

/**
 * Roteador por hash para o build de demonstração.
 *
 * O app de verdade usa o App Router do Next. A demonstração é um arquivo HTML
 * único, sem servidor, então as mesmas telas passam a ser resolvidas aqui —
 * pela mesma tabela de rotas, para nenhuma tela precisar mudar.
 */
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface Rota {
  caminho: string;
  parametros: Record<string, string>;
  busca: URLSearchParams;
}

const RotaContexto = createContext<Rota>({
  caminho: "/",
  parametros: {},
  busca: new URLSearchParams(),
});

/** "/estoque/:variantId" casa com "/estoque/abc" e devolve { variantId: "abc" }. */
export function casar(padrao: string, caminho: string): Record<string, string> | null {
  const p = padrao.split("/").filter(Boolean);
  const c = caminho.split("/").filter(Boolean);
  if (p.length !== c.length) return null;
  const parametros: Record<string, string> = {};
  for (let i = 0; i < p.length; i += 1) {
    const parte = p[i] as string;
    const valor = c[i] as string;
    if (parte.startsWith(":")) parametros[parte.slice(1)] = decodeURIComponent(valor);
    else if (parte !== valor) return null;
  }
  return parametros;
}

function lerHash(): { caminho: string; busca: URLSearchParams } {
  const bruto = window.location.hash.replace(/^#/, "") || "/";
  const [caminho, consulta] = bruto.split("?");
  return { caminho: caminho || "/", busca: new URLSearchParams(consulta ?? "") };
}

export function Roteador({ rotas, children }: { rotas: string[]; children: ReactNode }) {
  const [estado, setEstado] = useState(() =>
    typeof window === "undefined" ? { caminho: "/", busca: new URLSearchParams() } : lerHash(),
  );

  useEffect(() => {
    const aoMudar = () => setEstado(lerHash());
    window.addEventListener("hashchange", aoMudar);
    return () => window.removeEventListener("hashchange", aoMudar);
  }, []);

  // Sem memoização: são poucas rotas e a comparação é de strings.
  let valor: Rota = { caminho: estado.caminho, parametros: {}, busca: estado.busca };
  for (const rota of rotas) {
    const parametros = casar(rota, estado.caminho);
    if (parametros) {
      valor = { caminho: estado.caminho, parametros, busca: estado.busca };
      break;
    }
  }

  return <RotaContexto.Provider value={valor}>{children}</RotaContexto.Provider>;
}

export function useRota() {
  return useContext(RotaContexto);
}

export function navegar(destino: string, substituir = false) {
  const alvo = `#${destino.startsWith("/") ? destino : `/${destino}`}`;
  if (substituir) window.location.replace(alvo);
  else window.location.hash = alvo;
  window.scrollTo({ top: 0 });
}
