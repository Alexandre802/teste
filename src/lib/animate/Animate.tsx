import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import type {Preset} from './presets';

/**
 * animate.css's default `animation-duration` is 1s. At 30fps that is 30 frames,
 * which is the default here too.
 */
export const DEFAULT_DURATION = 30;

/**
 * Turns the current frame into a 0 → 1 progress for a one-shot animation.
 * Before `delay` it is pinned at 0; after the animation it stays at 1 — the
 * element holds its final pose for the rest of the scene, like an animate.css
 * entrance with `animation-fill-mode: both`.
 */
export const useEnterProgress = (delay = 0, durationInFrames = DEFAULT_DURATION) => {
	const frame = useCurrentFrame();

	return interpolate(frame - delay, [0, durationInFrames], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
};

/**
 * Progress for an attention-seeker that repeats forever: a sawtooth 0 → 1 that
 * resets every `durationInFrames`. This is what `animation-iteration-count:
 * infinite` becomes when the frame number is the only clock.
 */
export const useLoopProgress = (durationInFrames = DEFAULT_DURATION, delay = 0) => {
	const frame = useCurrentFrame();
	const elapsed = frame - delay;

	if (elapsed < 0) {
		return 0;
	}

	return (elapsed % durationInFrames) / durationInFrames;
};

type AnimateProps = {
	preset: Preset;
	delay?: number;
	durationInFrames?: number;
	/** Repeat forever (attention seekers) instead of playing once. */
	loop?: boolean;
	style?: React.CSSProperties;
	children: React.ReactNode;
};

/**
 * Wraps children in a div whose style comes from an animate.css preset.
 *
 * ```tsx
 * <Animate preset={bounceIn} delay={10}>
 *   <Card />
 * </Animate>
 * ```
 */
export const Animate: React.FC<AnimateProps> = ({
	preset,
	delay = 0,
	durationInFrames = DEFAULT_DURATION,
	loop = false,
	style,
	children,
}) => {
	const enterProgress = useEnterProgress(delay, durationInFrames);
	const loopProgress = useLoopProgress(durationInFrames, delay);
	const progress = loop ? loopProgress : enterProgress;

	return <div style={{...style, ...preset(progress)}}>{children}</div>;
};
