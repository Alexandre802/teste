/**
 * ============================================================================
 *  Biblioteca de efeitos sonoros
 * ============================================================================
 *  Os arquivos em public/audio/sfx são gerados proceduralmente por
 *  `python3 tools/gen_sfx.py` (nenhum asset externo necessário).
 *
 *  Cada entrada tem um volume padrão calibrado para ficar abaixo da narração.
 *  Para mexer no mix inteiro, ajuste MASTER_SFX_VOLUME.
 */

export const MASTER_SFX_VOLUME = 1;

export const SFX = {
  /** Whoosh / Swoosh curto — entradas rápidas de textos e elementos */
  whoosh: { file: "whoosh-short.wav", volume: 0.34 },
  /** Whoosh de transição — trocas entre telas */
  whooshBig: { file: "whoosh-transition.wav", volume: 0.42 },
  /** Swipe / Fast pass-by — elementos que atravessam a tela */
  swipe: { file: "swipe-fast.wav", volume: 0.3 },
  /** Pop UI — palavras, ícones e cards aparecendo */
  pop: { file: "pop-ui.wav", volume: 0.3 },
  /** Soft pop / Bubble pop — elementos menores */
  popSoft: { file: "pop-soft.wav", volume: 0.24 },
  /** Digital click / UI click */
  click: { file: "click-digital.wav", volume: 0.22 },
  /** Tap / Button press */
  tap: { file: "tap-button.wav", volume: 0.28 },
  /** Notification pop */
  notify: { file: "notification.wav", volume: 0.26 },
  /** Impact / Hit — frases importantes */
  impact: { file: "impact.wav", volume: 0.4 },
  /** Bass hit / Low impact — peso nas mudanças de cena */
  bass: { file: "bass-hit.wav", volume: 0.44 },
  /** Sub boom — momentos de maior destaque */
  sub: { file: "sub-boom.wav", volume: 0.42 },
  /** Riser curto — prepara transições */
  riser: { file: "riser.wav", volume: 0.3 },
  /** Reverse whoosh — sucção antes da entrada */
  reverse: { file: "reverse-whoosh.wav", volume: 0.3 },
  /** Digital glitch / Tech glitch */
  glitch: { file: "glitch.wav", volume: 0.24 },
  /** Tick / Micro click — detalhes gráficos */
  tick: { file: "tick.wav", volume: 0.18 },
  /** Success / Confirmation chime — check/concluído */
  success: { file: "success.wav", volume: 0.3 },
  /** Sparkle / Shine — elementos de destaque */
  sparkle: { file: "sparkle.wav", volume: 0.26 },
  /** Logo sting — finalização/branding */
  sting: { file: "logo-sting.wav", volume: 0.5 },
} as const;

export type SfxName = keyof typeof SFX;

export type Cue = {
  /** frame (relativo à cena, ou absoluto na trilha global) */
  at: number;
  name: SfxName;
  /** multiplicador sobre o volume padrão */
  gain?: number;
  /** afinação/velocidade — bom para variar repetições do mesmo som */
  rate?: number;
};

/** Açúcar sintático para escrever listas de cues. */
export const cue = (at: number, name: SfxName, gain?: number, rate?: number): Cue => ({
  at,
  name,
  gain,
  rate,
});
