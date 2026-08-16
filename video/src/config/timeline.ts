/**
 * ─────────────────────────────────────────────────────────────
 *  PAINEL DE CONTROLE DO VÍDEO
 *  Tudo que é ajustável no dia a dia mora aqui: duração de cada
 *  cena, textos e marcação dos efeitos sonoros.
 *  Alterar `durationInSeconds` recalcula todo o vídeo sozinho.
 * ─────────────────────────────────────────────────────────────
 */
import { VIDEO } from "./theme";

export type SfxName =
  | "whoosh-short"
  | "whoosh-transition"
  | "swipe-pass"
  | "pop-ui"
  | "pop-soft"
  | "click-digital"
  | "tap-button"
  | "notification"
  | "impact"
  | "bass-hit"
  | "sub-boom"
  | "riser"
  | "reverse-whoosh"
  | "glitch"
  | "tick"
  | "success"
  | "sparkle"
  | "logo-sting";

/** Uma marcação de som: `at` é em segundos, relativo ao início da cena. */
export type SfxCue = {
  at: number;
  sound: SfxName;
  volume?: number;
};

export type SceneConfig = {
  id: string;
  /** Legenda on-screen da cena. */
  title: string[];
  durationInSeconds: number;
  sfx: SfxCue[];
};

export const SCENES: SceneConfig[] = [
  {
    id: "s01-leque",
    title: ["O FUTURO", "DO DINHEIRO", "É SIMPLES."],
    durationInSeconds: 2.5,
    sfx: [
      { at: 0.0, sound: "sub-boom", volume: 0.9 },
      { at: 0.05, sound: "reverse-whoosh", volume: 0.5 },
      { at: 0.35, sound: "whoosh-short", volume: 0.7 },
      { at: 0.62, sound: "swipe-pass", volume: 0.5 },
      { at: 0.72, sound: "swipe-pass", volume: 0.45 },
      { at: 0.82, sound: "swipe-pass", volume: 0.4 },
      { at: 0.95, sound: "pop-ui", volume: 0.6 },
      { at: 1.25, sound: "pop-ui", volume: 0.6 },
      { at: 1.55, sound: "impact", volume: 0.8 },
      { at: 1.95, sound: "sparkle", volume: 0.45 },
    ],
  },
  {
    id: "s02-orbita",
    title: ["UMA CONTA FEITA", "PARA DAR MAIS", "CONTROLE A VOCÊ."],
    durationInSeconds: 2.5,
    sfx: [
      { at: 0.0, sound: "whoosh-transition", volume: 0.75 },
      { at: 0.3, sound: "riser", volume: 0.4 },
      { at: 0.85, sound: "bass-hit", volume: 0.8 },
      { at: 1.0, sound: "pop-soft", volume: 0.5 },
      { at: 1.18, sound: "pop-soft", volume: 0.5 },
      { at: 1.45, sound: "tick", volume: 0.4 },
      { at: 1.9, sound: "sparkle", volume: 0.4 },
    ],
  },
  {
    id: "s03-menos-mais",
    title: ["MENOS BUROCRACIA.", "MAIS LIBERDADE."],
    durationInSeconds: 2.5,
    sfx: [
      { at: 0.0, sound: "whoosh-transition", volume: 0.8 },
      { at: 0.45, sound: "swipe-pass", volume: 0.7 },
      { at: 0.62, sound: "glitch", volume: 0.45 },
      { at: 0.8, sound: "reverse-whoosh", volume: 0.55 },
      { at: 1.05, sound: "impact", volume: 0.95 },
      { at: 1.1, sound: "sub-boom", volume: 0.7 },
      { at: 1.6, sound: "pop-ui", volume: 0.5 },
      { at: 2.0, sound: "tick", volume: 0.35 },
    ],
  },
  {
    id: "s04-app-cursor",
    title: ["TUDO O QUE VOCÊ PRECISA,", "NA PALMA DA MÃO."],
    durationInSeconds: 2.5,
    sfx: [
      { at: 0.0, sound: "whoosh-transition", volume: 0.7 },
      { at: 0.42, sound: "pop-soft", volume: 0.45 },
      { at: 0.5, sound: "pop-soft", volume: 0.45 },
      { at: 0.58, sound: "pop-soft", volume: 0.45 },
      { at: 0.66, sound: "pop-soft", volume: 0.45 },
      { at: 0.95, sound: "click-digital", volume: 0.7 },
      { at: 1.35, sound: "swipe-pass", volume: 0.4 },
      { at: 1.75, sound: "tap-button", volume: 0.7 },
      { at: 2.15, sound: "click-digital", volume: 0.6 },
    ],
  },
  {
    id: "s05-merece-mais",
    title: ["SEU DINHEIRO", "MERECE MAIS."],
    durationInSeconds: 2.5,
    sfx: [
      { at: 0.0, sound: "whoosh-transition", volume: 0.75 },
      { at: 0.3, sound: "riser", volume: 0.5 },
      { at: 0.85, sound: "impact", volume: 0.85 },
      { at: 0.9, sound: "sparkle", volume: 0.6 },
      { at: 1.2, sound: "tick", volume: 0.3 },
      { at: 1.45, sound: "tick", volume: 0.3 },
      { at: 1.7, sound: "tick", volume: 0.3 },
      { at: 2.05, sound: "pop-ui", volume: 0.5 },
    ],
  },
  {
    id: "s06-rendimento",
    title: ["SEU DINHEIRO RENDE", "ENQUANTO VOCÊ", "SEGUE EM FRENTE."],
    durationInSeconds: 2.5,
    sfx: [
      { at: 0.0, sound: "whoosh-transition", volume: 0.7 },
      { at: 0.35, sound: "pop-ui", volume: 0.5 },
      { at: 0.6, sound: "tick", volume: 0.35 },
      { at: 0.9, sound: "tick", volume: 0.35 },
      { at: 1.2, sound: "tick", volume: 0.35 },
      { at: 1.5, sound: "riser", volume: 0.45 },
      { at: 1.95, sound: "success", volume: 0.6 },
    ],
  },
  {
    id: "s07-seguranca",
    title: ["MAIS SEGURANÇA.", "SEMPRE."],
    durationInSeconds: 2.5,
    sfx: [
      { at: 0.0, sound: "whoosh-transition", volume: 0.75 },
      { at: 0.25, sound: "reverse-whoosh", volume: 0.5 },
      { at: 0.7, sound: "bass-hit", volume: 0.85 },
      { at: 1.15, sound: "impact", volume: 0.8 },
      { at: 1.22, sound: "success", volume: 0.75 },
      { at: 1.75, sound: "sparkle", volume: 0.5 },
    ],
  },
  {
    id: "s08-notificacoes",
    title: ["CONTROLE", "NA PALMA DA MÃO."],
    durationInSeconds: 2.5,
    sfx: [
      { at: 0.0, sound: "whoosh-transition", volume: 0.7 },
      { at: 0.35, sound: "whoosh-short", volume: 0.5 },
      { at: 0.8, sound: "notification", volume: 0.65 },
      { at: 1.1, sound: "notification", volume: 0.6 },
      { at: 1.4, sound: "notification", volume: 0.55 },
      { at: 1.75, sound: "pop-ui", volume: 0.5 },
      { at: 2.0, sound: "tap-button", volume: 0.5 },
    ],
  },
  {
    id: "s09-possibilidades",
    title: ["MENOS COMPLICAÇÃO.", "MAIS POSSIBILIDADES."],
    durationInSeconds: 2.5,
    sfx: [
      { at: 0.0, sound: "whoosh-transition", volume: 0.8 },
      { at: 0.3, sound: "swipe-pass", volume: 0.6 },
      { at: 0.55, sound: "glitch", volume: 0.4 },
      { at: 0.8, sound: "impact", volume: 0.9 },
      { at: 1.15, sound: "sparkle", volume: 0.5 },
      { at: 1.55, sound: "riser", volume: 0.45 },
      { at: 1.62, sound: "logo-sting", volume: 0.85 },
    ],
  },
];

export const sec = (s: number) => Math.round(s * VIDEO.fps);

/** Frame absoluto em que cada cena começa. */
export const SCENE_STARTS = SCENES.reduce<number[]>((acc, scene, i) => {
  const prev = i === 0 ? 0 : acc[i - 1] + sec(SCENES[i - 1].durationInSeconds);
  acc.push(prev);
  return acc;
}, []);

export const TOTAL_FRAMES = SCENES.reduce(
  (sum, s) => sum + sec(s.durationInSeconds),
  0,
);
