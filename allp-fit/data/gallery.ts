/**
 * Fotos da unidade.
 *
 * Regra que vale para este site: só entram fotografias da própria academia,
 * enviadas pelo cliente (perfil da Allp Fit no Google). Não há banco de
 * imagens genérico de academia em lugar nenhum, e cada legenda descreve o que
 * a foto realmente mostra — nenhuma foto é usada para ilustrar um ambiente
 * que ela não retrata.
 *
 * As placas dos carros de terceiros na foto da fachada foram desfocadas.
 */

export type Foto = {
  id: string;
  src: string;
  alt: string;
  titulo: string;
  legenda: string;
  largura: number;
  altura: number;
};

export const fotos = {
  salao: {
    id: 'salao',
    src: '/fotos/salao.webp',
    alt: 'Salão da Allp Fit visto do corredor de esteiras, com fitas de LED roxas, azuis e cianas no teto preto e a área de musculação ao fundo',
    titulo: 'Salão principal',
    legenda: 'Pé-direito alto, teto preto e as fitas de LED que dão o tom da casa.',
    largura: 828,
    altura: 1215,
  },
  esteiras: {
    id: 'esteiras',
    src: '/fotos/esteiras.webp',
    alt: 'Fileira de esteiras da Allp Fit em uso, com painéis individuais e televisores na parede',
    titulo: 'Área de cardio',
    legenda: 'Fileira de esteiras com painel individual, de frente para os televisores.',
    largura: 788,
    altura: 440,
  },
  tetoLed: {
    id: 'teto-led',
    src: '/fotos/teto-led.webp',
    alt: 'Detalhe do teto da Allp Fit com várias fitas de LED paralelas em roxo, azul e ciano',
    titulo: 'Iluminação em LED',
    legenda: 'As linhas de luz que atravessam o salão de ponta a ponta.',
    largura: 828,
    altura: 695,
  },
  musculacao: {
    id: 'musculacao',
    src: '/fotos/musculacao.webp',
    alt: 'Corredor de máquinas de musculação da Allp Fit, com equipamentos pretos alinhados e piso claro',
    titulo: 'Musculação',
    legenda: 'Corredor de máquinas alinhadas, com espaço livre para circular.',
    largura: 460,
    altura: 568,
  },
  fachada: {
    id: 'fachada',
    src: '/fotos/fachada.webp',
    alt: 'Fachada roxa da Allp Fit na Avenida Celso Garcia Cid, com o letreiro da marca e a entrada em laranja',
    titulo: 'Fachada e entrada',
    legenda: 'Av. Celso Garcia Cid, 231 — entrada pela frente, com estacionamento.',
    largura: 828,
    altura: 1032,
  },
} satisfies Record<string, Foto>;

/** Ordem da galeria cinematográfica (rolagem horizontal). */
export const galeria: Foto[] = [
  fotos.fachada,
  fotos.salao,
  fotos.esteiras,
  fotos.tetoLed,
  fotos.musculacao,
];

/**
 * Bento grid da seção Estrutura. `span` controla o tamanho do bloco no
 * desktop; no celular todos ocupam a largura inteira.
 */
export type BlocoEstrutura = { foto: Foto; span: 'grande' | 'alto' | 'largo' | 'normal' };

export const blocosEstrutura: BlocoEstrutura[] = [
  { foto: fotos.salao, span: 'grande' },
  { foto: fotos.musculacao, span: 'alto' },
  { foto: fotos.esteiras, span: 'largo' },
  { foto: fotos.tetoLed, span: 'normal' },
  { foto: fotos.fachada, span: 'normal' },
];
