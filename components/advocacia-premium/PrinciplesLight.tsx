'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useEntrada } from './entrada';
import styles from './sections.module.css';

/**
 * A única seção clara do site.
 *
 * Serve de respiro entre dois blocos escuros — o olho descansa e o escuro
 * seguinte volta a impressionar. Os quatro conceitos são numerados porque
 * descrevem uma ordem real de trabalho, não para enfeitar.
 */

const CONCEITOS = [
  { n: '01', titulo: 'Atendimento individual', texto: 'Cada situação é lida por inteiro antes de qualquer encaminhamento.' },
  { n: '02', titulo: 'Comunicação clara', texto: 'Orientação em linguagem compreensível, sem termo desnecessário.' },
  { n: '03', titulo: 'Análise detalhada', texto: 'Documentos e circunstâncias examinados com tempo e critério.' },
  { n: '04', titulo: 'Acompanhamento próximo', texto: 'Retorno sobre cada etapa, do início ao desfecho.' },
];

export default function PrinciplesLight() {
  const { lista, item } = useEntrada();

  return (
    <section className="section section--light" id="escritorio">
      <div className="shell">
        <motion.div className={styles.claraCabeca} {...lista}>
          <motion.span className={styles.claraLabel} variants={item}>
            Forma de atuação
          </motion.span>
          <motion.h2 className={`display ${styles.claraTitulo}`} variants={item}>
            Uma atuação construída sobre responsabilidade.
          </motion.h2>
        </motion.div>

        <motion.ol className={styles.conceitos} {...lista}>
          {CONCEITOS.map((c) => (
            <motion.li key={c.n} className={styles.conceito} variants={item}>
              <span className={styles.conceitoNumero}>{c.n}</span>
              <h3 className={styles.conceitoTitulo}>{c.titulo}</h3>
              <p className={styles.conceitoTexto}>{c.texto}</p>
            </motion.li>
          ))}
        </motion.ol>
      </div>
    </section>
  );
}
