import React from 'react';
import {Easing, interpolate} from 'remotion';

/**
 * animate.css, ported to Remotion.
 *
 * animate.css is a CSS `@keyframes` library: the browser owns the clock, so the
 * animation runs on wall-time and cannot be seeked. Remotion needs the opposite
 * — style must be a pure function of the frame number, or scrubbing and
 * parallel rendering break.
 *
 * So each preset here takes `progress` (0 → 1, where 1 is the end of the
 * animation) and returns the CSS for exactly that point. The keyframe stops and
 * values are transcribed from animate.css's `source/` directory; the percentage
 * stops become `interpolate()` input ranges, and each keyframe's
 * `animation-timing-function` becomes the matching `easing`.
 *
 * Ported from https://github.com/animate-css/animate.css (MIT/Hippocratic).
 */

const clamp = {
	extrapolateLeft: 'clamp',
	extrapolateRight: 'clamp',
} as const;

/** animate.css's default keyframe easing: cubic-bezier(0.215, 0.61, 0.355, 1). */
const EASE_OUT_CUBIC = Easing.bezier(0.215, 0.61, 0.355, 1);

export type Preset = (progress: number) => React.CSSProperties;

/* ------------------------------------------------------------------ *
 * Fading entrances
 * ------------------------------------------------------------------ */

/** `fadeIn`: opacity 0 → 1. */
export const fadeIn: Preset = (p) => ({
	opacity: interpolate(p, [0, 1], [0, 1], clamp),
});

/**
 * `fadeInUp`: translate3d(0, 100%, 0) → 0, opacity 0 → 1.
 * The source uses a 100% offset; here it is a pixel distance so it reads the
 * same at any composition size.
 */
export const fadeInUp =
	(distance = 60): Preset =>
	(p) => ({
		opacity: interpolate(p, [0, 1], [0, 1], clamp),
		transform: `translateY(${interpolate(p, [0, 1], [distance, 0], clamp)}px)`,
	});

export const fadeInDown =
	(distance = 60): Preset =>
	(p) => ({
		opacity: interpolate(p, [0, 1], [0, 1], clamp),
		transform: `translateY(${interpolate(p, [0, 1], [-distance, 0], clamp)}px)`,
	});

export const fadeInLeft =
	(distance = 60): Preset =>
	(p) => ({
		opacity: interpolate(p, [0, 1], [0, 1], clamp),
		transform: `translateX(${interpolate(p, [0, 1], [-distance, 0], clamp)}px)`,
	});

export const fadeInRight =
	(distance = 60): Preset =>
	(p) => ({
		opacity: interpolate(p, [0, 1], [0, 1], clamp),
		transform: `translateX(${interpolate(p, [0, 1], [distance, 0], clamp)}px)`,
	});

/* ------------------------------------------------------------------ *
 * Bouncing entrances
 * ------------------------------------------------------------------ */

/** `bounceIn`: scale 0.3 → 1.1 → 0.9 → 1.03 → 0.97 → 1. */
export const bounceIn: Preset = (p) => ({
	opacity: interpolate(p, [0, 0.6], [0, 1], clamp),
	transform: `scale(${interpolate(
		p,
		[0, 0.2, 0.4, 0.6, 0.8, 1],
		[0.3, 1.1, 0.9, 1.03, 0.97, 1],
		{...clamp, easing: EASE_OUT_CUBIC},
	)})`,
});

/** `bounceInUp`: rises from below, overshoots, then settles — with a Y squash. */
export const bounceInUp =
	(distance = 800): Preset =>
	(p) => {
		const y = interpolate(
			p,
			[0, 0.6, 0.75, 0.9, 1],
			[distance, -20, 10, -5, 0],
			{...clamp, easing: EASE_OUT_CUBIC},
		);
		const scaleY = interpolate(p, [0, 0.6, 0.75, 0.9, 1], [5, 0.9, 0.95, 0.985, 1], clamp);

		return {
			opacity: interpolate(p, [0, 0.6], [0, 1], clamp),
			transform: `translateY(${y}px) scaleY(${scaleY})`,
		};
	};

