'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { DayPoint } from '@/lib/types';
import { moeda, moedaCurta, plural } from '@/lib/format';
import { rotuloDataLonga } from '@/lib/date';
import { Icone } from '@/components/ui/Icone';
import { caminhoSuave, useSerieSuave } from './serie-suave';

export type Metrica = 'cortes' | 'faturamento';

export interface Periodo {
  id: string;
  rotulo: string;
}

interface Props {
  titulo: string;
  serie: DayPoint[];
  metrica?: Metrica;
  altura?: number;
  periodos?: Periodo[];
  periodoAtivo?: string;
  aoTrocarPeriodo?: (id: string) => void;
  aoTrocarMetrica?: (m: Metrica) => void;
  /** Mostra o par de botões Cortes / Faturamento. */
  alternaMetrica?: boolean;
}

const MARGEM = { topo: 16, direita: 12, baixo: 26, esquerda: 12 };
/** Dentro da faixa que o pedido define: 800 ms a 1,2 s. */
const DURACAO_TRACO = 1.0;

/**
 * "Atividade de cortes" — a linha que conta como foi a semana.
 *
 * A abertura é a parte que importa: a área aparece, a linha começa no primeiro
 * dia e é desenhada até o último, e cada ponto surge no instante em que o traço
 * passa por ele. Depois disso a linha nunca mais é redesenhada: quando um corte
 * novo chega, só a altura do ponto de hoje muda, deslizando.
 *
 * O balão funciona no toque, que é como o funcionário vai usar, e no ponteiro,
 * que é como o Maicon vai olhar no computador.
 */
