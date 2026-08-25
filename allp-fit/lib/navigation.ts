/** Âncoras do site — usadas no menu, no rodapé e no sitemap. */
export type Secao = { id: string; rotulo: string };

export const menu: Secao[] = [
  { id: 'inicio', rotulo: 'Início' },
  { id: 'sobre', rotulo: 'A Allp Fit' },
  { id: 'estrutura', rotulo: 'Estrutura' },
  { id: 'modalidades', rotulo: 'Modalidades' },
  { id: 'planos', rotulo: 'Planos' },
  { id: 'avaliacoes', rotulo: 'Avaliações' },
  { id: 'localizacao', rotulo: 'Localização' },
  { id: 'faq', rotulo: 'FAQ' },
];

/** Links rápidos do rodapé (inclui seções que não cabem no menu do topo). */
export const menuRodape: Secao[] = [
  { id: 'planos', rotulo: 'Planos' },
  { id: 'modalidades', rotulo: 'Modalidades' },
  { id: 'estrutura', rotulo: 'Estrutura' },
  { id: 'galeria', rotulo: 'Galeria' },
  { id: 'avaliacoes', rotulo: 'Avaliações' },
  { id: 'aula-experimental', rotulo: 'Aula experimental' },
  { id: 'localizacao', rotulo: 'Localização' },
  { id: 'faq', rotulo: 'Dúvidas' },
];
