'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useEntrada } from './entrada';
import styles from './sections.module.css';

/**
 * Áreas de atuação.
 *
 * Sem cartão e sem caixa: cada área é uma linha de uma tabela editorial,
 * separada por fio. O número é o único dourado da seção, e é pequeno — ele
 * marca ordem de leitura, não hierarquia de importância.
 */

const AREAS = [
  {
    n: '01',
    nome: 'Direito Trabalhista',
    texto: 'Questões ligadas às relações de trabalho e seus desdobramentos.',
  },
  {
    n: '02',
    nome: 'Direito Civil',
    texto: 'Direitos e obrigações civis, contratos e responsabilidade.',
  },
  {
    n: '03',
    nome: 'Direito de Família',
    texto: 'Demandas familiares que pedem orientação e cuidado no trato.',
  },
  {
    n: '04',
    nome: 'Direito Previdenciário',
    texto: 'Benefícios, requisitos e acompanhamento junto à Previdência.',
  },
  {
    n: '05',
    nome: 'Direito Empresarial',
    texto: 'Constituição, contratos e rotina jurídica de empresas.',
  },
  {
    n: '06',
    nome: 'Direito Imobiliário',
    texto: 'Negociação, regularização e questões de propriedade.',
  },
];

export default function PracticeAreasEditorial() {
  const { lista, item } = useEntrada();

  return (
    <section className="section" id="areas">
      <div className="shell">
        <motion.div className={`section__head ${styles.cabecaEspaco}`} {...lista}>
          <motion.span className="label" variants={item}>
            Áreas de atuação
          </motion.span>
          <motion.h2 className="display" variants={item}>
            Atuação em diferentes necessidades.
          </motion.h2>
        </motion.div>

        <motion.ul className={styles.areas} {...lista}>
          {AREAS.map((area) => (
            <motion.li key={area.n} className={styles.area} variants={item}>
              <span className={styles.areaNumero}>{area.n}</span>
              <div>
                <h3 className={styles.areaNome}>{area.nome}</h3>
                <p className={styles.areaTexto}>{area.texto}</p>
              </div>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