export function ResultsChart({
  titulo,
  serie,
  metrica = 'cortes',
  altura = 176,
  periodos,
  periodoAtivo,
  aoTrocarPeriodo,
  aoTrocarMetrica,
  alternaMetrica = false,
}: Props) {
  const reduzido = useReducedMotion();
  const areaRef = useRef<HTMLDivElement>(null);
  const [largura, setLargura] = useState(0);
  const [selecionado, setSelecionado] = useState<number | null>(null);

  // O SVG precisa da largura em pixels de verdade: com viewBox esticado, o
  // traço de 2px vira 3 de um lado e 1 do outro.
  useLayoutEffect(() => {
    const alvo = areaRef.current;
    if (!alvo) return;
    const medir = () => setLargura(alvo.clientWidth);
    medir();
    const observador = new ResizeObserver(medir);
    observador.observe(alvo);
    return () => observador.disconnect();
  }, []);

  const valores = useMemo(
    () => serie.map((p) => (metrica === 'cortes' ? p.count : p.revenue)),
    [serie, metrica],
  );

  const { pontos, caminhoLinha, caminhoArea, maximo, vazio } = useGeometria(
    valores,
    largura,
    altura,
  );

  // Um toque fora do gráfico fecha o balão — no celular não existe "sair com o
  // ponteiro", e o balão aberto para sempre atrapalharia a leitura.
  useEffect(() => {
    if (selecionado === null) return;
    const fora = (e: PointerEvent) => {
      if (!areaRef.current?.contains(e.target as Node)) setSelecionado(null);
    };
    document.addEventListener('pointerdown', fora);
    return () => document.removeEventListener('pointerdown', fora);
  }, [selecionado]);

  const indiceDoToque = useCallback(
    (clientX: number) => {
      const caixa = areaRef.current?.getBoundingClientRect();
      if (!caixa || serie.length === 0) return null;
      const util = Math.max(caixa.width - MARGEM.esquerda - MARGEM.direita, 1);
      const relativo = (clientX - caixa.left - MARGEM.esquerda) / util;
      const i = Math.round(relativo * (serie.length - 1));
      return Math.min(Math.max(i, 0), serie.length - 1);
    },
    [serie.length],
  );

  const ponto = selecionado === null ? null : serie[selecionado];
  const formatarEixo = metrica === 'cortes' ? (v: number) => String(v) : moedaCurta;

  return (
    <section className="cartao overflow-hidden p-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[0.95rem] font-semibold text-neve">{titulo}</h2>
        {periodos && periodos.length > 0 ? (
          <Alternador
            opcoes={periodos.map((p) => ({ id: p.id, rotulo: p.rotulo }))}
            ativo={periodoAtivo ?? periodos[0]!.id}
            aoTrocar={(id) => {
              setSelecionado(null);
              aoTrocarPeriodo?.(id);
            }}
          />
        ) : null}
      </header>

      {alternaMetrica ? (
        <div className="mt-3">
          <Alternador
            opcoes={[
              { id: 'cortes', rotulo: 'Cortes' },
              { id: 'faturamento', rotulo: 'Faturamento' },
            ]}
            ativo={metrica}
            aoTrocar={(id) => {
              setSelecionado(null);
              aoTrocarMetrica?.(id as Metrica);
            }}
          />
        </div>
      ) : null}

      <div
        ref={areaRef}
        className="relative mt-4 touch-pan-y select-none"
        style={{ height: altura }}
        onPointerDown={(e) => setSelecionado(indiceDoToque(e.clientX))}
        onPointerMove={(e) => {
          if (e.pointerType === 'mouse' || e.buttons > 0) setSelecionado(indiceDoToque(e.clientX));
        }}
        onPointerLeave={(e) => {
          if (e.pointerType === 'mouse') setSelecionado(null);
        }}
      >
        {largura > 0 ? (
          <svg
            width={largura}
            height={altura}
            viewBox={`0 0 ${largura} ${altura}`}
            className="overflow-visible"
            role="img"
            aria-label={`${titulo}: ${serie.length} ${plural(serie.length, 'dia', 'dias')}`}
          >
            <defs>
              <linearGradient id="md-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#d9a441" stopOpacity="0.32" />
                <stop offset="100%" stopColor="#d9a441" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="md-linha" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#a97b28" />
                <stop offset="45%" stopColor="#d9a441" />
                <stop offset="100%" stopColor="#f0cd80" />
              </linearGradient>
            </defs>

            {/* Linha de base — sustenta o gráfico mesmo sem nenhum dado. */}
            <line
              x1={MARGEM.esquerda}
              y1={altura - MARGEM.baixo}
              x2={largura - MARGEM.direita}
              y2={altura - MARGEM.baixo}
              stroke="#232733"
              strokeWidth={1}
            />

            {!vazio ? (
              <>
                <motion.path
                  d={caminhoArea}
                  fill="url(#md-area)"
                  initial={reduzido ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.45, delay: DURACAO_TRACO * 0.45 }}
                />
                <motion.path
                  d={caminhoLinha}
                  fill="none"
                  stroke="url(#md-linha)"
                  strokeWidth={2.4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={reduzido ? false : { pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: DURACAO_TRACO, ease: [0.32, 0.72, 0.35, 1] }}
                />
              </>
            ) : null}

            {/* Guia vertical do dia tocado. */}
            {ponto && pontos[selecionado!] ? (
              <line
                x1={pontos[selecionado!]!.x}
                y1={MARGEM.topo - 6}
                x2={pontos[selecionado!]!.x}
                y2={altura - MARGEM.baixo}
                stroke="#d9a441"
                strokeOpacity={0.4}
                strokeWidth={1}
                strokeDasharray="3 3"
              />
            ) : null}

            {!vazio
              ? pontos.map((p, i) => {
                  const ativo = i === selecionado;
                  // Cada ponto nasce no instante em que o traço chega nele.
                  const atraso =
                    pontos.length > 1 ? (i / (pontos.length - 1)) * DURACAO_TRACO * 0.92 : 0;
                  return (
                    <motion.circle
                      key={serie[i]?.dayKey ?? i}
                      cx={p.x}
                      cy={p.y}
                      r={ativo ? 5.5 : 3.4}
                      fill={ativo ? '#f0cd80' : '#0b0d12'}
                      stroke="#d9a441"
                      strokeWidth={ativo ? 2 : 1.8}
                      initial={reduzido ? false : { scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.26, delay: atraso, ease: 'easeOut' }}
                      style={{ transformOrigin: `${p.x}px ${p.y}px` }}
                    />
                  );
                })
              : null}
          </svg>
        ) : null}

        {vazio ? (
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-6 text-center">
            <p className="text-[0.82rem] leading-snug text-fumaca-fraca">
              Os resultados aparecerão conforme os cortes forem registrados.
            </p>
          </div>
        ) : null}

        <AnimatePresence>
          {ponto && pontos[selecionado!] ? (
            <Balao
              ponto={ponto}
              x={pontos[selecionado!]!.x}
              larguraArea={largura}
            />
          ) : null}
        </AnimatePresence>
      </div>

      {/* Eixo dos dias. */}
      <div
        className="mt-1 flex justify-between px-[12px] text-[0.68rem] text-fumaca-fraca"
        aria-hidden="true"
      >
        {serie.map((p, i) => (
          <span
            key={p.dayKey}
            className={`${mostraRotulo(i, serie.length) ? '' : 'invisible'} ${
              i === selecionado ? 'font-semibold text-ouro' : ''
            }`}
          >
            {p.label}
          </span>
        ))}
      </div>

      {!vazio ? (
        <div className="mt-2 flex items-center justify-between gap-3 text-[0.7rem] text-fumaca-fraca">
          <span className="flex items-center gap-1.5">
            <Icone nome="celular" tamanho={12} className="shrink-0" />
            Toque em um dia para ver o resultado
          </span>
          <span className="shrink-0 whitespace-nowrap">
            Máximo: <strong className="font-semibold text-fumaca">{formatarEixo(maximo)}</strong>
          </span>
        </div>
      ) : null}
    </section>
  );
}

