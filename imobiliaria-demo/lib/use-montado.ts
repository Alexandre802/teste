'use client';

import { useSyncExternalStore } from 'react';

const semAssinatura = () => () => {};

/**
 * `false` no servidor e na hidratação, `true` depois — sem `setState` dentro de
 * efeito. É o que segura o `<Player>` até haver navegador de verdade.
 */
export const useMontado = () => useSyncExternalStore(semAssinatura, () => true, () => false);
