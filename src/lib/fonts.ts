import { FONT } from "../config/theme";
import { POPPINS_CSS } from "./poppinsCss";

/**
 * Poppins embutida como data: URI (gerada por tools/inline-fonts.mjs).
 *
 * Por que não `delayRender()` + carregamento por HTTP:
 * durante o render o Remotion controla os timers da página, então um
 * `delayRender()` que dependa de rede (ou de qualquer promise que não resolva)
 * derruba o job inteiro por timeout — foi o que acontecia aqui em renders
 * longos, quando o Remotion abre uma aba nova no meio do caminho.
 *
 * Com o @font-face embutido no bundle não existe requisição nem espera: o
 * `<style>` é injetado na importação deste módulo, antes do React renderizar,
 * e `font-display: block` garante que o texto só seja pintado com a Poppins
 * (nunca com a fonte de fallback).
 */

const STYLE_ID = "consultech-poppins";

if (typeof document !== "undefined" && !document.getElementById(STYLE_ID)) {
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = POPPINS_CSS;
  document.head.appendChild(style);

  // Dispara o parsing dos 5 pesos já na primeira layout, para o frame inicial
  // nunca ser o que "descobre" a fonte.
  if (document.fonts) {
    for (const weight of [400, 500, 600, 700, 800]) {
      document.fonts.load(`${weight} 100px ${FONT}`).catch(() => undefined);
    }
  }
}

export const fontFamily = `${FONT}, "Helvetica Neue", Arial, sans-serif`;

/** Sonda invisível: mantém os 5 pesos em uso desde o primeiro frame. */
export const FONT_WEIGHTS_PROBE = [400, 500, 600, 700, 800] as const;
