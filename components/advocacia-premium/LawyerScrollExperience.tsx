'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useReducedMotion } from 'framer-motion';
import type { PlayerRef } from '@remotion/player';
import { DURATION_IN_FRAMES, REDUCED_MOTION_FRAME } from '@/remotion/constants';
import styles from './LawyerScrollExperience.module.css';

const RemotionStage = dynamic(() => import('./RemotionStage'), { ssr: false });

/**
 * A rolagem controla o tempo do vídeo.
 *
 * A seção é alta e o palco fica preso (`sticky`) no topo enquanto ela passa.
 * A fração já percorrida vira um frame, e o frame vai para o Player por
 * `seekTo` — o Player nunca toca sozinho.
 *
 * Três cuidados que essa ponte exige:
 *  - o evento de rolagem dispara dezenas de vezes por quadro, então o cálculo
 *    é adiado para um `requestAnimationFrame` e coalescido por uma trava;
 *  - `seekTo` só é chamado quando o frame inteiro muda, senão são centenas de
 *    chamadas por segundo pedindo o mesmo quadro;
 *  - listener, observer e rAF pendente são desfeitos na saída.
 *
 * Com `prefers-reduced-motion` a seção encolhe para uma tela e o Player exibe
 * um quadro fixo: o documento já assinado, que resume a sequência.
 */
export default function LawyerScrollExperience() {
  const secaoRef = useRef<HTMLElement>(null);
  const playerRef = useRef<PlayerRef | null>(null);
  const frameAtualRef = useRef(-1);

  const [perto, setPerto] = useState(false);
  const [compact, setCompact] = useState(false);
  const reduzirMovimento = useReducedMotion();

  const guardarPlayer = useCallback((player: PlayerRef | null) => {
    playerRef.current = player;
    frameAtualRef.current = -1;
  }, []);

  // modo retrato: recorta as laterais e reenquadra a composição
  useEffect(() => {
    const consulta = window.matchMedia('(max-width: 860px), (orientation: portrait)');
    const aplicar = () => setCompact(consulta.matches);
    aplicar();
    consulta.addEventListener('change', aplicar);
    return () => consulta.removeEventListener('change', aplicar);
  }, []);

  // só monta o Player quando a seção se aproxima da tela
  useEffect(() => {
    const alvo = secaoRef.current;
    if (!alvo) return;
    if (!('IntersectionObserver' in window)) {
      setPerto(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entradas) => {
        if (entradas.some((e) => e.isIntersecting)) {
          setPerto(true);
          observer.disconnect();
        }
      },
      { rootMargin: '600px 0px' },
    );
    observer.observe(alvo);
    return () => observer.disconnect();
  }, []);

  // rolagem → frame
  useEffect(() => {
    if (!perto) return;

    if (reduzirMovimento) {
      // um quadro só, sem ouvir rolagem
      const id = window.setTimeout(() => {
        playerRef.current?.seekTo(REDUCED_MOTION_FRAME);
      }, 90);
      return () => window.clearTimeout(id);
    }

    let rafId = 0;
    let agendado = false;

    const calcular = () => {
      agendado = false;
      const secao = secaoRef.current;
      const player = playerRef.current;
      if (!secao || !player) return;

      const caixa = secao.getBoundingClientRect();
      const percurso = secao.offsetHeight - window.innerHeight;
      const progresso =
        percurso <= 0 ? 0 : Math.min(1, Math.max(0, -caixa.top / percurso));

      const frame = Math.round(progresso * (DURATION_IN_FRAMES - 1));
      if (frame === frameAtualRef.current) return;
      frameAtualRef.current = frame;
      player.seekTo(frame);
    };

    const aoRolar = () => {
      if (agendado) return;
      agendado = true;
      rafId = window.requestAnimationFrame(calcular);
    };

    window.addEventListener('scroll', aoRolar, { passive: true });
    window.addEventListener('resize', aoRolar);
    // primeira posição, caso a página abra já dentro da seção
    aoRolar();

    return () => {
      window.removeEventListener('scroll', aoRolar);
      window.removeEventListener('resize', aoRolar);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [perto, reduzirMovimento, compact]);

  return (
    <section
      ref={secaoRef}
      id="experiencia"
      className={styles.trilho}
      data-reduzido={reduzirMovimento ? 'sim' : 'nao'}
      aria-label="Sequência: análise, orientação e assinatura do documento"
    >
      <div className={styles.palco}>
        <div className={styles.quadro}>
          {perto ? (
            <RemotionStage compact={compact} aoMontar={guardarPlayer} />
          ) : null}
        </div>

        {!reduzirMovimento ? (
          <div className={styles.dica} aria-hidden>
            <span className={styles.dicaTrilho}>
              <span className={styles.dicaPonto} />
            </span>
            Role para conduzir
          </div>
        ) : null}
      </div>
    </section>
  );
}
