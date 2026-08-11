import { loadFont } from "@remotion/fonts";
import { continueRender, delayRender, staticFile } from "remotion";
import { FONT } from "../config/theme";

const weights = ["400", "500", "600", "700", "800"] as const;

const handle = delayRender("carregando Poppins");

Promise.all(
  weights.map((weight) =>
    loadFont({
      family: FONT,
      url: staticFile(`fonts/poppins-latin-${weight}-normal.woff2`),
      weight,
      format: "woff2",
      display: "block",
    }),
  ),
)
  .then(() => continueRender(handle))
  .catch((err) => {
    // Não travar o render se a fonte falhar — cai no fallback do sistema.
    console.warn("Falha ao carregar Poppins:", err);
    continueRender(handle);
  });

export const fontFamily = `${FONT}, "Helvetica Neue", Arial, sans-serif`;
