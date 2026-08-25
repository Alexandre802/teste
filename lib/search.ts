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
 * O índice guarda os campos separados porque eles não valem a mesma coisa: um
 * termo no nome do produto diz muito mais do que o mesmo termo no rótulo da
 * espécie. Sem essa separação, "ração cachorro" trazia o porta-ração antes das
 * rações — os dois casam com as duas palavras, mas por motivos bem diferentes.
 */
type Entrada = {
  produto: Produto;
  nome: string;
  categoria: string;
  resto: string;
  tudo: string;
};

const indice: Entrada[] = produtos.map((produto) => {
  const nome = normalizar(`${produto.nome} ${produto.medida ?? ''}`);
  const categoria = normalizar(
    `${tituloDaCategoria.get(produto.categoria) ?? ''} ${produto.categoria.replace(/-/g, ' ')}`,
  );
  const resto = normalizar(
    [produto.marca, rotuloEspecie[produto.especie] ?? '', (produto.termos ?? []).join(' ')].join(' '),
  );
  return { produto, nome, categoria, resto, tudo: `${nome} ${categoria} ${resto}` };
});

/** Casa como palavra inteira: "gato" não deve casar dentro de "gatorade". */
function palavraInteira(texto: string, termo: string): boolean {
  const i = texto.indexOf(termo);
  if (i === -1) return false;
  const antes = i === 0 || !/[a-z0-9]/.test(texto[i - 1]);
  const depois = i + termo.length >= texto.length || !/[a-z0-9]/.test(texto[i + termo.length]);
  return antes && depois;
}

/** Quanto este termo pesa neste produto. Vale o campo mais forte, uma vez só. */
function peso(entrada: Entrada, termo: string): number {
  if (entrada.nome.startsWith(termo)) return 5;
  if (palavraInteira(entrada.nome, termo)) return 4;
  if (entrada.nome.includes(termo)) return 3;
  if (entrada.categoria.includes(termo)) return 2;
  if (entrada.resto.includes(termo)) return 1;
  return 0;
}

/**
 * Busca por todos os termos digitados (E, não OU): "racao cachorro" só traz
 * quem casa com as duas palavras. A ordem sai da soma dos pesos acima, com o
 * nome do produto como desempate.
 */
export function buscar(consulta: string, limite = 8): Produto[] {
  const termos = normalizar(consulta).split(/\s+/).filter(Boolean);
  if (termos.length === 0) return [];

  const achados: { entrada: Entrada; nota: number }[] = [];
  for (const entrada of indice) {
    let nota = 0;
    let casouTudo = true;
    for (const termo of termos) {
      const p = peso(entrada, termo);
      if (p === 0) {
        casouTudo = false;
        break;
      }
      nota += p;
    }
    if (casouTudo) achados.push({ entrada, nota });
  }

  achados.sort(
    (a, b) => b.nota - a.nota || a.entrada.produto.nome.localeCompare(b.entrada.produto.nome, 'pt-BR'),
  );
  return achados.slice(0, limite).map(({ entrada }) => entrada.produto);
}

/** Quantos produtos o termo encontra no catálogo inteiro. */
export function contarResultados(consulta: string): number {
  const termos = normalizar(consulta).split(/\s+/).filter(Boolean);
  if (termos.length === 0) return 0;
  return indice.filter((e) => termos.every((t) => e.tudo.includes(t))).length;
}

/**
 * Href da seção onde o produto está. A busca fica no cabeçalho, que aparece
 * também em /carrinho e /login — por isso o "/" na frente: sem ele, clicar num
 * resultado fora da home não levaria a lugar nenhum.
 */
export function ancoraDoProduto(produto: Produto): string {
  const secao = secoes.find((s) => s.categoria === produto.categoria);
  return `/#${secao ? secao.id : 'destaques'}`;
}
