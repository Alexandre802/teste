import 'server-only'

import { NextResponse } from 'next/server'
import { DatabaseNotConfiguredError } from '@/lib/db'

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, { status: 200, ...init })
}

export function jsonError(message: string, status: number, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: message, ...extra }, { status })
}

export function tooManyRequests(retryAfterSeconds: number) {
  return NextResponse.json(
    { error: 'Muitas tentativas seguidas. Aguarde um instante e tente de novo.' },
    { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } },
  )
}

/**
 * Falha fechada e honesta. Banco ausente vira 503 com explicação — nunca um
 * "deu certo" inventado.
 */
export function handleRouteError(context: string, error: unknown) {
  if (error instanceof DatabaseNotConfiguredError) {
    return jsonError(
      'O agendamento ainda não está disponível: o banco de dados não foi configurado.',
      503,
    )
  }
  console.error(`[md-agenda] ${context}`, error)
  return jsonError('Não conseguimos concluir agora. Tente novamente em instantes.', 500)
}

/** Corpo JSON com teto de tamanho — payload gigante nem chega ao parser. */
export async function readJsonBody(request: Request, maxBytes = 8_000): Promise<unknown> {
  const raw = await request.text()
  if (raw.length > maxBytes) throw new PayloadTooLargeError()
  if (raw.trim().length === 0) return {}
  return JSON.parse(raw)
}

export class PayloadTooLargeError extends Error {
  constructor() {
    super('Payload grande demais.')
    this.name = 'PayloadTooLargeError'
  }
}
