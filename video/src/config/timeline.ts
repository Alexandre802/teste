/**
 * Linha do tempo do reel.
 *
 * Este e o unico arquivo que precisa ser editado para mudar duracao,
 * ordem das cenas ou os textos. Tudo o mais deriva daqui.
 */

export const FPS = 60;
export const WIDTH = 1080;
export const HEIGHT = 1920;

/** Duracao de cada cena, em segundos. */
export const SCENE_SECONDS = {
  s01Hook: 4.6, // T — "Metodo nao da resultado. Mas sabe por que?"
  s03Caos: 5.2, // G — ganhos e gastos espalhados
  s02Nao: 4.0, // T — "Nao e necessariamente por causa do metodo."
  s10Periodo: 5.4, // G — "Acompanhe por periodo"
  s04Dinheiro: 3.6, // T — "Voce ate pode estar fazendo dinheiro..."
  s11TudoUm: 5.2, // G — "Tudo em um so lugar"
  s05Enxergar: 4.4, // T — "mas nao consegue enxergar..."
  s09Phone: 5.8, // G — mockup "Veja o lucro real"
  s06Quanto: 4.6, // T — "Quanto entrou? saiu? sobrou?"
  s12Operacao: 5.6, // G — "Resultado da operacao"
  s07Prever: 4.4, // T — "Quanto vai fechar na proxima semana?"
  s13Previsao: 5.8, // G — "Previsao da semana"
  s08Nasceu: 4.4, // T — "Foi pensando nisso que nasceu a Monttra"
  s14Cta: 5.6, // CTA final
} as const;

export type SceneId = keyof typeof SCENE_SECONDS;

/**
 * Alternancia deliberada: cena de texto -> cena de baloes/graficos ->
 * cena de texto -> ... Cada bloco de argumento e seguido pela tela do
 * produto que o ilustra.
 */
export const SCENE_ORDER: SceneId[] = [
  's01Hook',
  's03Caos',
  's02Nao',
  's10Periodo',
  's04Dinheiro',
  's11TudoUm',
  's05Enxergar',
  's09Phone',
  's06Quanto',
  's12Operacao',
  's07Prever',
  's13Previsao',
  's08Nasceu',
  's14Cta',
];

export const sec = (s: number) => Math.round(s * FPS);

/** Frame inicial de cada cena, acumulado. */
export const SCENE_START: Record<SceneId, number> = (() => {
  const out = {} as Record<SceneId, number>;
  let acc = 0;
  for (const id of SCENE_ORDER) {
    out[id] = acc;
    acc += sec(SCENE_SECONDS[id]);
  }
  return out;
})();

export const TOTAL_FRAMES = SCENE_ORDER.reduce(
  (a, id) => a + sec(SCENE_SECONDS[id]),
  0,
);

/**
 * Textos do reel — extraidos da copy (referencias/copy) e das artes.
 * Cada item de `lines` vira uma linha animada independentemente.
 */
