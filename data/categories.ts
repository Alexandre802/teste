/**
 * Espécies e departamentos. Cada item aponta para a âncora de uma seção real
 * da home — se você criar ou renomear uma seção em `data/sections.ts`, ajuste
 * a âncora aqui também.
 */

export type IconeKey =
  | 'cachorro'
  | 'gato'
  | 'peixe'
  | 'ave'
  | 'coelho'
  | 'reptil'
  | 'racao'
  | 'sache'
  | 'petisco'
  | 'tapete'
  | 'brinquedo'
  | 'coleira'
  | 'cama'
  | 'higiene'
  | 'saude';

export type Especie = 'cachorro' | 'gato' | 'peixes' | 'aves' | 'coelhos' | 'repteis';

export type EspecieCategoria = {
  id: Especie;
  nome: string;
  icone: IconeKey;
  /** id da seção de destino — vire href com `paraSecao` */
  ancora: string;
};

/** A fileira de ícones redondos logo abaixo da faixa de benefícios. */
export const especies: EspecieCategoria[] = [
  { id: 'cachorro', nome: 'Cachorro', icone: 'cachorro', ancora: 'cachorros' },
  { id: 'gato', nome: 'Gato', icone: 'gato', ancora: 'gatos' },
  { id: 'peixes', nome: 'Peixes', icone: 'peixe', ancora: 'peixes' },
  { id: 'aves', nome: 'Aves', icone: 'ave', ancora: 'aves' },
  { id: 'coelhos', nome: 'Coelhos', icone: 'coelho', ancora: 'coelhos' },
  { id: 'repteis', nome: 'Répteis', icone: 'reptil', ancora: 'repteis' },
];

export type Departamento = {
  nome: string;
  icone: IconeKey;
  /** id da seção de destino — vire href com `paraSecao` */
  ancora: string;
};

/** Cards de "Departamentos populares". */
export const departamentos: Departamento[] = [
  { nome: 'Rações para Cachorros', icone: 'racao', ancora: 'racao-cachorro' },
  { nome: 'Rações para Gatos', icone: 'racao', ancora: 'racao-gato' },
  { nome: 'Sachês para Gatos', icone: 'sache', ancora: 'racao-gato' },
  { nome: 'Petiscos para Cachorros', icone: 'petisco', ancora: 'petiscos-cachorro' },
  { nome: 'Petiscos para Gatos', icone: 'petisco', ancora: 'petiscos-gato' },
  { nome: 'Tapetes Higiênicos', icone: 'tapete', ancora: 'higiene-cachorro' },
  { nome: 'Brinquedos', icone: 'brinquedo', ancora: 'brinquedos-cachorro' },
  { nome: 'Coleiras e Guias', icone: 'coleira', ancora: 'coleiras' },
  { nome: 'Camas e Acessórios', icone: 'cama', ancora: 'camas' },
  { nome: 'Higiene e Limpeza', icone: 'higiene', ancora: 'higiene-gato' },
  { nome: 'Saúde e Farmácia', icone: 'saude', ancora: 'saude' },
  { nome: 'Produtos para Peixes', icone: 'peixe', ancora: 'peixes' },
  { nome: 'Produtos para Aves', icone: 'ave', ancora: 'aves' },
];

/**
 * Href de uma seção da home. O "/" na frente importa: o rodapé e o menu
 * aparecem em /carrinho e /login também, e ali um "#racao-cachorro" sozinho
 * não leva a lugar nenhum — precisa voltar para a home antes de rolar.
 */
export function paraSecao(id: string): string {
  return `/#${id}`;
}
