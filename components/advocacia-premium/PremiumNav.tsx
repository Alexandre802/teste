'use client';

import React, { useEffect, useState } from 'react';
import { LogoMonogram } from './LogoMonogram';
import { WHATSAPP_URL } from './contato';
import styles from './PremiumNav.module.css';

/**
 * Barra do topo.
 *
 * Fica ausente durante a primeira tela — a abertura precisa começar vazia — e
 * entra depois que o hero sai. A vigilância é por rolagem, num rAF coalescido,
 * pelo mesmo motivo do controlador do Remotion.
 */

const LINKS = [
  { href: '#experiencia', texto: 'A experiência' },
  { href: '#areas', texto: 'Áreas' },
  { href: '#escritorio', texto: 'O escritório' },
  { href: '#profissionais', texto: 'Profissionais' },
  { href: '#contato', texto: 'Contato' },
];

export default function PremiumNav() {
  const [visivel, setVisivel] = useState(false);
  const [aberto, setAberto] = useState(false);

  useEffect(() => {
    let rafId = 0;
    let agendado = false;

    const avaliar = () => {
      agendado = false;
      setVisivel(window.scrollY > window.innerHeight * 0.85);
    };

    const aoRolar = () => {
      if (agendado) return;
      agendado = true;
      rafId = window.requestAnimationFrame(avaliar);
    };

    window.addEventListener('scroll', aoRolar, { passive: true });
    aoRolar();
    return () => {
      window.removeEventListener('scroll', aoRolar);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  // o menu aberto trava a rolagem do fundo
  useEffect(() => {
    if (!aberto) return;
    const anterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAberto(false);
    };
    window.addEventListener('keydown', aoTeclar);
    return () => {
      document.body.style.overflow = anterior;
      window.removeEventListener('keydown', aoTeclar);
    };
  }, [aberto]);

  return (
    <>
      <nav
        className={styles.barra}
        data-visivel={visivel ? 'sim' : 'nao'}
        aria-label="Navegação principal"
      >
        <a className={styles.marca} href="#inicio">
          <LogoMonogram tamanho={26} espessura={3.6} />
          <span>Almeida &amp; Costa</span>
        </a>

        <ul className={styles.links}>
          {LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href}>{l.texto}</a>
            </li>
          ))}
        </ul>

        <a
          className={`action ${styles.acao}`}
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          Contato
        </a>

        <button
          type="button"
          className={styles.botao}
          onClick={() => setAberto(true)}
          aria-label="Abrir menu"
          aria-expanded={aberto}
        >
          <span />
          <span />
        </button>
      </nav>

      {aberto ? (
        <div className={styles.painel} role="dialog" aria-modal="true" aria-label="Menu">
          <button
            type="button"
            className={styles.fechar}
            onClick={() => setAberto(false)}
            aria-label="Fechar menu"
          >
            ✕
          </button>

          <ul>
            {LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} onClick={() => setAberto(false)}>
                  {l.texto}
                </a>
              </li>
            ))}
          </ul>

          <a
            className="action action--solid"
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setAberto(false)}
          >
            Entrar em contato
            <span className="action__arrow" aria-hidden>
              →
            </span>
          </a>
        </div>
      ) : null}
    </>
  );
}
