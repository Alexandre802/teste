import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  buildAppointmentMessage,
  buildCancellationMessage,
  getWhatsappAppointmentUrl,
} from '@/lib/notifications/whatsapp'
import {
  formatPhoneBR,
  formatPriceBRL,
  generateAppointmentCode,
  isValidPhoneBR,
  normalizeCode,
  parsePriceToCents,
  toInternationalPhone,
} from '@/lib/format'

const AJUSTES = { businessName: 'MD_agenda', timezone: 'America/Sao_Paulo' }

const AGENDAMENTO = {
  code: 'MD-A83F2',
  customerName: 'João da Silva',
  customerPhone: '12999999999',
  serviceNameSnapshot: 'Corte Degradê',
  servicePriceSnapshot: 6000,
  serviceDurationSnapshot: 40,
  startsAt: '2026-09-25T17:30:00.000Z', // 14:30 em São Paulo
  notes: 'Manter o topo mais comprido.',
}

describe('mensagem do WhatsApp', () => {
  it('monta o texto exatamente no formato combinado', () => {
    const mensagem = buildAppointmentMessage(AGENDAMENTO, AJUSTES)

    assert.equal(
      mensagem,
      [
        'NOVO AGENDAMENTO — MD_agenda',
        '',
        'Cliente:',
        'João da Silva',
        '',
        'Telefone:',
        '(12) 99999-9999',
        '',
        'Serviço:',
        'Corte Degradê',
        '',
        'Data:',
        '25/09/2026',
        '',
        'Horário:',
        '14:30',
        '',
        'Duração:',
        '40 min',
        '',
        'Valor:',
        'R$ 60,00',
        '',
        'Observação:',
        'Manter o topo mais comprido.',
        '',
        'Código:',
        'MD-A83F2',
      ].join('\n'),
    )
  })

  it('omite a observação quando o cliente não escreveu nada', () => {
    const mensagem = buildAppointmentMessage({ ...AGENDAMENTO, notes: null }, AJUSTES)
    assert.ok(!mensagem.includes('Observação'))
    assert.ok(mensagem.includes('Código:\nMD-A83F2'))
  })

  it('descreve o cancelamento sem inventar campo', () => {
    const mensagem = buildCancellationMessage(AGENDAMENTO, AJUSTES)
    assert.ok(mensagem.startsWith('AGENDAMENTO CANCELADO — MD_agenda'))
    assert.ok(mensagem.includes('25/09/2026'))
    assert.ok(mensagem.includes('14:30'))
  })
})

describe('link wa.me', () => {
  it('monta o link com o texto codificado', () => {
    const url = getWhatsappAppointmentUrl('Olá Maicon', '12999999999')
    assert.equal(url, 'https://wa.me/5512999999999?text=Ol%C3%A1%20Maicon')
  })

  it('devolve null sem número configurado — a interface esconde o botão', () => {
    assert.equal(getWhatsappAppointmentUrl('Olá', null), null)
    assert.equal(getWhatsappAppointmentUrl('Olá', '123'), null)
  })
})

describe('telefone, preço e código', () => {
  it('aplica a máscara brasileira progressivamente', () => {
    assert.equal(formatPhoneBR('12'), '(12')
    assert.equal(formatPhoneBR('1299999'), '(12) 9999-9')
    assert.equal(formatPhoneBR('12999999999'), '(12) 99999-9999')
  })

  it('aceita celular e fixo, recusa entrada inválida', () => {
    assert.equal(isValidPhoneBR('(12) 99999-9999'), true)
    assert.equal(isValidPhoneBR('1233334444'), true)
    assert.equal(isValidPhoneBR('999999999'), false)
    assert.equal(isValidPhoneBR('11111111111'), false)
    assert.equal(isValidPhoneBR('(12) 89999-9999'), false)
  })

  it('normaliza para o formato internacional sem duplicar o DDI', () => {
    assert.equal(toInternationalPhone('12999999999'), '5512999999999')
    assert.equal(toInternationalPhone('5512999999999'), '5512999999999')
  })

  it('formata e interpreta preço em centavos', () => {
    assert.equal(formatPriceBRL(6000), 'R$ 60,00')
    assert.equal(parsePriceToCents('60,00'), 6000)
    assert.equal(parsePriceToCents('R$ 90'), 9000)
    assert.equal(parsePriceToCents('1.250,50'), 125050)
    assert.equal(parsePriceToCents('abc'), null)
  })

  it('gera código curto e sem caracteres ambíguos', () => {
    const codigo = generateAppointmentCode(() => 0)
    assert.match(codigo, /^MD-[2-9A-HJ-NP-Z]{5}$/)
    assert.ok(!/[01IO]/.test(codigo.slice(3)))
  })

  it('normaliza o código digitado pelo cliente', () => {
    assert.equal(normalizeCode('md-a83f2'), 'MD-A83F2')
    assert.equal(normalizeCode('A83F2'), 'MD-A83F2')
    assert.equal(normalizeCode('mda83f2'), 'MD-A83F2')
  })
})
