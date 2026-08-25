import { createHash, timingSafeEqual } from 'node:crypto';

/**
 * Utilidades de segurança e privacidade das rotas.
 *
 * Princípio que orienta o arquivo: o que não é coletado não vaza. O site não
 * grava IP, não usa cookie de rastreio, não carrega script de terceiro e não
 * tem analytics. O identificador usado para limitar taxa é um hash — o IP
 * original não fica em lugar nenhum, nem em memória.
 */

/** Sal do hash de identificação. Troque em produção para o hash não ser previsível. */
const SAL = process.env.RATE_LIMIT_SALT ?? 'mfh-sal-de-desenvolvimento';

/**
 * Identificador anônimo e estável do solicitante, para limitar taxa.
 *
 * O IP entra, um hash truncado sai, e o IP é descartado. Não dá para voltar
 * ao endereço a partir do que guardamos, e o valor troca a cada dia, então
 * nem serve para seguir alguém ao longo do tempo.
 */
export function identificadorAnonimo(request: Request): string {
  const bruto =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'desconhecido';
  const dia = Math.floor(Date.now() / 86_400_000);
  return createHash('sha256').update(`${SAL}:${dia}:${bruto}`).digest('hex').slice(0, 24);
}

/* ─────────────────────────── limite de taxa ─────────────────────────── */

const janelas = new Map<string, number[]>();

/**
 * Janela deslizante em memória.
 *
 * Vale para uma instância só. Em serverless cada instância tem a própria
 * memória, então isto segura abuso casual e repetição acidental, não um
 * ataque distribuído — para isso é preciso um armazenamento compartilhado
 * (Vercel KV, Upstash Redis) com a mesma lógica.
 */
export function limitarTaxa(
  chave: string,
  maximo: number,
  janelaMs: number,
): { ok: boolean; restantes: number; esperaS: number } {
  const agora = Date.now();
  const marcas = (janelas.get(chave) ?? []).filter((t) => agora - t < janelaMs);

  if (marcas.length >= maximo) {
    janelas.set(chave, marcas);
    const esperaS = Math.ceil((janelaMs - (agora - marcas[0])) / 1000);
    return { ok: false, restantes: 0, esperaS };
  }

  marcas.push(agora);
  janelas.set(chave, marcas);

  // limpeza preguiçosa, para o mapa não crescer sem fim
  if (janelas.size > 5000) {
    for (const [k, v] of janelas) {
      if (v.every((t) => agora - t >= janelaMs)) janelas.delete(k);
    }
  }

  return { ok: true, restantes: maximo - marcas.length, esperaS: 0 };
}

/* ───────────────────────────── registro ───────────────────────────── */

const PADROES: [RegExp, string][] = [
  [/\b[\w.+-]+@[\w-]+\.[\w.-]{2,}\b/g, '«e-mail»'],
  [/(?<!\d)(?:\+?55\s?)?\(?\d{2}\)?[\s-]?9?\d{4}[-\s]?\d{4}(?!\d)/g, '«telefone»'],
  [/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g, '«cpf»'],
  [/\b\d{5}-?\d{3}\b/g, '«cep»'],
  [/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, '«ip»'],
  [/\b(?:\d[ -]*?){13,19}\b/g, '«cartão»'],
  // token de portador, chave de API, segredo em geral
  [/\b(?:Bearer\s+)?[A-Za-z0-9_-]{32,}\b/g, '«segredo»'],
];

/** Substitui dado pessoal e segredo por marcador. */
export function redigir(valor: unknown): string {
  let texto = typeof valor === 'string' ? valor : JSON.stringify(valor) ?? String(valor);
  for (const [padrao, marca] of PADROES) texto = texto.replace(padrao, marca);
  return texto.slice(0, 500);
}

/**
 * Registro do servidor com dado pessoal removido.
 *
 * Log de plataforma é lido por gente que não precisa ver telefone nem
 * endereço de cliente, e costuma ser retido por semanas. Tudo que sai daqui
 * passa pela redação antes.
 */
export const log = {
  info: (escopo: string, ...partes: unknown[]) =>
    console.log(`[${escopo}]`, ...partes.map(redigir)),
  aviso: (escopo: string, ...partes: unknown[]) =>
    console.warn(`[${escopo}]`, ...partes.map(redigir)),
  erro: (escopo: string, ...partes: unknown[]) =>
    console.error(`[${escopo}]`, ...partes.map(redigir)),
};

/* ─────────────────────────── assinaturas ─────────────────────────── */

/** Comparação em tempo constante, para não vazar o segredo pelo tempo de resposta. */
export function comparaSegura(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/** Resposta de erro sem detalhe interno — mensagem de exceção não vai ao cliente. */
export function erroPublico(mensagem: string, status: number) {
  return Response.json({ erro: mensagem }, { status });
}
