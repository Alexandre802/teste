import type { LucideIcon } from 'lucide-react';

/** Quadro branco do painel. */
export function Cartao({
  children,
  className = '',
  ...resto
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...resto} className={`admin-card ${className}`}>
      {children}
    </div>
  );
}

export function CabecalhoCartao({
  titulo,
  acao,
  className = '',
}: {
  titulo: string;
  acao?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-between gap-3 px-4 py-3.5 sm:px-5 ${className}`}>
      <h2 className="text-sm font-bold text-[var(--admin-tinta)] sm:text-base">{titulo}</h2>
      {acao}
    </div>
  );
}

type Tom = 'laranja' | 'verde' | 'vermelho' | 'azul' | 'neutro';

const TONS: Record<Tom, { fundo: string; texto: string; icone: string }> = {
  laranja: { fundo: 'bg-[#fff5ec]', texto: 'text-[#b8480b]', icone: 'bg-[#ffe4cf] text-[#b8480b]' },
  verde: { fundo: 'bg-[#ecfdf3]', texto: 'text-[#067647]', icone: 'bg-[#d1fadf] text-[#067647]' },
  vermelho: { fundo: 'bg-[#fef3f2]', texto: 'text-[#b42318]', icone: 'bg-[#fee4e2] text-[#b42318]' },
  azul: { fundo: 'bg-[#eff6ff]', texto: 'text-[#1849a9]', icone: 'bg-[#d1e5ff] text-[#1849a9]' },
  neutro: { fundo: 'bg-white', texto: 'text-[var(--admin-tinta)]', icone: 'bg-slate-100 text-slate-600' },
};

/**
 * Cartão de número do resumo.
 *
 * O valor vem antes do rótulo na hierarquia visual — a dona abre o painel
 * para ver quanto, não para ler "Vendas do dia".
 */
export function CartaoNumero({
  rotulo,
  valor,
  detalhe,
  tom = 'neutro',
  icone: Icone,
  variacao,
}: {
  rotulo: string;
  valor: string;
  detalhe?: string;
  tom?: Tom;
  icone?: LucideIcon;
  /** "+12%" / "−8%". Some quando não há período anterior para comparar. */
  variacao?: { texto: string; positiva: boolean } | null;
}) {
  const cores = TONS[tom];
  return (
    <div className={`admin-card ${cores.fundo} p-4`}>
      <div className="flex items-start justify-between gap-2">
        <p className={`text-xl font-extrabold leading-tight sm:text-2xl ${cores.texto}`}>{valor}</p>
        {Icone && (
          <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${cores.icone}`}>
            <Icone className="h-4 w-4" aria-hidden />
          </span>
        )}
      </div>

      <p className="mt-1 text-xs font-medium text-[var(--admin-tinta-suave)] sm:text-sm">{rotulo}</p>

      {(detalhe || variacao) && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {variacao && (
            <span
              className={`rounded-full px-1.5 py-0.5 text-[11px] font-bold ${
                variacao.positiva ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}
            >
              {variacao.texto}
            </span>
          )}
          {detalhe && <span className="text-[11px] text-[var(--admin-tinta-suave)]">{detalhe}</span>}
        </div>
      )}
    </div>
  );
}
