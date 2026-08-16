/**
 * Carrega as fontes antes do primeiro frame renderizar.
 *
 * As fontes vêm embutidas em base64 (src/lib/fontData.ts), então não há
 * requisição de rede: um render de 1350 frames abre várias abas do Chromium
 * e qualquer fetch pendurado derrubava a renderização por timeout.
 *
 * Mesmo sem rede, o `continueRender` é protegido por uma corrida com prazo:
 * se `document.fonts.ready` não resolver, o render segue com o fallback em
 * vez de travar.
 */
import { continueRender, delayRender } from "remotion";
import { EMBEDDED_FACES } from "./fontData";

export const DISPLAY = '"Archivo", "Helvetica Neue", Arial, sans-serif';
export const BODY = '"Inter", "Helvetica Neue", Arial, sans-serif';

const handle = delayRender("carregando fontes");

const injectFaceRules = () => {
  const css = EMBEDDED_FACES.map(
    ({ family, weight, src }) => `@font-face{
  font-family:"${family}";
  font-weight:${weight};
  font-style:normal;
  font-display:block;
  src:url(${src}) format("woff2");
}`,
  ).join("\n");

  const style = document.createElement("style");
  style.setAttribute("data-fonts", "nubank-reels");
  style.textContent = css;
  document.head.appendChild(style);
};

const loadFaces = async () => {
  injectFaceRules();

  // força o carregamento de cada peso — `fonts.ready` sozinho só espera
  // o que já foi solicitado por algum elemento renderizado
  await Promise.all(
    EMBEDDED_FACES.map(({ family, weight }) =>
      document.fonts.load(`${weight} 100px "${family}"`),
    ),
  );
  await document.fonts.ready;
};

const deadline = new Promise<void>((resolve) => setTimeout(resolve, 20_000));

Promise.race([loadFaces(), deadline])
  .catch((err) => {
    console.error("Falha ao carregar fontes", err);
  })
  .finally(() => {
    continueRender(handle);
  });
