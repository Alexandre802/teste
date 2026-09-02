/**
 * Datas no fuso de São Paulo.
 *
 * O banco guarda `timestamptz` — instante absoluto, sem fuso embutido. Quem
 * decide o que é "hoje" é esta camada. Sem isso, um pedido das 22h30 de
 * segunda cairia na terça no relatório, porque o servidor roda em UTC.
 */

import { FUSO } from './config';

interface ParedeRelogio {
  ano: number;
  mes: number;
  dia: number;
  hora: number;
  minuto: number;
  segundo: number;
}

/** Que horas eram em São Paulo neste instante. */
function paredeEmSP(instante: Date): ParedeRelogio {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: FUSO,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(instante);

  const v = Object.fromEntries(partes.map((p) => [p.type, p.value])) as Record<string, string>;
  return {
    ano: Number(v.year),
    mes: Number(v.month),
    dia: Number(v.day),
    // 'en-CA' com hour12:false devolve 24 para a meia-noite
    hora: Number(v.hour) % 24,
    minuto: Number(v.minute),
    segundo: Number(v.second),
  };
}

/**
 * O caminho inverso: dado um horário de parede em São Paulo, qual instante
 * absoluto ele representa.
 *
 * Duas passadas. A primeira finge que os números são UTC; a segunda mede o
 * quanto São Paulo estava deslocado naquele momento e corrige. Funciona
 * mesmo se o país voltar a ter horário de verão — não depende de um −3 fixo.
 */
function instanteEmSP(ano: number, mes: number, dia: number, hora = 0, minuto = 0, segundo = 0): Date {
  const palpite = Date.UTC(ano, mes - 1, dia, hora, minuto, segundo);
  const lido = paredeEmSP(new Date(palpite));
  const lidoComoUtc = Date.UTC(lido.ano, lido.mes - 1, lido.dia, lido.hora, lido.minuto, lido.segundo);
  return new Date(palpite - (lidoComoUtc - palpite));
}

/** Começo do dia (00:00:00 em SP) do dia que contém este instante. */
export function inicioDoDia(instante: Date = new Date()): Date {
  const p = paredeEmSP(instante);
  return instanteEmSP(p.ano, p.mes, p.dia);
}

export function somaDias(data: Date, dias: number): Date {
  const p = paredeEmSP(data);
  return instanteEmSP(p.ano, p.mes, p.dia + dias, p.hora, p.minuto, p.segundo);
}

export function inicioDoMes(instante: Date = new Date()): Date {
  const p = paredeEmSP(instante);
  return instanteEmSP(p.ano, p.mes, 1);
}

export function somaMeses(data: Date, meses: number): Date {
  const p = paredeEmSP(data);
  return instanteEmSP(p.ano, p.mes + meses, 1);
}

/** "2026-09-02" em São Paulo — o formato dos campos `<input type="date">`. */
export function isoDia(instante: Date = new Date()): string {
  const p = paredeEmSP(instante);
  return `${p.ano}-${String(p.mes).padStart(2, '0')}-${String(p.dia).padStart(2, '0')}`;
}

/** "2026-09-02" → o instante das 00:00 daquele dia em São Paulo. */
export function doIsoDia(iso: string): Date {
  const [ano, mes, dia] = iso.split('-').map(Number);
  return instanteEmSP(ano, mes, dia);
}

/* ─────────────────────────── períodos ─────────────────────────── */

export type PeriodoId =
  | 'hoje'
  | 'ontem'
  | 'sete-dias'
  | 'trinta-dias'
  | 'este-mes'
  | 'mes-passado'
  | 'personalizado';

export interface Periodo {
  id: PeriodoId;
  rotulo: string;
  /** Inclusivo. */
  de: Date;
  /** EXCLUSIVO — sempre a meia-noite do dia seguinte. */
  ate: Date;
}

export const ROTULO_PERIODO: Record<PeriodoId, string> = {
  hoje: 'Hoje',
  ontem: 'Ontem',
  'sete-dias': '7 dias',
  'trinta-dias': '30 dias',
  'este-mes': 'Este mês',
  'mes-passado': 'Mês passado',
  personalizado: 'Personalizado',
};

/**
 * Intervalo de um período nomeado.
 *
 * `ate` é sempre exclusivo (meia-noite do dia seguinte), e as consultas usam
 * `< ate`. Usar `<= 23:59:59` perde a venda fechada às 23:59:59.4.
 */
