/**
 * PAINEL DE CONTROLE DO VÍDEO
 * ---------------------------------------------------------------------------
 * Tudo que normalmente se ajusta (duração de cena, textos, transição, volume
 * dos efeitos) mora aqui. As cenas leem daqui — não é preciso abrir os
 * componentes para mudar copy ou timing.
 *
 * A narração de referência tem 85,7 s. As durações abaixo somam ~86 s.
 * O vídeo NÃO leva narração: apenas efeitos sonoros.
 */

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

export type TransitionKind =
  | 'slideUp'
  | 'pushLeft'
  | 'punchIn'
  | 'zoomOut'
  | 'glitch'
  | 'slideDown'
  | 'swipeUp'
  | 'spin'
  | 'flash';

export type SceneConfig = {
  id: string;
  /** Duração da cena em frames (inclui o trecho sobreposto pela transição). */
  dur: number;
  /** Frames em que esta cena começa antes do fim da anterior. */
  overlap: number;
  /** Como esta cena entra. */
  transition: TransitionKind;
  /** Trecho da narração que esta cena representa (referência de ritmo). */
  vo: string;
};

export const SCENES: SceneConfig[] = [
  {
    id: 'S01',
    dur: 172,
    overlap: 0,
    transition: 'slideUp',
    vo: 'A maioria dos profissionais da beleza não perde clientes por falta de qualidade.',
  },
  {
    id: 'S02',
    dur: 168,
    overlap: 10,
    transition: 'pushLeft',
    vo: 'Perde porque o concorrente respondeu primeiro.',
  },
  {
    id: 'S03',
    dur: 218,
    overlap: 10,
    transition: 'punchIn',
    vo: 'Você atende clientes o dia inteiro, ou passa o dia inteiro correndo atrás deles no WhatsApp.',
  },
  {
    id: 'S04',
    dur: 236,
    overlap: 12,
    transition: 'zoomOut',
    vo: 'Enquanto você está fazendo um corte, um procedimento ou atendendo uma cliente, outras pessoas estão mandando mensagem.',
  },
  {
    id: 'S05',
    dur: 262,
    overlap: 12,
    transition: 'slideDown',
    vo: 'E sabe o que acontece quando elas ficam esperando? Elas chamam o próximo salão, a próxima clínica, a próxima barbearia.',
  },
  {
    id: 'S06',
    dur: 278,
    overlap: 12,
    transition: 'glitch',
    vo: 'Foi exatamente para resolver isso que nasceu o Waatzo. Uma inteligência artificial que trabalha dentro do seu próprio WhatsApp,',
  },
  {
    id: 'S07',
    dur: 252,
    overlap: 12,
    transition: 'swipeUp',
    vo: 'respondendo clientes, agendando horários,',
  },
  {
    id: 'S08',
    dur: 372,
    overlap: 12,
    transition: 'pushLeft',
    vo: 'enviando lembretes e recuperando quem sumiu. Ele confirma agendamentos, reduz faltas com lembretes automáticos, faz follow-up de clientes que desapareceram e até responde objeções de preço.',
  },
  {
    id: 'S09',
    dur: 330,
    overlap: 12,
    transition: 'spin',
    vo: 'Tudo automaticamente, 24 horas por dia. É como ter uma funcionária que nunca atrasa, nunca esquece uma mensagem e nunca deixa um cliente esperando.',
  },
  {
    id: 'S10',
    dur: 306,
    overlap: 12,
    transition: 'punchIn',
    vo: 'Teste o Waatzo gratuitamente por 14 dias e descubra como é ter o seu WhatsApp trabalhando por você.',
  },
];

/** Frame inicial de cada cena, já descontando as sobreposições. */
export const SCENE_STARTS: number[] = SCENES.reduce<number[]>((acc, s, i) => {
  if (i === 0) return [0];
  const prevStart = acc[i - 1];
  acc.push(prevStart + SCENES[i - 1].dur - s.overlap);
  return acc;
}, []);

