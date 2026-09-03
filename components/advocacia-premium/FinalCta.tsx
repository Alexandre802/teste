'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useEntrada } from './entrada';
import { LogoMonogram } from './LogoMonogram';
import { WHATSAPP_URL } from './contato';
import styles from './sections.module.css';

/**
 * Fechamento.
 *
 * Quase uma tela inteira, tudo centralizado, uma ação só. A peça termina no
 * mesmo lugar em que começou — o monograma —, agora abaixo do texto.
 */
export default function FinalCta() {
  const { lista, item } = useEntrada();

  return (
    <section className={styles.fechamento}>
      <div className="spotlight" aria-hidden />
      <div className="grain" aria-hidden />

      <motion.div className={styles.fechamentoCentro} {...lista}>
        <motion.h2 className={`display ${styles.fechamentoTitulo}`} variants={item}>
          Uma conversa pode trazer mais clareza ao próximo passo.
        </motion.h2>

        <motion.div variants={item} className={styles.fechamentoAcao}>
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

        <motion.div variants={item} className={styles.fechamentoMarca}>
          <LogoMonogram tamanho={38} espessura={2.8} />
        </motion.div>
      </motion.div>
    </section>
  );
}
