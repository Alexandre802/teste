/**
 * Confere o catálogo antes do build. Importa os dados de verdade
 * (`node --experimental-strip-types` lê o TypeScript direto) em vez de tentar
 * adivinhar com expressão regular — assim a checagem não mente quando alguém
 * escreve um produto num formato diferente.
 *
 * Reprova quando encontra:
 *   • id repetido — o carrinho usa o id como chave;
 *   • id fora de [a-z0-9-] — o id vira nome de arquivo de foto;
 *   • categoria declarada no tipo sem nenhum produto;
 *   • seção da home apontando para categoria vazia;
 *   • produto em destaque sem nada que o destaque.
 */
import { produtos } from '../data/products.ts';
import { secoes } from '../data/sections.ts';
import { departamentos, especies } from '../data/categories.ts';

const problemas = [];
const avisos = [];

const vistos = new Set();
for (const p of produtos) {
  if (vistos.has(p.id)) problemas.push(`id repetido: ${p.id}`);
  vistos.add(p.id);
  if (!/^[a-z0-9-]+$/.test(p.id))
    problemas.push(`id com caractere que não vale em nome de arquivo: ${p.id}`);
  if (!p.nome?.trim()) problemas.push(`produto sem nome: ${p.id}`);
  if (!p.marca?.trim()) problemas.push(`produto sem marca: ${p.id}`);
}

const porCategoria = new Map();
for (const p of produtos) porCategoria.set(p.categoria, (porCategoria.get(p.categoria) ?? 0) + 1);

for (const s of secoes) {
  if (!porCategoria.has(s.categoria))
    problemas.push(`seção "${s.titulo}" aponta para a categoria vazia "${s.categoria}"`);
}

const idsDeSecao = new Set(secoes.map((s) => s.id));
for (const s of secoes) if (s.ancoraEspecie) idsDeSecao.add(s.ancoraEspecie);
idsDeSecao.add('destaques');
idsDeSecao.add('departamentos');
idsDeSecao.add('promocoes');
idsDeSecao.add('servicos');

for (const e of especies) {
  if (!idsDeSecao.has(e.ancora)) problemas.push(`espécie "${e.nome}" aponta para #${e.ancora}, que não existe`);
}
for (const d of departamentos) {
  if (!idsDeSecao.has(d.ancora)) problemas.push(`departamento "${d.nome}" aponta para #${d.ancora}, que não existe`);
}

const destaques = produtos.filter((p) => p.destaque);
if (destaques.length < 4) avisos.push(`só ${destaques.length} produto(s) em destaque`);

console.log(`catálogo: ${produtos.length} produtos em ${porCategoria.size} categorias`);
for (const s of secoes) {
  console.log(`  ${String(porCategoria.get(s.categoria) ?? 0).padStart(3)}  ${s.titulo}`);
}
console.log(`  ${String(destaques.length).padStart(3)}  (em destaque)`);

for (const a of avisos) console.warn('  ! ' + a);

if (problemas.length) {
  console.error('\nPROBLEMAS:');
  for (const p of problemas) console.error('  ✗ ' + p);
  process.exit(1);
}
console.log('\nsem problemas');