export const COPY = {
  s01: {
    lines: [
      { text: 'Método', color: 'green' as const },
      { text: 'não dá', color: 'ink' as const },
      { text: 'resultado.', color: 'ink' as const },
    ],
    sub: [
      { text: 'Mas sabe', color: 'ink' as const },
      { text: 'por quê?', color: 'green' as const },
    ],
  },
  s02: {
    lines: [
      [{ text: 'Não é', color: 'ink' as const }],
      [{ text: 'necessariamente', color: 'green' as const }],
      [
        { text: 'por causa', color: 'green' as const },
        { text: 'do método.', color: 'ink' as const },
      ],
    ],
  },
  s03: {
    kicker: 'Anotações, planilhas e contas diferentes',
    cards: [
      { label: 'Receitas', value: 42850, prefix: 'R$ ', tone: 'green' as const },
      { label: 'Despesas', value: 28730, prefix: 'R$ ', tone: 'red' as const },
    ],
    result: { label: 'Resultado', value: 14120, prefix: 'R$ ' },
  },
  s04: {
    lines: [
      [{ text: 'Você até pode estar', color: 'ink' as const }],
      [{ text: 'fazendo dinheiro...', color: 'green' as const }],
    ],
  },
  s05: {
    lines: [
      [{ text: 'Mas não', color: 'ink' as const }],
      [{ text: 'consegue', color: 'ink' as const }],
      [{ text: 'enxergar', color: 'teal' as const, hero: true }],
      [{ text: 'quanto realmente', color: 'ink' as const, small: true }],
      [{ text: 'está ganhando.', color: 'teal' as const }],
    ],
  },
  s06: {
    pairs: [
      { a: 'Quanto', b: 'entrou?' },
      { a: 'Quanto', b: 'saiu?' },
      { a: 'Quanto', b: 'sobrou?' },
    ],
  },
  s07: {
    lines: [
      [{ text: 'E mais', color: 'ink' as const }],
      [{ text: 'importante:', color: 'green' as const }],
      [{ text: 'Quanto vai fechar', color: 'ink' as const, small: true }],
      [
        { text: 'na', color: 'ink' as const },
        { text: 'próxima', color: 'green' as const },
      ],
      [{ text: 'semana?', color: 'green' as const }],
    ],
  },
  s08: {
    lines: [
      [{ text: 'Foi', color: 'ink' as const }],
      [{ text: 'pensando', color: 'ink' as const }],
      [{ text: 'nisso', color: 'ink' as const }],
      [{ text: 'que nasceu a', color: 'ink' as const, small: true }],
    ],
    brand: 'Monttra',
  },
  s09: {
    title: ['Veja o ', 'lucro real'],
    greeting: 'Olá, Marília',
    greetingSub: 'Resumo da sua conta',
    totalLabel: 'Lucro total',
    total: 12540,
    delta: '↑ 12,43%',
    perfLabel: 'Desempenho',
    badge: { value: '+12,43%', caption: 'Últimos 30 dias' },
    chip: 'Lucro real',
    activity: [980, 750, 540],
    activityLabel: 'Atividade recente',
  },
  s10: {
    chipTop: 'Acompanhe por período',
    tabs: ['Dia', 'Semana', 'Mês', '90 dias', 'Ano'],
    activeTab: 2,
    months: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
    chipBottom: 'Números claros',
  },
  s11: {
    title: 'Tudo em um só lugar',
    cards: [
      { label: 'Entrou', value: 42850, tone: 'green' as const, icon: 'up' as const },
      { label: 'Saiu', value: 28730, tone: 'red' as const, icon: 'down' as const },
      { label: 'Sobrou', value: 14120, tone: 'green' as const, icon: 'eq' as const },
    ],
  },
  s12: {
    title: ['Resultado da ', 'operação'],
    suggestions: [
      { n: '1', tag: 'DISTRIBUIÇÃO IDEAL', label: 'Valor sugerido', value: 'R$ 512,20' },
      { n: '2', tag: 'DISTRIBUIÇÃO IDEAL', label: 'Valor sugerido', value: 'R$ 487,80' },
    ],
    stats: [
      { label: 'Lucro', value: 'R$ 66,67' },
      { label: 'ROI', value: '6,67%' },
    ],
  },
  s13: {
    title: ['Previsão', 'da semana'],
    sub: ['Insights hoje, melhores', 'resultados amanhã.'],
    calendarMonth: 'Maio 2024',
    weekLabels: ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'],
    aiLabel: 'Previsão IA',
    confidence: 'Confiança alta',
    days: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
    forecasts: ['+28%', '+42%'],
    assistant: {
      name: 'Assistente IA',
      body: 'Analisando dados do mercado, comportamento e sazonalidade para prever o melhor cenário.',
    },
    goal: { tag: 'Sugestão inteligente', label: 'Próxima meta', value: 42, caption: 'de crescimento projetado' },
    pills: ['Estimativa', 'Tendência positiva'],
  },
  s14: {
    lines: [
      [{ text: 'Pare de', color: 'white' as const }],
      [{ text: 'trabalhar', color: 'white' as const }],
      [{ text: 'no escuro.', color: 'neon' as const }],
    ],
    cta: 'Teste grátis por 3 dias',
    footer: 'monttra.com',
  },
} as const;
