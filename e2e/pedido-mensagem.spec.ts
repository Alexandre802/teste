import { test, expect } from '@playwright/test';
import { buildOrderMessage, formatarTelefone } from '../lib/whatsapp';
import { validarEndereco, enderecoValido, formatarCep, sanearEndereco } from '../lib/endereco';
import { validarTroco, valorDoTroco, lerValor, pagamentoEmLinhas } from '../lib/pagamento';
import type { Endereco } from '../lib/endereco';
import type { EscolhaPagamento } from '../lib/pagamento';
import type { CartLine, Customer } from '../lib/store';

/**
 * O conteúdo exato da mensagem que a cozinha recebe.
 *
 * Isto é o coração do produto: se o endereço ou o troco não estiverem na
 * mensagem, o entregador não sai da porta. Os testes travam o formato para
 * uma mudança futura não apagar um campo sem ninguém perceber.
 */

const ITENS: CartLine[] = [
  { productId: 'x-bacon', qty: 2, note: 'sem cebola' },
  { productId: 'coca-lata', qty: 1, note: '' },
];

const CLIENTE: Customer = {
  name: 'Ana Paula Souza',
  phone: '12991234567',
  provider: 'convidado',
};

const ENDERECO: Endereco = {
  rua: 'Rua das Palmeiras',
  numero: '245',
  bairro: 'Jardim Califórnia',
  complemento: 'Casa 2',
  referencia: 'portão azul',
  cep: '12325-100',
};

const DINHEIRO_COM_TROCO: EscolhaPagamento = {
  forma: 'dinheiro',
  momento: 'na-entrega',
  precisaTroco: true,
  trocoPara: 100,
};

test.describe('mensagem do pedido', () => {
  test('entrega leva itens, observações, endereço completo e troco', () => {
    const msg = buildOrderMessage({
      lines: ITENS,
      mode: 'entrega',
      customer: CLIENTE,
      address: ENDERECO,
      payment: DINHEIRO_COM_TROCO,
      note: 'tocar a campainha',
      reference: 'AB12CD-X9',
    });

    // itens e quantidade
    expect(msg).toContain('2x X Bacon');
    expect(msg).toContain('1x Coca-Cola lata 350 ml');
    // observação individual do item
    expect(msg).toContain('obs: sem cebola');
    // total
    expect(msg).toMatch(/Total: R\$\s?\d/);
    // tipo
    expect(msg).toContain('Tipo: Entrega');
    // cliente e telefone formatado
    expect(msg).toContain('Cliente: Ana Paula Souza');
    expect(msg).toContain('Telefone: (12) 99123-4567');
    // endereço, campo por campo
    expect(msg).toContain('Endereço: Rua das Palmeiras, 245');
    expect(msg).toContain('Complemento: Casa 2');
    expect(msg).toContain('Bairro: Jardim Califórnia');
    expect(msg).toContain('CEP: 12325-100');
    expect(msg).toContain('Referência: portão azul');
    // pagamento exato, no formato pedido
    expect(msg).toContain('Pagamento: Dinheiro');
    // `formatPrice` usa Intl, que separa "R$" do valor com espaço não
    // separável (U+00A0) — daí o \s em vez de um espaço literal
    expect(msg).toMatch(/Troco para: R\$\s100,00/);
    // observação geral e número do pedido
    expect(msg).toContain('Observações: tocar a campainha');
    expect(msg).toContain('Pedido nº AB12CD-X9');
    // nunca mais o texto vago que a casa reclamava
    expect(msg).not.toContain('a combinar');
  });

  test('retirada não manda endereço nenhum', () => {
    const msg = buildOrderMessage({
      lines: ITENS,
      mode: 'retirada',
      customer: { ...CLIENTE, address: 'Rua Antiga, 10' },
      address: ENDERECO,
      payment: { forma: 'pix', momento: 'na-entrega', precisaTroco: false, trocoPara: null },
    });

    expect(msg).toContain('Tipo: Retirada');
    expect(msg).toContain('Retirada no local');
    expect(msg).toContain('Pagamento: Pix');
    // nenhum campo de endereço vaza para a retirada
    expect(msg).not.toContain('Rua das Palmeiras');
    expect(msg).not.toContain('Rua Antiga');
    expect(msg).not.toContain('Bairro:');
    expect(msg).not.toContain('CEP:');
    expect(msg).not.toContain('Complemento:');
  });

  test('cartão pago online aparece como pago, e só então', () => {
    const cartao: EscolhaPagamento = {
      forma: 'cartao',
      momento: 'online',
      precisaTroco: false,
      trocoPara: null,
    };

    const pago = buildOrderMessage({
      lines: ITENS,
      mode: 'entrega',
      customer: CLIENTE,
      address: ENDERECO,
      payment: cartao,
      paidOnline: true,
    });
    expect(pago).toContain('Pagamento: Cartão');
    expect(pago).toContain('Situação: pago pelo site');

    // escolher cartão sem pagar NÃO pode virar "pago"
    const naoPago = buildOrderMessage({
      lines: ITENS,
      mode: 'entrega',
      customer: CLIENTE,
      address: ENDERECO,
      payment: cartao,
      paidOnline: false,
    });
    expect(naoPago).toContain('Pagamento: Cartão');
    expect(naoPago).not.toContain('pago pelo site');
    expect(naoPago).toContain('a pagar na entrega');
  });

  test('dinheiro sem troco diz que não precisa', () => {
    const msg = buildOrderMessage({
      lines: ITENS,
      mode: 'entrega',
      customer: CLIENTE,
      address: ENDERECO,
      payment: { forma: 'dinheiro', momento: 'na-entrega', precisaTroco: false, trocoPara: null },
    });
    expect(msg).toContain('Pagamento: Dinheiro');
    expect(msg).toContain('Troco: não precisa');
  });

  test('endereço antigo em texto corrido ainda funciona', () => {
    const msg = buildOrderMessage({
      lines: ITENS,
      mode: 'entrega',
      customer: { ...CLIENTE, address: 'Rua Velha, 99 — Centro' },
      address: null,
      payment: DINHEIRO_COM_TROCO,
    });
    expect(msg).toContain('Endereço: Rua Velha, 99 — Centro');
  });
});

