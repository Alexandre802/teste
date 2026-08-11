import {ASSET_DBFS, NARRATION_DBFS} from './levels';

/**
 * The mix, specified in decibels **below the narration**.
 *
 *   NARRAÇÃO  ████████████████████████████████   0 dB reference
 *   SFX       ████████████████                  -12 … -18 dB
 *   MÚSICA    ████████                          -24 … -30 dB
 *
 * The subtlety that matters: "0 dB reference" is the *narration's own level*,
 * not full scale. The voice track sits at about -23 dBFS, while a
 * peak-normalised effect sits nearer -13 dBFS. Applying a flat -12 dB to that
 * effect would leave it roughly 10 dB **above** the voice — the opposite of
 * what the spec asks for. (That is exactly the mistake the first pass made.)
 *
 * So the gain each file needs depends on its own measured level:
 *
 *   target_dBFS = NARRATION_DBFS - offset
 *   gain_dB     = target_dBFS - asset_dBFS
 *
 * `tools/measure-levels.py` measures every asset and writes `levels.ts`;
 * re-run it whenever the audio is regenerated.
 */

/** How far under the narration each kind of cue should sit, in dB. */
export const OFFSET = {
	/** Brand moments: the assembly, the convergence, the CTA landing. */
	hero: 12,
	/** Scene transitions. */
	transition: 14,
	/** A word or headline landing with weight. */
	textHit: 15,
	/** Dark whoosh under a large element. */
	low: 15,
	/** A card, tile or row appearing. */
	card: 16,
	/** Chart and line draws. */
	sweep: 16,
	/** Light sweeps. */
	shimmer: 17,
	/** Text sliding in. */
	textIn: 18,
	/** Counter ticks. */
	beep: 18,
	/** Small UI elements: plate characters, sidebar rows. */
	ui: 18,
	/**
	 * For a hero moment built from two simultaneous one-shots. Two equal
	 * sources sum to +3 dB, so each is set 3 dB lower and the pair lands on
	 * the `hero` target rather than 3 dB over it.
	 */
	heroStacked: 15,
} as const;

/** Music sits a further octave of level down, per the spec. */
export const MUSIC_OFFSET = {
	/** The drop and the CTA. */
	peak: 24,
	/** Normal body of the ad. */
	body: 27,
	/** Where the narrator is busiest. */
	duck: 30,
} as const;

const dbToLinear = (decibels: number) => Math.pow(10, decibels / 20);

/**
 * Linear gain that lands `asset` at `offset` dB below the narration.
 * Falls back to a conservative -20 dB if an asset has not been measured, so a
 * missing entry is quiet rather than deafening.
 */
export const gainFor = (asset: string, offset: number) => {
	const assetDb = ASSET_DBFS[asset];
	if (assetDb === undefined) {
		return dbToLinear(-20);
	}

	const targetDb = NARRATION_DBFS - offset;
	return dbToLinear(targetDb - assetDb);
};

/** Same, for the music bed, whose offset changes across the ad. */
export const musicGain = (offset: number) => gainFor('music', offset);

/** The level a cue will actually sit at, for verification/logging. */
export const resultingDbfs = (offset: number) => NARRATION_DBFS - offset;
