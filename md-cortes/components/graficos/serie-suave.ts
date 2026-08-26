'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

/**
 * Leva os valores do gráfico até os novos suavemente.
 *
 * Quando um corte entra pelo tempo real, só o ponto de hoje muda de altura — e
 * ele desliza até a nova posição em vez de saltar. O caminho do SVG é
 * recalculado a partir destes valores intermediários, então nada é redesenhado
 * do zero: a linha simplesmente se move.
 *
 * A interpolação é feita à mão, e não pelo `d` animado do framer, porque `d` só
 * interpola quando as duas versões têm exatamente a mesma quantidade de
 * comandos — e a série muda de tamanho quando se troca de 7 para 30 dias.
 */
export function useSerieSuave(alvo: number[], duracao = 480): number[] {
  const reduzido = useReducedMotion();
  const [valores, setValores] = useState(alvo);
  const deRef = useRef(alvo);
  const quadroRef = useRef<number | null>(null);

  useEffect(() => {
    const de = deRef.current;

    // Mudou a quantidade de pontos (trocou o período): não há o que interpolar.
    if (reduzido || de.length !== alvo.length) {
      deRef.current = alvo;
      setValores(alvo);
      return;
    }
    if (de.every((v, i) => v === alvo[i])) return;

    const inicio = performance.now();
    const passo = (agora: number) => {
      const t = Math.min((agora - inicio) / duracao, 1);
      const suave = 1 - Math.pow(1 - t, 3);
      const atual = alvo.map((v, i) => (de[i] ?? 0) + (v - (de[i] ?? 0)) * suave);
      setValores(atual);
      if (t < 1) quadroRef.current = requestAnimationFrame(passo);
      else deRef.current = alvo;
    };
    quadroRef.current = requestAnimationFrame(passo);

    return () => {
      if (quadroRef.current) cancelAnimationFrame(quadroRef.current);
    };
  }, [alvo, duracao, reduzido]);

  return valores;
}

/**
 * Interpolação cúbica monótona (Fritsch–Carlson).
 *
 * Uma curva Catmull-Rom comum ficaria mais bonita, mas passa do ponto: entre um
 * dia de 0 e outro de 8 cortes ela desce abaixo de zero antes de subir, e um
 * gráfico de contagem não pode ter barriga negativa. Esta nunca ultrapassa os
 * valores reais.
 */
export function caminhoSuave(pontos: { x: number; y: number }[]): string {
  const n = pontos.length;
  if (n === 0) return '';
  const p0 = pontos[0]!;
  if (n === 1) return `M ${p0.x} ${p0.y}`;
  if (n === 2) {
    const p1 = pontos[1]!;
    return `M ${p0.x} ${p0.y} L ${p1.x} ${p1.y}`;
  }

  // Inclinação de cada segmento.
  const delta: number[] = [];
  for (let i = 0; i < n - 1; i += 1) {
    const a = pontos[i]!;
    const b = pontos[i + 1]!;
    delta.push((b.y - a.y) / (b.x - a.x || 1));
  }

  // Tangente em cada ponto, zerada nos extremos locais para não criar barriga.
  const m: number[] = new Array(n).fill(0);
  m[0] = delta[0]!;
  m[n - 1] = delta[n - 2]!;
  for (let i = 1; i < n - 1; i += 1) {
    const d0 = delta[i - 1]!;
    const d1 = delta[i]!;
    m[i] = d0 * d1 <= 0 ? 0 : (d0 + d1) / 2;
  }
  for (let i = 0; i < n - 1; i += 1) {
    const d = delta[i]!;
    if (d === 0) {
      m[i] = 0;
      m[i + 1] = 0;
      continue;
    }
    const a = m[i]! / d;
    const b = m[i + 1]! / d;
    const s = a * a + b * b;
    if (s > 9) {
      const escala = 3 / Math.sqrt(s);
      m[i] = escala * a * d;
      m[i + 1] = escala * b * d;
    }
  }

  let caminho = `M ${p0.x.toFixed(2)} ${p0.y.toFixed(2)}`;
  for (let i = 0; i < n - 1; i += 1) {
    const a = pontos[i]!;
    const b = pontos[i + 1]!;
    const h = (b.x - a.x) / 3;
    caminho += ` C ${(a.x + h).toFixed(2)} ${(a.y + m[i]! * h).toFixed(2)}, ${(b.x - h).toFixed(2)} ${(b.y - m[i + 1]! * h).toFixed(2)}, ${b.x.toFixed(2)} ${b.y.toFixed(2)}`;
  }
  return caminho;
}
