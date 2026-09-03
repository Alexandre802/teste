'use client';

import React, { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import styles from './sections.module.css';

/**
 * Quatro palavras, uma de cada vez, no centro da tela.
 *
 * A rolagem é a linha do tempo: `useScroll` mede quanto da seção já passou e
 * cada palavra recebe sua própria janela dentro desse progresso.
 *
 * As janelas se SOBREPÕEM de propósito — a anterior só começa a sair quando a
 * seguinte já está entrando. Sem essa costura existe um instante de tela
 * vazia entre uma palavra e outra, que lê como falha de carregamento.
 *
 * A primeira janela começa em zero para a palavra já estar em cena quando a
 * seção encosta no topo: vindo do apagamento da sequência, qualquer atraso
 * aqui viraria o vazio preto que a transição antiga produzia.
 */

const PALAVRAS = ['Compreender', 'Analisar', 'Orientar', 'Atuar'];

/** início e fim de cada palavra dentro do progresso da seção */
const JANELAS: [number, number][] = [
  [0.0, 0.28],
  [0.22, 0.52],
  [0.46, 0.76],
  [0.7, 1.0],
];

function Palavra({
  texto,
  janela,
  primeira,
  ultima,
  progresso,
}: {
  texto: string;
  janela: [number, number];
  primeira: boolean;
  ultima: boolean;
  progresso: ReturnType<typeof useScroll>['scrollYProgress'];
}) {
  const [inicio, fim] = janela;
  const vao = fim - inicio;
  const entrou = inicio + vao * 0.3;
  const comeca_a_sair = inicio + vao * 0.72;

  // a primeira já nasce visível; a última não sai, sustenta até o fim
  const opacity = useTransform(
    progresso,
    [inicio, entrou, comeca_a_sair, fim],
    [primeira ? 1 : 0, 1, 1, ultima ? 1 : 0],
  );
  const y = useTransform(
    progresso,
    [inicio, entrou, comeca_a_sair, fim],
    [primeira ? 0 : 18, 0, 0, ultima ? 0 : -14],
  );
  const scale = useTransform(
    progresso,
    [inicio, entrou, comeca_a_sair, fim],
    [primeira ? 1 : 0.98, 1, 1, ultima ? 1 : 0.99],
  );
  const desfoque = useTransform(
    progresso,
    [inicio, entrou, comeca_a_sair, fim],
    [primeira ? 0 : 8, 0, 0, ultima ? 0 : 8],
  );
  const filter = useTransform(desfoque, (v) => `blur(${v}px)`);

  return (
    <motion.span className={styles.palavra} style={{ opacity, y, scale, filter }}>
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
      <section className={`${styles.processoSimples}`} aria-label="Como o escritório conduz">
        <ul className={styles.processoLista}>
          {PALAVRAS.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
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
              janela={JANELAS[i]}
              primeira={i === 0}
              ultima={i === PALAVRAS.length - 1}
              progresso={scrollYProgress}
            />
          ))}
        </div>
        <div className="vignette" aria-hidden />
      </div>
    </section>
  );
}
