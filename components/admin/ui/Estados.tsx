'use client';

import { AlertTriangle, Inbox, RefreshCw } from 'lucide-react';
import { Botao } from './Botao';

/**
 * Os três estados que toda lista do painel precisa ter além de "deu certo".
 *
 * Sem eles, uma tela sem dados fica idêntica a uma tela quebrada e a uma tela
 * ainda carregando — e quem está no balcão não sabe se espera, se recarrega
 * ou se realmente não vendeu nada hoje.
 */

export function Esqueleto({ className = '' }: { className?: string }) {
  return <div className={`admin-esqueleto ${className}`} aria-hidden />;
}

/** Esqueleto de lista: repete uma linha com a altura da linha de verdade. */
export function EsqueletoLista({ linhas = 4 }: { linhas?: number }) {
  return (
    <div className="flex flex-col gap-2" role="status" aria-label="Carregando">
      {Array.from({ length: linhas }, (_, i) => (
        <Esqueleto key={i} className="h-16 w-full rounded-xl" />
      ))}
    </div>
  );
}

export function Vazio({
  titulo,
  descricao,
  acao,
}: {
  titulo: string;
  descricao?: string;
  acao?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-400">
        <Inbox className="h-6 w-6" aria-hidden />
      </span>
      <div>
        <p className="font-semibold text-[var(--admin-tinta)]">{titulo}</p>
        {descricao && (
          <p className="mx-auto mt-1 max-w-[38ch] text-sm text-[var(--admin-tinta-suave)]">
            {descricao}
          </p>
        )}
      </div>
      {acao}
    </div>
  );
}

/**
 * Erro de carregamento.
 *
 * Mostra a mensagem que veio, não um "algo deu errado" genérico: quem vai
 * pedir ajuda precisa conseguir dizer o que apareceu na tela.
 */
export function Erro({ mensagem, aoTentarDeNovo }: { mensagem: string; aoTentarDeNovo?: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-6 py-8 text-center"
    >
      <AlertTriangle className="h-6 w-6 text-[var(--admin-vermelho)]" aria-hidden />
      <p className="max-w-[46ch] text-sm font-medium text-rose-900">{mensagem}</p>
      {aoTentarDeNovo && (
        <Botao variante="secundario" tamanho="sm" onClick={aoTentarDeNovo}>
          <RefreshCw className="h-4 w-4" aria-hidden />
          Tentar de novo
        </Botao>
      )}
    </div>
  );
}

/** Aviso curto de sucesso ou erro depois de uma ação. */
export function Aviso({ tipo, children }: { tipo: 'erro' | 'sucesso' | 'info'; children: React.ReactNode }) {
  const estilos = {
    erro: 'border-rose-200 bg-rose-50 text-rose-900',
    sucesso: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    info: 'border-sky-200 bg-sky-50 text-sky-900',
  };
  return (
    <p
      role={tipo === 'erro' ? 'alert' : 'status'}
      className={`rounded-xl border px-3.5 py-2.5 text-sm ${estilos[tipo]}`}
    >
      {children}
    </p>
  );
}
