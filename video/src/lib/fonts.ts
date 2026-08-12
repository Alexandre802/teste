import { continueRender, delayRender } from 'remotion';
import { INTER_WOFF2 } from './interFonts';

const WEIGHTS = [400, 500, 600, 700, 800, 900];

let started = false;

/**
 * Registra a Inter a partir de data URIs embutidos (ver `tools/embed_fonts.py`).
 *
 * Nada de rede: durante o render o Remotion abre várias abas em paralelo e
 * requisições simultâneas de fonte chegaram a emperrar, estourando o
 * delayRender. Com a fonte inline o carregamento é local e determinístico.
 */
export const loadFonts = () => {
  if (started || typeof document === 'undefined') return;
  started = true;

  const handle = delayRender('Carregando fontes Inter', {
    timeoutInMilliseconds: 60000,
  });

  const style = document.createElement('style');
  style.textContent =
    '*{ -webkit-font-smoothing: antialiased; text-rendering: geometricPrecision; }';
  document.head.appendChild(style);

  Promise.all(
    WEIGHTS.map((w) => {
      const face = new FontFace(
        'Inter',
        `url(data:font/woff2;base64,${INTER_WOFF2[w]}) format('woff2')`,
        { weight: String(w), style: 'normal', display: 'block' },
      );
      return face.load().then((loaded) => {
        // O tipo de FontFaceSet varia entre versões da lib DOM.
        (document.fonts as unknown as { add: (f: FontFace) => void }).add(loaded);
      });
    }),
  )
    .then(() => continueRender(handle))
    .catch(() => continueRender(handle));
};
