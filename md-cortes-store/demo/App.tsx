"use client";

/**
 * Casca do build de demonstração.
 *
 * Monta exatamente as mesmas telas do app — nenhum componente é reescrito
 * aqui. O que muda é só o entorno: rota por hash em vez do App Router, e
 * nenhuma sessão, porque não há Supabase para autenticar contra.
 *
 * A fila de sincronização é deixada como está de propósito: sem banco ligado,
 * as vendas ficam pendentes no aparelho, que é exatamente o comportamento do
 * app de verdade quando falta internet.
 */
import { useEffect, useRef, useState } from "react";
import { ToastProvider } from "@/components/ui/Toast";
import { BottomNav } from "@/components/layout/BottomNav";
import { ReminderDialog } from "@/components/layout/ReminderDialog";
import { useStore } from "@/lib/store";
import { PRODUTOS_DEMONSTRACAO, FORNECEDOR_DEMONSTRACAO } from "@/services/demonstracao";
import { Roteador, useRota, casar } from "./atalhos/roteador";

import Dashboard from "@/app/(app)/page";
import Venda from "@/app/(app)/venda/page";
import Estoque from "@/app/(app)/estoque/page";
import DetalheProduto from "@/app/(app)/estoque/[variantId]/page";
import NovoProduto from "@/app/(app)/produto/novo/page";
import EditarProduto from "@/app/(app)/produto/[variantId]/editar/page";
import Entrada from "@/app/(app)/entrada/page";
import Reposicao from "@/app/(app)/reposicao/page";
import Financeiro from "@/app/(app)/financeiro/page";
import Despesas from "@/app/(app)/despesas/page";
import Relatorios from "@/app/(app)/relatorios/page";
import Vendas from "@/app/(app)/vendas/page";
import Fechamento from "@/app/(app)/fechamento/page";
import Mais from "@/app/(app)/mais/page";
import Lembretes from "@/app/(app)/mais/lembretes/page";
import Configuracoes from "@/app/(app)/mais/configuracoes/page";
import Fornecedores from "@/app/(app)/mais/fornecedores/page";
import Busca from "@/app/(app)/busca/page";
import BemVindo from "@/app/(app)/bem-vindo/page";

const ROTAS: { padrao: string; Tela: React.ComponentType }[] = [
  { padrao: "/", Tela: Dashboard },
  { padrao: "/venda", Tela: Venda },
  { padrao: "/estoque", Tela: Estoque },
  { padrao: "/estoque/:variantId", Tela: DetalheProduto },
  { padrao: "/produto/novo", Tela: NovoProduto },
  { padrao: "/produto/:variantId/editar", Tela: EditarProduto },
  { padrao: "/entrada", Tela: Entrada },
  { padrao: "/reposicao", Tela: Reposicao },
  { padrao: "/financeiro", Tela: Financeiro },
  { padrao: "/despesas", Tela: Despesas },
  { padrao: "/relatorios", Tela: Relatorios },
  { padrao: "/vendas", Tela: Vendas },
  { padrao: "/fechamento", Tela: Fechamento },
  { padrao: "/mais", Tela: Mais },
  { padrao: "/mais/lembretes", Tela: Lembretes },
  { padrao: "/mais/configuracoes", Tela: Configuracoes },
  { padrao: "/mais/fornecedores", Tela: Fornecedores },
  { padrao: "/busca", Tela: Busca },
  { padrao: "/bem-vindo", Tela: BemVindo },
];

const PADROES = ROTAS.map((r) => r.padrao);

function Conteudo() {
  const { caminho } = useRota();
  const encontrada = ROTAS.find((r) => casar(r.padrao, caminho) !== null);
  const Tela = encontrada?.Tela ?? Dashboard;
  const semBarra = caminho === "/bem-vindo";

  return (
    <div className="min-h-dvh bg-branco">
      <main
        className="mx-auto w-full max-w-2xl px-4 lg:max-w-3xl"
        style={{ paddingBottom: semBarra ? 24 : "calc(var(--altura-barra) + 20px)" }}
      >
        <Tela />
      </main>
      {semBarra ? null : (
        <>
          <BottomNav />
          <ReminderDialog />
        </>
      )}
    </div>
  );
}

function AvisoDemonstracao() {
  const [aberto, setAberto] = useState(true);
  if (!aberto) return null;
  return (
    <div className="border-b border-ouro-borda bg-ouro-suave px-4 py-2.5">
      <div className="mx-auto flex max-w-2xl items-start gap-3 lg:max-w-3xl">
        <p className="flex-1 text-[12px] leading-snug text-grafite">
          <strong className="font-semibold text-tinta">Demonstração.</strong> Sem login e sem banco: os dados ficam
          só neste navegador, e as vendas aparecem como pendentes de sincronização — igual a quando falta internet.
        </p>
        <button
          type="button"
          onClick={() => setAberto(false)}
          className="shrink-0 text-[12.5px] font-semibold text-ouro hover:underline"
        >
          Ok
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const hydrate = useStore((s) => s.hydrate);
  const ready = useStore((s) => s.ready);
  // Trava de semeadura num ref: é controle de execução, não estado de tela.
  const semeado = useRef(false);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!ready || semeado.current) return;
    semeado.current = true;
    const estado = useStore.getState();
    if (estado.products.length > 0) return;

    void (async () => {
      const fornecedorId = await estado.saveSupplier(FORNECEDOR_DEMONSTRACAO);
      for (const produto of PRODUTOS_DEMONSTRACAO) {
        await useStore.getState().saveProduct({ ...produto, supplierId: fornecedorId });
      }
      await useStore.getState().saveSettings({ onboarded: true });
    })();
  }, [ready]);

  if (!ready) {
    return <div className="grid min-h-dvh place-items-center bg-branco text-[15px] text-cinza">Carregando…</div>;
  }

  return (
    <ToastProvider>
      <AvisoDemonstracao />
      <Roteador rotas={PADROES}>
        <Conteudo />
      </Roteador>
    </ToastProvider>
  );
}
