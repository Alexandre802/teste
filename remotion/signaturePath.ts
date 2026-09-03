/**
 * Traço da assinatura e a geometria que prende a caneta a ele.
 *
 * O path é UMA curva contínua de propósito: `getPointAtLength` percorre
 * subpaths em sequência, mas entre um e outro a ponta saltaria no ar. Com um
 * traço só, a posição devolvida em qualquer comprimento é sempre um ponto por
 * onde a caneta realmente passou.
 */

export const SIGNATURE_VIEWBOX = { width: 520, height: 150 };

export const SIGNATURE_PATH =
  // Uma assinatura, não uma onda: a leitura vem da diferença de amplitude.
  // Abre com a haste alta do A (y 120 → 19), fecha o A pelo lado direito,
  // dá o laço de retorno na base e só então corre para a direita, cada vez
  // mais baixa, terminando num floreio curto. Laços de raio igual em
  // sequência — o erro da versão anterior — leem como mola.
  'M 26 120 ' +
  'C 36 74, 46 30, 63 19 ' +      // haste ascendente do A
  'C 78 11, 84 46, 71 84 ' +      // desce pelo lado direito
  'C 62 110, 68 126, 86 107 ' +   // laço de retorno na base
  'C 100 92, 110 60, 119 41 ' +   // segunda subida, mais curta
  'C 127 71, 131 97, 149 104 ' +  // desce e vira à direita
  'C 175 113, 207 100, 233 94 ' + // traço fluido
  'C 269 86, 305 92, 339 101 ' +  // ondulação ampla e baixa
  'C 373 110, 409 103, 457 89 ' + // segue caindo
  'C 476 84, 489 88, 498 97';     // floreio final

export type SignaturePoint = { x: number; y: number; angle: number };

/**
 * Amostra o traço em `samples` pontos igualmente espaçados por COMPRIMENTO
 * (não por parâmetro da curva), que é o que faz a ponta da caneta avançar em
 * velocidade constante em vez de acelerar nas curvas fechadas.
 *
 * Precisa do DOM: `getPointAtLength` é método de SVGGeometryElement. Só é
 * chamada dentro do Player, que o site monta apenas no cliente; ainda assim a
 * função devolve lista vazia no servidor em vez de estourar.
 */
export function sampleSignature(samples = 260): SignaturePoint[] {
  if (typeof document === 'undefined') return [];

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', SIGNATURE_PATH);

  const total = path.getTotalLength();
  if (!Number.isFinite(total) || total === 0) return [];

  const pontos: SignaturePoint[] = [];
  for (let i = 0; i < samples; i += 1) {
    const distancia = (total * i) / (samples - 1);
    const p = path.getPointAtLength(distancia);
    // tangente por diferença adiante, presa às pontas do traço
    const vizinho = path.getPointAtLength(Math.min(total, distancia + total / samples));
    pontos.push({
      x: p.x,
      y: p.y,
      angle: (Math.atan2(vizinho.y - p.y, vizinho.x - p.x) * 180) / Math.PI,
    });
  }
  return pontos;
}

/** Comprimento total do traço, usado no stroke-dasharray. */
export function signatureLength(): number {
  if (typeof document === 'undefined') return 1400;
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', SIGNATURE_PATH);
  const total = path.getTotalLength();
  return Number.isFinite(total) && total > 0 ? total : 1400;
}
