"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Receipt, Trash2 } from "lucide-react";
import type { ExpenseCategory } from "@/types";
import { EXPENSE_CATEGORIES, expenseCategoryLabel } from "@/lib/constants";
import { money } from "@/lib/format";
import { longDate, RANGES, rangeFor, toDateKey, type RangeId } from "@/lib/date";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/Toast";
import { PageHeader } from "@/components/ui/PageHeader";
import { Chip, ChipRow } from "@/components/ui/Chip";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Input, MoneyInput, Select } from "@/components/ui/Field";
import { Sheet } from "@/components/ui/Sheet";
import { EmptyState } from "@/components/ui/EmptyState";

export default function DespesasPage() {
  const expenses = useStore((s) => s.expenses);
  const removeExpense = useStore((s) => s.removeExpense);
  const [periodo, setPeriodo] = useState<RangeId>("30d");
  const [aberto, setAberto] = useState(false);
  const toast = useToast();

  const lista = useMemo(() => {
    const { start, end } = rangeFor(periodo);
    return expenses
      .filter((e) => {
        const dia = new Date(`${e.spentOn}T12:00:00`);
        return dia >= start && dia < end;
      })
      .sort((a, b) => b.spentOn.localeCompare(a.spentOn));
  }, [expenses, periodo]);

  const total = lista.reduce((soma, e) => soma + e.amountCents, 0);

  return (
    <>
      <PageHeader
        title="Despesas"
        action={
          <button
            type="button"
            onClick={() => setAberto(true)}
            aria-label="Nova despesa"
            className="flex size-10 items-center justify-center rounded-full text-ouro transition-colors hover:bg-ouro-suave"
          >
            <Plus size={21} />
          </button>
        }
      />

      <ChipRow>
        {RANGES.map((r) => (
          <Chip key={r.id} active={periodo === r.id} onClick={() => setPeriodo(r.id)}>
            {r.label}
          </Chip>
        ))}
      </ChipRow>

      <Card className="mt-4 flex items-center justify-between px-4 py-3.5">
        <span className="text-[15px] text-grafite">Total no período</span>
        <span className="tabular text-[19px] font-bold text-laranja">{money(total)}</span>
      </Card>

      {lista.length === 0 ? (
        <EmptyState
          icon={<Receipt size={26} />}
          title="Nenhuma despesa no período"
          description="Registre compras de mercadoria, frete, embalagem e o que mais sair do caixa."
          action={
            <Button variant="principal" size="md" onClick={() => setAberto(true)}>
              <Plus size={18} />
              Nova despesa
            </Button>
          }
        />
      ) : (
        <ul className="mt-4 space-y-2">
          {lista.map((despesa, indice) => (
            <motion.li
              key={despesa.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, delay: Math.min(indice * 0.025, 0.25) }}
              className="flex items-center gap-3 rounded-card border border-borda bg-branco p-3.5 shadow-card"
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-semibold text-tinta">{despesa.description}</span>
                <span className="block text-[13px] text-cinza">
                  {expenseCategoryLabel(despesa.category)} · {longDate(`${despesa.spentOn}T12:00:00`)}
                </span>
              </span>
              <span className="tabular shrink-0 text-[15px] font-bold text-laranja">
                {money(despesa.amountCents)}
              </span>
              <button
                type="button"
                onClick={async () => {
                  await removeExpense(despesa.id);
                  toast({ tone: "sucesso", title: "Despesa removida" });
                }}
                aria-label={`Remover ${despesa.description}`}
                className="flex size-9 shrink-0 items-center justify-center rounded-full text-cinza-claro transition-colors hover:bg-vermelho-suave hover:text-vermelho"
              >
                <Trash2 size={16} />
              </button>
            </motion.li>
          ))}
        </ul>
      )}

      <NovaDespesa aberto={aberto} onFechar={() => setAberto(false)} />
    </>
  );
}

function NovaDespesa({ aberto, onFechar }: { aberto: boolean; onFechar: () => void }) {
  const saveExpense = useStore((s) => s.saveExpense);
  const toast = useToast();
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState(0);
  const [categoria, setCategoria] = useState<ExpenseCategory>("mercadoria");
  const [data, setData] = useState(toDateKey(new Date()));
  const [enviando, setEnviando] = useState(false);

  async function salvar(evento: React.FormEvent) {
    evento.preventDefault();
    if (!descricao.trim() || valor <= 0) return;
    setEnviando(true);
    await saveExpense({ description: descricao, amountCents: valor, category: categoria, spentOn: data });
    toast({ tone: "sucesso", title: "Despesa registrada" });
    setDescricao("");
    setValor(0);
    setEnviando(false);
    onFechar();
  }

  return (
    <Sheet open={aberto} onClose={onFechar} title="Nova despesa">
      <form onSubmit={salvar} className="space-y-4 pb-6">
        <Field label="Descrição">
          <Input
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Compra de camisetas — fornecedor"
            required
            autoFocus
          />
        </Field>
        <Field label="Valor">
          <MoneyInput valueCents={valor} onChangeCents={setValor} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Categoria">
            <Select value={categoria} onChange={(e) => setCategoria(e.target.value as ExpenseCategory)}>
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Data">
            <Input type="date" value={data} onChange={(e) => setData(e.target.value)} required />
          </Field>
        </div>
        <Button type="submit" variant="principal" size="lg" full loading={enviando} disabled={valor <= 0}>
          Salvar despesa
        </Button>
      </form>
    </Sheet>
  );
}
