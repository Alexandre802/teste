import { INTER_WOFF2 } from './interFonts';

const WEIGHTS = [400, 500, 600, 700, 800, 900];

/**
 * Carregamento da Inter — sem rede e sem `delayRender`.
 *
 * A fonte vai embutida em base64 (ver `tools/embed_fonts.py`). Duas tentativas
 * anteriores usaram `delayRender` para segurar o render até a fonte carregar, e
 * em ambas uma das abas paralelas do Remotion travava: o handle criado no
 * escopo do módulo impede a montagem do React, então nada mais consegue
 * liberá-lo e a aba inteira estoura o tempo.
 *
 * Como o woff2 é local, decodificar é praticamente instantâneo. Em vez de
 * bloquear, o CSS é injetado na avaliação do bundle e um bloco escondido força
 * o Chromium a decodificar os seis pesos já no primeiro layout — bem antes do
 * primeiro frame ser capturado.
 */
const CSS = WEIGHTS.map(
  (w) =>
    `@font-face{font-family:'Inter';font-style:normal;font-weight:${w};` +
    `font-display:block;src:url(data:font/woff2;base64,${INTER_WOFF2[w]}) format('woff2');}`,
).join('');

let started = false;

export const loadFonts = () => {
  if (started || typeof document === 'undefined') return;
  started = true;

  const style = document.createElement('style');
  style.textContent = `${CSS}
  *{ -webkit-font-smoothing: antialiased; text-rendering: geometricPrecision; }`;
  document.head.appendChild(style);

  // Pré-aquecimento: força a decodificação dos seis pesos no primeiro layout.
  const warm = document.createElement('div');
  warm.setAttribute('aria-hidden', 'true');
  warm.style.cssText =
    'position:fixed;left:-9999px;top:0;visibility:hidden;pointer-events:none;';
  warm.innerHTML = WEIGHTS.map(
    (w) => `<span style="font-family:Inter;font-weight:${w};font-size:64px">Waatzo 24h</span>`,
  ).join('');
  document.body.appendChild(warm);
  // Leitura forçada do layout: dispara a decodificação de forma síncrona.
  void warm.getBoundingClientRect().width;

  // Registro adicional pela FontFace API (não bloqueia nada se demorar).
  WEIGHTS.forEach((w) => {
    const face = new FontFace(
      'Inter',
      `url(data:font/woff2;base64,${INTER_WOFF2[w]}) format('woff2')`,
      { weight: String(w), style: 'normal', display: 'block' },
    );
    face
      .load()
      .then((loaded) => {
        (document.fonts as unknown as { add: (f: FontFace) => void }).add(loaded);
      })
      .catch(() => undefined);
  });
};
