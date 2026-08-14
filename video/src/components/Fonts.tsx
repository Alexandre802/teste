import { useEffect, useState, type FC } from "react";
import { continueRender, delayRender, staticFile } from "remotion";

const CSS_ID = "monttra-fonts";
const WEIGHTS = [400, 500, 600, 700, 800];
const SAMPLE = "Monttra 0123456789 R$ % ãõéçíóúâêÁÉÍÓÚ";

/**
 * Carrega a Plus Jakarta Sans a partir dos woff2 vendorizados em
 * public/fonts (sem depender da rede no momento do render).
 */
export const Fonts: FC = () => {
  const [handle] = useState(() => delayRender("Carregando Plus Jakarta Sans"));

  useEffect(() => {
    const load = async () => {
      try {
        if (!document.getElementById(CSS_ID)) {
          const link = document.createElement("link");
          link.id = CSS_ID;
          link.rel = "stylesheet";
          link.href = staticFile("fonts/fonts.css");
          document.head.appendChild(link);
          await new Promise<void>((resolve) => {
            link.onload = () => resolve();
            link.onerror = () => resolve();
          });
        }
        await Promise.all(
          WEIGHTS.map((w) => document.fonts.load(`${w} 100px "Plus Jakarta Sans"`, SAMPLE)),
        );
        await document.fonts.ready;
      } finally {
        continueRender(handle);
      }
    };
    void load();
  }, [handle]);

  return null;
};
