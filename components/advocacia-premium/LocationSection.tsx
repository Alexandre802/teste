'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useEntrada } from './entrada';
import { ESCRITORIO, WHATSAPP_URL } from './contato';
import styles from './sections.module.css';

/**
 * Localização e contato.
 *
 * O mapa é o embed oficial do Google, já liberado no `frame-src` da CSP do
 * projeto. O contorno escuro por cima é só uma máscara de borda — não cobre o
 * mapa, que continua interativo.
 */
export default function LocationSection() {
  const { lista, item } = useEntrada();

  return (
    <section className="section" id="contato">
      <div className="shell">
        <motion.div className={`section__head ${styles.cabecaEspaco}`} {...lista}>
          <motion.span className="label" variants={item}>
            Localização
          </motion.span>
          <motion.h2 className="display" variants={item}>
            {ESCRITORIO.cidade} — {ESCRITORIO.estado}
          </motion.h2>
        </motion.div>

        <motion.div className={styles.contatoGrade} {...lista}>
          <motion.div className={styles.mapa} variants={item}>
            <iframe
              title={`Mapa — ${ESCRITORIO.cidade}, ${ESCRITORIO.estado}`}
              src={ESCRITORIO.mapaEmbed}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </motion.div>

          <motion.dl className={styles.dados} variants={item}>
            <div>
              <dt>Atendimento</dt>
              <dd>{ESCRITORIO.atendimento}</dd>
            </div>
            <div>
              <dt>Telefone</dt>
              <dd>{ESCRITORIO.telefoneExibicao}</dd>
            </div>
            <div>
              <dt>WhatsApp</dt>
              <dd>
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                  Abrir conversa
                </a>
              </dd>
            </div>
            <div>
              <dt>Endereço</dt>
              <dd>
                <a
                  href={ESCRITORIO.mapaLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ver no Google Maps →
                </a>
              </dd>
            </div>
          </motion.dl>
        </motion.div>
      </div>
    </section>
  );
}
