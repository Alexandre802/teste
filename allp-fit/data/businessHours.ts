/**
 * Horário de funcionamento — configuração por dia da semana.
 *
 * ATENÇÃO (dado do negócio): a referência enviada mostra apenas
 * "Aberto · Fecha 00:00" no dia da consulta. O horário de ABERTURA não foi
 * informado, e por isso está `null`: o site não inventa horário.
 *
 * Enquanto `abre` estiver `null`, a página mostra o fechamento confirmado e
 * um convite para confirmar no WhatsApp, em vez de dizer "aberto agora".
 * Preencha `abre` (formato "HH:MM") e o selo ABERTO/FECHADO passa a ser
 * calculado sozinho, sem mexer em nenhum componente.
 *
 *   segunda: { abre: '06:00', fecha: '00:00' },
 */

export type Dia = 'domingo' | 'segunda' | 'terca' | 'quarta' | 'quinta' | 'sexta' | 'sabado';

export type HorarioDia = {
  /** "HH:MM" ou null quando não confirmado. */
  abre: string | null;
  /** "HH:MM"; "00:00" significa meia-noite do dia seguinte. */
  fecha: string | null;
  /** true quando a unidade não abre nesse dia. */
  fechado?: boolean;
};

export const rotulosDia: Record<Dia, string> = {
  domingo: 'Domingo',
  segunda: 'Segunda',
  terca: 'Terça',
  quarta: 'Quarta',
  quinta: 'Quinta',
  sexta: 'Sexta',
  sabado: 'Sábado',
};

/** Ordem de exibição na tabela de horários. */
export const ordemDias: Dia[] = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];

export const horarios: Record<Dia, HorarioDia> = {
  segunda: { abre: null, fecha: '00:00' },
  terca: { abre: null, fecha: '00:00' },
  quarta: { abre: null, fecha: '00:00' },
  quinta: { abre: null, fecha: '00:00' },
  sexta: { abre: null, fecha: '00:00' },
  sabado: { abre: null, fecha: null },
  domingo: { abre: null, fecha: null },
};

/** Frase curta do fechamento confirmado na referência. */
export const notaHorario = 'Fecha à meia-noite';

/** Fuso da unidade — o cálculo não depende do relógio do visitante. */
export const fusoHorario = 'America/Sao_Paulo';

export type EstadoAgora =
  | { estado: 'aberto'; fecha: string }
  | { estado: 'fechado'; abre: string | null }
  | { estado: 'indefinido' };

const minutos = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

/**
 * Situação da academia no instante informado, no fuso da unidade.
 * Devolve 'indefinido' quando falta dado — nunca chuta.
 */
export function estadoAgora(agora: Date = new Date()): EstadoAgora {
  const partes = new Intl.DateTimeFormat('pt-BR', {
    timeZone: fusoHorario,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(agora);

  const valor = (tipo: string) => partes.find((p) => p.type === tipo)?.value ?? '';
  const mapaSemana: Record<string, Dia> = {
    dom: 'domingo',
    seg: 'segunda',
    ter: 'terca',
    qua: 'quarta',
    qui: 'quinta',
    sex: 'sexta',
    sáb: 'sabado',
    sab: 'sabado',
  };

  const chave = valor('weekday').toLowerCase().replace('.', '').slice(0, 3);
  const dia = mapaSemana[chave];
  if (!dia) return { estado: 'indefinido' };

  const hoje = horarios[dia];
  const agoraMin = Number(valor('hour')) * 60 + Number(valor('minute'));

  // Vira-noite: o expediente de ontem pode alcançar as primeiras horas de hoje.
  const indiceOntem = (ordemDias.indexOf(dia) + ordemDias.length - 1) % ordemDias.length;
  const ontem = horarios[ordemDias[indiceOntem]];
  if (ontem.abre && ontem.fecha && minutos(ontem.fecha) <= minutos(ontem.abre)) {
    if (agoraMin < minutos(ontem.fecha)) return { estado: 'aberto', fecha: ontem.fecha };
  }

  if (hoje.fechado) return { estado: 'fechado', abre: null };
  if (!hoje.abre || !hoje.fecha) return { estado: 'indefinido' };

  const abre = minutos(hoje.abre);
  const fecha = minutos(hoje.fecha);
  const fim = fecha <= abre ? fecha + 24 * 60 : fecha; // 00:00 = fim do dia

  if (agoraMin >= abre && agoraMin < fim) return { estado: 'aberto', fecha: hoje.fecha };
  return { estado: 'fechado', abre: agoraMin < abre ? hoje.abre : null };
}

/** Horário em formato schema.org (openingHours), só com dias confirmados. */
export function horariosSchema(): string[] {
  const sigla: Record<Dia, string> = {
    segunda: 'Mo',
    terca: 'Tu',
    quarta: 'We',
    quinta: 'Th',
    sexta: 'Fr',
    sabado: 'Sa',
    domingo: 'Su',
  };

  return ordemDias
    .filter((dia) => horarios[dia].abre && horarios[dia].fecha)
    .map((dia) => `${sigla[dia]} ${horarios[dia].abre}-${horarios[dia].fecha}`);
}
