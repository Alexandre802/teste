"use client";

import { create } from "zustand";

import type { DeliveryZone } from "@/types";
import { deliveryZones } from "@/data/deliveryZones";

/**
 * Área de entrega em uso pelo site.
 *
 * Começa com a lista de data/deliveryZones.ts, que é o ponto de partida antes
 * de o banco existir. Quando o fluxo de caixa está no ar, /api/zonas devolve a
 * configuração real e ela substitui a lista — assim a taxa que o cliente vê é
 * exatamente a que o servidor cobra ao gravar o pedido.
 */

type EstadoZonas = {
  zonas: DeliveryZone[];
  carregado: boolean;
  carregar: () => Promise<void>;
};

export const useZonas = create<EstadoZonas>((set, get) => ({
  zonas: deliveryZones,
  carregado: false,

  carregar: async () => {
    if (get().carregado) return;
    try {
      const resposta = await fetch("/api/zonas", { cache: "no-store" });
      if (!resposta.ok) return;

      const corpo = (await resposta.json()) as {
        zonas: {
          cidade: string;
          bairro: string;
          fee_cents: number | null;
          pedido_minimo_cents: number | null;
          prazo_minutos: number | null;
        }[];
      };

      if (!corpo.zonas || corpo.zonas.length === 0) {
        set({ carregado: true });
        return;
      }

      // Uma zona por cidade, juntando as faixas de bairro.
      const porCidade = new Map<string, DeliveryZone>();
      for (const linha of corpo.zonas) {
        const atual = porCidade.get(linha.cidade) ?? {
          id: linha.cidade,
          cidade: linha.cidade,
          bairros: [],
          fee: null,
          pedidoMinimo: null,
          prazoMinutos: null,
        };

        if (linha.bairro) {
          atual.bairros.push(linha.bairro);
        } else {
          atual.fee = linha.fee_cents === null ? null : linha.fee_cents / 100;
          atual.pedidoMinimo =
            linha.pedido_minimo_cents === null
              ? null
              : linha.pedido_minimo_cents / 100;
          atual.prazoMinutos = linha.prazo_minutos;
        }
        porCidade.set(linha.cidade, atual);
      }

      set({ zonas: [...porCidade.values()], carregado: true });
    } catch {
      // Rede fora do ar: seguimos com a lista local em vez de travar a tela.
      set({ carregado: true });
    }
  },
}));

/** Cidades atendidas, já considerando o que veio do banco. */
export function cidadesEmUso(zonas: DeliveryZone[]): string[] {
  return zonas.map((zona) => zona.cidade);
}

/** Taxa da região segundo a configuração em uso. null = a combinar. */
export function taxaEmUso(
  zonas: DeliveryZone[],
  cidade: string,
  bairro: string,
): number | null {
  const alvo = bairro.trim().toLocaleLowerCase("pt-BR");
  const daCidade = zonas.filter((zona) => zona.cidade === cidade);
  const porBairro = daCidade.find((zona) =>
    zona.bairros.some((nome) => nome.toLocaleLowerCase("pt-BR") === alvo),
  );
  return (porBairro ?? daCidade[0])?.fee ?? null;
}
