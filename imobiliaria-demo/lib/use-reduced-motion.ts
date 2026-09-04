'use client';

import { useSyncExternalStore } from 'react';

const CONSULTA = '(prefers-reduced-motion: reduce)';

const assinar = (aoMudar: () => void) => {
  const mq = window.matchMedia(CONSULTA);
  mq.addEventListener('change', aoMudar);
  return () => mq.removeEventListener('change', aoMudar);
};

const noCliente = () => window.matchMedia(CONSULTA).matches;

/** No servidor assumimos "false"; o CSS já cobre o caso até a hidratação. */
const noServidor = () => false;

export const usePrefereMenosMovimento = () =>
  useSyncExternalStore(assinar, noCliente, noServidor);
