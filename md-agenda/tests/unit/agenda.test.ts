import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { checkSlot, computeSlots, type Interval } from '@/lib/scheduling/engine'
import { dateTimeToUtc, toDateStr, toTimeStr, zonedToUtc } from '@/lib/time'
import type { BusinessHour } from '@/types'

const TZ = 'America/Sao_Paulo'
const DIA = '2026-05-25' // segunda-feira

const EXPEDIENTE: BusinessHour = {
  weekday: 1,
  isOpen: true,
  opensAt: '09:00',
  closesAt: '12:00',
  breakStart: null,
  breakEnd: null,
}

const REGRAS = { slotIntervalMinutes: 30, minimumBookingNoticeMinutes: 60, timezone: TZ }

/** Instante bem antes do dia testado — tira a antecedência do caminho. */
const ONTEM = dateTimeToUtc('2026-05-24', '08:00', TZ)

function intervalo(inicio: string, fim: string): Interval {
  return {
    start: dateTimeToUtc(DIA, inicio, TZ).getTime(),
    end: dateTimeToUtc(DIA, fim, TZ).getTime(),
  }
}

describe('fuso horário', () => {
  it('converte horário de São Paulo para UTC', () => {
    const instante = dateTimeToUtc('2026-05-25', '14:30', TZ)
    assert.equal(instante.toISOString(), '2026-05-25T17:30:00.000Z')
  })

  it('volta de UTC para a data e a hora locais', () => {
    const instante = new Date('2026-05-26T02:00:00.000Z')
    assert.equal(toDateStr(instante, TZ), '2026-05-25')
    assert.equal(toTimeStr(instante, TZ), '23:00')
  })

  it('mantém a ida e a volta consistentes', () => {
    const instante = zonedToUtc(2026, 12, 31, 23, 30, TZ)
    assert.equal(toDateStr(instante, TZ), '2026-12-31')
    assert.equal(toTimeStr(instante, TZ), '23:30')
  })
})