test.describe('validação de endereço', () => {
  test('rua, número e bairro são obrigatórios', () => {
    const vazio: Endereco = {
      rua: '',
      numero: '',
      bairro: '',
      complemento: '',
      referencia: '',
      cep: '',
    };
    const erros = validarEndereco(vazio);
    expect(erros.rua).toBeTruthy();
    expect(erros.numero).toBeTruthy();
    expect(erros.bairro).toBeTruthy();
    expect(enderecoValido(vazio)).toBe(false);
  });

  test('complemento, referência e CEP são opcionais', () => {
    const minimo: Endereco = {
      rua: 'Rua A',
      numero: '10',
      bairro: 'Centro',
      complemento: '',
      referencia: '',
      cep: '',
    };
    expect(validarEndereco(minimo)).toEqual({});
    expect(enderecoValido(minimo)).toBe(true);
  });

  test('CEP pela metade é recusado, em branco é aceito', () => {
    const base: Endereco = { ...ENDERECO, cep: '123' };
    expect(validarEndereco(base).cep).toBeTruthy();
    expect(validarEndereco({ ...base, cep: '' }).cep).toBeUndefined();
    expect(validarEndereco({ ...base, cep: '12325-100' }).cep).toBeUndefined();
  });

  test('“s/n” vale como número', () => {
    expect(validarEndereco({ ...ENDERECO, numero: 's/n' })).toEqual({});
  });

  test('formata CEP enquanto digita', () => {
    expect(formatarCep('12325100')).toBe('12325-100');
    expect(formatarCep('123')).toBe('123');
    expect(formatarCep('abc12325100xyz')).toBe('12325-100');
  });

  test('o servidor corta campo gigante e recusa endereço incompleto', () => {
    const saneado = sanearEndereco({ ...ENDERECO, rua: 'x'.repeat(500) });
    expect(saneado?.rua.length).toBe(120);
    expect(sanearEndereco({ rua: 'Rua A', numero: '', bairro: 'Centro' })).toBeNull();
    expect(sanearEndereco(null)).toBeNull();
  });
});

test.describe('troco', () => {
  test('troco menor que o total é recusado', () => {
    const escolha: EscolhaPagamento = {
      forma: 'dinheiro',
      momento: 'na-entrega',
      precisaTroco: true,
      trocoPara: 30,
    };
    expect(validarTroco(escolha, 42)).toBeTruthy();
    expect(validarTroco({ ...escolha, trocoPara: 50 }, 42)).toBeNull();
  });

  test('calcula quanto o entregador leva de volta', () => {
    const escolha: EscolhaPagamento = {
      forma: 'dinheiro',
      momento: 'na-entrega',
      precisaTroco: true,
      trocoPara: 50,
    };
    expect(valorDoTroco(escolha, 42)).toBe(8);
  });

  test('lê valor digitado em qualquer formato', () => {
    expect(lerValor('50')).toBe(50);
    expect(lerValor('50,00')).toBe(50);
    expect(lerValor('R$ 50,00')).toBe(50);
    expect(lerValor('1.500,50')).toBe(1500.5);
    expect(lerValor('')).toBeNull();
    expect(lerValor('abc')).toBeNull();
  });

  test('Pix e cartão nunca produzem linha de troco', () => {
    for (const forma of ['pix', 'cartao'] as const) {
      const linhas = pagamentoEmLinhas(
        { forma, momento: 'na-entrega', precisaTroco: true, trocoPara: 100 },
        42,
      );
      expect(linhas.join('\n')).not.toContain('Troco para');
    }
  });
});

test.describe('telefone', () => {
  test('formata celular e fixo, e devolve o original quando não reconhece', () => {
    expect(formatarTelefone('12991234567')).toBe('(12) 99123-4567');
    expect(formatarTelefone('5512991234567')).toBe('(12) 99123-4567');
    expect(formatarTelefone('1233334444')).toBe('(12) 3333-4444');
    expect(formatarTelefone('123')).toBe('123');
  });
});
