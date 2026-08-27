import type { PaymentMethod } from './types';

/**
 * Serviços que o formulário mostra enquanto a tabela `services` do banco não
 * responde ou vem vazia. Os preços ficam em zero de propósito: a tabela real da
 * barbearia não foi informada, e chutar valor de serviço é inventar dado da casa.
 */
export const SERVICOS_PADRAO = [
  'Corte',
  'Corte Degradê',
  'Barba',
  'Corte + Barba',
  'Sobrancelha',
  'Acabamento',
  'Outro',
] as const;

export const PAGAMENTOS: { value: PaymentMethod; label: string }[] = [
  { value: 'pix', label: 'PIX' },
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'debito', label: 'Débito' },
  { value: 'credito', label: 'Crédito' },
];

export const ROTULO_PAGAMENTO: Record<PaymentMethod, string> = {
  pix: 'PIX',
  dinheiro: 'Dinheiro',
  debito: 'Débito',
  credito: 'Crédito',
};

/** Quantos dias o app carrega de uma vez. Cobre mês corrente + gráfico de 30 dias. */
export const JANELA_DIAS = 40;
