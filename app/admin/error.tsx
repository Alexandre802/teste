"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

/**
 * Fronteira de erro do painel.
 *
 * Erro ao buscar dados no servidor cai aqui. É o lugar certo: try/catch em
 * volta do JSX não pega erro de renderização, porque o React só renderiza
 * depois. A mensagem técnica não vai para a tela — quem está no caixa não
 * precisa ler stack trace.
 */
export default function ErroDoPainel({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // O servidor guarda o detalhe; aqui fica só a marca para achar no log.
    if (error.digest) {
      console.error(`Falha no painel (digest ${error.digest})`);
    }
  }, [error]);

  return (
    <div
      role="alert"
      className="mx-auto max-w-lg rounded-bloco border border-vermelho/25 bg-vermelho/5 px-5 py-8 text-center"
    >
      <AlertTriangle
        className="mx-auto h-8 w-8 text-vermelho"
        aria-hidden="true"
      />
      <h1 className="fonte-titulo mt-3 text-lg font-bold text-tinta">
        Não conseguimos carregar esta tela
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-tinta-media">
        Pode ser a conexão com o banco. Nenhum dado foi alterado. Tente de novo
        em alguns segundos.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-5 inline-flex min-h-[48px] items-center gap-2 rounded-carta bg-laranja px-5 text-[15px] font-semibold text-white"
      >
        <RotateCcw className="h-4 w-4" aria-hidden="true" />
        Tentar de novo
      </button>
    </div>
  );
}
