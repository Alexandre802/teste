import { continueRender, delayRender, staticFile } from 'remotion';

const WEIGHTS = [400, 500, 600, 700, 800, 900];

let started = false;

/**
 * Carrega a Inter a partir de `public/fonts` (sem rede) usando a FontFace API.
 *
 * O render roda várias abas em paralelo; se alguma requisição de fonte
 * emperrar, o `delayRender` seguraria o frame até estourar o timeout. Por isso
 * há uma trava de segurança que libera o render de qualquer forma — pior caso,
 * um frame usa a fonte de sistema em vez de travar o vídeo inteiro.
 */
export const loadFonts = () => {
  if (started || typeof document === 'undefined') return;
  started = true;

  const handle = delayRender('Carregando fontes Inter', {
    timeoutInMilliseconds: 60000,
  });

  let released = false;
  const release = () => {
    if (released) return;
    released = true;
    continueRender(handle);
  };

  // Trava de segurança: nunca segura o render por mais de 20 s.
  setTimeout(release, 20000);

  Promise.all(
    WEIGHTS.map((w) => {
      const face = new FontFace(
        'Inter',
        `url(${staticFile(`fonts/inter-latin-${w}-normal.woff2`)}) format('woff2')`,
        { weight: String(w), style: 'normal', display: 'block' },
      );
      return face.load().then((loaded) => {
        document.fonts.add(loaded);
      });
    }),
  )
    .then(release)
    .catch(release);

  const style = document.createElement('style');
  style.textContent =
    '*{ -webkit-font-smoothing: antialiased; text-rendering: geometricPrecision; }';
  document.head.appendChild(style);
};
