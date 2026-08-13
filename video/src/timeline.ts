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
  /** Índice do componente em SCENE_COMPONENTS. */
  scene: number;
  /** Variante visual da cena (retomadas usam o mesmo layout com outra leitura). */
  variant?: number;
  /**
   * Frame absoluto em que a fala correspondente COMEÇA na narração.
   * Vem da detecção de pausas do áudio de referência — é o que garante que
   * cada troca de tela caia exatamente na virada da frase.
   */
  at: number;
  /** Frames que a cena continua visível depois que a próxima entra. */
  hold: number;
  /**
   * Duração para a qual a coreografia interna foi desenhada. A cena roda em
   * tempo escalonado (dur/designDur), então encurtar um bloco acelera as
   * animações internas em vez de cortá-las pela metade.
   */
  designDur: number;
  transition: TransitionKind;
  /** Trecho exato da narração coberto por este bloco. */
  vo: string;
};

/**
 * Decupagem sincronizada com a narração (85,708 s).
 *
 * Os tempos vieram da análise de energia do áudio de referência: todas as
 * viradas caem no centro de uma pausa real da locução. As três retomadas
 * (S08 v2, S06 v1, S02 v1) cobrem o trecho final da copy, que retoma
 * assuntos já ilustrados — em vez de deixar uma cena parada por 18 s.
 */
export const SCENES: SceneConfig[] = [
  {
    id: 'S01',
    scene: 0,
    at: 0,
    hold: 10,
    designDur: 172,
    transition: 'slideUp',
    vo: 'A maioria dos profissionais da beleza não perde clientes por falta de qualidade.',
  },
  {
    id: 'S02',
    scene: 1,
    at: 140,
    hold: 8,
    designDur: 150,
    transition: 'pushLeft',
    vo: 'Perde porque o concorrente respondeu primeiro.',
  },
  {
    id: 'S03',
    scene: 2,
    at: 230,
    hold: 10,
    designDur: 218,
    transition: 'punchIn',
    vo: 'Você atende clientes o dia inteiro, ou passa o dia inteiro correndo atrás deles no WhatsApp.',
  },
  {
    id: 'S04',
    scene: 3,
    at: 403,
    hold: 10,
    designDur: 236,
    transition: 'zoomOut',
    vo: 'Enquanto você está fazendo um corte, um procedimento ou atendendo uma cliente, outras pessoas estão mandando mensagem.',
  },
  {
    id: 'S05',
    scene: 4,
    at: 609,
    hold: 10,
    designDur: 262,
    transition: 'slideDown',
    vo: 'E sabe o que acontece quando elas ficam esperando? Elas chamam o próximo salão, a próxima clínica, a próxima barbearia.',
  },
  {
    // A demonstração do aplicativo entra exatamente na frase que apresenta o
    // produto — 7,2 s, tempo suficiente para o cursor percorrer as quatro
    // seções sem correr.
    id: 'APP',
    scene: 10,
    at: 860,
    hold: 10,
    designDur: 217,
    transition: 'swipeUp',
    vo: 'Foi exatamente para resolver isso que nasceu o Waatzo. Uma inteligência artificial que trabalha',
  },
  {
    id: 'S07',
    scene: 6,
    at: 1077,
    hold: 8,
    designDur: 230,
    transition: 'swipeUp',
    vo: 'dentro do seu próprio WhatsApp, respondendo clientes, agendando horários,',
  },
  {
    id: 'S08',
    scene: 7,
    variant: 1,
    at: 1237,
    hold: 8,
    designDur: 104,
    transition: 'pushLeft',
    vo: 'enviando lembretes e recuperando quem sumiu.',
  },
  {
    id: 'S09',
    scene: 8,
    at: 1341,
    hold: 10,
    designDur: 250,
    transition: 'spin',
    vo: 'Tudo automaticamente, 24 horas por dia. Enquanto você está focado em quem já chegou, o Waatzo cuida de quem ainda vai chegar.',
  },
  {
    // A conversa dentro do WhatsApp: cada mensagem chega numa marca da
    // narração, que aqui fala em confirmar agendamento e responder preço.
    id: 'CHAT',
    scene: 11,
    at: 1549,
    hold: 10,
    designDur: 326,
    transition: 'punchIn',
    vo: 'Ele confirma agendamentos, reduz faltas com lembretes automáticos, faz follow-up de clientes que desapareceram e até responde objeções de preço, sem precisar instalar outro aplicativo ou mudar sua rotina.',
  },
  {
    id: 'S06',
    scene: 5,
    variant: 1,
    at: 1875,
    hold: 10,
    designDur: 198,
    transition: 'zoomOut',
    vo: 'É como ter uma funcionária que nunca atrasa, nunca esquece uma mensagem e nunca deixa um cliente esperando.',
  },
  {
    // Fecho argumentativo em tipografia — antes esta janela reprisava a arte
    // da comparação com o concorrente.
    id: 'S12',
    scene: 12,
    at: 2073,
    hold: 10,
    designDur: 239,
    transition: 'slideUp',
    vo: 'Porque no fim das contas, o problema não é falta de clientes, é perder oportunidades simplesmente porque ninguém respondeu a tempo.',
  },
  {
    id: 'S10',
    scene: 9,
    at: 2312,
    hold: 0,
    designDur: 280,
    transition: 'punchIn',
    vo: 'Teste o Waatzo gratuitamente por 14 dias e descubra como é ter o seu WhatsApp trabalhando por você, mesmo quando suas mãos estão ocupadas.',
  },
];

