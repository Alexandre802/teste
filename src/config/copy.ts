/**
 * Todos os textos do vídeo, transcritos das imagens de referência.
 * Alterar aqui muda o vídeo inteiro — os componentes não têm texto hardcoded.
 */

export const BRAND = {
  name1: "Consul",
  name2: "Tech",
  url: "https://consultech.digital/login",
};

export const SCENE1 = {
  badge: "2/8",
  headline: [
    { text: "Quantas", color: "white" as const },
    { text: "oportunidades", color: "blue" as const },
    { text: "você", color: "white" as const },
    { text: "perdeu?", color: "blue" as const },
  ],
  search: "Buscar consultas...",
  chips: [
    { label: "Consultas rápidas", icon: "bolt" as const },
    { label: "Dados confiáveis", icon: "shield" as const },
    { label: "Alertas", icon: "bell" as const },
  ],
  bureaus: ["spc", "serasa", "boavista", "receita"] as const,
};

export const SCENE2 = {
  badge: "3/8",
  headline: [
    { text: "E o", color: "white" as const },
    { text: "pior...", color: "blue" as const },
  ],
  alerts: [
    { title: "Restrições", subtitle: "impedem a aprovação" },
    { title: "Consulta rejeitada", subtitle: "Dados inconsistentes" },
    { title: "Pendência encontrada", subtitle: "Ação necessária" },
    { title: "Risco elevado", subtitle: "Análise manual exigida" },
  ],
};

export const SCENE3 = {
  badge: "5/8",
  headline: [
    { text: "Precisa", color: "white" as const },
    { text: "consultar?", color: "blue" as const },
  ],
  cards: [
    { label: "Veículo", icon: "car" as const },
    { label: "Score de crédito", icon: "gauge" as const },
    { label: "CRLV-e", icon: "doc" as const },
    { label: "Protestos", icon: "scales" as const },
  ],
  search: "Buscar consulta...",
  chips: [
    { label: "Dados confiáveis", icon: "shield" as const },
    { label: "Segurança total", icon: "shieldCheck" as const },
  ],
  stat: { label: "Consultas realizadas", value: 1248 },
  activity: "Atividade recente",
  footer: [
    { text: "Tudo em ", color: "white" as const },
    { text: "um só lugar.", color: "blue" as const },
  ],
};

export const SCENE4 = {
  badge: "5/8",
  headline: {
    big: "100+",
    line2: "tipos de",
    line3: "consultas",
    line4a: "em ",
    line4b: "segundos.",
  },
  /**
   * Como as linhas do título são FALADAS — usado só para o alinhamento
   * silábico com a narração ("100+" não tem vogais para pesar).
   */
  headlineSpoken: ["mais de cem", "tipos de", "consultas", "em segundos"],
  search: "Buscar consulta...",
  list: [
    { label: "Veículo", icon: "car" as const },
    { label: "Score de crédito", icon: "gauge" as const },
    { label: "CRLV-e", icon: "doc" as const },
    { label: "Protestos", icon: "scales" as const },
    { label: "Jurídica", icon: "gavel" as const },
    { label: "Financeira", icon: "dollar" as const },
    { label: "Dados confiáveis", icon: "shield" as const, checked: true },
  ],
  stats: [
    { label: "Consultas realizadas", value: "1.248", kind: "spark" as const },
    { label: "Taxa de sucesso", value: "98,7%", kind: "bars" as const },
    { label: "Tempo médio", value: "2,3s", kind: "trend" as const },
  ],
  chartTitle: "Consultas nos últimos 7 dias",
  weekDays: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"],
  donut: {
    total: "1.248",
    totalLabel: "Total",
    legend: [
      { label: "Veículos", color: "#1B5CFF", value: 34 },
      { label: "Crédito", color: "#4D82FF", value: 26 },
      { label: "Jurídica", color: "#8B5CF6", value: 14 },
      { label: "Financeira", color: "#EC4899", value: 12 },
      { label: "Outros", color: "#F5A623", value: 14 },
    ],
  },
  floating: [
    { label: "Segurança total", icon: "shieldCheck" as const, variant: "light" as const },
    { label: "Agilidade", icon: "bolt" as const, variant: "dark" as const },
    { label: "Dados confiáveis", icon: "shield" as const, variant: "glass" as const },
  ],
  activityTitle: "Atividade recente",
  activity: [
    { label: "Consulta Veículo", icon: "car" as const, status: "Concluída", time: "2s" },
    { label: "Score de Crédito", icon: "gauge" as const, status: "Concluída", time: "2s" },
    { label: "Consulta Jurídica", icon: "scales" as const, status: "Concluída", time: "3s" },
  ],
};

export const SCENE5 = {
  badge: "8/8",
  headline: [
    { text: "Pague só", color: "ink" as const },
    { text: "pelo que usar", color: "blue" as const },
  ],
  subtitle: "Sem mensalidade obrigatória.",
  row1: [
    { title: "Sem custo", sub: "adicional", icon: "dollar" as const, well: true },
    { title: "Você paga apenas", sub: "pelas consultas\nrealizadas", icon: "doc" as const },
  ],
  row2: [
    { title: "Mais controle", sub: "dos seus gastos", icon: "sliders" as const },
    { title: "Mais autonomia", sub: "para decidir", icon: "person" as const },
    { title: "Preço sob", sub: "demanda", icon: "tag" as const },
  ],
  row3: [
    { title: "Preço justo", sub: "Você paga\npelo que usar.", icon: "dollar" as const },
    { title: "Mais controle", sub: "Gastos sob\nseu controle.", icon: "check" as const },
    { title: "Mais velocidade", sub: "Consultas rápidas\ne eficientes.", icon: "bolt" as const },
    { title: "Mais segurança", sub: "Seus dados\nsempre protegidos.", icon: "lock" as const },
  ],
  cta: BRAND.url,
};
