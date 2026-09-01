/** Formatação de telefone, dinheiro e código de agendamento. */

/** Só os dígitos, para comparação e para o link do WhatsApp. */
export function phoneDigits(value: string): string {
  return value.replace(/\D/g, '')
}

/** Máscara brasileira progressiva: (12) 99999-9999. */
export function formatPhoneBR(value: string): string {
  const digits = phoneDigits(value).slice(0, 11)
  if (digits.length === 0) return ''
  if (digits.length <= 2) return `(${digits}`
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

/** Celular ou fixo brasileiro: 10 ou 11 dígitos, DDD válido. */
export function isValidPhoneBR(value: string): boolean {
  const digits = phoneDigits(value)
  if (digits.length !== 10 && digits.length !== 11) return false
  const ddd = Number(digits.slice(0, 2))
  if (ddd < 11 || ddd > 99) return false
  if (digits.length === 11 && digits[2] !== '9') return false
  return !/^(\d)\1+$/.test(digits)
}

/** Guarda sempre no mesmo formato, para não duplicar cliente. */
export function normalizePhone(value: string): string {
  return phoneDigits(value)
}

/** Formato internacional para o wa.me. */
export function toInternationalPhone(value: string): string {
  const digits = phoneDigits(value)
  return digits.startsWith('55') ? digits : `55${digits}`
}

export function formatPriceBRL(cents: number): string {
  return (
    (cents / 100)
      .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
      // O Intl separa "R$" do valor com espaço não separável; na mensagem do
      // WhatsApp e na tela isso vira caractere estranho conforme a fonte.
      .replace(/\u00a0/g, ' ')
  )
}

/** "60,00" ou "60.00" ou "R$ 60" → 6000 centavos. */
export function parsePriceToCents(value: string): number | null {
  const cleaned = value.replace(/[^\d,.-]/g, '').replace(/\.(?=\d{3}\b)/g, '').replace(',', '.')
  if (cleaned.trim().length === 0) return null
  const parsed = Number(cleaned)
  if (!Number.isFinite(parsed) || parsed < 0) return null
  return Math.round(parsed * 100)
}

const CODE_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'

/** MD-A83F2 — curto, sem caracteres que se confundem ao ditar. */
export function generateAppointmentCode(random: () => number = Math.random): string {
  let suffix = ''
  for (let index = 0; index < 5; index += 1) {
    suffix += CODE_ALPHABET[Math.floor(random() * CODE_ALPHABET.length)]
  }
  return `MD-${suffix}`
}

export function normalizeCode(value: string): string {
  const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '')
  const withoutPrefix = cleaned.startsWith('MD') ? cleaned.slice(2) : cleaned
  return `MD-${withoutPrefix}`
}

/** Primeiro nome, para saudação e para a agenda do painel. */
export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
