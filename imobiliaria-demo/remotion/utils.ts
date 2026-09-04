import { HERO_DURATION_IN_FRAMES } from './constants';

export const limitar = (valor: number, minimo = 0, maximo = 1) =>
  valor < minimo ? minimo : valor > maximo ? maximo : valor;

/**
 * Converte o progresso do scroll (0 a 1) no quadro correspondente.
 *
 * A conversão é LINEAR de propósito: qualquer easing aqui mudaria a ordem
 * temporal dos quadros e, com ela, o ritmo do movimento gravado no vídeo.
 */
export const progressoParaQuadro = (progresso: number) =>
  Math.round(limitar(progresso) * (HERO_DURATION_IN_FRAMES - 1));

/** Normaliza um valor dentro de uma faixa: fora dela vira 0 ou 1. */
export const faixa = (valor: number, inicio: number, fim: number) =>
  fim === inicio ? (valor >= fim ? 1 : 0) : limitar((valor - inicio) / (fim - inicio));

/** Easing só para a interface (texto, botões) — nunca para a câmera. */
export const suavizarSaida = (t: number) => 1 - Math.pow(1 - limitar(t), 3);
