import { EMBEDDED_FACES } from './fontsData';

/**
 * Registro das fontes do reel (Anton, Archivo, Poppins).
 *
 * Os arquivos vao embutidos como data URI (src/fontsData.ts). Sem requisicao
 * HTTP, a fonte esta disponivel assim que a folha de estilo e analisada — nao
 * ha I/O para esperar.
 *
 * Nao usamos delayRender aqui de proposito: durante o render o Remotion
 * suspende a pagina entre os quadros, e tanto as promessas de
 * document.fonts.load() quanto setTimeout ficam pendentes, o que travava o
 * render (o handle estourava o timeout e cancelava tudo).
 */
const STYLE_ID = 'monttra-fonts';

if (typeof document !== 'undefined' && !document.getElementById(STYLE_ID)) {
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = EMBEDDED_FACES.map(
    (f) =>
      `@font-face{font-family:'${f.family}';src:url(data:font/woff2;base64,${f.data}) format('woff2');font-weight:${f.weight};font-style:normal;font-display:block;}`,
  ).join('\n');
  document.head.appendChild(style);

  // Forca o registro imediato das faces (nao bloqueia o render).
  for (const f of EMBEDDED_FACES) {
    document.fonts.load(`${f.weight} 100px '${f.family}'`).catch(() => undefined);
  }
}