/* ------------------------------------------------------------------ *
 * Back entrances
 * ------------------------------------------------------------------ */

/** `backInDown`: drops in small from above, holds, then scales up to full size. */
export const backInDown =
	(distance = 600): Preset =>
	(p) => ({
		opacity: interpolate(p, [0, 0.8, 1], [0.7, 0.7, 1], clamp),
		transform: `translateY(${interpolate(
			p,
			[0, 0.8, 1],
			[-distance, 0, 0],
			clamp,
		)}px) scale(${interpolate(p, [0, 0.8, 1], [0.7, 0.7, 1], clamp)})`,
	});

/* ------------------------------------------------------------------ *
 * Zooming entrances
 * ------------------------------------------------------------------ */

/** `zoomIn`: scale 0.3 → 1, with opacity reaching 1 at the halfway point. */
export const zoomIn: Preset = (p) => ({
	opacity: interpolate(p, [0, 0.5], [0, 1], clamp),
	transform: `scale(${interpolate(p, [0, 1], [0.3, 1], clamp)})`,
});

/* ------------------------------------------------------------------ *
 * Flippers
 * ------------------------------------------------------------------ */

/** `flipInX`: rotates in around the X axis, 90deg → -20 → 10 → -5 → 0. */
export const flipInX: Preset = (p) => ({
	opacity: interpolate(p, [0, 0.6], [0, 1], clamp),
	transform: `perspective(400px) rotateX(${interpolate(
		p,
		[0, 0.4, 0.6, 0.8, 1],
		[90, -20, 10, -5, 0],
		{...clamp, easing: Easing.ease},
	)}deg)`,
	backfaceVisibility: 'visible',
});

/* ------------------------------------------------------------------ *
 * Lightspeed
 * ------------------------------------------------------------------ */

/** `lightSpeedInRight`: flies in from the right with a skew that settles. */
export const lightSpeedInRight =
	(distance = 900): Preset =>
	(p) => ({
		opacity: interpolate(p, [0, 0.6], [0, 1], clamp),
		transform: `translateX(${interpolate(
			p,
			[0, 0.6, 1],
			[distance, 0, 0],
			{...clamp, easing: Easing.out(Easing.quad)},
		)}px) skewX(${interpolate(p, [0, 0.6, 0.8, 1], [-30, 20, -5, 0], clamp)}deg)`,
	});

/* ------------------------------------------------------------------ *
 * Attention seekers — these are meant to loop, so pass a looping progress.
 * ------------------------------------------------------------------ */

/** `pulse`: scale 1 → 1.05 → 1. */
export const pulse: Preset = (p) => ({
	transform: `scale(${interpolate(p, [0, 0.5, 1], [1, 1.05, 1], {
		...clamp,
		easing: Easing.inOut(Easing.ease),
	})})`,
});

/** `tada`: shakes and scales, the classic "look at me". */
export const tada: Preset = (p) => {
	const scale = interpolate(
		p,
		[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
		[1, 0.9, 0.9, 1.1, 1.1, 1.1, 1.1, 1.1, 1.1, 1.1, 1],
		clamp,
	);
	const rotate = interpolate(
		p,
		[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
		[0, -3, -3, 3, -3, 3, -3, 3, -3, 3, 0],
		clamp,
	);

	return {transform: `scale(${scale}) rotate(${rotate}deg)`};
};

/** `headShake`: a small "no" shake. Completes in the first half of the cycle. */
export const headShake: Preset = (p) => {
	const x = interpolate(
		p,
		[0, 0.065, 0.185, 0.315, 0.435, 0.5, 1],
		[0, -6, 5, -3, 2, 0, 0],
		{...clamp, easing: Easing.inOut(Easing.ease)},
	);
	const rotateY = interpolate(
		p,
		[0, 0.065, 0.185, 0.315, 0.435, 0.5, 1],
		[0, -9, 7, -5, 3, 0, 0],
		clamp,
	);

	return {transform: `perspective(400px) translateX(${x}px) rotateY(${rotateY}deg)`};
};
