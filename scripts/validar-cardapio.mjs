import { readFileSync } from 'node:fs';
import { join } from 'node:path';
const menu = JSON.parse(readFileSync(join(process.cwd(),'data','menu-original.json'),'utf8'));
if (menu.categories.length !== 2) throw new Error('Quantidade de categorias inesperada');
const disponiveis = menu.products.filter((produto) => produto.available !== false);
if (disponiveis.length !== 13) throw new Error(`Quantidade de produtos disponíveis inesperada: ${disponiveis.length}`);
const nomesEsperados = [
  'Bife a Cavalo',
  'Bife Acebolado',
  'Feijoada',
  'File de Frango Grelhado',
  'File de Frango Parmegiana',
  'Filé de Frango Milanesa',
  'Omelete',
  'Panqueca de Carne',
  'Coca Cola Mini',
  'Coca Cola Lata',
  'Fanta Laranja 2L',
  'Frutuba 2L',
  'coca cola normal 2L',
];
for (const nome of nomesEsperados) {
  if (!disponiveis.some((produto) => produto.name === nome)) {
    throw new Error(`Produto oficial ausente: ${nome}`);
  }
}
const ids = new Set();
for (const p of menu.products) {
  if (ids.has(p.id)) throw new Error(`Produto duplicado: ${p.id}`);
  ids.add(p.id);
  if (!p.name || typeof p.price !== 'number' || p.price < 0) throw new Error(`Produto inválido: ${p.id}`);
  for (const g of p.options ?? []) {
    if (g.required && !g.choices?.length) throw new Error(`Grupo obrigatório vazio: ${p.id}/${g.id}`);
  }
}
console.log(`Cardápio validado: ${menu.categories.length} categorias, ${disponiveis.length} produtos disponíveis e ${menu.products.length - disponiveis.length} histórico(s).`);