export const TOTAL_FRAMES =
  SCENE_STARTS[SCENES.length - 1] + SCENES[SCENES.length - 1].dur;

// ---------------------------------------------------------------------------
// TEXTOS — extraídos das imagens de referência. Preservam a arte original.
// ---------------------------------------------------------------------------

export const BRAND = 'Waatzo';

/** Cartão de lembrete da cena 8 (campos opcionais variam por cartão). */
export type ReminderCard = {
  icon: 'bell' | 'alarm' | 'person' | 'check';
  text: string;
  highlight?: string;
  sub?: string;
  button?: string;
};

export const TEXTS = {
  s01: {
    line1: [
      { t: 'A maioria dos', c: 'dark' },
      { t: 'profissionais', c: 'blue' },
      { t: 'da beleza', c: 'dark' },
    ],
    line2: [
      { t: 'não perde', c: 'blue' },
      { t: 'clientes', c: 'dark' },
      { t: 'por falta de qualidade', c: 'dark' },
    ],
    chat: [
      { from: 'them', text: 'Oi! Gostaria de agendar um horário.', time: '10:21' },
      { from: 'me', text: 'Olá! Claro, temos horários disponíveis 😊', time: '10:22' },
      { from: 'me', text: 'Podemos sim! Quer marcar para sábado de manhã?', time: '10:36' },
      { from: 'me', text: 'Sim! Temos essa opção. Quer agendar?', time: '11:03' },
    ],
    notifications: [
      { name: 'Ana Paula', initial: 'A', text: 'Quais os horários disponíveis na próxima semana?', time: '10:35' },
      { name: 'Mariana Silva', initial: 'M', text: 'Vocês fazem design de sobrancelha?', time: '11:02' },
      { name: 'Carla Lima', initial: 'C', text: 'Gostaria de saber o valor da limpeza de pele.', time: '11:18' },
    ],
    inputPlaceholder: 'Digite uma mensagem',
  },

  s02: {
    lines: [
      [{ t: 'Perde porque', c: 'dark' }],
      [{ t: 'o concorrente', c: 'dark' }],
      [{ t: 'respondeu primeiro', c: 'blue' }],
    ],
    cardA: {
      name: 'Cliente',
      status: 'Online',
      message: 'Olá, gostaria de saber mais sobre o serviço.',
      time: '09:41',
      badge: 'Não respondido',
    },
    cardB: {
      name: 'Concorrente',
      status: 'Online',
      message: 'Olá, gostaria de saber mais sobre o serviço.',
      time: '09:41',
      reply: 'Claro! Posso te ajudar agora mesmo.',
      replyTime: '09:42',
    },
  },

  s03: {
    lines: [
      [{ t: 'Você atende clientes', c: 'dark' }],
      [{ t: 'o dia inteiro', c: 'blue' }],
    ],
    cards: [
      { name: 'Juliana Silva', text: 'Olá! Gostaria de saber sobre sobrancelha.', time: '09:41', photo: 's3_av1.png' },
      { name: 'Camila Souza', text: 'Vocês fazem design de unhas?', time: '09:42', photo: 's3_av2.png' },
      { name: 'Mariana Costa', text: 'Quero agendar um horário 😊', time: '09:43', photo: 's3_av3.png' },
      { name: 'Carla Lima', text: 'Qual o valor da limpeza de pele?', time: '09:45', photo: 's3_av4.png' },
    ],
  },

  s04: {
    lines: [
      [{ t: 'Outras pessoas', c: 'blue' }],
      [{ t: 'estão mandando', c: 'dark' }],
      [{ t: 'mensagem', c: 'blue' }],
    ],
  },

  s05: {
    lines: [
      [{ t: 'Elas chamam', c: 'dark' }],
      [{ t: 'o', c: 'dark' }, { t: 'próximo salão', c: 'blue' }],
    ],
    person: { name: 'Ana Paula', age: '32 anos', photo: 's5_ana.png' },
    options: [
      { label: 'salão', icon: 'scissors' as const },
      { label: 'clínica', icon: 'cross' as const },
      { label: 'barbearia', icon: 'barber' as const },
    ],
  },

  s06: {
    line1: 'Nasceu o',
    line2: BRAND,
    subtitle: 'IA dentro do seu WhatsApp',
    botName: BRAND,
  },

  s07: {
    chips: [
      [{ t: 'Responde', c: 'blue' }, { t: 'clientes', c: 'dark' }],
      [{ t: 'Agenda', c: 'blue' }, { t: 'horários', c: 'dark' }],
    ],
    messages: [
      { name: 'Juliana', text: 'Oi! Gostaria de agendar um horário, por favor.', time: '09:12', side: 'left' as const },
      { name: 'Carlos', text: 'Quais horários vocês têm disponíveis hoje?', time: '09:13', side: 'right' as const },
    ],
    slot: '14:30',
    confirmation: { text: 'Horário agendado com sucesso!', time: '09:14' },
  },

  s08: {
    lines: [
      [{ t: 'Envia', c: 'dark' }, { t: 'lembretes', c: 'blue' }],
      [{ t: 'Recupera', c: 'blue' }, { t: 'quem sumiu', c: 'dark' }],
    ],
    cards: [
      { icon: 'bell', text: 'Lembrete: seu horário é amanhã às ', highlight: '14:30' },
      { icon: 'alarm', text: 'Oi! Passando para lembrar do seu atendimento hoje às ', highlight: '16:00.' },
      { icon: 'person', text: 'Sentimos sua falta. Quer agendar novamente?', button: 'Agendar novamente' },
      { icon: 'check', text: 'Lembrete enviado', sub: 'Tudo certo! ✅' },
    ] as ReminderCard[],
  },

  s09: {
    lines: [
      [{ t: 'Tudo', c: 'dark' }],
      [{ t: 'automaticamente', c: 'blue' }],
      [{ t: '24 horas por dia', c: 'dark' }],
    ],
    ringLabel: '24h',
  },

  s10: {
    lines: [
      [{ t: 'Teste grátis', c: 'dark' }],
      [{ t: 'por 14 dias', c: 'blue' }],
    ],
    subtitle: [
      { t: 'Seu ', c: 'dark' },
      { t: 'WhatsApp', c: 'blue' },
      { t: ' trabalhando por você', c: 'dark' },
    ],
    banner: 'Responda mais rápido e não perca oportunidades. Você tem conversas abertas.',
    stats: [
      { value: 8, label: 'Novos interessados', accent: true },
      { value: 37, label: 'Conversas abertas', accent: false },
    ],
    rows: [
      { initials: 'LS', name: 'Lucas Silva', text: 'Quero saber mais sobre os planos.', time: '09:45', badge: 2 },
      { initials: 'AM', name: 'Ana Martins', text: 'Vocês atendem aos sábados?', time: '09:32', badge: 1 },
      { initials: 'RF', name: 'Rafael Ferreira', text: 'Qual o prazo de implantação?', time: '09:10', badge: 0 },
      { initials: 'BC', name: 'Beatriz Costa', text: 'Gostaria de uma demonstração.', time: '08:58', badge: 3 },
    ],
    cta: 'https://waatzo.com/login',
  },
} as const;

// ---------------------------------------------------------------------------
// MIXAGEM — volume global por família de efeito (0 a 1).
// ---------------------------------------------------------------------------

export const MIX: Record<string, number> = {
  whoosh_short: 0.34,
  whoosh_transition: 0.46,
  swipe_fast: 0.3,
  pop_ui: 0.32,
  soft_pop: 0.24,
  bubble_pop: 0.26,
  digital_click: 0.26,
  tap: 0.3,
  notification_pop: 0.3,
  impact: 0.44,
  bass_hit: 0.5,
  sub_boom: 0.5,
  riser: 0.36,
  reverse_whoosh: 0.32,
  glitch: 0.34,
  tick: 0.2,
  success_chime: 0.34,
  sparkle: 0.26,
  logo_sting: 0.5,
};

/** Volume geral da trilha de efeitos. */
export const SFX_MASTER = 1;
