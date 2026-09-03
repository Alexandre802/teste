'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ARCO_C, HASTES_A, TRAVESSA_A } from './LogoMonogram';
import { WHATSAPP_URL } from './contato';
import styles from './HeroPremium.module.css';

/**
 * Primeira tela.
 *
 * Abre praticamente vazia e se constrói na ordem do briefing: o traço dourado
 * desenha o anel do monograma, o A se inscreve nele, e só então nome,
 * assinatura da marca e título entram. Cada peça herda o atraso da anterior
 * pela constante TEMPO, para a sequência continuar coerente se algum tempo
 * mudar.
 *
 * Com `prefers-reduced-motion` a mesma composição aparece montada e imóvel.
 */

const TEMPO = {
  traco: 0.2,
  monograma: 0.7,
  nome: 1.1,
  assinatura: 1.5,
  titulo: 2.0,
  apoio: 2.35,
} as const;

const COMPRIMENTO_ARCO = 170; // ~2πr·(270/360) com r=32, arredondado para cima

export default function HeroPremium() {
  const reduzir = useReducedMotion();

  // sem movimento: tudo já no lugar
  const surgir = (atraso: number) =>
    reduzir
      ? { initial: false as const, animate: { opacity: 1, y: 0, filter: 'blur(0px)' } }
      : {
          initial: { opacity: 0, y: 12, filter: 'blur(8px)' },
          animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
          transition: { duration: 0.9, delay: atraso, ease: [0.22, 1, 0.36, 1] as const },
        };

  return (
    <header className={styles.hero} id="inicio">
      <div className={styles.spotlightCamada} aria-hidden>
        <div className="spotlight" />
        <div className="mesh" />
        <div className="grain" />
        <div className="vignette" />
      </div>

      <div className={styles.centro}>
        <svg
          className={styles.marca}
          viewBox="0 0 100 100"
          fill="none"
          role="img"
          aria-label="Almeida &amp; Costa"
        >
          {/* o traço dourado que desenha o anel */}
          <motion.path
            d={ARCO_C}
            stroke="#b89b61"
            strokeWidth={2.6}
            strokeLinecap="round"
            strokeDasharray={COMPRIMENTO_ARCO}
            initial={reduzir ? false : { strokeDashoffset: COMPRIMENTO_ARCO }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: 1.15, delay: TEMPO.traco, ease: [0.4, 0, 0.2, 1] }}
          />
          {/* o A se inscreve depois que o anel está desenhado */}
          <motion.g
            initial={reduzir ? false : { opacity: 0, scale: 0.94, filter: 'blur(6px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.85, delay: TEMPO.monograma, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: '50px 50px' }}
          >
            <path
              d={HASTES_A}
              stroke="#f4f3ef"
              strokeWidth={2.6}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d={TRAVESSA_A} stroke="#f4f3ef" strokeWidth={2.6} strokeLinecap="round" />
          </motion.g>
        </svg>

        <motion.p className={styles.nome} {...surgir(TEMPO.nome)}>
          Almeida &amp; Costa
        </motion.p>

        <motion.p className={styles.assinatura} {...surgir(TEMPO.assinatura)}>
          Advocacia e Consultoria Jurídica
        </motion.p>

        <motion.h1 className={`display ${styles.titulo}`} {...surgir(TEMPO.titulo)}>
          Orientação jurídica para decisões que exigem clareza.
        </motion.h1>

        <motion.p className={`lede ${styles.lede}`} {...surgir(TEMPO.apoio)}>
          Atuação jurídica pautada por análise, responsabilidade e acompanhamento
          próximo.
        </motion.p>

        <motion.div className={styles.acoes} {...surgir(TEMPO.apoio + 0.12)}>
          <a
            className="action action--solid"
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Entrar em contato
            <span className="action__arrow" aria-hidden>
              →
            </span>
          </a>
        </motion.div>
      </div>

      <motion.div
        className={styles.rolar}
        {...surgir(TEMPO.apoio + 0.3)}
        aria-hidden
      >
        <span>Role para continuar</span>
        <span className={styles.seta}>
          <svg viewBox="0 0 12 26" fill="none" width="12" height="26">
            <path
              d="M6 0v22M1 17l5 5 5-5"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </motion.div>
    </header>
  );
}
