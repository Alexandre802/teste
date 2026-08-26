import type { Adapter, Modo } from './adapter';
import { adapterLocal } from './local';
import { adapterNuvem, nuvemConfigurada } from './supabase';

/**
 * Escolhe onde os dados vivem: com Supabase configurado, na nuvem; sem ele, no
 * próprio aparelho.
 *
 * A decisão é feita uma vez, quando o módulo carrega, e por isso trocar de modo
 * pede uma recarga da página — é o que `recarregarApos` faz depois de salvar.
 * Manter a escolha fixa durante a sessão evita o pior dos mundos: metade da
 * tela lendo de um lugar e metade do outro.
 */
export const dados: Adapter = nuvemConfigurada() ? adapterNuvem : adapterLocal;

export const modoAtual: Modo = dados.modo;

/** Salvar configuração muda de adapter; só uma recarga aplica isso inteiro. */
export function recarregarApos(): void {
  if (typeof window !== 'undefined') window.location.reload();
}

export { nuvemConfigurada };
export {
  apagarConfigNuvem,
  configVeioDoAparelho,
  gravarConfigNuvem,
  lerConfigNuvem,
  lerConvite,
  montarConvite,
  validar,
  type ConfigNuvem,
} from './config';
export type { Adapter, Escutas, EventoCorte, Modo } from './adapter';
export { ErroDeLogin } from './adapter';
