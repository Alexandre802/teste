import type { Adapter, Modo } from './adapter';
import { adapterLocal } from './local';
import { adapterNaoConfigurado } from './nao-configurado';
import { adapterNuvem, nuvemConfigurada } from './supabase';

/**
 * Onde os dados vivem — e, mais importante, quem valida a senha.
 *
 * Em produção existe um caminho só: o Supabase. Com as chaves presentes, o
 * adapter da nuvem; sem elas, o adapter que recusa, com a tela explicando o que
 * falta. O modo local não entra nessa conta.
 *
 * O modo local só existe quando a build pede por ele em NEXT_PUBLIC_PERMITIR_MODO_LOCAL,
 * o que hoje acontece num lugar só: a prévia de página única, que roda sem
 * servidor e serve para mostrar o sistema. Como a variável é constante de build,
 * o ramo morre na minificação de qualquer build normal — não há como cair nele
 * por acidente, nem mexendo no localStorage do aparelho.
 */
const MODO_LOCAL_PERMITIDO = process.env.NEXT_PUBLIC_PERMITIR_MODO_LOCAL === '1';

function escolher(): Adapter {
  if (nuvemConfigurada()) return adapterNuvem;
  if (MODO_LOCAL_PERMITIDO) return adapterLocal;
  return adapterNaoConfigurado;
}

/**
 * A escolha é feita uma vez, quando o módulo carrega, e por isso trocar de
 * configuração pede uma recarga — é o que `recarregarApos` faz. Manter a
 * escolha fixa durante a sessão evita o pior dos mundos: metade da tela lendo
 * de um lugar e metade do outro.
 */
export const dados: Adapter = escolher();

export const modoAtual: Modo = dados.modo;

/** Salvar configuração muda de adapter; só uma recarga aplica isso inteiro. */
export function recarregarApos(): void {
  if (typeof window !== 'undefined') window.location.reload();
}

export { nuvemConfigurada };
export {
  apagarConfigNuvem,
  configVeioDaBuild,
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