/** Duração da narração de referência, em frames — o vídeo tem exatamente isso. */
export const TOTAL_FRAMES = 2571;

/** Início e duração (já com o hold da transição) de cada bloco. */
export const SCENE_SPANS = SCENES.map((sc, i) => {
  const nextAt = SCENES[i + 1]?.at ?? TOTAL_FRAMES;
  return {
    start: sc.at,
    /** Frames em que este bloco é o principal (até a próxima fala). */
    span: nextAt - sc.at,
    /** Duração renderizada, incluindo o rabicho por cima da próxima cena. */
    dur: nextAt - sc.at + sc.hold,
  };
});

/** Escala de tempo da coreografia interna de cada bloco. */
export const SCENE_SCALE = SCENES.map((sc, i) => SCENE_SPANS[i].span / sc.designDur);

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

  /**
   * Conversa real dentro do WhatsApp, transcrita da captura de referência.
   * Cobre "Ele confirma agendamentos… e até responde objeções de preço".
   */
  s13: {
    contact: 'Studio Ana Martins',
    messages: [
      { from: 'cliente', text: 'Oi! Tem horário essa semana para limpeza de pele?', time: '15:42' },
      {
        from: 'ia',
        text: 'Oi! 😊 Temos sim! A limpeza de pele custa R$120 e dura 1h. Qual dia fica melhor para você?',
        time: '15:42',
      },
      { from: 'cliente', text: 'Sexta à tarde!', time: '15:43' },
      {
        from: 'ia',
        text: 'Tenho sexta às 16h disponível. Posso confirmar para você? 😊',
        time: '15:43',
      },
      { from: 'cliente', text: 'Sim!', time: '15:44' },
      {
        from: 'ia',
        text: 'Prontinho, Aline! ✅ Limpeza de pele confirmada para sexta às 16h. Te esperamos! 😊',
        time: '15:44',
      },
    ],
  },

  /** Fecho argumentativo — "o problema não é falta de clientes…" */
  s12: {
    lines: [
      [{ t: 'O problema não é', c: 'dark' }],
      [{ t: 'falta de clientes', c: 'blue' }],
      [{ t: 'é perder oportunidades', c: 'dark' }],
      [{ t: 'por não responder a tempo', c: 'blue' }],
    ],
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
