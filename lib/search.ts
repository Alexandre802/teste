import { produtos, type Produto } from '@/data/products';
import { secoes } from '@/data/sections';

/** Tira acento e caixa: quem digita "racao" acha "Ração". */
function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

const rotuloEspecie: Record<string, string> = {
  cachorro: 'cachorro cachorros cao caes dog',
  gato: 'gato gatos felino gatinho cat',
  peixes: 'peixe peixes aquario aquarismo',
  aves: 'ave aves passaro passaros gaiola',
  coelhos: 'coelho coelhos roedor roedores hamster',
  repteis: 'reptil repteis tartaruga terrario',
  todos: 'cachorro gato pet',
};

const tituloDaCategoria = new Map(secoes.map((s) => [s.categoria, s.titulo]));

/**
 * Um só texto por produto, com tudo que a busca precisa reconhecer: nome,
 * marca, medida, categoria, espécie e os termos extras do catálogo. Montado
 * uma vez, no carregamento do módulo.
 */
const indice: { produto: Produto; texto: string }[] = produtos.map((produto) => ({
  produto,
  texto: normalizar(
    [
      produto.nome,
      produto.marca,
      produto.medida ?? '',
      tituloDaCategoria.get(produto.categoria) ?? produto.categoria,
      produto.categoria.replace(/-/g, ' '),
      rotuloEspecie[produto.especie] ?? '',
      (produto.termos ?? []).join(' '),
    ].join(' '),
  ),
}));

/**
 * Busca por todos os termos digitados (E, não OU): "racao cachorro" só traz
 * quem casa com as duas palavras. Ordena quem bate no começo do nome primeiro.
 */
export function buscar(consulta: string, limite = 8): Produto[] {
  const termos = normalizar(consulta).split(/\s+/).filter(Boolean);
  if (termos.length === 0) return [];

  const achados = indice.filter(({ texto }) => termos.every((t) => texto.includes(t)));

  const primeiro = termos[0];
  achados.sort((a, b) => {
    const aComeca = normalizar(a.produto.nome).includes(primeiro) ? 0 : 1;
    const bComeca = normalizar(b.produto.nome).includes(primeiro) ? 0 : 1;
    if (aComeca !== bComeca) return aComeca - bComeca;
    return a.produto.nome.localeCompare(b.produto.nome, 'pt-BR');
  });

  return achados.slice(0, limite).map(({ produto }) => produto);
}

/** Quantos produtos o termo encontra no catálogo inteiro. */
export function contarResultados(consulta: string): number {
  const termos = normalizar(consulta).split(/\s+/).filter(Boolean);
  if (termos.length === 0) return 0;
  return indice.filter(({ texto }) => termos.every((t) => texto.includes(t))).length;
}

/** Âncora da seção onde o produto está, para a busca poder levar até ele. */
export function ancoraDoProduto(produto: Produto): string {
  const secao = secoes.find((s) => s.categoria === produto.categoria);
  return secao ? `#${secao.id}` : '#destaques';
}
