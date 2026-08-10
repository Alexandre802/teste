import {interpolate, spring} from 'remotion';

/**
 * Frame-driven animation helpers shared by every scene.
 *
 * All of them are pure functions of the frame number — that is what lets
 * Remotion render frame 217 on its own, on any machine, and get the same pixels.
 */

type EnterOptions = {
	frame: number;
	fps: number;
	/** Frames to wait before this element starts moving. */
	delay?: number;
	damping?: number;
};

/** 0 → 1 spring progress that stays at 0 until `delay` has passed. */
export const enter = ({frame, fps, delay = 0, damping = 200}: EnterOptions) =>
	spring({
		fps,
		frame: Math.max(0, frame - delay),
		config: {damping},
	});

/** Slides up into place while fading in. Returns ready-made CSS. */
export const riseIn = (
	options: EnterOptions & {distance?: number},
): React.CSSProperties => {
	const progress = enter(options);
	const distance = options.distance ?? 40;

	return {
		opacity: progress,
		transform: `translateY(${interpolate(progress, [0, 1], [distance, 0])}px)`,
	};
};

/**
 * Fades a scene's contents out over its final frames so the cut never lands on
 * a fully-lit frame.
 */
export const fadeOutAtEnd = (frame: number, durationInFrames: number, over = 14) =>
	interpolate(frame, [durationInFrames - over, durationInFrames], [1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

/** Deterministic drift — `Math.sin` is pure, unlike `Math.random`. */
export const drift = (frame: number, speed: number, amplitude: number, phase = 0) =>
	Math.sin(frame * speed + phase) * amplitude;
