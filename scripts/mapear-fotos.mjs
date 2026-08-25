/**
 * Varre /public/produtos e /public/ilustracoes e escreve data/fotos.ts com os
 * dois mapas id → caminho.
 *
 * Por que existe: o catálogo é importado pelo navegador, que não enxerga o
 * disco. Sem este mapa, cada foto nova exigiria editar `data/products.ts` à
 * mão. Com ele, basta salvar o arquivo com o nome do id do produto — por
 * exemplo `premier-formula-gatos-castrados-frango-15kg.webp` — que a imagem
 * aparece no card sozinha.
 *
 * São dois mapas porque a precedência importa: a foto real do produto sempre
 * ganha da ilustração da casa. Para trocar uma ilustração por foto de verdade,
 * basta soltar o arquivo em /public/produtos — não é preciso apagar nada.
 *
 * Roda automaticamente antes de `npm run dev` e `npm run build`.
 */
import { readdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const EXTENSOES = new Set(['.webp', '.avif', '.png', '.jpg', '.jpeg']);
/* ordem de preferência quando o mesmo produto tem mais de um formato */
const PESO = { '.avif': 0, '.webp': 1, '.png': 2, '.jpg': 3, '.jpeg': 4 };

async function varrer(pasta, prefixoUrl) {
  const raiz = path.join(process.cwd(), 'public', pasta);
  const mapa = new Map();
  if (!existsSync(raiz)) return mapa;

  for (const arquivo of (await readdir(raiz)).sort()) {
    const ext = path.extname(arquivo).toLowerCase();
    if (!EXTENSOES.has(ext)) continue;
    const id = path.basename(arquivo, path.extname(arquivo));
    const atual = mapa.get(id);
    if (atual && PESO[atual.ext] <= PESO[ext]) continue;
    mapa.set(id, { caminho: `${prefixoUrl}/${arquivo}`, ext });
  }
  return mapa;
}

function emObjeto(mapa) {
  return [...mapa.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([id, { caminho }]) => `  ${JSON.stringify(id)}: ${JSON.stringify(caminho)},`)
    .join('\n');
}

const fotos = await varrer('produtos', '/produtos');
const ilustracoes = await varrer('ilustracoes', '/ilustracoes');

const conteudo = `/* Gerado por scripts/mapear-fotos.mjs — não edite à mão.

   fotos       fotografia real do produto, em /public/produtos
   ilustracoes desenho da casa, em /public/ilustracoes (npm run ilustracoes)

   A foto real tem precedência sobre a ilustração. Para adicionar a foto de um
   produto, salve o arquivo em /public/produtos/ com o nome igual ao id dele em
   data/products.ts. */

export const fotos: Record<string, string> = {
${emObjeto(fotos)}
};

export const ilustracoes: Record<string, string> = {
${emObjeto(ilustracoes)}
};
`;

await writeFile(path.join(process.cwd(), 'data', 'fotos.ts'), conteudo, 'utf8');
console.log(`mapear-fotos: ${fotos.size} foto(s) real(is), ${ilustracoes.size} ilustração(ões)`);
