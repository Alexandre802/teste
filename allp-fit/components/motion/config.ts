/**
 * Ajustes compartilhados de movimento.
 *
 * Regra que vale para todos os componentes animados: a marcação renderizada é
 * SEMPRE a mesma, com ou sem `prefers-reduced-motion`. Quem pede menos
 * movimento não recebe outra árvore de elementos — recebe as mesmas animações
 * com duração zero. Trocar a marcação conforme a preferência do visitante
 * quebra a hidratação, porque o servidor não sabe o que ele prefere.
 */

/** Curva usada no site inteiro. */
export const suave = [0.22, 1, 0.36, 1] as const;

/** Duração real, ou 0 para quem pediu menos movimento. */
export const dur = (semMovimento: boolean | null, valor: number) => (semMovimento ? 0 : valor);
