'use client';

import React, { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import styles from './TransicaoDocumento.module.css';

/**
 * A virada entre a sequência e o corpo do site.
 *
 * O documento assinado termina a sequência ocupando o quadro; aqui ele cresce
 * até estourar a tela em branco, e o branco cede para o preto com a frase.
 * É o único momento claro da metade escura do site — funciona como corte de
 * respiração antes das áreas de atuação.
 *
 * Sem movimento reduzido isso é conduzido pela rolagem, não por tempo, para
 * continuar preso ao gesto de quem lê.
 */
export default function TransicaoDocumento() {
  const alvo = useRef<HTMLElement>(null);
  const reduzir = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: alvo,
    offset: ['start start', 'end end'],
  });

  // folha crescendo até preencher
  const escalaFolha = useTransform(scrollYProgress, [0, 0.42], [0.82, 7]);
  const opacidadeFolha = useTransform(scrollYProgress, [0, 0.08, 0.4, 0.5], [0, 1, 1, 0]);
  // branco pleno, depois preto
  const branco = useTransform(scrollYProgress, [0.34, 0.46, 0.6, 0.72], [0, 1, 1, 0]);
  // frase final
  const fraseOpacidade = useTransform(scrollYProgress, [0.68, 0.82, 1], [0, 1, 1]);
  const fraseY = useTransform(scrollYProgress, [0.68, 0.86], [18, 0]);

  if (reduzir) {
    return (
      <section className={styles.simples}>
        <p className={styles.frase}>Cada situação exige uma análise própria.</p>
      </section>
    );
  }

  return (
    <section ref={alvo} className={styles.trilho} aria-label="Transição">
      <div className={styles.palco}>
        <motion.div
          className={styles.folha}
          style={{ scale: escalaFolha, opacity: opacidadeFolha }}
          aria-hidden
        />
        <motion.div className={styles.branco} style={{ opacity: branco }} aria-hidden />
        <motion.p
          className={styles.frase}
          style={{ opacity: fraseOpacidade, y: fraseY }}
        >
          Cada situação exige uma análise própria.
        </motion.p>
      </div>
    </section>
  );
}
