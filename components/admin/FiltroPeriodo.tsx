'use client';

import { useState } from 'react';
import { CalendarDays } from 'lucide-react';
import {
  ROTULO_PERIODO,
  isoDia,
  periodoDe,
  rotuloIntervalo,
  type Periodo,
  type PeriodoId,
} from '@/lib/admin/datas';
import { Modal } from './ui/Modal';
import { Botao } from './ui/Botao';

/**
 * Seletor de período.
 *
 * "Personalizado" abre um modal com duas datas em vez de dois campos sempre
 * visíveis: no celular, dois `input[type=date]` na barra empurram o primeiro
 * cartão para fora da tela, e eles são usados uma vez a cada muitas.
 */
export const PERIODOS_PADRAO: PeriodoId[] = [
  'hoje',
  'ontem',
  'sete-dias',
  'trinta-dias',
  'este-mes',
  'mes-passado',
  'personalizado',
];

export function useFiltroPeriodo(inicial: PeriodoId = 'hoje') {
  const [id, setId] = useState<PeriodoId>(inicial);
  const [intervalo, setIntervalo] = useState({ de: isoDia(), ate: isoDia() });
  const periodo = periodoDe(id, intervalo);
  return { id, setId, intervalo, setIntervalo, periodo };
}

export default function FiltroPeriodo({
  id,
  aoTrocar,
  intervalo,
  aoTrocarIntervalo,
  periodo,
  opcoes = PERIODOS_PADRAO,
}: {
  id: PeriodoId;
  aoTrocar: (id: PeriodoId) => void;
  intervalo: { de: string; ate: string };
  aoTrocarIntervalo: (intervalo: { de: string; ate: string }) => void;
  periodo: Periodo;
  opcoes?: PeriodoId[];
}) {
  const [modalAberto, setModalAberto] = useState(false);
  const [rascunho, setRascunho] = useState(intervalo);

  const escolher = (novo: PeriodoId) => {
    if (novo === 'personalizado') {
      setRascunho(intervalo);
      setModalAberto(true);
      return;
    }
    aoTrocar(novo);
  };

  const aplicar = () => {
    aoTrocarIntervalo(rascunho);
    aoTrocar('personalizado');
    setModalAberto(false);
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <label htmlFor="filtro-periodo" className="sr-only">
          Período
        </label>
        <div className="relative">
          <CalendarDays
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <select
            id="filtro-periodo"
            value={id}
            onChange={(e) => escolher(e.target.value as PeriodoId)}
            className="admin-campo h-10 w-auto min-w-[10rem] cursor-pointer py-0 pl-9 pr-8 text-sm font-semibold"
          >
            {opcoes.map((o) => (
              <option key={o} value={o}>
                {ROTULO_PERIODO[o]}
              </option>
            ))}
          </select>
        </div>

        <span className="hidden text-xs text-[var(--admin-tinta-suave)] sm:inline">
          {rotuloIntervalo(periodo)}
        </span>
      </div>

      <Modal
        aberto={modalAberto}
        aoFechar={() => setModalAberto(false)}
        titulo="Período personalizado"
        largura="sm"
        rodape={
          <div className="flex gap-2">
            <Botao variante="secundario" className="flex-1" onClick={() => setModalAberto(false)}>
              Cancelar
            </Botao>
            <Botao className="flex-1" onClick={aplicar}>
              Aplicar
            </Botao>
          </div>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="periodo-de" className="admin-rotulo">
              Data inicial
            </label>
            <input
              id="periodo-de"
              type="date"
              value={rascunho.de}
              max={isoDia()}
              onChange={(e) => setRascunho((r) => ({ ...r, de: e.target.value }))}
              className="admin-campo"
            />
          </div>
          <div>
            <label htmlFor="periodo-ate" className="admin-rotulo">
              Data final
            </label>
            <input
              id="periodo-ate"
              type="date"
              value={rascunho.ate}
              max={isoDia()}
              onChange={(e) => setRascunho((r) => ({ ...r, ate: e.target.value }))}
              className="admin-campo"
            />
          </div>
        </div>
        <p className="mt-3 text-xs text-[var(--admin-tinta-suave)]">
          As duas datas entram no relatório. Datas invertidas são corrigidas sozinhas.
        </p>
      </Modal>
    </>
  );
}
