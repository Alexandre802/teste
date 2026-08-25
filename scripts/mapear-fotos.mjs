/**
 * Varre /public/produtos e escreve data/fotos.ts com o mapa id → caminho.
 *
 * Por que existe: o catálogo é importado pelo navegador, que não enxerga o
 * disco. Sem este mapa, cada foto nova exigiria editar `data/products.ts` à
 * mão. Com ele, basta salvar o arquivo com o nome do id do produto — por
 * exemplo `premier-formula-gatos-castrados-frango-15kg.webp` — que a foto
 * aparece no card sozinha.
 *
 * Roda automaticamente antes de `npm run dev` e `npm run build`.
 */
import { readdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const PASTA = path.join(process.cwd(), 'public', 'produtos');
const SAIDA = path.join(process.cwd(), 'data', 'fotos.ts');
const EXTENSOES = new Set(['.webp', '.avif', '.png', '.jpg', '.jpeg']);
/* ordem de preferência quando o mesmo produto tem mais de um formato */
const PESO = { '.avif': 0, '.webp': 1, '.png': 2, '.jpg': 3, '.jpeg': 4 };

const mapa = new Map();

if (existsSync(PASTA)) {
  const arquivos = await readdir(PASTA);
  for (const arquivo of arquivos.sort()) {
    const ext = path.extname(arquivo).toLowerCase();
    if (!EXTENSOES.has(ext)) continue;
    const id = path.basename(arquivo, path.extname(arquivo));
    const atual = mapa.get(id);
    if (atual && PESO[atual.ext] <= PESO[ext]) continue;
    mapa.set(id, { caminho: `/produtos/${arquivo}`, ext });
  }
}

const linhas = [...mapa.entries()]
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([id, { caminho }]) => `  ${JSON.stringify(id)}: ${JSON.stringify(caminho)},`);

const conteudo = `/* Gerado por scripts/mapear-fotos.mjs — não edite à mão.
   Para adicionar a foto de um produto, salve o arquivo em /public/produtos/
   com o nome igual ao id dele em data/products.ts. */

export const fotos: Record<string, string> = {
${linhas.join('\n')}
};
`;

await writeFile(SAIDA, conteudo, 'utf8');
console.log(`mapear-fotos: ${mapa.size} foto(s) em /public/produtos`);
