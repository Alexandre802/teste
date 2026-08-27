import type { Adapter } from './adapter';
import { ErroDeLogin } from './adapter';

const AVISO =
  'O MD_cortes ainda não está ligado ao banco. Configure o Supabase antes de entrar.';

/**
 * O adapter que não deixa ninguém entrar.
 *
 * Existe para o caso de a build sair sem as chaves do Supabase. Sem banco não há
 * senha para validar, e deixar passar mesmo assim é o oposto do que este sistema
 * precisa fazer.
 *
 * Ele não é um "modo": é uma recusa explícita, com a tela dizendo o que falta.
 */
export const adapterNaoConfigurado: Adapter = {
  modo: 'nao-configurado',

  async entrar() {
    throw new ErroDeLogin(AVISO);
  },
  async sair() {},
  async sessaoAtual() {
    return null;
  },
  async perfis() {
    return [];
  },
  async servicos() {
    return [];
  },
  async cortes() {
    return [];
  },
  async registrarCorte() {
    throw new Error(AVISO);
  },
  async notificacoes() {
    return [];
  },
  async marcarLida() {},
  async marcarTodasLidas() {},
  escutar() {
    return () => {};
  },
};
