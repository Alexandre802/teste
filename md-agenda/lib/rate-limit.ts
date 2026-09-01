/**
 * Limite de tentativas em memória.
 *
 * Janela deslizante por chave. Contém abuso óbvio: cem agendamentos seguidos,
 * força bruta no código de consulta, tentativa de senha no painel. A estrutura
 * é a de um limitador externo — trocar por Redis/Upstash é substituir `hit`.
 *
 * Limitação conhecida: a contagem é por instância. Em várias réplicas o teto
 * efetivo multiplica pelo número de instâncias.
 */

interface Bucket {
  hits: number[]
}

interface Estado {
  buckets: Map<string, Bucket>
  lastSweep: number
}

/**
 * O estado mora no processo, não no módulo. Rotas de API e Server Actions
 * podem cair em pacotes diferentes do build — sem isto, cada uma contaria
 * sozinha e o teto valeria várias vezes.
 */
const ESTADO_KEY = Symbol.for('md-agenda.rate-limit')

function estado(): Estado {
  const holder = globalThis as unknown as Record<symbol, Estado | undefined>
  if (!holder[ESTADO_KEY]) {
    holder[ESTADO_KEY] = { buckets: new Map(), lastSweep: Date.now() }
  }
  return holder[ESTADO_KEY]
}

function sweep(now: number, windowMs: number) {
  const atual = estado()
  if (now - atual.lastSweep < 60_000) return
  atual.lastSweep = now
  for (const [key, bucket] of atual.buckets) {
    bucket.hits = bucket.hits.filter((time) => now - time < windowMs)
    if (bucket.hits.length === 0) atual.buckets.delete(key)
  }
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  retryAfterSeconds: number
}

export function hit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now()
  sweep(now, windowMs)

  const { buckets } = estado()
  const bucket = buckets.get(key) ?? { hits: [] }
  bucket.hits = bucket.hits.filter((time) => now - time < windowMs)

  if (bucket.hits.length >= limit) {
    buckets.set(key, bucket)
    const oldest = bucket.hits[0]
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000)),
    }
  }

  bucket.hits.push(now)
  buckets.set(key, bucket)
  return { allowed: true, remaining: limit - bucket.hits.length, retryAfterSeconds: 0 }
}

export function resetRateLimit() {
  estado().buckets.clear()
}

/** IP do cliente atrás de proxy/CDN. */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return headers.get('x-real-ip') ?? 'desconhecido'
}

export const LIMITS = {
  createByIp: { limit: 8, windowMs: 10 * 60_000 },
  createByPhone: { limit: 4, windowMs: 60 * 60_000 },
  lookup: { limit: 12, windowMs: 10 * 60_000 },
  cancel: { limit: 10, windowMs: 10 * 60_000 },
  login: { limit: 8, windowMs: 15 * 60_000 },
} as const
