/**
 * Todos os textos e numeros das 10 cenas, transcritos das imagens de
 * referencia. Edite aqui para mudar qualquer conteudo do video sem
 * encostar nas animacoes.
 */

export const COPY = {
  brand: "Monttra",
  url: "https://monttra.com.br/",

  /** Cena 1 — gancho */
  s1: {
    headline: [
      { text: "Método", tone: "ink" },
      { text: "não dá", tone: "ink" },
      { text: "resultado.", tone: "green" },
    ],
    sub: "Mas sabe por quê?",
    perf: { label: "Desempenho", value: 12.43, suffix: "%", note: "Últimos 30 dias" },
    methods: { label: "Métodos testados", value: 7 },
    surebets: { label: "Surebets identificadas", value: 23 },
    bank: { label: "Evolução da banca", value: 18764.32, pill: "30 dias" },
    mgmt: { title: "Gestão de banca", sub: "Estratégia + Disciplina = Resultado" },
  },

  /** Cena 2 — ganhos e gastos espalhados */
  s2: {
    headline: [
      { text: "Ganhos e", tone: "ink" },
      { text: "gastos", tone: "ink" },
      { text: "espalhados.", tone: "green" },
    ],
    sub: ["anotações, planilhas", "e contas diferentes."],
    note: {
      title: "Anotação rápida",
      lines: ["Venda parcelada R$ 1.200", "Material – R$ 320", "Cliente novo"],
    },
    sheet: {
      title: "Planilha Maio",
      head: ["Descrição", "Valor"],
      rows: [
        ["Venda produto", "R$ 2.350,00"],
        ["Serviço prestado", "R$ 1.800,00"],
        ["Despesa com frete", "– R$ 210,00"],
        ["Material de escritório", "– R$ 95,00"],
      ],
    },
    payments: {
      title: "Controle de pagamentos",
      head: ["Data", "Fornecedor", "Valor"],
      rows: [
        ["05/05", "Fornecedor A", "– R$ 450,00"],
        ["07/05", "Fornecedor B", "– R$ 120,00"],
        ["12/05", "Fornecedor C", "– R$ 230,00"],
      ],
    },
    pj: { label: "Conta PJ", value: 8450.0 },
    personal: { label: "Conta pessoal", value: 3210.4 },
    digital: { label: "Banco digital", value: 6780.22 },
    card: { label: "Cartão de crédito", value: 1287.65, limitLabel: "Limite disponível", limit: 2712.35 },
    inflow: { label: "Recebimento", value: 1250.0 },
    outflow: { label: "Despesa", value: 189.9 },
    sticky: { title: "Ideia de projeto", lines: ["Novo site", "Campanha Ads", "Lançamento"] },
  },

  /** Cena 3 — faz dinheiro mas nao enxerga o lucro */
  s3: {
    lines: [
      { text: "Você até", style: "pale" },
      { text: "faz dinheiro", style: "dark" },
      { text: "mas não enxerga o lucro real.", style: "paleSmall" },
    ],
    chart: [
      { label: "Jan", value: 1200 },
      { label: "Fev", value: 1850 },
      { label: "Mar", value: 2300 },
      { label: "Abr", value: 3100 },
      { label: "Mai", value: 3900 },
      { label: "Jun", value: 4800 },
      { label: "Jul", value: 5600 },
    ],
  },

  /** Cena 4 — quanto realmente sobrou */
  s4: {
    headline: [
      { text: "Quanto", tone: "ink" },
      { text: "realmente", tone: "ink" },
      { text: "sobrou?", tone: "green" },
    ],
    sub: ["E quanto vai fechar", "na próxima semana?"],
    month: { label: "Mês atual", value: 18764.32, note: "Saldo disponível" },
    forecast: { label: "Previsão - Próxima semana", value: -2340.0, note: "Projeção de saldo" },
    calendar: { weekdays: ["D", "S", "T", "Q", "Q", "S", "S"], today: 7 },
    projection: { title: "Projeção de saldo", nowLabel: "Hoje", axis: ["-20 dias", "-10 dias", "Hoje", "+7 dias"] },
    insight: { title: "Insights", body: ["Alta incerteza na projeção", "da próxima semana."] },
  },

  /** Cena 5 — nasceu a Monttra (escura) */
  s5: {
    lines: ["Foi pensando", "nisso que", "nasceu a", "Monttra"],
    sub: ["Números claros para métodos,", "apostas e surebets"],
    points: [
      { label: "JAN", value: 18.7 },
      { label: "FEV", value: 22.1 },
      { label: "MAR", value: 27.4 },
      { label: "ABR", value: 30.6 },
      { label: "MAI", value: 34.2 },
      { label: "JUN", value: 42.8 },
    ],
    badgeAt: [0, 2, 4, 5],
    total: { label: ["PERFORMANCE", "ACUMULADA"], value: 147.6, note: "6 MESES" },
  },

  /** Cena 6 — acompanhe tudo que entrou e saiu */
  s6: {
    headline: [
      { text: "Acompanhe", tone: "ink" },
      { text: "tudo que", tone: "ink" },
      { text: "entrou e saiu", tone: "green" },
    ],
    sub: ["dia", "semana", "mês", "90 dias", "ano"],
    tabs: ["Dia", "Semana", "Mês", "90 dias", "Ano"],
    activeTab: 2,
    stats: [
      { label: "Entradas", value: 45231.8, delta: 18.72, dir: "in" },
      { label: "Saídas", value: 26467.3, delta: 9.35, dir: "out" },
      { label: "Lucro", value: 18764.5, delta: 32.41, dir: "eq" },
    ],
    deltaNote: "vs. período anterior",
    flow: {
      title: "Fluxo financeiro",
      legend: ["Entradas", "Saídas", "Lucro"],
      months: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"],
      series: [
        [42, 40, 46, 44, 43, 47],
        [18, 19, 22, 23, 21, 23],
        [15, -25, 12, 13, 12, 12],
      ],
    },
    summary: {
      title: "Resumo do período",
      rows: [
        { label: "Maior entrada", value: 12430.0, date: "15 Mai", dir: "in" },
        { label: "Maior saída", value: 8210.0, date: "02 Mai", dir: "out" },
        { label: "Melhor dia de lucro", value: 5980.0, date: "20 Mai", dir: "up" },
      ],
    },
    timeline: {
      title: "Linha do tempo",
      points: ["30 dias atrás", "Semana passada", "Esta semana", "Este mês", "Próximo mês"],
      active: 3,
    },
  },

  /** Cena 7 — calculadora de surebets */
  s7: {
    headline: [
      { text: "Calculadora", tone: "ink" },
      { text: "inteligente", tone: "ink" },
      { text: "de surebets.", tone: "green" },
    ],
    sub: ["lucro", "ROI", "detalhes da operação"],
    app: {
      title: "Calculadora de surebets",
      event: { label: "Evento", value: "Arsenal x Chelsea" },
      market: { label: "Mercado", value: "Resultado final" },
      pick1: { label: "Seleção 1", value: "Arsenal", odd: "2.10", house: "Bet365" },
      pick2: { label: "Seleção 2", value: "Chelsea", odd: "1.95", house: "Betano" },
      total: { label: "Valor total disponível", value: "R$ 1.000,00" },
      cta: "Calcular surebet",
      resultTitle: "Resultado da operação",
      splitLabel: "Distribuição sugerida",
      split: [
        { value: 512.2, pct: 51.22 },
        { value: 487.8, pct: 48.78 },
      ],
      profit: { label: "Lucro garantido", value: 66.67 },
      roi: { label: "ROI", value: 6.67 },
      details: {
        label: "Detalhes da operação",
        lines: ["Surebet encontrada com sucesso.", "100% de cobertura em ambas seleções."],
      },
      toggle: { title: "Atualização automática", sub: "Odds ao vivo monitoradas" },
    },
    badges: [
      { top: "100%", bottom: "Proteção" },
      { top: "", bottom: "Surebet encontrada" },
      { top: "", bottom: "Lucro garantido" },
    ],
  },

  /** Cena 8 — defina metas */
  s8: {
    headline: [
      { text: "Defina", tone: "ink" },
      { text: "metas.", tone: "green" },
    ],
    sub: "Saiba exatamente onde quer chegar.",
    sub2: "Porque não basta ganhar dinheiro.",
    goals: [
      { label: "Meta diária", value: 500, target: 700, pct: 71 },
      { label: "Meta semanal", value: 2800, target: 4000, pct: 70 },
      { label: "Meta mensal", value: 12500, target: 20000, pct: 62 },
    ],
    ring: { title: "Meta mensal", pct: 62, note: "concluída", value: 12500, target: 20000 },
    milestones: {
      title: "Seus marcos",
      items: [
        { label: "R$ 5 mil", done: true },
        { label: "R$ 10 mil", done: true },
        { label: "R$ 15 mil", done: true },
        { label: "R$ 20 mil", done: false },
      ],
    },
    footer: { title: "Você está no caminho certo!", sub: "Continue assim e alcance suas metas." },
  },

  /** Cena 9 — clareza para planejar */
  s9: {
    headline: [
      { text: "Clareza para", tone: "ink" },
      { text: "planejar os", tone: "ink" },
      { text: "próximos passos.", tone: "green" },
    ],
    sub: ["quanto ganhou", "quanto gastou", "quanto sobrou"],
    kicker: "Pare de trabalhar no escuro.",
    summary: {
      title: "Resumo financeiro",
      pill: "Últimos 30 dias",
      items: [
        { label: "Ganho", value: 24580.0, dir: "up" },
        { label: "Gasto", value: 11230.75, dir: "down" },
        { label: "Sobrou", value: 13349.25, dir: "up" },
      ],
    },
    donut: {
      title: "Distribuição de gastos",
      total: 11230.75,
      totalLabel: "Total",
      slices: [
        { label: "Custos fixos", pct: 48 },
        { label: "Marketing", pct: 22 },
        { label: "Operação", pct: 18 },
        { label: "Outros", pct: 12 },
      ],
    },
    balance: { title: "Evolução do saldo", value: 13349.25 },
    steps: {
      title: "Próximos passos sugeridos",
      items: [
        { title: "Revise seus custos fixos", sub: "Identifique oportunidades de redução" },
        { title: "Invista no que gera retorno", sub: "Aloque mais no que traz resultado" },
        { title: "Projete e acompanhe", sub: "Use dados para tomar melhores decisões" },
      ],
    },
    control: { title: "Você está no controle.", sub: ["Decisões melhores,", "resultados maiores."] },
  },

  /** Cena 10 — CTA final (escura) */
  s10: {
    headline: [
      { text: "Pare de", tone: "white" },
      { text: "trabalhar", tone: "white" },
      { text: "no escuro", tone: "neon" },
    ],
    sub: ["Comece a ter controle", "dos seus números."],
    cta: { line1: "Teste grátis por 3 dias", line2: "https://monttra.com.br/" },
    badges: {
      methods: { label: "Métodos testados", value: 7 },
      perf: { label: "Desempenho", value: 12.43, note: "Últimos 30 dias" },
      shield: { top: "100%", bottom: "Proteção" },
      profit: "Lucro garantido",
      bank: { label: "Evolução da banca", value: 18764.32 },
    },
  },
} as const;
