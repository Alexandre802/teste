/**
 * The mix, specified in decibels rather than raw linear gains.
 *
 * Target balance (narration is the 0 dB reference):
 *
 *   NARRAÇÃO  ████████████████████████████████   0 dB
 *   SFX       ████████████████                  -12 … -18 dB
 *   MÚSICA    ████████                          -24 … -30 dB
 *
 * Working in dB keeps that relationship legible: every cue below states how far
 * under the voice it sits, and `db()` converts to the linear gain Remotion's
 * `volume` prop expects. Linear numbers hide the relationship — 0.25 and 0.13
 * look arbitrary, -12 dB and -18 dB do not.
 */

/** Decibels below the narration → linear gain. */
export const db = (decibels: number) => Math.pow(10, decibels / 20);

/**
 * The SFX band, -12 dB (loudest) to -18 dB (quietest).
 * Hero impacts sit at the top of the band, incidental UI ticks at the bottom.
 */
export const SFX = {
	/** Brand moments: the assembly, the convergence, the CTA landing. */
	hero: db(-12),
	/** Scene transitions. */
	transition: db(-14),
	/** A word or headline landing with weight. */
	textHit: db(-15),
	/** A card, tile or row appearing. */
	card: db(-16),
	/** Chart and line draws. */
	sweep: db(-16),
	/** Dark whoosh under a large element. */
	low: db(-15),
	/** Light sweeps. */
	shimmer: db(-17),
	/** Text sliding in. */
	textIn: db(-18),
	/** Counter ticks. */
	beep: db(-18),
	/** Small UI elements: plate characters, sidebar rows. */
	ui: db(-18),
} as const;

/**
 * The music band, -24 dB (peaks) to -30 dB (under dense narration).
 * Well below the effects, which are themselves well below the voice.
 */
export const MUSIC = {
	/** The drop and the CTA. */
	peak: db(-24),
	/** Normal body of the ad. */
	body: db(-27),
	/** Where the narrator is busiest. */
	duck: db(-30),
	silent: 0,
} as const;
