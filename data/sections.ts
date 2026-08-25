import type { CategoriaId } from './products';

/**
 * As seções de produtos da home, na ordem em que aparecem. Cada uma tem a sua
 * própria âncora — é para cá que apontam as categorias por espécie, os cards de
 * departamento e o menu lateral.
 *
 * `ancoraEspecie` cria um segundo alvo de rolagem na mesma seção, para que
 * `#cachorros` e `#gatos` levem à primeira seção daquela espécie.
 */
export type SecaoProdutos = {
  id: string;
  titulo: string;
  categoria: CategoriaId;
  ancoraEspecie?: string;
  /** frase curta sob o título, quando ajuda o cliente a se localizar */
  legenda?: string;
};

export const secoes: SecaoProdutos[] = [
  {
    id: 'racao-cachorro',
    titulo: 'Rações para Cachorros',
    categoria: 'racao-cachorro',
    ancoraEspecie: 'cachorros',
    legenda: 'Super premium, premium e linhas do dia a dia',
  },
  {
    id: 'racao-gato',
    titulo: 'Rações para Gatos',
    categoria: 'racao-gato',
    ancoraEspecie: 'gatos',
    legenda: 'Secas e sachês, incluindo linhas para castrados',
  },
  { id: 'petiscos-cachorro', titulo: 'Petiscos para Cachorros', categoria: 'petisco-cachorro' },
  { id: 'petiscos-gato', titulo: 'Petiscos para Gatos', categoria: 'petisco-gato' },
  { id: 'brinquedos-cachorro', titulo: 'Brinquedos para Cachorros', categoria: 'brinquedo-cachorro' },
  { id: 'brinquedos-gato', titulo: 'Brinquedos para Gatos', categoria: 'brinquedo-gato' },
  { id: 'higiene-cachorro', titulo: 'Higiene para Cachorros', categoria: 'higiene-cachorro' },
  { id: 'higiene-gato', titulo: 'Higiene para Gatos', categoria: 'higiene-gato' },
  { id: 'coleiras', titulo: 'Coleiras e Guias', categoria: 'coleiras' },
  { id: 'camas', titulo: 'Camas e Acessórios', categoria: 'camas' },
  { id: 'peixes', titulo: 'Produtos para Peixes', categoria: 'peixes', ancoraEspecie: 'peixes-especie' },
  { id: 'aves', titulo: 'Produtos para Aves e Pássaros', categoria: 'aves', ancoraEspecie: 'aves-especie' },
  { id: 'coelhos', titulo: 'Produtos para Coelhos', categoria: 'coelhos', ancoraEspecie: 'coelhos-especie' },
  { id: 'repteis', titulo: 'Produtos para Répteis', categoria: 'repteis', ancoraEspecie: 'repteis-especie' },
  { id: 'saude', titulo: 'Saúde e Farmácia', categoria: 'saude' },
];
