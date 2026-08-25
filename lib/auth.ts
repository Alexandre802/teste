/**
 * Ponto único de ligação com a autenticação.
 *
 * Hoje não existe back-end e o site NÃO finge que existe: `entrar` e
 * `criarConta` devolvem sempre `naoConfigurado`. É de propósito — uma conta
 * falsa que "aceita" qualquer senha dá a impressão errada ao cliente e depois
 * é difícil de arrancar do código.
 *
 * Para ligar de verdade, troque só o corpo destas três funções (por NextAuth,
 * Supabase, Firebase, uma API própria — tanto faz). Nenhum componente muda:
 * a tela de login já trata os três resultados abaixo.
 */

export type ResultadoAuth =
  | { ok: true }
  | { ok: false; motivo: 'credenciais' | 'naoConfigurado'; mensagem: string };

const NAO_CONFIGURADO: ResultadoAuth = {
  ok: false,
  motivo: 'naoConfigurado',
  mensagem:
    'O login ainda não está ligado. Enquanto isso, faça seu pedido pelo WhatsApp — a gente responde na hora.',
};

export async function entrar(_email: string, _senha: string): Promise<ResultadoAuth> {
  return NAO_CONFIGURADO;
}

export async function criarConta(_email: string, _senha: string): Promise<ResultadoAuth> {
  return NAO_CONFIGURADO;
}

export async function recuperarSenha(_email: string): Promise<ResultadoAuth> {
  return NAO_CONFIGURADO;
}
