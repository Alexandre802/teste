/**
 * AVALIACOES DA COMIDA CASEIRA DA MARCIA COSTA
 * ---------------------------------------------------------------------------
 * Avaliacao inventada e propaganda enganosa. Aqui so entra depoimento que a
 * casa realmente recebeu, com o nome de quem escreveu.
 *
 * A lista comeca VAZIA de proposito. Enquanto estiver assim, a secao de
 * avaliacoes mostra a animacao da marca e convida o cliente a avaliar, em vez
 * de exibir elogio que ninguem escreveu.
 *
 * COMO ADICIONAR: copie o texto exato da avaliacao (Google, iFood, Instagram,
 * WhatsApp) e preencha um item:
 *
 *   {
 *     id: "maria-2026-08",
 *     nome: "Maria S.",
 *     nota: 5,
 *     texto: "Marmita muito bem servida e chegou quentinha.",
 *     origem: "Google",
 *     data: "2026-08-14",
 *   }
 */

export type Avaliacao = {
  id: string;
  /** Nome de quem avaliou, do jeito que a pessoa publicou. */
  nome: string;
  /** De 1 a 5. */
  nota: 1 | 2 | 3 | 4 | 5;
  texto: string;
  /** Onde a avaliacao foi publicada: Google, iFood, Instagram... */
  origem: string;
  /** AAAA-MM-DD. */
  data: string;
};

export const avaliacoes: Avaliacao[] = [];

/** Media das notas, ou null quando ainda nao ha avaliacao publicada. */
export function mediaDasNotas(): number | null {
  if (avaliacoes.length === 0) return null;
  const soma = avaliacoes.reduce((total, item) => total + item.nota, 0);
  return Math.round((soma / avaliacoes.length) * 10) / 10;
}

export const temAvaliacoes = avaliacoes.length > 0;