export function periodoDe(id: PeriodoId, personalizado?: { de: string; ate: string }): Periodo {
  const hoje = inicioDoDia();
  const amanha = somaDias(hoje, 1);

  switch (id) {
    case 'ontem':
      return { id, rotulo: ROTULO_PERIODO[id], de: somaDias(hoje, -1), ate: hoje };
    case 'sete-dias':
      return { id, rotulo: ROTULO_PERIODO[id], de: somaDias(hoje, -6), ate: amanha };
    case 'trinta-dias':
      return { id, rotulo: ROTULO_PERIODO[id], de: somaDias(hoje, -29), ate: amanha };
    case 'este-mes':
      return { id, rotulo: ROTULO_PERIODO[id], de: inicioDoMes(), ate: amanha };
    case 'mes-passado': {
      const inicio = somaMeses(inicioDoMes(), -1);
      return { id, rotulo: ROTULO_PERIODO[id], de: inicio, ate: inicioDoMes() };
    }
    case 'personalizado': {
      if (!personalizado?.de || !personalizado?.ate) {
        return { id, rotulo: ROTULO_PERIODO[id], de: hoje, ate: amanha };
      }
      const de = doIsoDia(personalizado.de);
      const ate = somaDias(doIsoDia(personalizado.ate), 1);
      // datas invertidas viram um intervalo válido em vez de um relatório vazio
      return de <= ate
        ? { id, rotulo: ROTULO_PERIODO[id], de, ate }
        : { id, rotulo: ROTULO_PERIODO[id], de: ate, ate: de };
    }
    default:
      return { id: 'hoje', rotulo: ROTULO_PERIODO.hoje, de: hoje, ate: amanha };
  }
}

/**
 * O período imediatamente anterior, do mesmo tamanho.
 *
 * É o que sustenta "hoje × ontem" e "este mês × mês passado" sem inventar
 * base de comparação.
 */
export function periodoAnterior(p: Periodo): { de: Date; ate: Date } {
  if (p.id === 'este-mes') {
    return { de: somaMeses(inicioDoMes(), -1), ate: inicioDoMes() };
  }
  const duracao = p.ate.getTime() - p.de.getTime();
  return { de: new Date(p.de.getTime() - duracao), ate: p.de };
}

/* ─────────────────────────── formatação ─────────────────────────── */

const HORA = new Intl.DateTimeFormat('pt-BR', { timeZone: FUSO, hour: '2-digit', minute: '2-digit' });
const DIA = new Intl.DateTimeFormat('pt-BR', { timeZone: FUSO, day: '2-digit', month: '2-digit' });
const DIA_ANO = new Intl.DateTimeFormat('pt-BR', {
  timeZone: FUSO,
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});
const DIA_EXTENSO = new Intl.DateTimeFormat('pt-BR', {
  timeZone: FUSO,
  day: '2-digit',
  month: 'long',
  year: 'numeric',
});

const paraData = (v: string | Date): Date => (v instanceof Date ? v : new Date(v));

/** "19:32" */
export const hora = (v: string | Date) => HORA.format(paraData(v));
/** "02/09" */
export const diaCurto = (v: string | Date) => DIA.format(paraData(v));
/** "02/09/2026" */
export const dia = (v: string | Date) => DIA_ANO.format(paraData(v));
/** "02 de setembro de 2026" */
export const diaExtenso = (v: string | Date) => DIA_EXTENSO.format(paraData(v));
/** "02/09/2026 19:32" */
export const dataHora = (v: string | Date) => `${dia(v)} ${hora(v)}`;

/** Rótulo do intervalo: "02/09/2026" ou "01/09/2026 – 30/09/2026". */
export function rotuloIntervalo(p: { de: Date; ate: Date }): string {
  const ultimoDia = somaDias(p.ate, -1);
  return isoDia(p.de) === isoDia(ultimoDia) ? dia(p.de) : `${dia(p.de)} – ${dia(ultimoDia)}`;
}

/** "há 3 min", "há 2 h", "ontem". Para a lista de pedidos novos. */
export function desdeQuando(v: string | Date): string {
  const minutos = Math.floor((Date.now() - paraData(v).getTime()) / 60000);
  if (minutos < 1) return 'agora';
  if (minutos < 60) return `há ${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `há ${horas} h`;
  const dias = Math.floor(horas / 24);
  return dias === 1 ? 'ontem' : `há ${dias} dias`;
}
