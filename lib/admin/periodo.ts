/**
 * Períodos do painel, sempre no fuso da casa (America/Sao_Paulo).
 *
 * O servidor pode estar em UTC; se a data fosse calculada com o fuso da
 * máquina, uma venda das 22h apareceria no dia seguinte.
 */

export const FUSO = "America/Sao_Paulo";

export type ChavePeriodo =
  | "hoje"
  | "ontem"
  | "7dias"
  | "30dias"
  | "mes"
  | "personalizado";

export type Periodo = {
  /** Data inicial no formato AAAA-MM-DD, no fuso da casa. */
  de: string;
  ate: string;
  rotulo: string;
};

const formatador = new Intl.DateTimeFormat("en-CA", {
  timeZone: FUSO,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Data de hoje em São Paulo, como AAAA-MM-DD. */
export function hojeEmSaoPaulo(): string {
  return formatador.format(new Date());
}

/** Soma (ou subtrai) dias de uma data AAAA-MM-DD sem passar por fuso nenhum. */
export function somarDias(data: string, dias: number): string {
  const [ano, mes, dia] = data.split("-").map(Number);
  const referencia = new Date(Date.UTC(ano, mes - 1, dia));
  referencia.setUTCDate(referencia.getUTCDate() + dias);
  return referencia.toISOString().slice(0, 10);
}

export function primeiroDiaDoMes(data: string): string {
  return `${data.slice(0, 7)}-01`;
}

export const ROTULOS_PERIODO: Record<Exclude<ChavePeriodo, "personalizado">, string> = {
  hoje: "Hoje",
  ontem: "Ontem",
  "7dias": "7 dias",
  "30dias": "30 dias",
  mes: "Este mês",
};

/** Resolve a chave escolhida no filtro em um intervalo de datas. */
export function resolverPeriodo(
  chave: ChavePeriodo,
  de?: string,
  ate?: string,
): Periodo {
  const hoje = hojeEmSaoPaulo();

  switch (chave) {
    case "ontem": {
      const ontem = somarDias(hoje, -1);
      return { de: ontem, ate: ontem, rotulo: "Ontem" };
    }
    case "7dias":
      return { de: somarDias(hoje, -6), ate: hoje, rotulo: "Últimos 7 dias" };
    case "30dias":
      return { de: somarDias(hoje, -29), ate: hoje, rotulo: "Últimos 30 dias" };
    case "mes":
      return { de: primeiroDiaDoMes(hoje), ate: hoje, rotulo: "Este mês" };
    case "personalizado":
      if (de && ate) {
        const [inicio, fim] = de <= ate ? [de, ate] : [ate, de];
        return { de: inicio, ate: fim, rotulo: "Período escolhido" };
      }
      return { de: hoje, ate: hoje, rotulo: "Hoje" };
    case "hoje":
    default:
      return { de: hoje, ate: hoje, rotulo: "Hoje" };
  }
}

/**
 * Período imediatamente anterior, do mesmo tamanho, para as comparações
 * "hoje x ontem", "esta semana x semana passada".
 */
export function periodoAnterior(periodo: Periodo): Periodo {
  const dias = diasEntre(periodo.de, periodo.ate) + 1;
  return {
    de: somarDias(periodo.de, -dias),
    ate: somarDias(periodo.ate, -dias),
    rotulo: "Período anterior",
  };
}

export function diasEntre(de: string, ate: string): number {
  const inicio = Date.parse(`${de}T00:00:00Z`);
  const fim = Date.parse(`${ate}T00:00:00Z`);
  return Math.round((fim - inicio) / 86_400_000);
}

const horaFormatador = new Intl.DateTimeFormat("pt-BR", {
  timeZone: FUSO,
  hour: "2-digit",
  minute: "2-digit",
});

const dataFormatador = new Intl.DateTimeFormat("pt-BR", {
  timeZone: FUSO,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

/** Hora de um timestamp do banco, no fuso da casa. */
export function formatarHora(iso: string): string {
  return horaFormatador.format(new Date(iso));
}

export function formatarData(iso: string): string {
  return dataFormatador.format(new Date(iso));
}

/** Data AAAA-MM-DD para DD/MM. */
export function diaCurto(data: string): string {
  const [, mes, dia] = data.split("-");
  return `${dia}/${mes}`;
}
