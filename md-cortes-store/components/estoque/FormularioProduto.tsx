"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Palette, Plus, Save, Trash2 } from "lucide-react";
import type { CategoryId, VariantView } from "@/types";
import {
  CATEGORIES,
  COLOR_PRESETS,
  DEFAULT_SIZES,
  SHOE_SIZES,
  SINGLE_SIZE,
  compareSizes,
} from "@/lib/constants";
import { useStore, type ProductDraftVariant } from "@/lib/store";
import { useToast } from "@/components/ui/Toast";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Input, MoneyInput, Select } from "@/components/ui/Field";
import { Chip } from "@/components/ui/Chip";
import { Stepper } from "@/components/ui/Stepper";
import { ColorDot } from "@/components/ui/ProductThumb";
import { SeletorFoto } from "./SeletorFoto";

interface CorEditavel extends ProductDraftVariant {
  chave: string;
}

/**
 * Cadastro e edição do produto.
 *
 * Os tamanhos são do produto, não da cor: é assim que a loja trabalha (a mesma
 * camiseta em P/M/G/GG nas duas cores) e evita repetir a grade em cada cor.
 * Na edição, a quantidade digitada vira ajuste de estoque — o número não é
 * sobrescrito por baixo dos panos, entra como movimentação e fica no histórico.
 */
