/**
 * Scene timing, derived from the narration track — not invented.
 *
 * `public/audio/narration.mp3` was analysed with ffmpeg's `silencedetect`
 * (noise=-30dB, d=0.30) to find every pause between spoken phrases. Each cut
 * below lands in the middle of one of those pauses, so scene changes fall in
 * the gaps of the voiceover instead of over a word.
 *
 * Times are seconds in the narration; `f()` converts to frames at 30fps.
 */

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

/** Narration is 70.19s; a short tail lets the last scene breathe. */
export const TOTAL_DURATION = 2110;

export const f = (seconds: number) => Math.round(seconds * FPS);

/** Cut points, in seconds — each sits inside a detected pause. */
const CUT = {
	professions: 0,
	askMe: 5.55,
	scattered: 6.94,
	worse: 15.5,
	loss: 16.46,
	birth: 22.16,
	platform: 25.11,
	categories: 29.88,
	seconds: 35.24,
	services: 36.85,
	onePlace: 46.6,
	noMiddleman: 48.66,
	payPerUse: 52.27,
	benefits: 59.15,
	cta: 65.06,
	end: TOTAL_DURATION / FPS,
} as const;

type SceneName = Exclude<keyof typeof CUT, 'end'>;

const ORDER: SceneName[] = [
	'professions',
	'askMe',
	'scattered',
	'worse',
	'loss',
	'birth',
	'platform',
	'categories',
	'seconds',
	'services',
	'onePlace',
	'noMiddleman',
	'payPerUse',
	'benefits',
	'cta',
];

const NEXT: Record<SceneName, number> = {
	professions: CUT.askMe,
	askMe: CUT.scattered,
	scattered: CUT.worse,
	worse: CUT.loss,
	loss: CUT.birth,
	birth: CUT.platform,
	platform: CUT.categories,
	categories: CUT.seconds,
	seconds: CUT.services,
	services: CUT.onePlace,
	onePlace: CUT.noMiddleman,
	noMiddleman: CUT.payPerUse,
	payPerUse: CUT.benefits,
	benefits: CUT.cta,
	cta: CUT.end,
};

/** Start frame of each scene. */
export const START = Object.fromEntries(
	ORDER.map((name) => [name, f(CUT[name])]),
) as Record<SceneName, number>;

/** Length of each scene in frames. */
export const DUR = Object.fromEntries(
	ORDER.map((name) => [name, f(NEXT[name]) - f(CUT[name])]),
) as Record<SceneName, number>;

export const SCENE_ORDER = ORDER;

/**
 * Beats *inside* a scene, in frames relative to that scene's start. These also
 * come from the pause map — the narrator lists the four categories, the five
 * services and the three benefits with a clear gap between each.
 */
export const BEAT: Record<'categories' | 'services' | 'benefits', number[]> = {
	/** "cadastrais, veiculares, financeiras e jurídicas" */
	categories: [0, 27, 70, 115],
	/** "veículo? / score? / CRLV-e? / protestos? / restrições e histórico?" */
	services: [0, 60, 110, 167, 219],
	/** "agilidade / segurança / produtividade" */
	benefits: [0, 53, 120],
};
