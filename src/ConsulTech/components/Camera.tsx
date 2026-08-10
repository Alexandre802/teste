import React from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame} from 'remotion';

/**
 * A virtual camera over each scene.
 *
 * Motion graphics read as flat when every scene sits at the same distance, so
 * each scene gets a move: the camera pushes in on a reveal, pulls back to show
 * a whole grid, drifts sideways under a list, or punches in on an impact.
 *
 * It is a pure transform driven by the frame — a scale and a translate — so it
 * composes with whatever the scene is already animating and stays seekable.
 */

export type CameraMove =
	/** Slow, continuous zoom in. The default for a reveal. */
	| 'push'
	/** Starts close and pulls back to reveal the full layout. */
	| 'pull'
	/** Hard zoom that snaps in on the first frames, then eases. */
	| 'punch'
	/** Pulls back fast off an impact, like a recoil. */
	| 'recoil'
	/** Slow lateral drift with a touch of zoom. */
	| 'driftLeft'
	| 'driftRight'
	/** Rises up the frame — good under a stacking list. */
	| 'craneUp'
	/** Almost still, with a hint of life. */
	| 'hold';

type Props = {
	move?: CameraMove;
	/** Scene length in frames — the move is scaled to fill it. */
	duration: number;
	/** Multiplies the move's amplitude. */
	strength?: number;
	/** Adds a short handheld shake at the start (impacts). */
	shake?: number;
	children: React.ReactNode;
};

type Track = {scale: [number, number]; x: [number, number]; y: [number, number]};

const TRACKS: Record<CameraMove, Track> = {
	push: {scale: [1.0, 1.14], x: [0, 0], y: [0, 0]},
	pull: {scale: [1.22, 1.0], x: [0, 0], y: [0, 0]},
	punch: {scale: [1.35, 1.06], x: [0, 0], y: [0, 0]},
	recoil: {scale: [1.5, 1.0], x: [0, 0], y: [0, 0]},
	driftLeft: {scale: [1.1, 1.16], x: [46, -46], y: [0, 0]},
	driftRight: {scale: [1.1, 1.16], x: [-46, 46], y: [0, 0]},
	craneUp: {scale: [1.16, 1.04], x: [0, 0], y: [54, -34]},
	hold: {scale: [1.02, 1.05], x: [0, 0], y: [0, 0]},
};

/** Fast moves settle early instead of crawling for the whole scene. */
const EASING: Record<CameraMove, (t: number) => number> = {
	push: (t) => t,
	pull: (t) => 1 - Math.pow(1 - t, 2.4),
	punch: (t) => 1 - Math.pow(1 - t, 5),
	recoil: (t) => 1 - Math.pow(1 - t, 6),
	driftLeft: (t) => t,
	driftRight: (t) => t,
	craneUp: (t) => 1 - Math.pow(1 - t, 2.2),
	hold: (t) => t,
};

export const Camera: React.FC<Props> = ({
	move = 'push',
	duration,
	strength = 1,
	shake = 0,
	children,
}) => {
	const frame = useCurrentFrame();

	const track = TRACKS[move];
	const raw = interpolate(frame, [0, Math.max(1, duration)], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const t = EASING[move](raw);

	const lerp = ([from, to]: [number, number]) => from + (to - from) * t;

	/* Amplitude is applied around 1 so `strength` never changes the start pose. */
	const scale = 1 + (lerp(track.scale) - 1) * strength;
	const x = lerp(track.x) * strength;
	const y = lerp(track.y) * strength;

	/* A breath on top of every move so nothing is ever perfectly locked off. */
	const breath = Math.sin(frame * 0.026) * 0.006;

	/* Impact shake: a few frames of decaying seeded jitter. */
	const decay = Math.exp(-frame / 5);
	const shakeX = shake ? (random(`sx-${Math.floor(frame)}`) - 0.5) * 26 * shake * decay : 0;
	const shakeY = shake ? (random(`sy-${Math.floor(frame)}`) - 0.5) * 26 * shake * decay : 0;

	return (
		<AbsoluteFill
			style={{
				transform: `scale(${scale + breath}) translate(${x + shakeX}px, ${y + shakeY}px)`,
				transformOrigin: 'center center',
				willChange: 'transform',
			}}
		>
			{children}
		</AbsoluteFill>
	);
};

/**
 * Parallax wrapper: moves a layer *against* the camera by `depth`.
 * Background layers get a small negative depth so they lag the foreground,
 * which is what sells the zoom as depth rather than a flat scale.
 */
export const ParallaxLayer: React.FC<{
	depth?: number;
	duration: number;
	children: React.ReactNode;
}> = ({depth = 0.35, duration, children}) => {
	const frame = useCurrentFrame();
	const t = interpolate(frame, [0, Math.max(1, duration)], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<AbsoluteFill style={{transform: `scale(${1 + t * depth * 0.12})`}}>{children}</AbsoluteFill>
	);
};
