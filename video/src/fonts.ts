import '@fontsource/anton/400.css';
import '@fontsource/archivo/400.css';
import '@fontsource/archivo/500.css';
import '@fontsource/archivo/600.css';
import '@fontsource/archivo/700.css';
import '@fontsource/archivo/800.css';

import { continueRender, delayRender } from 'remotion';

/**
 * As fontes vêm empacotadas (sem rede). Ainda assim o render espera o
 * document.fonts assentar, senão o primeiro quadro sai com a fonte de fallback
 * e a métrica do tipo gigante muda no meio da animação.
 */
let started = false;
export const ensureFonts = () => {
  if (started || typeof document === 'undefined') return;
  started = true;
  const handle = delayRender('carregando fontes');
  document.fonts.ready.then(() => continueRender(handle)).catch(() => continueRender(handle));
};
