'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Identificação do cliente antes do pagamento.
 *
 * Regra que vale para tudo aqui: método que não funciona de verdade NÃO
 * APARECE. Antes, sem app registrado no provedor, os botões de Google e
 * Facebook rodavam uma animação e davam o cliente por autenticado — login
 * falso, com cliente real. Agora cada botão só existe se as credenciais dele
 * existirem, e o convidado cobre o resto.
 *
 * O bloqueio por tentativas é uma trava de INTERFACE. Ele vive no navegador,
 * então qualquer pessoa consegue zerar limpando os dados do site. Serve para
 * conter erro honesto e digitação repetida, não para deter ataque — proteção
 * de verdade contra força bruta é limite por IP no servidor de autenticação.
 */

export const MAX_TENTATIVAS = 5;
/** Depois do bloqueio, o login volta sozinho. Travar para sempre deixaria o
 *  cliente sem conta no aparelho dele por causa de cinco erros de digitação. */
export const BLOQUEIO_MINUTOS = 15;

/**
 * Provedores sociais.
 *
 * Ter a credencial é condição necessária, não suficiente: o fluxo OAuth
 * também precisa das rotas `/api/auth/<provedor>/start` e `/callback`. Elas
 * ainda não existem, então hoje as duas constantes são falsas na prática e
 * os botões ficam fora da tela. Ver RELATORIO-PRODUCAO.md.
 */
export const GOOGLE_ATIVO = Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
export const FACEBOOK_ATIVO = Boolean(process.env.NEXT_PUBLIC_FACEBOOK_APP_ID);

export type Provedor = 'google' | 'facebook' | 'email' | 'telefone' | 'convidado';

export const NOME_PROVEDOR: Record<Provedor, string> = {
  google: 'Google',
  facebook: 'Facebook',
  email: 'e-mail',
  telefone: 'telefone',
  convidado: 'convidado',
};

interface AuthState {
  /** Tentativas de login que falharam desde o último acerto. */
  tentativas: number;
  /** Timestamp em que o login destrava. `null` = liberado. */
  bloqueadoAte: number | null;

  registrarFalha: () => void;
  limparTentativas: () => void;
  /** Zera o bloqueio quando o prazo já passou. Devolve se está bloqueado. */
  estaBloqueado: () => boolean;
  restanteMs: () => number;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      tentativas: 0,
      bloqueadoAte: null,

      registrarFalha: () =>
        set((s) => {
          const tentativas = s.tentativas + 1;
          return tentativas >= MAX_TENTATIVAS
            ? { tentativas, bloqueadoAte: Date.now() + BLOQUEIO_MINUTOS * 60_000 }
            : { tentativas };
        }),

      limparTentativas: () => set({ tentativas: 0, bloqueadoAte: null }),

      estaBloqueado: () => {
        const { bloqueadoAte } = get();
        if (!bloqueadoAte) return false;
        if (Date.now() >= bloqueadoAte) {
          // prazo vencido: libera e devolve as tentativas
          set({ tentativas: 0, bloqueadoAte: null });
          return false;
        }
        return true;
      },

      restanteMs: () => {
        const { bloqueadoAte } = get();
        return bloqueadoAte ? Math.max(0, bloqueadoAte - Date.now()) : 0;
      },
    }),
    { name: 'mfh-auth-v1' },
  ),
);

/** "4 min" / "38 s" — o que falta para o login destravar. */
export function formatarEspera(ms: number): string {
  const s = Math.ceil(ms / 1000);
  if (s >= 60) {
    // arredondar para cima dava "16 minutos" logo no instante do bloqueio,
    // porque o segundo fracionado sobe de 900 para 901
    const min = Math.max(1, Math.round(s / 60));
    return `${min} ${min === 1 ? 'minuto' : 'minutos'}`;
  }
  return `${s} segundos`;
}

export function emailValido(valor: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valor.trim());
}

/** Nome de exibição a partir do e-mail, quando o provedor não devolve um. */
export function nomeDoEmail(email: string): string {
  const local = email.split('@')[0] ?? '';
  const limpo = local.replace(/[._-]+/g, ' ').trim();
  return limpo
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0].toUpperCase() + p.slice(1))
    .join(' ');
}