describe('grade de horários', () => {
  it('respeita abertura, fechamento e duração do serviço', () => {
    const slots = computeSlots({
      date: DIA,
      serviceDurationMinutes: 60,
      hours: EXPEDIENTE,
      busy: [],
      blocked: [],
      rules: REGRAS,
      now: ONTEM,
    })

    assert.deepEqual(
      slots.map((slot) => slot.time),
      ['09:00', '09:30', '10:00', '10:30', '11:00'],
    )
    assert.ok(slots.every((slot) => slot.available))
  })

  it('não abre horário quando o dia está fechado', () => {
    const slots = computeSlots({
      date: DIA,
      serviceDurationMinutes: 30,
      hours: { ...EXPEDIENTE, isOpen: false },
      busy: [],
      blocked: [],
      rules: REGRAS,
      now: ONTEM,
    })
    assert.equal(slots.length, 0)
  })

  it('bloqueia o início quando o serviço invade um horário ocupado', () => {
    // Serviço de 60 min: 10:00 não serve porque 10:30 está ocupado.
    const slots = computeSlots({
      date: DIA,
      serviceDurationMinutes: 60,
      hours: EXPEDIENTE,
      busy: [intervalo('10:30', '11:00')],
      blocked: [],
      rules: REGRAS,
      now: ONTEM,
    })

    const porHorario = new Map(slots.map((slot) => [slot.time, slot]))
    // 09:30 termina exatamente às 10:30 e por isso continua livre.
    assert.equal(porHorario.get('09:30')!.available, true)
    assert.equal(porHorario.get('10:00')!.available, false)
    assert.equal(porHorario.get('10:00')!.reason, 'busy')
    assert.equal(porHorario.get('10:30')!.available, false)
    assert.equal(porHorario.get('11:00')!.available, true)
  })

  it('encosta sem sobrepor: 09:00 fica livre com ocupação às 10:00', () => {
    const slots = computeSlots({
      date: DIA,
      serviceDurationMinutes: 60,
      hours: EXPEDIENTE,
      busy: [intervalo('10:00', '11:00')],
      blocked: [],
      rules: REGRAS,
      now: ONTEM,
    })

    const porHorario = new Map(slots.map((slot) => [slot.time, slot]))
    assert.equal(porHorario.get('09:00')!.available, true)
    assert.equal(porHorario.get('10:00')!.available, false)
    assert.equal(porHorario.get('11:00')!.available, true)
  })

  it('tira do ar o horário que cai no intervalo', () => {
    const slots = computeSlots({
      date: DIA,
      serviceDurationMinutes: 30,
      hours: { ...EXPEDIENTE, breakStart: '10:00', breakEnd: '10:30' },
      busy: [],
      blocked: [],
      rules: REGRAS,
      now: ONTEM,
    })

    const porHorario = new Map(slots.map((slot) => [slot.time, slot]))
    assert.equal(porHorario.get('10:00')!.available, false)
    assert.equal(porHorario.get('10:00')!.reason, 'break')
    assert.equal(porHorario.get('10:30')!.available, true)
  })

  it('respeita bloqueio criado pelo barbeiro', () => {
    const slots = computeSlots({
      date: DIA,
      serviceDurationMinutes: 30,
      hours: EXPEDIENTE,
      busy: [],
      blocked: [intervalo('11:00', '12:00')],
      rules: REGRAS,
      now: ONTEM,
    })

    const porHorario = new Map(slots.map((slot) => [slot.time, slot]))
    assert.equal(porHorario.get('11:00')!.reason, 'blocked')
    assert.equal(porHorario.get('11:30')!.reason, 'blocked')
    assert.equal(porHorario.get('10:30')!.available, true)
  })

  it('aplica a antecedência mínima', () => {
    // 09:20 no relógio, antecedência de 60 min: 10:00 é o primeiro que serve.
    const agora = dateTimeToUtc(DIA, '09:20', TZ)
    const slots = computeSlots({
      date: DIA,
      serviceDurationMinutes: 30,
      hours: EXPEDIENTE,
      busy: [],
      blocked: [],
      rules: REGRAS,
      now: agora,
    })

    const porHorario = new Map(slots.map((slot) => [slot.time, slot]))
    assert.equal(porHorario.get('09:30')!.available, false)
    assert.equal(porHorario.get('09:30')!.reason, 'notice')
    assert.equal(porHorario.get('10:00')!.available, false)
    assert.equal(porHorario.get('10:30')!.available, true)
  })

  it('muda a grade quando o intervalo entre horários muda', () => {
    const slots = computeSlots({
      date: DIA,
      serviceDurationMinutes: 30,
      hours: EXPEDIENTE,
      busy: [],
      blocked: [],
      rules: { ...REGRAS, slotIntervalMinutes: 20 },
      now: ONTEM,
    })
    assert.equal(slots[0].time, '09:00')
    assert.equal(slots[1].time, '09:20')
    assert.equal(slots[2].time, '09:40')
  })
})

describe('validação de um horário específico', () => {
  const base = {
    durationMinutes: 60,
    hours: EXPEDIENTE,
    busy: [] as Interval[],
    blocked: [] as Interval[],
    rules: REGRAS,
    bookingWindowDays: 30,
    now: ONTEM,
  }

  it('aceita horário livre dentro do expediente', () => {
    const resultado = checkSlot({ ...base, startsAt: dateTimeToUtc(DIA, '09:00', TZ) })
    assert.equal(resultado.ok, true)
  })

  it('recusa horário que ultrapassa o fechamento', () => {
    const resultado = checkSlot({ ...base, startsAt: dateTimeToUtc(DIA, '11:30', TZ) })
    assert.equal(resultado.ok, false)
    assert.equal(resultado.reason, 'outside_hours')
  })

  it('recusa horário já ocupado', () => {
    const resultado = checkSlot({
      ...base,
      busy: [intervalo('09:00', '10:00')],
      startsAt: dateTimeToUtc(DIA, '09:00', TZ),
    })
    assert.equal(resultado.ok, false)
    assert.equal(resultado.reason, 'busy')
  })

  it('recusa data além da janela de agendamento', () => {
    const resultado = checkSlot({
      ...base,
      bookingWindowDays: 1,
      startsAt: dateTimeToUtc(DIA, '09:00', TZ),
    })
    assert.equal(resultado.ok, false)
    assert.equal(resultado.reason, 'window')
  })

  it('recusa horário no passado', () => {
    const resultado = checkSlot({
      ...base,
      now: dateTimeToUtc(DIA, '10:00', TZ),
      startsAt: dateTimeToUtc(DIA, '09:00', TZ),
    })
    assert.equal(resultado.ok, false)
    assert.equal(resultado.reason, 'past')
  })
})
