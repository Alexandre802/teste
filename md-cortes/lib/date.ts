/**
 * Tudo que envolve data no MD_cortes acontece no fuso da barbearia.
 *
 * O corte lançado às 23h50 de terça em Jacareí pertence à terça, não à quarta
 * do UTC. Como o `Date` do JavaScript só sabe o fuso do aparelho, e o celular
 * do funcionário pode estar em qualquer configuração, todo recorte de dia,
 * semana e mês passa por estas funções.
 */

export const FUSO = 'America/Sao_Paulo';

const partesFmt = new Intl.DateTimeFormat('en-CA', {
  timeZone: FUSO,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
});

interface Partes {
  ano: number;
  mes: number;
  dia: number;
  hora: number;
  minuto: number;
  segundo: number;
}

function partesEmSaoPaulo(instante: Date): Partes {
  const p = partesFmt.formatToParts(instante);
  const get = (tipo: Intl.DateTimeFormatPartTypes) =>
    Number(p.find((x) => x.type === tipo)?.value ?? '0');
  // 24 é como algumas engines representam a meia-noite ao usar hour12: false.
  const hora = get('hour') % 24;
  return {
    ano: get('year'),
    mes: get('month'),
    dia: get('day'),
    hora,
    minuto: get('minute'),
    segundo: get('second'),
  };
}

/** Minutos que São Paulo está à frente do UTC naquele instante (hoje, -180). */
function deslocamentoMinutos(instante: Date): number {
  const p = partesEmSaoPaulo(instante);
  const comoSeFosseUtc = Date.UTC(p.ano, p.mes - 1, p.dia, p.hora, p.minuto, p.segundo);
  return (comoSeFosseUtc - Math.floor(instante.getTime() / 1000) * 1000) / 60000;
}

/** 'YYYY-MM-DD' do dia em que aquele instante caiu em São Paulo. */
export function chaveDoDia(instante: Date | string): string {
  const d = typeof instante === 'string' ? new Date(instante) : instante;
  const p = partesEmSaoPaulo(d);
  return `${p.ano}-${String(p.mes).padStart(2, '0')}-${String(p.dia).padStart(2, '0')}`;
}

/**
 * Instante exato em que começou (00:00) o dia 'YYYY-MM-DD' de São Paulo.
 *
 * Converge em duas passadas: a primeira usa o deslocamento aproximado, a
 * segunda corrige caso o palpite tenha caído do outro lado de uma virada de
 * fuso. O Brasil não usa mais horário de verão, mas a conta não depende disso.
 */
export function inicioDoDia(chave: string): Date {
  const [ano, mes, dia] = chave.split('-').map(Number) as [number, number, number];
  const palpite = new Date(Date.UTC(ano, mes - 1, dia, 0, 0, 0));
  let resultado = new Date(palpite.getTime() - deslocamentoMinutos(palpite) * 60000);
  resultado = new Date(palpite.getTime() - deslocamentoMinutos(resultado) * 60000);
  return resultado;
}

/** Primeiro instante do dia seguinte — o fim exclusivo do intervalo. */
export function fimDoDia(chave: string): Date {
  return inicioDoDia(somaDias(chave, 1));
}

export function somaDias(chave: string, dias: number): string {
  const [ano, mes, dia] = chave.split('-').map(Number) as [number, number, number];
  const d = new Date(Date.UTC(ano, mes - 1, dia));
  d.setUTCDate(d.getUTCDate() + dias);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(
    d.getUTCDate(),
  ).padStart(2, '0')}`;
}

export function hojeEmSaoPaulo(): string {
  return chaveDoDia(new Date());
}

/** Dia da semana em São Paulo: 0 = domingo. */
export function diaDaSemana(chave: string): number {
  const [ano, mes, dia] = chave.split('-').map(Number) as [number, number, number];
  return new Date(Date.UTC(ano, mes - 1, dia)).getUTCDay();
}

/** Segunda-feira da semana daquele dia. A semana da barbearia começa na segunda. */
export function inicioDaSemana(chave: string): string {
  const dow = diaDaSemana(chave);
  const recuo = dow === 0 ? 6 : dow - 1;
  return somaDias(chave, -recuo);
}

export function inicioDoMes(chave: string): string {
  return `${chave.slice(0, 7)}-01`;
}

/** Lista de 'YYYY-MM-DD' de `inicio` até `fim`, ambos incluídos. */
export function intervaloDeDias(inicio: string, fim: string): string[] {
  const dias: string[] = [];
  let atual = inicio;
  let guarda = 0;
  while (atual <= fim && guarda < 400) {
    dias.push(atual);
    atual = somaDias(atual, 1);
    guarda += 1;
  }
  return dias;
}

const horaFmt = new Intl.DateTimeFormat('pt-BR', {
  timeZone: FUSO,
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

/** '09:15' — o horário como aparece na lista de lançamentos. */
export function hora(instante: Date | string): string {
  const d = typeof instante === 'string' ? new Date(instante) : instante;
  return horaFmt.format(d);
}

const diaCurtoFmt = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC', weekday: 'short' });
const diaLongoFmt = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'UTC',
  day: 'numeric',
  month: 'long',
});
const dataCurtaFmt = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'UTC',
  day: '2-digit',
  month: '2-digit',
});

function comoUtc(chave: string): Date {
  const [ano, mes, dia] = chave.split('-').map(Number) as [number, number, number];
  return new Date(Date.UTC(ano, mes - 1, dia));
}

/** 'Seg', 'Ter'… para o eixo do gráfico. */
export function rotuloDiaSemana(chave: string): string {
  const bruto = diaCurtoFmt.format(comoUtc(chave)).replace('.', '');
  return bruto.charAt(0).toUpperCase() + bruto.slice(1);
}

/** '25/08' — eixo do gráfico quando o período é longo demais para o nome do dia. */
export function rotuloDataCurta(chave: string): string {
  return dataCurtaFmt.format(comoUtc(chave));
}

/** '25 de agosto' — o título do balão do gráfico. */
export function rotuloDataLonga(chave: string): string {
  return diaLongoFmt.format(comoUtc(chave));
}
