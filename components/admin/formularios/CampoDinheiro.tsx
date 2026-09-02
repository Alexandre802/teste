'use client';

import { lerCentavos } from '@/lib/admin/dinheiro';

/**
 * Campo de valor em reais.
 *
 * `inputMode="decimal"` abre o teclado numérico com vírgula no celular — é
 * onde este formulário vai ser preenchido, em pé, com uma mão só. O texto
 * fica cru enquanto se digita e só vira centavos na hora de salvar: formatar
 * a cada tecla move o cursor e faz a pessoa digitar o valor errado.
 */
export function CampoDinheiro({
  id,
  rotulo,
  valor,
  aoMudar,
  obrigatorio = false,
  autoFocus = false,
}: {
  id: string;
  rotulo: string;
  valor: string;
  aoMudar: (texto: string) => void;
  obrigatorio?: boolean;
  autoFocus?: boolean;
}) {
  const centavos = lerCentavos(valor);
  const invalido = valor.trim() !== '' && (centavos === null || centavos <= 0);

  return (
    <div>
      <label htmlFor={id} className="admin-rotulo">
        {rotulo}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
          R$
        </span>
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoFocus={autoFocus}
          required={obrigatorio}
          value={valor}
          onChange={(e) => aoMudar(e.target.value)}
          placeholder="0,00"
          aria-invalid={invalido || undefined}
          aria-describedby={invalido ? `${id}-erro` : undefined}
          className="admin-campo pl-10"
        />
      </div>
      {invalido && (
        <p id={`${id}-erro`} className="mt-1 text-xs text-[var(--admin-vermelho)]">
          Informe um valor maior que zero, como 25,00.
        </p>
      )}
    </div>
  );
}