export function FormularioProduto({ base }: { base?: VariantView }) {
  const router = useRouter();
  const toast = useToast();
  const salvar = useStore((s) => s.saveProduct);
  const suppliers = useStore((s) => s.suppliers);
  const catalogo = useStore((s) => s.variants);
  const inventory = useStore((s) => s.inventory);

  const coresExistentes = useMemo<CorEditavel[]>(() => {
    if (!base) {
      return [
        {
          chave: "nova-1",
          colorName: COLOR_PRESETS[0]?.name ?? "Preta",
          colorHex: COLOR_PRESETS[0]?.hex ?? "#111111",
          imageUrl: null,
          sku: null,
          quantities: {},
        },
      ];
    }
    return catalogo
      .filter((v) => v.productId === base.product.id && !v.archived)
      .map((v) => ({
        chave: v.id,
        id: v.id,
        colorName: v.colorName,
        colorHex: v.colorHex,
        imageUrl: v.imageUrl,
        sku: v.sku,
        quantities: Object.fromEntries(
          inventory.filter((row) => row.variantId === v.id).map((row) => [row.size, row.quantity]),
        ),
      }));
  }, [base, catalogo, inventory]);

  const tamanhosIniciais = useMemo(() => {
    const conjunto = new Set<string>();
    coresExistentes.forEach((cor) => Object.keys(cor.quantities).forEach((s) => conjunto.add(s)));
    if (conjunto.size === 0) DEFAULT_SIZES.slice(0, 4).forEach((s) => conjunto.add(s));
    return [...conjunto].sort(compareSizes);
  }, [coresExistentes]);

  const [nome, setNome] = useState(base?.product.name ?? "");
  const [categoria, setCategoria] = useState<CategoryId>(base?.product.category ?? "camiseta");
  const [fornecedor, setFornecedor] = useState(base?.product.supplierId ?? "");
  const [sku, setSku] = useState(base?.product.sku ?? "");
  const [custo, setCusto] = useState(base?.product.costCents ?? 0);
  const [preco, setPreco] = useState(base?.product.priceCents ?? 0);
  const [minimo, setMinimo] = useState(base?.product.minStock ?? 3);
  const [tamanhos, setTamanhos] = useState<string[]>(tamanhosIniciais);
  const [cores, setCores] = useState<CorEditavel[]>(coresExistentes);
  const [tamanhoNovo, setTamanhoNovo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const sugestoesTamanho = categoria === "tenis" ? SHOE_SIZES : DEFAULT_SIZES;

  function alternarTamanho(tamanho: string) {
    setTamanhos((atual) =>
      atual.includes(tamanho)
        ? atual.filter((t) => t !== tamanho)
        : [...atual, tamanho].sort(compareSizes),
    );
  }

  function adicionarTamanho() {
    const limpo = tamanhoNovo.trim().toUpperCase();
    if (!limpo || tamanhos.includes(limpo)) return;
    setTamanhos((atual) => [...atual, limpo].sort(compareSizes));
    setTamanhoNovo("");
  }

  function atualizarCor(chave: string, mudanca: Partial<CorEditavel>) {
    setCores((atual) => atual.map((cor) => (cor.chave === chave ? { ...cor, ...mudanca } : cor)));
  }

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    setErro(null);

    if (!nome.trim()) return setErro("Dê um nome ao produto.");
    if (preco <= 0) return setErro("Informe o preço de venda.");
    if (tamanhos.length === 0) return setErro("Escolha pelo menos um tamanho.");
    if (cores.some((cor) => !cor.colorName.trim())) return setErro("Toda cor precisa de um nome.");

    setEnviando(true);
    try {
      const id = await salvar({
        id: base?.product.id,
        name: nome,
        category: categoria,
        supplierId: fornecedor || null,
        sku: sku || null,
        costCents: custo,
        priceCents: preco,
        minStock: minimo,
        variants: cores.map((cor) => ({
          id: cor.id,
          colorName: cor.colorName,
          colorHex: cor.colorHex,
          imageUrl: cor.imageUrl,
          sku: cor.sku,
          quantities: Object.fromEntries(tamanhos.map((t) => [t, cor.quantities[t] ?? 0])),
        })),
      });
      toast({
        tone: "sucesso",
        title: base ? "Produto atualizado" : "Produto cadastrado",
        description: base ? undefined : "Já pode registrar vendas dessa peça.",
      });
      router.replace(id ? "/estoque" : "/estoque");
    } catch {
      setErro("Não foi possível salvar. Tente de novo.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar} className="space-y-5">
      <Card className="space-y-4 p-4">
        <Field label="Nome do produto">
          <Input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Camiseta Oversized MD"
            required
            autoFocus={!base}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Categoria">
            <Select value={categoria} onChange={(e) => setCategoria(e.target.value as CategoryId)}>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Fornecedor" hint="opcional">
            <Select value={fornecedor} onChange={(e) => setFornecedor(e.target.value)}>
              <option value="">Sem fornecedor</option>
              {suppliers.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Custo unitário">
            <MoneyInput valueCents={custo} onChangeCents={setCusto} />
          </Field>
          <Field label="Preço de venda">
            <MoneyInput valueCents={preco} onChangeCents={setPreco} />
          </Field>
        </div>

        {preco > 0 ? (
          <p className="tabular rounded-suave bg-verde-suave px-4 py-2.5 text-[14px] font-medium text-verde">
            Lucro por unidade: {((preco - custo) / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </p>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="SKU" hint="opcional">
            <Input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="CMD-OV-001" />
          </Field>
          <Field label="Estoque mínimo" hint="para o alerta">
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              value={minimo}
              onChange={(e) => setMinimo(Math.max(0, Number(e.target.value) || 0))}
            />
          </Field>
        </div>
      </Card>

      <Card className="p-4">
        <h2 className="mb-1 text-[15px] font-bold text-tinta">Tamanhos disponíveis</h2>
        <p className="mb-3 text-[13px] text-cinza">Valem para todas as cores deste produto.</p>
        <div className="flex flex-wrap gap-2">
          {[...sugestoesTamanho, SINGLE_SIZE].map((t) => (
            <Chip key={t} active={tamanhos.includes(t)} onClick={() => alternarTamanho(t)}>
              {t}
            </Chip>
          ))}
          {tamanhos
            .filter((t) => !sugestoesTamanho.includes(t as never) && t !== SINGLE_SIZE)
            .map((t) => (
              <Chip key={t} active onClick={() => alternarTamanho(t)}>
                {t}
              </Chip>
            ))}
        </div>
        <div className="mt-3 flex gap-2">
          <Input
            value={tamanhoNovo}
            onChange={(e) => setTamanhoNovo(e.target.value)}
            placeholder="Outro tamanho"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                adicionarTamanho();
              }
            }}
          />
          <Button type="button" variant="suave" size="md" onClick={adicionarTamanho}>
            <Plus size={17} />
            Incluir
          </Button>
        </div>
      </Card>

      {cores.map((cor, indice) => (
        <Card key={cor.chave} className="space-y-4 p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-[15px] font-bold text-tinta">
              <ColorDot hex={cor.colorHex} size={16} />
              Cor {indice + 1}
            </h2>
            {cores.length > 1 ? (
              <button
                type="button"
                onClick={() => setCores((atual) => atual.filter((c) => c.chave !== cor.chave))}
                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-vermelho hover:underline"
              >
                <Trash2 size={14} />
                Remover
              </button>
            ) : null}
          </div>

          <SeletorFoto
            valor={cor.imageUrl}
            onChange={(url) => atualizarCor(cor.chave, { imageUrl: url })}
            rotulo={`Foto — ${cor.colorName || "cor"}`}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nome da cor">
              <Input
                value={cor.colorName}
                onChange={(e) => atualizarCor(cor.chave, { colorName: e.target.value })}
                placeholder="Preta"
                required
              />
            </Field>
            <Field label="Tom">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={cor.colorHex}
                  onChange={(e) => atualizarCor(cor.chave, { colorHex: e.target.value })}
                  aria-label="Escolher tom da cor"
                  className="h-12 w-14 shrink-0 cursor-pointer rounded-suave border border-borda bg-branco p-1"
                />
                <div className="rolagem-invisivel flex gap-1.5 overflow-x-auto">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      title={preset.name}
                      aria-label={preset.name}
                      onClick={() => atualizarCor(cor.chave, { colorName: preset.name, colorHex: preset.hex })}
                      className="size-8 shrink-0 rounded-full border border-borda-forte"
                      style={{ background: preset.hex }}
                    />
                  ))}
                </div>
              </div>
            </Field>
          </div>

          <div>
            <span className="mb-2 block text-[13px] font-medium text-grafite">
              {base ? "Quantidade atual por tamanho" : "Quantidade inicial por tamanho"}
            </span>
            {tamanhos.length === 0 ? (
              <p className="text-[13px] text-cinza">Escolha os tamanhos acima.</p>
            ) : (
              <ul className="space-y-2">
                {tamanhos.map((t) => (
                  <li key={t} className="flex items-center justify-between rounded-suave border border-borda px-3 py-2">
                    <span className="text-[15px] font-semibold text-tinta">{t}</span>
                    <Stepper
                      value={cor.quantities[t] ?? 0}
                      onChange={(valor) =>
                        atualizarCor(cor.chave, { quantities: { ...cor.quantities, [t]: valor } })
                      }
                      label={`Quantidade do tamanho ${t}`}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      ))}

      <Button
        type="button"
        variant="suave"
        size="md"
        full
        onClick={() =>
          setCores((atual) => [
            ...atual,
            {
              chave: `nova-${Date.now()}`,
              colorName: "",
              colorHex: "#111111",
              imageUrl: null,
              sku: null,
              quantities: {},
            },
          ])
        }
      >
        <Palette size={17} />
        Adicionar outra cor
      </Button>

      {erro ? (
        <p role="alert" className="rounded-suave bg-vermelho-suave px-4 py-3 text-[14px] text-vermelho">
          {erro}
        </p>
      ) : null}

      <Button type="submit" variant="principal" size="lg" full loading={enviando}>
        {enviando ? null : <Save size={19} />}
        {base ? "Salvar alterações" : "Salvar produto"}
      </Button>
    </form>
  );
}
