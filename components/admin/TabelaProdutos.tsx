"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertTriangle, Check, Loader2 } from "lucide-react";

import { salvarCustoProduto } from "@/lib/admin/acoes";
import {
  formatarCentavos,
  lerCentavos,
  mascaraCentavos,
} from "@/lib/dinheiro";
import type { ProdutoAdmin } from "@/lib/admin/tipos";

export function TabelaProdutos({
  produtos,
  precosDoCardapio,
}: {
  produtos: ProdutoAdmin[];
  precosDoCardapio: [string, number][];
}) {
  const doCardapio = new Map(precosDoCardapio);
  const divergentes = produtos.filter(
    (produto) =>
      doCardapio.has(produto.id) &&
      doCardapio.get(produto.id) !== produto.price_cents,
  );

  return (
    <div className="space-y-4">
      {divergentes.length > 0 && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-bloco border border-vermelho/25 bg-vermelho/5 px-4 py-3"
        >
          <AlertTriangle
            className="mt-0.5 h-5 w-5 shrink-0 text-vermelho"
            aria-hidden="true"
          />
          <div className="text-sm text-vermelho">
            <p className="font-semibold">
              O preço do banco está diferente do cardápio em{" "}
              {divergentes.length}{" "}
              {divergentes.length === 1 ? "item" : "itens"}.
            </p>
            <p className="mt-1">
              O cliente vê o preço do cardápio, mas quem cobra é o banco. Rode{" "}
              <code>npm run sincronizar-produtos</code> para alinhar os dois.
            </p>
          </div>
        </div>
      )}

      <ul className="space-y-2">
        {produtos.map((produto) => (
          <LinhaProduto
            key={produto.id}
            produto={produto}
            precoCardapio={doCardapio.get(produto.id)}
          />
        ))}
      </ul>
    </div>
  );
}

function LinhaProduto({
  produto,
  precoCardapio,
}: {
  produto: ProdutoAdmin;
  precoCardapio?: number;
}) {
  const router = useRouter();
  const [custo, setCusto] = useState(
    produto.cost_cents > 0 ? formatarCentavos(produto.cost_cents) : "",
  );
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const centavos = lerCentavos(custo) ?? 0;
  const lucro = produto.price_cents - centavos;
  const divergente =
    precoCardapio !== undefined && precoCardapio !== produto.price_cents;

  const salvar = async () => {
    if (salvando) return;
    setSalvando(true);
    setErro(null);
    try {
      const resultado = await salvarCustoProduto(produto.id, centavos);
      if (!resultado.ok) {
        setErro(resultado.erro);
        return;
      }
      setSalvo(true);
      window.setTimeout(() => setSalvo(false), 1800);
      router.refresh();
    } finally {
      setSalvando(false);
    }
  };

  return (
    <li className="rounded-bloco border border-borda bg-white p-4 shadow-carta">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-bold text-tinta">{produto.nome}</p>
          <p className="text-[12px] text-tinta-suave">
            {produto.categoria} · venda {formatarCentavos(produto.price_cents)}
            {divergente && (
              <span className="text-vermelho">
                {" "}
                · cardápio {formatarCentavos(precoCardapio!)}
              </span>
            )}
          </p>
        </div>

        <div>
          <label
            htmlFor={`custo-${produto.id}`}
            className="mb-1 block text-[12px] font-semibold text-tinta-media"
          >
            Custo
          </label>
          <input
            id={`custo-${produto.id}`}
            inputMode="numeric"
            placeholder="R$ 0,00"
            value={custo}
            onChange={(evento) => setCusto(mascaraCentavos(evento.target.value))}
            className="min-h-[48px] w-32 rounded-carta border border-borda px-3 text-[15px]"
          />
        </div>

        <div className="w-28">
          <p className="mb-1 text-[12px] font-semibold text-tinta-media">
            Lucro bruto
          </p>
          <p
            className={`text-[15px] font-bold ${
              lucro >= 0 ? "text-verde-positivo" : "text-vermelho"
            }`}
          >
            {formatarCentavos(lucro)}
          </p>
        </div>

        <button
          type="button"
          onClick={salvar}
          disabled={salvando}
          className="inline-flex min-h-[48px] items-center gap-2 rounded-carta bg-laranja px-4 text-[14px] font-semibold text-white disabled:opacity-70"
        >
          {salvando && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          {salvo && !salvando && <Check className="h-4 w-4" aria-hidden="true" />}
          {salvando ? "Salvando…" : salvo ? "Salvo" : "Salvar custo"}
        </button>
      </div>

      {erro && (
        <p role="alert" className="mt-2 text-[12px] text-vermelho">
          {erro}
        </p>
      )}
    </li>
  );
}
