import { beat } from './beat';
import { scenes } from './timeline';

/** Nomes dos arquivos em `public/sfx/`. */
export type Sound =
  | 'whoosh_short' | 'whoosh_transition' | 'swipe_fast'
  | 'pop_ui' | 'soft_pop' | 'bubble_pop'
  | 'digital_click' | 'tap' | 'notification_pop'
  | 'impact' | 'bass_hit' | 'sub_boom'
  | 'riser' | 'reverse_whoosh' | 'glitch'
  | 'tick' | 'success_chime' | 'sparkle' | 'logo_sting';

export type Cue = { at: number; sound: Sound; volume?: number };

const S = Object.fromEntries(scenes.map((s) => [s.id, s.from])) as Record<string, number>;
/** Converte "tempo musical dentro da cena" em quadro absoluto. */
const at = (scene: string, b: number) => S[scene] + beat(b);

const list: Cue[] = [];
const cue = (frame: number, sound: Sound, volume?: number) => list.push({ at: frame, sound, volume });

// ---------------------------------------------------------------- viradas ---
// Cada troca de cena leva o mesmo trio: sucção antes, corpo no impacto e grave
// para dar peso — casando com o flash branco e a separação RGB.
for (const s of scenes.slice(1)) {
  cue(s.from - beat(0.8), 'reverse_whoosh', 0.55);
  cue(s.from - beat(0.5), 'riser', 0.32);
  cue(s.from, 'whoosh_transition', 0.7);
  cue(s.from, 'bass_hit', 0.6);
  cue(s.from + 1, 'glitch', 0.34);
}

// ------------------------------------------- s1 · arte de abertura ---
cue(at('s1', 0.5), 'whoosh_short', 0.6);
cue(at('s1', 0.5), 'logo_sting', 0.3);
[2, 3.5, 5].forEach((b) => cue(at('s1', b), 'notification_pop', 0.5));
[1, 4, 7].forEach((b) => cue(at('s1', b), 'tick', 0.3));
cue(at('s1', 6), 'sparkle', 0.34);

// -------------------------------------------------- s2 · a frota passa ---
cue(at('s2', 0.5), 'whoosh_short', 0.6);
[0.5, 2.5, 4.5].forEach((b) => {                  // cada troca do seletor
  cue(at('s2', b), 'swipe_fast', 0.6);
  cue(at('s2', b) + 3, 'tap', 0.42);
});
cue(at('s2', 1), 'sub_boom', 0.45);
cue(at('s2', 3), 'pop_ui', 0.5);

// ---------------------------------------------------------- s3 · escala ---
cue(at('s3', 1), 'riser', 0.42);
for (let i = 0; i < 8; i++) cue(at('s3', 1 + i * 0.45), 'tick', 0.3); // contador subindo
cue(at('s3', 4.6), 'impact', 0.75);
cue(at('s3', 4.6), 'sub_boom', 0.6);
cue(at('s3', 5), 'whoosh_short', 0.55);
cue(at('s3', 5.2), 'sparkle', 0.4);

// -------------------------------------------------------- s4 · urgência ---
cue(at('s4', 0.5), 'whoosh_short', 0.55);
[1.5, 3, 4.5].forEach((b) => cue(at('s4', b), 'digital_click', 0.55)); // etapas do rastreio
cue(at('s4', 4.5) + 3, 'success_chime', 0.4);
cue(at('s4', 3), 'whoosh_short', 0.62);
cue(at('s4', 3.5), 'impact', 0.5);
cue(at('s4', 6), 'pop_ui', 0.5);

// -------------------------------------------------------- s5 · promessa ---
cue(at('s5', 0.5), 'whoosh_short', 0.62);
cue(at('s5', 1), 'impact', 0.5);
cue(at('s5', 1.5), 'swipe_fast', 0.62);           // a caixa cruzando o mapa
cue(at('s5', 4.5), 'success_chime', 0.45);        // chegada em São Paulo
[2, 2.5].forEach((b) => cue(at('s5', b), 'soft_pop', 0.42));
cue(at('s5', 4), 'tick', 0.34);

// ------------------------------------------------------- s6 · confiança ---
cue(at('s6', 0.5), 'reverse_whoosh', 0.45);
cue(at('s6', 1), 'sub_boom', 0.5);
[2, 2.5, 3, 3.5].forEach((b) => cue(at('s6', b), 'pop_ui', 0.55));   // os quatro selos
[6, 7, 8].forEach((b) => cue(at('s6', b), 'digital_click', 0.5));    // fluxo do pedido
cue(at('s6', 8), 'success_chime', 0.6);                              // ENTREGUE
[8.5, 8.75, 9, 9.25, 9.5].forEach((b) => cue(at('s6', b), 'tick', 0.34)); // estrelas
cue(at('s6', 9.6), 'sparkle', 0.5);
cue(at('s6', 9.5), 'whoosh_short', 0.6);
cue(at('s6', 10), 'impact', 0.55);

// ------------------------------------------------------ s7 · assinatura ---
cue(at('s7', 0.5), 'whoosh_short', 0.65);
cue(at('s7', 1), 'logo_sting', 0.6);
[1.5, 2.5].forEach((b) => cue(at('s7', b), 'notification_pop', 0.6));
cue(at('s7', 2), 'sparkle', 0.42);

export const cues: Cue[] = list
  .filter((c) => c.at >= 0)
  .sort((a, b) => a.at - b.at);
