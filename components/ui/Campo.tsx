"use client";

import { useId } from "react";
import type { ComponentProps } from "react";

/** Input sempre com label de verdade e erro ligado por aria-describedby. */
export function Campo({
  rotulo,
  erro,
  opcional = false,
  className = "",
  ...resto
}: {
  rotulo: string;
  erro?: string;
  opcional?: boolean;
} & ComponentProps<"input">) {
  const id = useId();
  const idErro = `${id}-erro`;

  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="mb-1.5 block text-[13px] font-semibold text-tinta-media"
      >
        {rotulo}
        {opcional && (
          <span className="font-normal text-tinta-suave"> (opcional)</span>
        )}
      </label>
      <input
        id={id}
        aria-invalid={erro ? true : undefined}
        aria-describedby={erro ? idErro : undefined}
        className={`min-h-[48px] w-full rounded-carta border bg-white px-4 text-[15px] text-tinta placeholder:text-tinta-suave ${
          erro ? "border-vermelho" : "border-borda"
        }`}
        {...resto}
      />
      {erro && (
        <p id={idErro} role="alert" className="mt-1.5 text-[13px] text-vermelho">
          {erro}
        </p>
      )}
    </div>
  );
}

/** Select com as mesmas garantias de rotulo e erro do Campo. */
export function CampoSelecao({
  rotulo,
  erro,
  className = "",
  children,
  ...resto
}: {
  rotulo: string;
  erro?: string;
} & ComponentProps<"select">) {
  const id = useId();
  const idErro = `${id}-erro`;

  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="mb-1.5 block text-[13px] font-semibold text-tinta-media"
      >
        {rotulo}
      </label>
      <select
        id={id}
        aria-invalid={erro ? true : undefined}
        aria-describedby={erro ? idErro : undefined}
        className={`min-h-[48px] w-full appearance-none rounded-carta border bg-white bg-[length:1.1rem] bg-[right_1rem_center] bg-no-repeat px-4 text-[15px] text-tinta ${
          erro ? "border-vermelho" : "border-borda"
        }`}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23857c76' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
        }}
        {...resto}
      >
        {children}
      </select>
      {erro && (
        <p id={idErro} role="alert" className="mt-1.5 text-[13px] text-vermelho">
          {erro}
        </p>
      )}
    </div>
  );
}

/** Area de texto para observacoes. */
export function CampoTexto({
  rotulo,
  opcional = false,
  className = "",
  ...resto
}: {
  rotulo: string;
  opcional?: boolean;
} & ComponentProps<"textarea">) {
  const id = useId();

  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="mb-1.5 block text-[13px] font-semibold text-tinta-media"
      >
        {rotulo}
        {opcional && (
          <span className="font-normal text-tinta-suave"> (opcional)</span>
        )}
      </label>
      <textarea
        id={id}
        rows={3}
        className="w-full resize-y rounded-carta border border-borda bg-white px-4 py-3 text-[15px] text-tinta placeholder:text-tinta-suave"
        {...resto}
      />
    </div>
  );
}
