'use client';

import React from 'react';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { useEntrada } from './entrada';
import styles from './sections.module.css';

/**
 * O escritório.
 *
 * A imagem entra levemente ampliada e assenta em 1 — o movimento é da própria
 * fotografia, não de um contêiner por cima dela, para o texto sobreposto ficar
 * parado e legível durante a entrada.
 */
export default function OfficeSection() {
  const { bloco } = useEntrada();
  const reduzir = useReducedMotion();

  return (
    <section className={styles.escritorio}>
      <motion.figure className={styles.escritorioMoldura} {...bloco}>
        <motion.div
          className={styles.escritorioImagem}
          initial={reduzir ? false : { scale: 1.08 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <Image
            src="/advocacia-premium/mesa-assinatura.webp"
            alt="Mesa de trabalho do escritório, com documento sendo assinado"
            width={1100}
            height={730}
            sizes="(max-width: 860px) 100vw, 1120px"
            className={styles.escritorioFoto}
          />
        </motion.div>

        <figcaption className={styles.escritorioTexto}>
          <span className="label">O escritório</span>
          <h2 className={`display ${styles.escritorioTitulo}`}>O escritório.</h2>
          <p className={styles.escritorioLede}>
            Um ambiente de trabalho organizado em torno de leitura atenta,
            registro e acompanhamento.
          </p>
        </figcaption>
      </motion.figure>
    </section>
  );
}
