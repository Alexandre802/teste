#!/usr/bin/env node
/**
 * Empacota os woff2 da Poppins como data: URI dentro de src/lib/poppinsCss.ts.
 *
 * Motivo: carregar a fonte por HTTP durante o render cria uma dependência do
 * servidor de arquivos estáticos do Remotion — em renders longos, uma aba nova
 * pode ficar presa esperando o arquivo e derrubar o job por timeout de
 * delayRender(). Embutida (≈40 KB no total), a fonte está disponível sem
 * nenhuma requisição.
 *
 * Uso:  node tools/inline-fonts.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";

const WEIGHTS = [400, 500, 600, 700, 800];

const faces = WEIGHTS.map((weight) => {
  const file = `public/fonts/poppins-latin-${weight}-normal.woff2`;
  const b64 = readFileSync(file).toString("base64");
  return `@font-face {
  font-family: 'Poppins';
  font-style: normal;
  font-weight: ${weight};
  font-display: block;
  src: url(data:font/woff2;base64,${b64}) format('woff2');
}`;
}).join("\n");

const out = `/**
 * ARQUIVO GERADO — não edite à mão.
 * Gere novamente com: node tools/inline-fonts.mjs
 *
 * Poppins (latin) embutida como data: URI para o render não depender de
 * requisições HTTP ao servidor de arquivos estáticos.
 */

export const POPPINS_CSS = \`
${faces}
\`;
`;

writeFileSync("src/lib/poppinsCss.ts", out);
console.log(`src/lib/poppinsCss.ts gerado (${(out.length / 1024).toFixed(0)} KB, pesos ${WEIGHTS.join("/")})`);