/* ── partes ─────────────────────────────────────────────────────────────── */

function Balao({
  ponto,
  x,
  larguraArea,
}: {
  ponto: DayPoint;
  x: number;
  larguraArea: number;
}) {
  const LARGURA = 168;
  // Encosta nas bordas em vez de vazar para fora do cartão.
  const esquerda = Math.min(Math.max(x - LARGURA / 2, 0), Math.max(larguraArea - LARGURA, 0));
  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.97 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="pointer-events-none absolute top-0 z-10 rounded-xl border border-ouro/25 bg-noite-alta/95 px-3 py-2 backdrop-blur-md"
      style={{ left: esquerda, width: LARGURA }}
    >
      <p className="text-[0.78rem] font-semibold text-neve">{rotuloDataLonga(ponto.dayKey)}</p>
      <p className="mt-1 text-[0.78rem] text-fumaca">
        <span className="font-semibold text-ouro">{ponto.count}</span>{' '}
        {plural(ponto.count, 'corte', 'cortes')}
      </p>
      <p className="text-[0.78rem] text-fumaca">
        <span className="font-semibold text-neve">{moeda(ponto.revenue)}</span> faturados
      </p>
    </motion.div>
  );
}

export function Alternador({
  opcoes,
  ativo,
  aoTrocar,
}: {
  opcoes: { id: string; rotulo: string }[];
  ativo: string;
  aoTrocar: (id: string) => void;
}) {
  return (
    <div
      role="tablist"
      className="flex items-center gap-0.5 rounded-full border border-grafite bg-noite-alta p-0.5"
    >
      {opcoes.map((o) => {
        const selecionado = o.id === ativo;
        return (
          <button
            key={o.id}
            role="tab"
            type="button"
            aria-selected={selecionado}
            onClick={() => aoTrocar(o.id)}
            className={`relative rounded-full px-3 py-1.5 text-[0.72rem] font-semibold transition-colors ${
              selecionado ? 'text-noite' : 'text-fumaca hover:text-neve'
            }`}
          >
            {selecionado ? (
              <motion.span
                layoutId={`alternador-${opcoes.map((x) => x.id).join('-')}`}
                className="absolute inset-0 rounded-full bg-linear-to-b from-ouro-claro to-ouro"
                transition={{ type: 'spring', stiffness: 520, damping: 40 }}
              />
            ) : null}
            <span className="relative">{o.rotulo}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ── geometria ──────────────────────────────────────────────────────────── */

function useGeometria(valores: number[], largura: number, altura: number) {
  const suaves = useSerieSuave(valores);

  return useMemo(() => {
    const n = suaves.length;
    const maximoReal = Math.max(...valores, 0);
    // Um pouco de folga no topo para o ponto mais alto não encostar na borda.
    const teto = maximoReal > 0 ? maximoReal * 1.18 : 1;
    const util = Math.max(largura - MARGEM.esquerda - MARGEM.direita, 1);
    const alturaUtil = Math.max(altura - MARGEM.topo - MARGEM.baixo, 1);
    const base = altura - MARGEM.baixo;

    const pontos = suaves.map((v, i) => ({
      x: MARGEM.esquerda + (n > 1 ? (i / (n - 1)) * util : util / 2),
      y: base - (Math.max(v, 0) / teto) * alturaUtil,
    }));

    const caminhoLinha = caminhoSuave(pontos);
    const primeiro = pontos[0];
    const ultimo = pontos[n - 1];
    const caminhoArea =
      caminhoLinha && primeiro && ultimo
        ? `${caminhoLinha} L ${ultimo.x.toFixed(2)} ${base} L ${primeiro.x.toFixed(2)} ${base} Z`
        : '';

    return { pontos, caminhoLinha, caminhoArea, maximo: maximoReal, vazio: maximoReal === 0 };
  }, [suaves, valores, largura, altura]);
}

/** Mostra o rótulo de todos os dias em períodos curtos; a cada 5 nos longos. */
function mostraRotulo(indice: number, total: number): boolean {
  if (total <= 8) return true;
  const passo = Math.ceil(total / 6);
  return indice % passo === 0 || indice === total - 1;
}
