/**
 * Planos.
 *
 * ATENÇÃO (dado do negócio): os preços oficiais NÃO foram informados. Por
 * isso `mensal` e `anual` estão `null` e o cartão mostra "Consulte" — nenhum
 * valor fictício aparece no site.
 *
 * Para publicar os preços reais, escreva o valor em reais (número) nos campos
 * `mensal`/`anual`. O layout não muda:
 *
 *   preco: { mensal: 99.9, anual: 89.9 }
 *
 * Os nomes dos planos também são provisórios (estrutura visual). Troque
 * `nome`, `resumo` e `beneficios` pelos planos reais quando a academia
 * confirmar — nenhum componente precisa ser alterado.
 */

export type Periodo = 'mensal' | 'anual';

export type Plano = {
  id: string;
  nome: string;
  resumo: string;
  /** Valor em reais por mês, ou null enquanto não confirmado. */
  preco: Record<Periodo, number | null>;
  beneficios: string[];
  cta: string;
  /** Destaque visual "mais escolhido". */
  destaque?: boolean;
};

export const planos: Plano[] = [
  {
    id: 'essencial',
    nome: 'Essencial',
    resumo: 'Ideal para começar.',
    preco: { mensal: null, anual: null },
    beneficios: [
      'Acesso à musculação',
      'Área de cardio',
      'Equipamentos modernos',
      'Ambiente climatizado',
    ],
    cta: 'Escolher plano',
  },
  {
    id: 'allp',
    nome: 'Allp',
    resumo: 'O treino completo, com as aulas incluídas.',
    preco: { mensal: null, anual: null },
    beneficios: [
      'Tudo do plano Essencial',
      'Aulas coletivas',
      'Spinning',
      'Mais possibilidades de treino',
      'Benefícios adicionais',
    ],
    cta: 'Quero o Allp',
    destaque: true,
  },
  {
    id: 'premium',
    nome: 'Premium',
    resumo: 'A experiência Allp Fit sem limite de acesso.',
    preco: { mensal: null, anual: null },
    beneficios: [
      'Acesso completo',
      'Todas as modalidades disponíveis',
      'Benefícios exclusivos',
      'Experiência completa Allp Fit',
    ],
    cta: 'Conhecer Premium',
  },
];

/**
 * Desconto do plano anual, em porcentagem.
 * `null` = não confirmado → o selo "economize" não aparece.
 * Ex.: `export const descontoAnual = 15;`
 */
export const descontoAnual: number | null = null;

export const rotuloPeriodo: Record<Periodo, string> = {
  mensal: 'Mensal',
  anual: 'Anual',
};

/** Texto exibido enquanto o preço não estiver configurado. */
export const precoIndefinido = 'Consulte';

/* ───────────────────────── comparação de planos ──────────────────────────
   `true` = incluído, `false` = não incluído, string = observação curta.
   As linhas seguem a mesma ordem na tabela (desktop) e no acordeão (celular).
   ───────────────────────────────────────────────────────────────────────── */

export type LinhaComparacao = {
  recurso: string;
  valores: Record<string, boolean | string>;
};

export const comparacao: LinhaComparacao[] = [
  { recurso: 'Musculação', valores: { essencial: true, allp: true, premium: true } },
  { recurso: 'Área de cardio', valores: { essencial: true, allp: true, premium: true } },
  { recurso: 'Ambiente climatizado', valores: { essencial: true, allp: true, premium: true } },
  { recurso: 'Aulas coletivas', valores: { essencial: false, allp: true, premium: true } },
  { recurso: 'Spinning', valores: { essencial: false, allp: true, premium: true } },
  { recurso: 'Benefícios adicionais', valores: { essencial: false, allp: true, premium: true } },
  { recurso: 'Acesso completo à estrutura', valores: { essencial: false, allp: false, premium: true } },
  {
    recurso: 'Horário de funcionamento',
    valores: { essencial: 'Integral', allp: 'Integral', premium: 'Integral' },
  },
  {
    recurso: 'Atendimento da equipe',
    valores: { essencial: true, allp: true, premium: true },
  },
];
