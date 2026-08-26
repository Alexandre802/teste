import type { Adapter, Modo } from './adapter';
import { adapterLocal } from './local';
import { adapterNuvem, nuvemConfigurada } from './supabase';

/**
 * Escolhe onde os dados vivem. Com Supabase configurado, na nuvem; sem ele, no
 * próprio aparelho. A decisão é feita uma vez, na carga do módulo, com base em
 * variáveis que o Next embute na build.
 */
export const dados: Adapter = nuvemConfigurada() ? adapterNuvem : adapterLocal;

export const modoAtual: Modo = dados.modo;

export { nuvemConfigurada };
export type { Adapter, Escutas, EventoCorte, Modo } from './adapter';
export { ErroDeLogin } from './adapter';
