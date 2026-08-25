/**
 * Diferenciais e itens da seção institucional.
 *
 * Cada item nasce de algo verificável nas referências (resumo das avaliações
 * no Google e fotos da unidade). Nenhum número, prazo ou promessa foi criado
 * aqui — o texto fala do que existe, sem quantificar o que não foi informado.
 */

export type Diferencial = {
  id: string;
  titulo: string;
  texto: string;
  icone: 'dumbbell' | 'wind' | 'users' | 'clock' | 'layout' | 'sparkles';
};

export const diferenciais: Diferencial[] = [
  {
    id: 'equipamentos',
    titulo: 'Equipamentos modernos',
    texto: 'Máquinas de cardio, pesos livres e máquinas de resistência para objetivos diferentes.',
    icone: 'dumbbell',
  },
  {
    id: 'climatizado',
    titulo: 'Ambiente climatizado',
    texto: 'Mais conforto durante o treino, do aquecimento ao último exercício.',
    icone: 'wind',
  },
  {
    id: 'aulas',
    titulo: 'Aulas coletivas',
    texto: 'Treino, energia e motivação de quem gosta de suar em grupo.',
    icone: 'users',
  },
  {
    id: 'horario',
    titulo: 'Horário amplo',
    texto: 'A academia fecha à meia-noite: dá tempo de treinar antes ou depois do trabalho.',
    icone: 'clock',
  },
  {
    id: 'estrutura',
    titulo: 'Estrutura completa',
    texto: 'Musculação, cardio e aulas no mesmo endereço, com espaço para circular.',
    icone: 'layout',
  },
  {
    id: 'experiencia',
    titulo: 'Experiência Allp',
    texto: 'Salão amplo, iluminação em LED e equipe atenciosa — treinar aqui tem outro clima.',
    icone: 'sparkles',
  },
];

/**
 * Itens da seção "Não é apenas uma academia".
 *
 * `confirmado: false` marca o que apareceu nas referências como comentário de
 * visitante, e não como serviço anunciado pela casa. Esses itens ficam
 * agrupados à parte, com a fonte declarada na própria seção.
 */
export type ItemEstrutura = { texto: string; confirmado: boolean };

export const itensEstrutura: ItemEstrutura[] = [
  { texto: 'Equipamentos modernos', confirmado: true },
  { texto: 'Ambiente climatizado', confirmado: true },
  { texto: 'Espaço amplo', confirmado: true },
  { texto: 'Aulas coletivas', confirmado: true },
  { texto: 'Área de cardio', confirmado: true },
  { texto: 'Musculação', confirmado: true },
  { texto: 'Estacionamento', confirmado: true },
  { texto: 'Equipe preparada', confirmado: true },
  { texto: 'Cadeiras de massagem', confirmado: false },
  { texto: 'Espaço kids', confirmado: false },
  { texto: 'Spinning', confirmado: false },
];

/** Faixa de números depois do hero. Só recebe número o que foi confirmado. */
export type Indicador = {
  id: string;
  /** Número confirmado, para o contador animado. */
  numero: number | null;
  decimais?: number;
  sufixo?: string;
  /** Texto grande usado quando não existe número oficial. */
  destaque?: string;
  titulo: string;
  descricao: string;
};

export const indicadores: Indicador[] = [
  {
    id: 'equipamentos',
    numero: null,
    destaque: 'Estrutura',
    titulo: 'Treine com liberdade',
    descricao: 'Máquinas de cardio, pesos livres e máquinas de resistência.',
  },
  {
    id: 'aulas',
    numero: null,
    destaque: 'Em grupo',
    titulo: 'Aulas coletivas',
    descricao: 'Treino e experiência com o professor conduzindo a turma.',
  },
  {
    id: 'horario',
    numero: null,
    destaque: '00h',
    titulo: 'Fecha à meia-noite',
    descricao: 'Mais tempo para encaixar o treino na sua rotina.',
  },
  {
    id: 'nota',
    numero: 4.7,
    decimais: 1,
    titulo: 'Avaliação dos alunos',
    descricao: '385 avaliações no perfil do Google.',
  },
];
