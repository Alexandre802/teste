import 'server-only'

/**
 * Sessão do painel.
 *
 * Em produção quem manda é o Supabase Auth. No modo local (sem Supabase) há um
 * par de credenciais lido do ambiente e um cookie assinado com HMAC — senha
 * conferida de verdade, cookie httpOnly de verdade. Se nem um nem outro
 * estiverem configurados, o login recusa e diz o motivo; ninguém entra.
 */

import { createHmac, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'
import {
  isLocalAdminConfigured,
  isSupabasePublicConfigured,
  localAdminEmail,
  localAdminPassword,
  localAdminSecret,
} from '@/lib/config'
import { serverAuthClient } from '@/lib/supabase/server'

export const LOCAL_SESSION_COOKIE = 'md_agenda_admin'
const LOCAL_SESSION_HOURS = 12

export interface AdminSession {
  email: string
  source: 'supabase' | 'local'
}

function sign(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('base64url')
}

function safeEqual(a: string, b: string): boolean {
  const bufferA = Buffer.from(a)
  const bufferB = Buffer.from(b)
  if (bufferA.length !== bufferB.length) return false
  return timingSafeEqual(bufferA, bufferB)
}

function issueLocalToken(email: string, secret: string): string {
  const payload = Buffer.from(
    JSON.stringify({ email, exp: Date.now() + LOCAL_SESSION_HOURS * 3_600_000 }),
  ).toString('base64url')
  return `${payload}.${sign(payload, secret)}`
}

function readLocalToken(token: string, secret: string): string | null {
  const [payload, signature] = token.split('.')
  if (!payload || !signature) return null
  if (!safeEqual(signature, sign(payload, secret))) return null
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString()) as {
      email?: string
      exp?: number
    }
    if (!data.email || !data.exp || data.exp < Date.now()) return null
    return data.email
  } catch {
    return null
  }
}

export async function getAdminSession(): Promise<AdminSession | null> {
  if (isSupabasePublicConfigured()) {
    const supabase = await serverAuthClient()
    if (!supabase) return null
    const { data } = await supabase.auth.getUser()
    if (!data.user?.email) return null
    return { email: data.user.email, source: 'supabase' }
  }

  if (isLocalAdminConfigured()) {
    const secret = localAdminSecret()!
    const cookieStore = await cookies()
    const token = cookieStore.get(LOCAL_SESSION_COOKIE)?.value
    if (!token) return null
    const email = readLocalToken(token, secret)
    return email ? { email, source: 'local' } : null
  }

  return null
}

export type SignInResult =
  | { ok: true; session: AdminSession }
  | { ok: false; message: string }

export async function signInAdmin(email: string, password: string): Promise<SignInResult> {
  if (isSupabasePublicConfigured()) {
    const supabase = await serverAuthClient()
    if (!supabase) return { ok: false, message: 'Autenticação indisponível.' }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error || !data.user?.email) {
      return { ok: false, message: 'E-mail ou senha incorretos.' }
    }
    return { ok: true, session: { email: data.user.email, source: 'supabase' } }
  }

  if (isLocalAdminConfigured()) {
    const expectedEmail = localAdminEmail()!
    const expectedPassword = localAdminPassword()!
    const secret = localAdminSecret()!

    const emailOk = safeEqual(email.trim().toLowerCase(), expectedEmail.trim().toLowerCase())
    const passwordOk = safeEqual(password, expectedPassword)
    if (!emailOk || !passwordOk) return { ok: false, message: 'E-mail ou senha incorretos.' }

    const cookieStore = await cookies()
    cookieStore.set(LOCAL_SESSION_COOKIE, issueLocalToken(expectedEmail, secret), {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: LOCAL_SESSION_HOURS * 3600,
    })
    return { ok: true, session: { email: expectedEmail, source: 'local' } }
  }

  return {
    ok: false,
    message:
      'O acesso do painel ainda não foi configurado. Configure o Supabase Auth para liberar o login.',
  }
}

export async function signOutAdmin(): Promise<void> {
  if (isSupabasePublicConfigured()) {
    const supabase = await serverAuthClient()
    await supabase?.auth.signOut()
    return
  }
  const cookieStore = await cookies()
  cookieStore.delete(LOCAL_SESSION_COOKIE)
}

/** Há alguma forma de login disponível neste ambiente? */
export function isAdminAuthConfigured(): boolean {
  return isSupabasePublicConfigured() || isLocalAdminConfigured()
}
