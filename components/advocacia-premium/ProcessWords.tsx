'use client';

import React, { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import styles from './sections.module.css';

/**
 * Quatro palavras, uma de cada vez, no centro da tela.
 *
 * A rolagem é a linha do tempo: `useScroll` mede quanto da seção já passou e
 * cada palavra recebe sua própria janela dentro desse progresso. As janelas se
 * cruzam de propósito — uma palavra ainda está saindo quando a seguinte
 * começa a entrar, o que evita o piscar de tela vazia entre elas.
 *
 * Com movimento reduzido a seção vira uma lista simples, sem sticky.
 */

const PALAVRAS = ['Compreender', 'Analisar', 'Orientar', 'Atuar'];

function Palavra({
  texto,
  indice,
  total,
  progresso,
}: {
  texto: string;
  indice: number;
  total: number;
  progresso: ReturnType<typeof useScroll>['scrollYProgress'];
}) {
  const fatia = 1 / total;
  const inicio = indice * fatia;
  // margens curtas nas pontas para a primeira já entrar e a última sustentar
  const entra = inicio + fatia * 0.12;
  const plateau1 = inicio + fatia * 0.32;
  const plateau2 = inicio + fatia * 0.74;
  const sai = inicio + fatia * 0.96;

  const opacity = useTransform(
    progresso,
    [inicio, entra, plateau1, plateau2, sai],
    [0, 0.35, 1, 1, 0],
  );
  const y = useTransform(progresso, [inicio, plateau1, sai], [26, 0, -26]);
  const blur = useTransform(
    progresso,
    [inicio, plateau1, plateau2, sai],
    [10, 0, 0, 10],
  );
  const filter = useTransform(blur, (v) => `blur(${v}px)`);

  return (
    <motion.span className={styles.palavra} style={{ opacity, y, filter }}>
      {texto}
    </motion.span>
  );
}

export default function ProcessWords() {
  const alvo = useRef<HTMLElement>(null);
  const reduzir = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: alvo,
    offset: ['start start', 'end end'],
  });

  if (reduzir) {
    return (
      <section className={`section ${styles.processoSimples}`}>
        <div className="shell">
          <ul className={styles.processoLista}>
            {PALAVRAS.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      </section>
    );
  }

  return (
    <section ref={alvo} className={styles.processo} aria-label="Como o escritório conduz">
      <div className={styles.processoPalco}>
        <div className="mesh" aria-hidden />
        <div className={styles.processoCentro}>
          {PALAVRAS.map((p, i) => (
            <Palavra
              key={p}
              texto={p}
              indice={i}
              total={PALAVRAS.length}
              progresso={scrollYProgress}
            />
          ))}
        </div>
        <div className="vignette" aria-hidden />
      </div>
    </section>
  );
}
