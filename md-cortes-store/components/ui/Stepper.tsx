"use client";

import { Minus, Plus } from "lucide-react";

/** Contador − 1 +. Usado na venda e na distribuição por tamanho. */
export function Stepper({
  value,
  onChange,
  min = 0,
  max = 999,
  label,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
}) {
  const step = (delta: number) => onChange(Math.min(max, Math.max(min, value + delta)));
  return (
    <div className="flex items-center gap-1.5" role="group" aria-label={label}>
      <button
        type="button"
        onClick={() => step(-1)}
        disabled={value <= min}
        aria-label="Diminuir"
        className="flex size-10 items-center justify-center rounded-suave border border-borda text-tinta transition-colors hover:bg-areia disabled:opacity-35"
      >
        <Minus size={16} />
      </button>
      <span className="tabular w-10 text-center text-[17px] font-bold text-tinta">{value}</span>
      <button
        type="button"
        onClick={() => step(1)}
        disabled={value >= max}
        aria-label="Aumentar"
        className="flex size-10 items-center justify-center rounded-suave border border-borda text-tinta transition-colors hover:bg-areia disabled:opacity-35"
      >
        <Plus size={16} />
      </button>
    </div>
  );
}
