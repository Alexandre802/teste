/**
 * Endereço de entrega.
 *
 * Antes isto era uma string livre em `Customer.address`, que nunca chegava a
 * ser preenchida por nenhuma tela — o pedido saía para a cozinha sem endereço.
 * Aqui o endereço tem campos, validação e um formato único de escrita, para
 * o entregador receber sempre a mesma coisa.
 *
 * Rua, número e bairro são obrigatórios. Complemento, referência e CEP são
 * opcionais: em bairro de casa térrea o complemento não existe, e exigir CEP
 * afasta cliente que não sabe o dele de cor.
 */

export interface Endereco {
  rua: string;
  numero: string;
  bairro: string;
  complemento: string;
  referencia: string;
  cep: string;
}

export const ENDERECO_VAZIO: Endereco = {
  rua: '',
  numero: '',
  bairro: '',
  complemento: '',
  referencia: '',
  cep: '',
};

export type CampoEndereco = keyof Endereco;

/** Campos sem os quais o entregador não sai. */
export const CAMPOS_OBRIGATORIOS: CampoEndereco[] = ['rua', 'numero', 'bairro'];

export type ErrosEndereco = Partial<Record<CampoEndereco, string>>;

/** Deixa só os dígitos e formata como 00000-000. Aceita entrada parcial. */
export function formatarCep(valor: string): string {
  const d = valor.replace(/\D/g, '').slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

/**
 * Erros por campo. Devolve objeto vazio quando está tudo certo.
 *
 * As mensagens dizem o que fazer, não o que está errado: "Informe a rua"
 * resolve mais rápido do que "campo obrigatório".
 */
export function validarEndereco(endereco: Endereco): ErrosEndereco {
  const erros: ErrosEndereco = {};
  const rua = endereco.rua.trim();
  const numero = endereco.numero.trim();
  const bairro = endereco.bairro.trim();
  const cep = endereco.cep.replace(/\D/g, '');

  if (!rua) erros.rua = 'Informe a rua ou avenida.';
  else if (rua.length < 3) erros.rua = 'Nome muito curto — escreva a rua completa.';

  if (!numero) erros.numero = 'Informe o número. Se não tiver, escreva “s/n”.';
  else if (numero.length > 12) erros.numero = 'Número muito longo.';

  if (!bairro) erros.bairro = 'Informe o bairro.';
  else if (bairro.length < 2) erros.bairro = 'Nome muito curto — escreva o bairro completo.';

  // CEP é opcional, mas pela metade não serve para ninguém
  if (cep && cep.length !== 8) erros.cep = 'O CEP tem 8 dígitos, ou deixe em branco.';

  return erros;
}

export function enderecoValido(endereco: Endereco | null): endereco is Endereco {
  return endereco !== null && Object.keys(validarEndereco(endereco)).length === 0;
}

/** Uma linha só, para caber em resumo e em parâmetro de template do WhatsApp. */
export function enderecoEmLinha(endereco: Endereco): string {
  const partes = [
    [endereco.rua.trim(), endereco.numero.trim()].filter(Boolean).join(', '),
    endereco.complemento.trim(),
    endereco.bairro.trim(),
  ].filter(Boolean);
  const cep = endereco.cep.replace(/\D/g, '');
  if (cep) partes.push(formatarCep(cep));
  return partes.join(' — ');
}

/**
 * Bloco de linhas para a mensagem do WhatsApp.
 *
 * Cada informação em uma linha própria: o entregador lê no celular, em
 * movimento, e endereço em parágrafo corrido é onde se erra número.
 */
export function enderecoEmLinhas(endereco: Endereco): string[] {
  const linhas = [`Endereço: ${endereco.rua.trim()}, ${endereco.numero.trim()}`];
  if (endereco.complemento.trim()) linhas.push(`Complemento: ${endereco.complemento.trim()}`);
  linhas.push(`Bairro: ${endereco.bairro.trim()}`);
  const cep = endereco.cep.replace(/\D/g, '');
  if (cep) linhas.push(`CEP: ${formatarCep(cep)}`);
  if (endereco.referencia.trim()) linhas.push(`Referência: ${endereco.referencia.trim()}`);
  return linhas;
}

/** Corta cada campo no tamanho máximo aceito, para o servidor não confiar no navegador. */
export function sanearEndereco(bruto: Partial<Endereco> | null | undefined): Endereco | null {
  if (!bruto || typeof bruto !== 'object') return null;
  const corta = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max);
  const endereco: Endereco = {
    rua: corta(bruto.rua, 120),
    numero: corta(bruto.numero, 12),
    bairro: corta(bruto.bairro, 80),
    complemento: corta(bruto.complemento, 80),
    referencia: corta(bruto.referencia, 120),
    cep: corta(bruto.cep, 9),
  };
  return enderecoValido(endereco) ? endereco : null;
}
