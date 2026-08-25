/**
 * Perguntas frequentes.
 *
 * As respostas dizem o que é verificável e mandam o visitante para o WhatsApp
 * quando a informação depende da casa (preço, condição de matrícula, grade de
 * aulas). Melhor uma resposta honesta com caminho de contato do que um número
 * inventado.
 */

export type Pergunta = { id: string; pergunta: string; resposta: string };

export const perguntas: Pergunta[] = [
  {
    id: 'matricula',
    pergunta: 'Como funciona a matrícula?',
    resposta:
      'A matrícula é feita na própria academia, na Av. Celso Garcia Cid, 231, no Centro de Londrina. Você também pode adiantar tudo pelo WhatsApp: a equipe passa as condições do momento e já deixa a sua matrícula encaminhada.',
  },
  {
    id: 'planos',
    pergunta: 'Quais são os planos disponíveis?',
    resposta:
      'A Allp Fit trabalha com planos de acesso à musculação e ao cardio e planos que incluem as aulas coletivas. Os valores atualizados são informados pela equipe pelo WhatsApp ou na recepção — assim você recebe a condição que está valendo hoje.',
  },
  {
    id: 'mensal-anual',
    pergunta: 'Existe plano mensal e anual?',
    resposta:
      'Sim, há opção mensal e opção anual. A diferença de valor entre as duas é confirmada pela equipe no atendimento.',
  },
  {
    id: 'experimental',
    pergunta: 'Posso fazer uma aula experimental?',
    resposta:
      'Pode. Preencha o formulário da seção "Aula experimental" aqui no site ou chame no WhatsApp: a equipe combina o melhor dia e horário para você conhecer a estrutura treinando.',
  },
  {
    id: 'modalidades',
    pergunta: 'Quais modalidades estão disponíveis?',
    resposta:
      'Musculação, área de cardio, aulas coletivas e spinning. A grade de horários das aulas é confirmada pela equipe.',
  },
  {
    id: 'estacionamento',
    pergunta: 'A academia tem estacionamento?',
    resposta:
      'Tem. O estacionamento em frente à unidade é um dos pontos citados pelos alunos nas avaliações do Google.',
  },
  {
    id: 'horario',
    pergunta: 'Até que horas a academia funciona?',
    resposta:
      'A academia fecha à meia-noite. O horário de abertura de cada dia é confirmado pela equipe — chame no WhatsApp para conferir o dia que você pretende treinar.',
  },
  {
    id: 'contato',
    pergunta: 'Como falo com a equipe?',
    resposta:
      'Pelo WhatsApp ou por telefone, no (43) 98855-4334. Se preferir, apareça na unidade: a recepção fica logo na entrada, na Av. Celso Garcia Cid, 231.',
  },
];

/** Objetivos oferecidos no formulário da aula experimental. */
export const objetivos = [
  'Ganhar massa',
  'Emagrecer',
  'Condicionamento',
  'Saúde',
  'Outro',
] as const;

export type Objetivo = (typeof objetivos)[number];
