'use client';

import { IconeMais, IconeMenos } from './Icons';

/**
 * Menos / número / mais. Os botões têm 40px de lado para caber no dedo sem
 * aperto (44pt no iOS, 48dp no Android — 40px + o espaçamento entre eles
 * chega lá em contexto de web).
 */
export default function QuantitySelector({
  quantidade,
  aoAlterar,
  rotulo,
  minimo = 1,
  maximo = 99,
}: {
  quantidade: number;
  aoAlterar: (novaQuantidade: number) => void;
  rotulo: string;
  minimo?: number;
  maximo?: number;
}) {
  return (
    <div className="inline-flex items-center rounded-full border border-line-2 bg-white">
      <button
        type="button"
        onClick={() => aoAlterar(quantidade - 1)}
        disabled={quantidade <= minimo}
        aria-label={`Diminuir quantidade de ${rotulo}`}
        className="grid h-10 w-10 place-items-center rounded-full text-brand-500 transition-colors hover:bg-brand-50 disabled:cursor-not-allowed disabled:text-ink-3/40 disabled:hover:bg-transparent"
      >
        <IconeMenos className="h-4 w-4" />
      </button>

      <span aria-live="polite" className="w-8 text-center text-sm font-bold text-ink">
        {quantidade}
      </span>

      <button
        type="button"
        onClick={() => aoAlterar(quantidade + 1)}
        disabled={quantidade >= maximo}
        aria-label={`Aumentar quantidade de ${rotulo}`}
        className="grid h-10 w-10 place-items-center rounded-full text-brand-500 transition-colors hover:bg-brand-50 disabled:cursor-not-allowed disabled:text-ink-3/40 disabled:hover:bg-transparent"
      >
        <IconeMais className="h-4 w-4" />
      </button>
    </div>
  );
}
