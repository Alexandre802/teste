import { randomBytes, scrypt, timingSafeEqual, type ScryptOptions } from 'node:crypto';

/**
 * Onde ficam as contas criadas com e-mail e senha.
 *
 * O site ainda não tem banco de dados, então `buscarPorEmail` e `criar`
 * devolvem `null` — e o login por e-mail avisa que está indisponível em vez de
 * fingir que aceitou. Login com Google e Facebook não passa por aqui e já
 * funciona assim que as chaves estiverem no .env.local.
 *
 * Para ligar: troque só o corpo destas duas funções por uma consulta ao seu
 * banco (Postgres, Supabase, Prisma, o que for). O hash da senha já está
 * pronto abaixo — guarde no banco exatamente a string que `gerarHash` devolve.
 */

export type Usuario = {
  id: string;
  email: string;
  nome: string | null;
  /** resultado de `gerarHash` */
  senhaHash: string;
};

export async function buscarPorEmail(_email: string): Promise<Usuario | null> {
  return null;
}

export async function criar(_email: string, _senha: string, _nome?: string): Promise<Usuario | null> {
  return null;
}

/** Existe algum lugar para guardar conta de e-mail e senha? */
export function temBancoDeUsuarios(): boolean {
  return false;
}

/* ─────────────────────── hash de senha (scrypt) ───────────────────────
   scrypt vem no próprio Node: nada de dependência extra e é lento de
   propósito, que é o que se quer contra quem tenta adivinhar senha em massa.
   Formato guardado: "scrypt$<sal em hex>$<hash em hex>".                */

const CUSTO: ScryptOptions = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
const TAMANHO = 64;

/* `promisify(scrypt)` perde a sobrecarga que recebe as opções de custo, então
   a Promise é montada à mão para poder passar CUSTO. */
function derivar(senha: string, sal: Buffer, tamanho: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(senha.normalize('NFKC'), sal, tamanho, CUSTO, (erro, chave) =>
      erro ? reject(erro) : resolve(chave as Buffer),
    );
  });
}

export async function gerarHash(senha: string): Promise<string> {
  const sal = randomBytes(16);
  const derivado = await derivar(senha, sal, TAMANHO);
  return `scrypt$${sal.toString('hex')}$${derivado.toString('hex')}`;
}

export async function conferirSenha(senha: string, guardado: string): Promise<boolean> {
  const [algoritmo, salHex, hashHex] = guardado.split('$');
  if (algoritmo !== 'scrypt' || !salHex || !hashHex) return false;

  const esperado = Buffer.from(hashHex, 'hex');
  const derivado = await derivar(senha, Buffer.from(salHex, 'hex'), esperado.length);

  // comparação de tempo constante: comparar com === vazaria o tamanho do
  // prefixo correto e daria pista de quanto a tentativa chegou perto
  return derivado.length === esperado.length && timingSafeEqual(derivado, esperado);
}
