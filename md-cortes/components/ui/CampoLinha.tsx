import type { ReactNode } from 'react';

interface Props {
  rotulo: string;
  htmlFor?: string;
  children: ReactNode;
  erro?: string | null;
}

/**
 * A linha de formulário do MD_cortes: rótulo à esquerda, campo à direita,
 * dentro da mesma moldura. É o formato da referência e economiza altura de tela
 * — no celular, três linhas dessas cabem sem rolagem junto com o botão.
 */
export function CampoLinha({ rotulo, htmlFor, children, erro }: Props) {
  return (
    <div>
      <div
        className={`flex items-stretch overflow-hidden rounded-campo border bg-carvao-alto transition-colors ${
          erro ? 'border-alerta/60' : 'border-grafite focus-within:border-ouro/55'
        }`}
      >
        <label
          htmlFor={htmlFor}
          className="flex w-[7.5rem] shrink-0 items-center border-r border-grafite px-3 py-3 text-[0.85rem] font-medium text-fumaca"
        >
          {rotulo}
        </label>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
      {erro ? <p className="mt-1.5 px-1 text-[0.75rem] text-alerta">{erro}</p> : null}
    </div>
  );
}

/**
 * Select nativo com a aparência do app. Nativo de propósito: no celular ele
 * abre a roleta do sistema, que é mais rápida que qualquer lista desenhada.
 *
 * As <option> não fixam cor. A lista é desenhada pelo sistema, e muitos
 * navegadores ignoram o fundo que a gente pede mas obedecem a cor do texto —
 * o que dava branco sobre branco. Sem cor fixada, o navegador escolhe o par
 * certo a partir do `color-scheme` declarado em globals.css.
 */
export function Seletor({
  id,
  valor,
  aoMudar,
  opcoes,
  vazio,
}: {
  id: string;
  valor: string;
  aoMudar: (v: string) => void;
  opcoes: { valor: string; rotulo: string }[];
  vazio: string;
}) {
  return (
    <div className="relative">
      <select
        id={id}
        value={valor}
        onChange={(e) => aoMudar(e.target.value)}
        className={`w-full appearance-none bg-transparent py-3 pr-9 pl-3 text-[1rem] outline-none ${
          valor ? 'text-neve' : 'text-fumaca-fraca'
        }`}
      >
        <option value="" disabled>
          {vazio}
        </option>
        {opcoes.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.rotulo}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-ouro">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </span>
    </div>
  );
}
