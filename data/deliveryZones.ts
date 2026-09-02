import type { DeliveryZone } from "@/types";

/**
 * AREA DE ENTREGA E TAXAS
 * ---------------------------------------------------------------------------
 * As duas cidades atendidas estao confirmadas nas pecas da propria casa.
 * A TAXA, o PEDIDO MINIMO e o PRAZO ainda nao foram confirmados pela Marcia,
 * entao continuam `null`.
 *
 * Enquanto a taxa for null o site NAO mostra numero nenhum: escreve
 * "a combinar no WhatsApp" no resumo, soma apenas o subtotal no total e diz
 * isso na mensagem enviada. Nunca cobre um valor que ninguem confirmou.
 *
 * Para ligar a cobranca, preencha `fee` em reais. Para taxa por bairro, crie
 * uma zona por faixa e liste os bairros em `bairros`.
 */

export const deliveryZones: DeliveryZone[] = [
  {
    id: "jacarei",
    cidade: "Jacareí - SP",
    bairros: [],
    fee: null,
    pedidoMinimo: null,
    prazoMinutos: null,
  },
  {
    id: "sao-jose-dos-campos",
    cidade: "São José dos Campos - SP",
    bairros: [],
    fee: null,
    pedidoMinimo: null,
    prazoMinutos: null,
  },
];

export const cidadesAtendidas = deliveryZones.map((zona) => zona.cidade);

/** Zona da cidade escolhida, ou undefined se a cidade nao for atendida. */
export function zonaPorCidade(cidade: string): DeliveryZone | undefined {
  return deliveryZones.find((zona) => zona.cidade === cidade);
}

/**
 * Zona que atende o bairro dentro da cidade. Cai na zona da cidade quando
 * nenhuma faixa de bairro foi cadastrada.
 */
export function zonaPorEndereco(
  cidade: string,
  bairro: string,
): DeliveryZone | undefined {
  const alvo = bairro.trim().toLocaleLowerCase("pt-BR");
  const porBairro = deliveryZones.find(
    (zona) =>
      zona.cidade === cidade &&
      zona.bairros.some((nome) => nome.toLocaleLowerCase("pt-BR") === alvo),
  );
  return porBairro ?? zonaPorCidade(cidade);
}

/** Taxa da regiao, ou null enquanto a casa nao confirmar. */
export function taxaDeEntrega(cidade: string, bairro: string): number | null {
  return zonaPorEndereco(cidade, bairro)?.fee ?? null;
}

/** true quando alguma zona ja tem taxa confirmada. */
export const temTaxaConfirmada = deliveryZones.some((zona) => zona.fee !== null);
