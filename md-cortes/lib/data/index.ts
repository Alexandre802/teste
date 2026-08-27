import type { Adapter, Modo } from './adapter';
import { adapterNaoConfigurado } from './nao-configurado';
import { adapterNuvem, nuvemConfigurada } from './supabase';

/**
 * Quem valida a senha.
 *
 * Existe um caminho só: o Supabase. Com as chaves presentes, o adapter da
 * nuvem; sem elas, o adapter que recusa tudo, com a tela dizendo o que falta.
 *
 * Não há modo local, nem entrada de demonstração, nem fallback: já houve, e era
 * exatamente o que fazia um sistema que deve exigir senha de verdade aceitar a
 * senha que a própria pessoa acabava de inventar. Esse código foi apagado, não
 * desligado — não há variável que o traga de volta.
 */
export const dados: Adapter = nuvemConfigurada() ? adapterNuvem : adapterNaoConfigurado;

export const modoAtual: Modo = dados.modo;

export { nuvemConfigurada };
export { lerConfigNuvem, type ConfigNuvem } from './config';
export type { Adapter, Escutas, EventoCorte, Modo } from './adapter';
export { ErroDeLogin } from './adapter';
