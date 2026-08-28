"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import type { PaymentMethod, Sale, VariantView } from "@/types";
import { PAYMENT_METHODS } from "@/lib/constants";
import { money } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Stepper } from "@/components/ui/Stepper";
import { ProductThumb, ColorDot } from "@/components/ui/ProductThumb";
import { StockBadge } from "@/components/ui/Badge";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/Toast";
import { PagamentoIcone } from "./PagamentoIcone";

/**
 * Cor, tamanho, quantidade e pagamento numa tela só.
 *
 * A forma de pagamento já vem marcada com a preferida, e o tamanho é escolhido
 * sozinho quando só existe um com peça — o caminho curto é registrar e pronto.
 */
export function FormularioVenda({
  inicial,
  coresDoProduto,
  onSucesso,
}: {
  inicial: VariantView;
  coresDoProduto: VariantView[];
  onSucesso: (venda: Sale) => void;
}) {
  const registrarVenda = useStore((s) => s.registerSale);
  const pagamentoPadrao = useStore((s) => s.settings.defaultPayment);
  const toast = useToast();

  const [variantId, setVariantId] = useState(inicial.variant.id);
  const [tamanhoEscolhido, setTamanhoEscolhido] = useState<string | null>(null);
  const [quantidadeEscolhida, setQuantidadeEscolhida] = useState(1);
  const [pagamento, setPagamento] = useState<PaymentMethod>(pagamentoPadrao);
  const [enviando, setEnviando] = useState(false);

  const view = useMemo(
    () => coresDoProduto.find((v) => v.variant.id === variantId) ?? inicial,
    [coresDoProduto, variantId, inicial],
  );

  const disponiveis = view.sizes.filter((s) => s.quantity > 0);

  // Tamanho e quantidade são derivados, não sincronizados por efeito: ao trocar
  // de cor, uma escolha que não existe mais simplesmente deixa de valer, e o
  // tamanho único já vem marcado.
  const tamanho =
    tamanhoEscolhido && disponiveis.some((s) => s.size === tamanhoEscolhido)
      ? tamanhoEscolhido
      : disponiveis.length === 1
        ? (disponiveis[0]?.size ?? null)
        : null;

  const emEstoque = disponiveis.find((s) => s.size === tamanho)?.quantity ?? 0;
  const quantidade = Math.min(Math.max(1, quantidadeEscolhida), Math.max(1, emEstoque));
  const unitario = view.product.priceCents;
  const total = unitario * quantidade;
  const podeConfirmar = Boolean(tamanho) && quantidade > 0 && quantidade <= emEstoque;

  async function confirmar() {
    if (!tamanho || !podeConfirmar) return;
    setEnviando(true);
    try {
      const venda = await registrarVenda({
        paymentMethod: pagamento,
        items: [
          {
            variantId: view.variant.id,
            productId: view.product.id,
            productName: view.product.name,
            colorName: view.variant.colorName,
            size: tamanho,
            quantity: quantidade,
            unitPriceCents: unitario,
            unitCostCents: view.product.costCents,
          },
        ],
      });
      onSucesso(venda);
    } catch {
      toast({ tone: "erro", title: "Não foi possível registrar", description: "Tente de novo." });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-card border border-borda bg-branco p-3 shadow-card">
        <ProductThumb src={view.variant.imageUrl} alt={view.product.name} size={64} />
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-[16px] font-bold leading-snug text-tinta">{view.product.name}</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-[13px] text-cinza">
            <ColorDot hex={view.variant.colorHex} />
            {view.variant.colorName}
          </p>
        </div>
        <StockBadge total={view.total} minStock={view.product.minStock} />
      </div>

      {coresDoProduto.length > 1 ? (
        <Secao titulo="Cor">
          <div className="flex flex-wrap gap-2">
            {coresDoProduto.map((cor) => {
              const ativo = cor.variant.id === variantId;
              return (
                <button
                  key={cor.variant.id}
                  type="button"
                  onClick={() => setVariantId(cor.variant.id)}
                  disabled={cor.total === 0}
                  aria-pressed={ativo}
                  className={`flex h-11 items-center gap-2 rounded-suave border px-3.5 text-[14px] font-medium transition-colors disabled:opacity-40 ${
                    ativo ? "border-ouro bg-ouro-suave text-ouro" : "border-borda bg-branco text-tinta hover:bg-areia"
                  }`}
                >
                  <ColorDot hex={cor.variant.colorHex} size={16} />
                  {cor.variant.colorName}
                </button>
              );
            })}
          </div>
        </Secao>
      ) : null}

      <Secao titulo="Tamanho" complemento={tamanho ? `${emEstoque} em estoque` : undefined}>
        {disponiveis.length === 0 ? (
          <p className="rounded-suave bg-vermelho-suave px-4 py-3 text-[14px] text-vermelho">
            Essa cor está sem peças. Registre uma entrada de estoque antes de vender.
          </p>
        ) : (
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
            {disponiveis.map((s) => {
              const ativo = s.size === tamanho;
              return (
                <button
                  key={s.size}
                  type="button"
                  onClick={() => {
                    setTamanhoEscolhido(s.size);
                    setQuantidadeEscolhida(1);
                  }}
                  aria-pressed={ativo}
                  className={`flex h-16 flex-col items-center justify-center rounded-suave border transition-colors ${
                    ativo ? "border-ouro bg-ouro-suave" : "border-borda bg-branco hover:bg-areia"
                  }`}
                >
                  <span className={`text-[15px] font-bold ${ativo ? "text-ouro" : "text-tinta"}`}>{s.size}</span>
                  <span className="tabular text-[12px] text-cinza">{s.quantity}</span>
                </button>
              );
            })}
          </div>
        )}
      </Secao>

      <Secao titulo="Quantidade">
        <div className="flex items-center justify-between">
          <Stepper
            value={quantidade}
            onChange={setQuantidadeEscolhida}
            min={1}
            max={Math.max(1, emEstoque)}
            label="Quantidade"
          />
          <span className="text-right">
            <span className="block text-[12px] text-cinza">Preço unitário</span>
            <span className="tabular block text-[16px] font-semibold text-tinta">{money(unitario)}</span>
          </span>
        </div>
      </Secao>

      <Secao titulo="Pagamento">
        <div className="grid grid-cols-4 gap-2">
          {PAYMENT_METHODS.map((forma) => {
            const ativo = forma.id === pagamento;
            return (
              <button
                key={forma.id}
                type="button"
                onClick={() => setPagamento(forma.id)}
                aria-pressed={ativo}
                className={`flex h-[76px] flex-col items-center justify-center gap-1.5 rounded-suave border transition-colors ${
                  ativo ? "border-ouro bg-ouro-suave text-ouro" : "border-borda bg-branco text-cinza hover:bg-areia"
                }`}
              >
                <PagamentoIcone forma={forma.id} />
                <span className={`text-[12px] font-medium ${ativo ? "text-ouro" : "text-grafite"}`}>{forma.label}</span>
              </button>
            );
          })}
        </div>
      </Secao>

      <motion.div layout className="flex items-center justify-between rounded-card border border-borda bg-areia px-4 py-3.5">
        <span className="text-[15px] font-semibold text-tinta">Total</span>
        <span className="tabular text-[22px] font-bold text-tinta">{money(total)}</span>
      </motion.div>

      <Button
        variant="ouro"
        size="lg"
        full
        loading={enviando}
        disabled={!podeConfirmar}
        onClick={confirmar}
        className="uppercase tracking-wide"
      >
        {enviando ? null : <ShoppingCart size={19} />}
        Confirmar venda
      </Button>
    </div>
  );
}

function Secao({
  titulo,
  complemento,
  children,
}: {
  titulo: string;
  complemento?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-2 flex items-baseline justify-between">
        <h3 className="text-[13px] font-semibold uppercase tracking-wide text-cinza">{titulo}</h3>
        {complemento ? <span className="tabular text-[13px] text-cinza">{complemento}</span> : null}
      </div>
      {children}
    </section>
  );
}
