/**
 * Linha do tempo do reel.
 *
 * Este e o unico arquivo que precisa ser editado para mudar duracao,
 * ordem das cenas ou os textos. Tudo o mais deriva daqui.
 */

export const FPS = 60;
export const WIDTH = 1080;
export const HEIGHT = 1920;

/**
 * Duracao de cada cena, em segundos.
 *
 * Os valores nao sao arbitrarios: cada cena esta ancorada em uma frase da
 * narracao (referencias/audio, 67,0s). As fronteiras foram medidas nas
 * pausas reais do audio, entao as cenas de texto ficam curtas (a frase e
 * curta) e as cenas de interface ficam longas (a descricao e longa) — o
 * ritmo rapido/devagar sai do proprio roteiro.
 */
export const SCENE_SECONDS = {
  s01Hook: 2.63, //  0.00 "Metodo nao da resultado. Mas sabe por que?"
  s02Nao: 2.39, //  2.63 "Nao e necessariamente por causa do metodo."
  s03Caos: 8.97, //  5.02 "...ganhos e gastos espalhados em anotacoes, planilhas..."
  s04Dinheiro: 1.77, // 13.99 "voce ate pode estar fazendo dinheiro..."
  s05Enxergar: 3.24, // 15.76 "mas nao consegue enxergar quanto esta ganhando."
  s06Quanto: 2.56, // 19.00 "quanto entrou, quanto saiu..."
  s11TudoUm: 4.54, // 21.56 "...e quanto realmente sobrou pra voce esse mes?"
  s07Prever: 4.70, // 26.10 "E mais importante: quanto vai fechar na proxima semana?"
  s08Nasceu: 2.39, // 30.80 "Foi pensando nisso que nasceu a Monttra."
  s09Phone: 7.41, // 33.19 "Uma plataforma criada para quem trabalha com metodos..."
  s10Periodo: 5.82, // 40.60 "Voce acompanha tudo que entrou e saiu por dia, semana..."
  s12Operacao: 7.26, // 46.42 "Registra suas surebets em uma calculadora inteligente..."
  s13Previsao: 7.06, // 53.68 "E ainda define metas para saber onde quer chegar."
  s14Cta: 6.26, // 60.74 "...parar de trabalhar no escuro? Teste gratis por 3 dias."
} as const;

export type SceneId = keyof typeof SCENE_SECONDS;

/** A ordem segue a narracao; cada texto e seguido da tela que o ilustra. */
export const SCENE_ORDER: SceneId[] = [
  's01Hook',
  's02Nao',
  's03Caos',
  's04Dinheiro',
  's05Enxergar',
  's06Quanto',
  's11TudoUm',
  's07Prever',
  's08Nasceu',
  's09Phone',
  's10Periodo',
  's12Operacao',
  's13Previsao',
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
