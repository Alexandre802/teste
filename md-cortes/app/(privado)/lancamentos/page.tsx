'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Icone, iconeDoServico } from '@/components/ui/Icone';
import { Alternador } from '@/components/graficos/ResultsChart';
import { EstadoVazio } from '@/components/ui/EstadoVazio';
import { EsqueletoLista } from '@/components/ui/Esqueleto';
import { ContadorAnimado } from '@/components/ui/AnimatedCounter';
import { useHistorico, type Recorte } from '@/lib/hooks/use-historico';
import { usePerfis } from '@/lib/hooks/use-perfis';
import { useSessao } from '@/lib/hooks/use-sessao';
import { ROTULO_PAGAMENTO } from '@/lib/constants';
import { hojeEmSaoPaulo, hora, rotuloDataLonga } from '@/lib/date';
import { moeda, plural } from '@/lib/format';

const RECORTES: { id: Recorte; rotulo: string }[] = [
  { id: 'hoje', rotulo: 'Hoje' },
  { id: 'semana', rotulo: 'Semana' },
  { id: 'mes', rotulo: 'Mês' },
  { id: 'personalizado', rotulo: 'Período' },
];

/**
 * Histórico completo.
 *
 * O Maicon filtra por funcionário; o Gabriel e o Nino não veem esse controle
 * porque, para eles, o banco só devolve os próprios cortes de qualquer forma.
 */
export default function PaginaLancamentos() {
  const { ehAdmin } = useSessao();
  const { funcionarios } = usePerfis({ ativo: ehAdmin });
  const hoje = hojeEmSaoPaulo();

  const [recorte, setRecorte] = useState<Recorte>('hoje');
  const [funcionario, setFuncionario] = useState('');
  const [de, setDe] = useState(hoje);
  const [ate, setAte] = useState(hoje);

  const { porDia, cortes, total, carregando, erro } = useHistorico({
    recorte,
    de,
    ate,
    employeeId: funcionario || undefined,
  });

  return (
    <>
      <header className="topo-seguro px-4 pb-1">
        <h1 className="flex items-center gap-2 text-[1.4rem] font-extrabold text-neve">
          <Icone nome="lista" tamanho={21} className="text-ouro" />
          Lançamentos
        </h1>
      </header>

      <div className="mt-4 flex flex-col gap-3.5 px-4">
        <section className="cartao flex flex-col gap-3 p-3.5">
          <div className="flex items-center gap-2 text-[0.8rem] font-medium text-fumaca">
            <Icone nome="filtro" tamanho={15} className="text-ouro" />
            Filtros
          </div>

          <div className="-mx-1 overflow-x-auto px-1 pb-0.5">
            <Alternador
              opcoes={RECORTES.map((r) => ({ id: r.id, rotulo: r.rotulo }))}
              ativo={recorte}
              aoTrocar={(id) => setRecorte(id as Recorte)}
            />
          </div>

          {recorte === 'personalizado' ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="grid grid-cols-2 gap-2 overflow-hidden"
            >
              <label className="text-[0.72rem] text-fumaca-fraca">
                De
                <input
                  type="date"
                  value={de}
                  max={ate}
                  onChange={(e) => setDe(e.target.value)}
                  className="campo mt-1 py-2.5 text-[0.9rem]"
                />
              </label>
              <label className="text-[0.72rem] text-fumaca-fraca">
                Até
                <input
                  type="date"
                  value={ate}
                  min={de}
                  onChange={(e) => setAte(e.target.value)}
                  className="campo mt-1 py-2.5 text-[0.9rem]"
                />
              </label>
            </motion.div>
          ) : null}

          {ehAdmin && funcionarios.length > 0 ? (
            <div className="-mx-1 overflow-x-auto px-1 pb-0.5">
              <Alternador
                opcoes={[
                  { id: '', rotulo: 'Todos' },
                  ...funcionarios.map((f) => ({ id: f.id, rotulo: f.name })),
                ]}
                ativo={funcionario}
                aoTrocar={setFuncionario}
              />
            </div>
          ) : null}
        </section>

        <section className="cartao-ouro flex items-center justify-between p-4">
          <div>
            <p className="text-[0.78rem] text-fumaca">No período</p>
            <p className="mt-0.5 flex items-baseline gap-1.5">
              <ContadorAnimado
                valor={cortes.length}
                className="numero text-[1.6rem] font-extrabold text-neve"
              />
              <span className="text-[0.8rem] text-fumaca-fraca">
                {plural(cortes.length, 'corte', 'cortes')}
              </span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-[0.78rem] text-fumaca">Faturado</p>
            <ContadorAnimado
              valor={total}
              formatar={moeda}
              className="numero mt-0.5 block text-[1.35rem] font-extrabold text-ouro-claro"
            />
          </div>
        </section>

        {erro ? (
          <p className="flex items-start gap-2 rounded-xl border border-alerta/40 bg-alerta/8 px-3 py-2.5 text-[0.8rem] text-alerta">
            <Icone nome="alerta" tamanho={15} className="mt-0.5 shrink-0" />
            {erro}
          </p>
        ) : null}

        {carregando ? (
          <div className="cartao p-4">
            <EsqueletoLista linhas={4} />
          </div>
        ) : porDia.length === 0 ? (
          <div className="cartao">
            <EstadoVazio
              icone="lista"
              titulo="Nenhum lançamento no período"
              descricao="Troque o filtro acima ou registre um corte na tela inicial."
            />
          </div>
        ) : (
          porDia.map((dia) => (
            <section key={dia.dayKey} className="cartao overflow-hidden">
              <header className="flex items-center justify-between border-b border-grafite/70 px-4 py-3">
                <h2 className="text-[0.88rem] font-semibold text-neve">
                  {dia.dayKey === hoje ? 'Hoje' : rotuloDataLonga(dia.dayKey)}
                </h2>
                <span className="text-[0.78rem] text-fumaca">
                  {dia.cortes.length} {plural(dia.cortes.length, 'corte', 'cortes')} ·{' '}
                  <strong className="font-semibold text-ouro">{moeda(dia.total)}</strong>
                </span>
              </header>

              <ul className="divide-y divide-grafite/60">
                {dia.cortes.map((corte) => (
                  <li key={corte.id} className="flex items-center gap-3 px-4 py-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ouro/22 text-ouro/85">
                      <Icone nome={iconeDoServico(corte.serviceName)} tamanho={16} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[0.88rem] font-semibold text-neve">
                        {corte.serviceName}
                      </p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[0.73rem] text-fumaca-fraca">
                        <span className="text-ouro/80">{hora(corte.createdAt)}</span>
                        <span aria-hidden="true">•</span>
                        <span>{ROTULO_PAGAMENTO[corte.paymentMethod]}</span>
                        {ehAdmin ? (
                          <>
                            <span aria-hidden="true">•</span>
                            <span className="truncate">{corte.employeeName}</span>
                          </>
                        ) : null}
                      </p>
                    </div>
                    <span className="numero shrink-0 text-[0.9rem] font-bold text-neve">
                      {moeda(corte.price)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </div>
    </>
  );
}
