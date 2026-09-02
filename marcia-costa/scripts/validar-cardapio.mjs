import { readFileSync } from 'node:fs';
import { join } from 'node:path';
const menu = JSON.parse(readFileSync(join(process.cwd(),'data','menu-original.json'),'utf8'));
if (menu.categories.length !== 2) throw new Error('Quantidade de categorias inesperada');
if (menu.products.length !== 12) throw new Error('Quantidade de produtos inesperada');
const ids = new Set();
for (const p of menu.products) {
  if (ids.has(p.id)) throw new Error(`Produto duplicado: ${p.id}`);
  ids.add(p.id);
  if (!p.name || typeof p.price !== 'number' || p.price < 0) throw new Error(`Produto inválido: ${p.id}`);
  for (const g of p.options ?? []) {
    if (g.required && !g.choices?.length) throw new Error(`Grupo obrigatório vazio: ${p.id}/${g.id}`);
  }
}
console.log(`Cardápio validado: ${menu.categories.length} categorias, ${menu.products.length} produtos.`);
