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
  // A altura de cada laço varia de propósito: laços de mesmo raio em
  // sequência leem como mola, não como letra.
  'M 24 120 ' +
  'C 34 70, 52 22, 72 26 ' +
  'C 88 30, 80 74, 70 104 ' +
  'C 64 122, 74 128, 86 116 ' +
  'C 100 100, 106 72, 118 60 ' +
  'C 128 50, 132 62, 126 80 ' +
  'C 120 98, 128 112, 142 108 ' +
  'C 158 103, 166 78, 178 66 ' +
  'C 186 58, 190 70, 186 86 ' +
  'C 182 102, 194 112, 210 104 ' +
  'C 228 95, 236 62, 252 48 ' +
  'C 264 38, 270 52, 264 74 ' +
  'C 258 96, 268 110, 286 106 ' +
  'C 306 101, 318 84, 332 78 ' +
  'C 346 72, 352 86, 344 96 ' +
  'C 336 106, 348 110, 366 104 ' +
  'C 400 93, 448 96, 480 110 ' +
  'C 490 114, 496 110, 500 100';

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
