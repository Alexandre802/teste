'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useEntrada } from './entrada';
import { LogoMonogram } from './LogoMonogram';
import styles from './sections.module.css';

/**
 * Profissionais.
 *
 * Perfis demonstrativos, sem fotografia e sem número de OAB. Publicidade
 * jurídica não admite inscrição inventada, e uma inscrição falsa numa peça de
 * prospecção é o tipo de detalhe que queima quem apresenta — o lugar do
 * retrato fica marcado pelo monograma, esperando o dado real.
 */

const PERFIS = [
  { nome: 'Dr. Rafael Almeida', papel: 'Advogado' },
  { nome: 'Dra. Marina Costa', papel: 'Advogada' },
];

export default function ProfessionalsSection() {
  const { lista, item } = useEntrada();

  return (
    <section className="section" id="profissionais">
      <div className="shell">
        <motion.div className={`section__head ${styles.cabecaEspaco}`} {...lista}>
          <motion.span className="label" variants={item}>
            Profissionais
          </motion.span>
          <motion.h2 className="display" variants={item}>
            Quem conduz o atendimento.
          </motion.h2>
        </motion.div>

        <motion.ul className={styles.perfis} {...lista}>
          {PERFIS.map((p) => (
            <motion.li key={p.nome} className={styles.perfil} variants={item}>
              <span className={styles.perfilMarca} aria-hidden>
                <LogoMonogram tamanho={34} espessura={3.4} />
              </span>
              <h3 className={styles.perfilNome}>{p.nome}</h3>
              <p className={styles.perfilPapel}>{p.papel}</p>
            </motion.li>
          ))}
        </motion.ul>

        <motion.p className={styles.perfilNota} {...lista}>
          Perfis demonstrativos.
        </motion.p>
      </div>
    </section>
  );
}
