/**
 * Every duration in the video, in frames, at 30fps.
 *
 * A `<TransitionSeries>` overlaps each transition with the scenes on both sides,
 * so the total is the sum of the scenes minus the sum of the transitions.
 * Deriving `TOTAL_DURATION` from these constants keeps `<Composition>` honest —
 * retime a scene and the composition length follows automatically.
 */

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

export const SCENE_DURATION = {
	title: 100,
	features: 140,
	stats: 130,
	outro: 110,
} as const;

export const TRANSITION_DURATION = {
	titleToFeatures: 22,
	featuresToStats: 22,
	statsToOutro: 22,
} as const;

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);

export const TOTAL_DURATION =
	sum(Object.values(SCENE_DURATION)) - sum(Object.values(TRANSITION_DURATION));
