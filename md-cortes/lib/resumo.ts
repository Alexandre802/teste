import { chaveDoDia, hojeEmSaoPaulo, inicioDaSemana, inicioDoMes, intervaloDeDias } from './date';
import type { Haircut } from './types';

export interface ResumoFuncionario {
  hojeCortes: number;
  hojeFaturamento: number;
  semanaCortes: number;
  semanaFaturamento: number;
  mesCortes: number;
  mesFaturamento: number;
}

const ZERO: ResumoFuncionario = {
  hojeCortes: 0,
  hojeFaturamento: 0,
  semanaCortes: 0,
  semanaFaturamento: 0,
  mesCortes: 0,
  mesFaturamento: 0,
};

/**
 * Fecha hoje / semana / mês de cada funcionário a partir da mesma lista que já
 * está na memória. Uma passada só, sem nenhuma volta ao banco: o painel do
 * Maicon mostra os três recortes dos dois funcionários com o custo de um laço.
 */
export function resumirPorFuncionario(
  cortes: Haircut[],
  dia = hojeEmSaoPaulo(),
): Map<string, ResumoFuncionario> {
  const daSemana = new Set(intervaloDeDias(inicioDaSemana(dia), dia));
  const doMes = new Set(intervaloDeDias(inicioDoMes(dia), dia));
  const mapa = new Map<string, ResumoFuncionario>();

  for (const corte of cortes) {
    const chave = chaveDoDia(corte.createdAt);
    const atual = mapa.get(corte.employeeId) ?? { ...ZERO };

    if (chave === dia) {
      atual.hojeCortes += 1;
      atual.hojeFaturamento += corte.price;
    }
    if (daSemana.has(chave)) {
      atual.semanaCortes += 1;
      atual.semanaFaturamento += corte.price;
    }
    if (doMes.has(chave)) {
      atual.mesCortes += 1;
      atual.mesFaturamento += corte.price;
    }
    mapa.set(corte.employeeId, atual);
  }

  return mapa;
}

export const RESUMO_ZERO = ZERO;
