"use client";

import type { ComponentProps, ReactNode } from "react";
import { centsToInput, parseMoneyToCents } from "@/lib/format";

const BASE =
  "w-full rounded-suave border border-borda bg-branco px-4 text-[16px] text-tinta placeholder:text-cinza-claro " +
  "transition-colors focus:border-ouro-borda focus:outline-none focus:ring-2 focus:ring-ouro/15";

export function Label({ children, hint }: { children: ReactNode; hint?: ReactNode }) {
  return (
    <span className="mb-1.5 flex items-baseline justify-between gap-2">
      <span className="text-[13px] font-medium text-grafite">{children}</span>
      {hint ? <span className="text-[12px] text-cinza">{hint}</span> : null}
    </span>
  );
}

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label?: ReactNode;
  hint?: ReactNode;
  error?: string | null;
  children: ReactNode;
}) {
  return (
    <label className="block">
      {label ? <Label hint={hint}>{label}</Label> : null}
      {children}
      {error ? <span className="mt-1.5 block text-[13px] text-vermelho">{error}</span> : null}
    </label>
  );
}

export function Input({ className = "", ...props }: ComponentProps<"input">) {
  return <input className={`${BASE} h-12 ${className}`} {...props} />;
}

export function Textarea({ className = "", ...props }: ComponentProps<"textarea">) {
  return <textarea className={`${BASE} py-3 ${className}`} rows={3} {...props} />;
}

export function Select({ className = "", children, ...props }: ComponentProps<"select">) {
  return (
    <select
      className={`${BASE} h-12 appearance-none bg-[url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round'><path d='m6 9 6 6 6-6'/></svg>')] bg-[length:16px] bg-[right_1rem_center] bg-no-repeat pr-11 ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

/**
 * Campo de dinheiro. O estado do formulário é sempre em centavos; o texto é só
 * apresentação, para não sobrar erro de arredondamento no meio do caminho.
 */
export function MoneyInput({
  valueCents,
  onChangeCents,
  className = "",
  ...props
}: {
  valueCents: number;
  onChangeCents: (cents: number) => void;
} & Omit<ComponentProps<"input">, "value" | "onChange">) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[15px] text-cinza">R$</span>
      <input
        {...props}
        inputMode="decimal"
        defaultValue={centsToInput(valueCents)}
        onChange={(event) => onChangeCents(parseMoneyToCents(event.target.value))}
        placeholder="0,00"
        className={`${BASE} h-12 pl-11 tabular ${className}`}
      />
    </div>
  );
}
