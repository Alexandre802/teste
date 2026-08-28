"use client";

import { Search, X } from "lucide-react";
import type { ComponentProps } from "react";

export function SearchInput({
  value,
  onValueChange,
  placeholder = "Buscar...",
  ...props
}: {
  value: string;
  onValueChange: (value: string) => void;
} & Omit<ComponentProps<"input">, "value" | "onChange">) {
  return (
    <div className="relative">
      <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-cinza-claro" />
      <input
        {...props}
        type="search"
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        placeholder={placeholder}
        className="h-12 w-full rounded-suave border border-borda bg-branco pl-11 pr-10 text-[16px] text-tinta placeholder:text-cinza-claro focus:border-ouro-borda focus:outline-none focus:ring-2 focus:ring-ouro/15 [&::-webkit-search-cancel-button]:hidden"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onValueChange("")}
          aria-label="Limpar busca"
          className="absolute right-3 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-cinza hover:bg-areia"
        >
          <X size={15} />
        </button>
      ) : null}
    </div>
  );
}
