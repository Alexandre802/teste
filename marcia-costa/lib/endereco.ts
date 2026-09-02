import type { Address } from "@/types";
import { cidadesAtendidas } from "@/data/deliveryZones";

/** Endereco vazio, usado como estado inicial do formulario. */
export const enderecoVazio: Address = {
  cep: "",
  rua: "",
  numero: "",
  bairro: "",
  complemento: "",
  cidade: "",
  referencia: "",
};

export type CampoEndereco = keyof Address;

/** Campos obrigatorios na entrega. Complemento e referencia sao opcionais. */
export const camposObrigatorios: CampoEndereco[] = [
  "rua",
  "numero",
  "bairro",
  "cidade",
];

export const rotulos: Record<CampoEndereco, string> = {
  cep: "CEP",
  rua: "Rua",
  numero: "Número",
  bairro: "Bairro",
  complemento: "Complemento",
  cidade: "Cidade",
  referencia: "Ponto de referência",
};

export type ErrosEndereco = Partial<Record<CampoEndereco, string>>;

/**
 * Valida o endereco da entrega e devolve uma mensagem amigavel por campo.
 *
 * `cidades` permite conferir contra a area de entrega que esta valendo agora
 * (a que veio do banco). Sem esse argumento, vale a lista local.
 */
export function validarEndereco(
  endereco: Address,
  cidades: string[] = cidadesAtendidas,
): ErrosEndereco {
  const erros: ErrosEndereco = {};

  for (const campo of camposObrigatorios) {
    if (!endereco[campo].trim()) {
      erros[campo] = `Preencha ${rotulos[campo].toLocaleLowerCase("pt-BR")}.`;
    }
  }

  const cepDigitos = endereco.cep.replace(/\D/g, "");
  if (cepDigitos.length > 0 && cepDigitos.length !== 8) {
    erros.cep = "O CEP tem 8 dígitos.";
  }

  if (endereco.cidade && !cidades.includes(endereco.cidade)) {
    erros.cidade = "No momento entregamos apenas nas cidades da lista.";
  }

  return erros;
}

export function enderecoValido(
  endereco: Address,
  cidades: string[] = cidadesAtendidas,
): boolean {
  return Object.keys(validarEndereco(endereco, cidades)).length === 0;
}

/** Endereco em uma linha, para o resumo da tela. */
export function enderecoEmUmaLinha(endereco: Address): string {
  const partes = [
    [endereco.rua, endereco.numero].filter(Boolean).join(", "),
    endereco.complemento,
    endereco.bairro,
    endereco.cidade,
  ].filter((parte) => parte.trim().length > 0);
  return partes.join(" - ");
}

/** Endereco em varias linhas, do jeito que a cozinha recebe no WhatsApp. */
export function enderecoEmLinhas(endereco: Address): string[] {
  const linhas: string[] = [];
  const rua = [endereco.rua, endereco.numero].filter(Boolean).join(", ");
  if (rua) linhas.push(rua);
  if (endereco.complemento.trim()) linhas.push(endereco.complemento.trim());
  if (endereco.bairro.trim()) linhas.push(endereco.bairro.trim());
  if (endereco.cidade.trim()) linhas.push(endereco.cidade.trim());
  if (endereco.cep.trim()) linhas.push(`CEP ${endereco.cep.trim()}`);
  if (endereco.referencia.trim()) {
    linhas.push(`Referência: ${endereco.referencia.trim()}`);
  }
  return linhas;
}
