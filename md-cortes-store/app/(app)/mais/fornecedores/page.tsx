"use client";

import { useState } from "react";
import { Phone, Plus, Trash2, Truck } from "lucide-react";
import type { Supplier } from "@/types";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/Toast";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { Sheet } from "@/components/ui/Sheet";
import { EmptyState } from "@/components/ui/EmptyState";

export default function FornecedoresPage() {
  const suppliers = useStore((s) => s.suppliers);
  const products = useStore((s) => s.products);
  const removeSupplier = useStore((s) => s.removeSupplier);
  const toast = useToast();
  const [editando, setEditando] = useState<Supplier | "novo" | null>(null);

  return (
    <>
      <PageHeader
        title="Fornecedores"
        action={
          <button
            type="button"
            onClick={() => setEditando("novo")}
            aria-label="Novo fornecedor"
            className="flex size-10 items-center justify-center rounded-full text-ouro transition-colors hover:bg-ouro-suave"
          >
            <Plus size={21} />
          </button>
        }
      />

      {suppliers.length === 0 ? (
        <EmptyState
          icon={<Truck size={26} />}
          title="Nenhum fornecedor"
          description="Cadastre quem fornece as peças para acompanhar de onde vem cada entrada."
          action={
            <Button variant="principal" size="md" onClick={() => setEditando("novo")}>
              <Plus size={18} />
              Novo fornecedor
            </Button>
          }
        />
      ) : (
        <ul className="space-y-2.5">
          {suppliers.map((fornecedor) => {
            const emUso = products.filter((p) => p.supplierId === fornecedor.id).length;
            return (
              <li key={fornecedor.id}>
                <Card className="flex items-center gap-3 p-3.5">
                  <button
                    type="button"
                    onClick={() => setEditando(fornecedor)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <span className="block truncate text-[15px] font-semibold text-tinta">{fornecedor.name}</span>
                    <span className="mt-0.5 flex items-center gap-2 text-[13px] text-cinza">
                      {fornecedor.phone ? (
                        <span className="flex items-center gap-1">
                          <Phone size={12} />
                          {fornecedor.phone}
                        </span>
                      ) : null}
                      <span>
                        {emUso} {emUso === 1 ? "produto" : "produtos"}
                      </span>
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await removeSupplier(fornecedor.id);
                      toast({ tone: "sucesso", title: "Fornecedor removido" });
                    }}
                    aria-label={`Remover ${fornecedor.name}`}
                    className="flex size-9 shrink-0 items-center justify-center rounded-full text-cinza-claro transition-colors hover:bg-vermelho-suave hover:text-vermelho"
                  >
                    <Trash2 size={16} />
                  </button>
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      <EditorFornecedor alvo={editando} onFechar={() => setEditando(null)} />
    </>
  );
}

function EditorFornecedor({ alvo, onFechar }: { alvo: Supplier | "novo" | null; onFechar: () => void }) {
  const saveSupplier = useStore((s) => s.saveSupplier);
  const toast = useToast();
  const existente = alvo && alvo !== "novo" ? alvo : null;

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [notas, setNotas] = useState("");
  const [chave, setChave] = useState<string | null>(null);

  // Recarrega os campos quando abre outro fornecedor, sem useEffect.
  const identidade = existente?.id ?? "novo";
  if (alvo && chave !== identidade) {
    setChave(identidade);
    setNome(existente?.name ?? "");
    setTelefone(existente?.phone ?? "");
    setNotas(existente?.notes ?? "");
  }

  async function salvar(evento: React.FormEvent) {
    evento.preventDefault();
    if (!nome.trim()) return;
    await saveSupplier({
      id: existente?.id,
      name: nome,
      phone: telefone || null,
      notes: notas || null,
    });
    toast({ tone: "sucesso", title: existente ? "Fornecedor atualizado" : "Fornecedor cadastrado" });
    setChave(null);
    onFechar();
  }

  return (
    <Sheet
      open={Boolean(alvo)}
      onClose={() => {
        setChave(null);
        onFechar();
      }}
      title={existente ? "Editar fornecedor" : "Novo fornecedor"}
    >
      <form onSubmit={salvar} className="space-y-4 pb-6">
        <Field label="Nome">
          <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="MD Confecções" required autoFocus />
        </Field>
        <Field label="Telefone" hint="opcional">
          <Input
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            inputMode="tel"
            placeholder="(12) 90000-0000"
          />
        </Field>
        <Field label="Observações" hint="opcional">
          <Textarea value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Prazo, condição, contato..." />
        </Field>
        <Button type="submit" variant="principal" size="lg" full>
          Salvar
        </Button>
      </form>
    </Sheet>
  );
}
