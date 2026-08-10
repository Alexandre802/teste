import React from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame} from 'remotion';
import {C} from '../theme';
import {HEIGHT, START, WIDTH} from '../timing';

/**
 * The background is not one look for 70 seconds — it changes with the story.
 *
 * Five layers live on top of each other and cross-fade as the ad moves through
 * its acts: rings while the hook lands, a red glitch field for the problem, a
 * burst at the moment the brand appears, flowing data columns under the service
 * list, and a calm orb field for the close.
 *
 * Every layer is a pure function of the frame, and all scattering comes from
 * seeded `random()`, so the whole thing is deterministic.
 */

/* ------------------------------------------------------------------ *
 * Concentric rings + orbiting dots — the "circles" motif.
 * ------------------------------------------------------------------ */

const ORBIT_DOTS = new Array(22).fill(true).map((_, i) => ({
	radius: 190 + random(`od-r-${i}`) * 520,
	speed: (random(`od-s-${i}`) - 0.5) * 0.022,
	phase: random(`od-p-${i}`) * Math.PI * 2,
	size: 3 + random(`od-z-${i}`) * 6,
	color: random(`od-c-${i}`) > 0.5 ? C.cyan : C.blueBright,
}));

export const RingField: React.FC<{opacity: number}> = ({opacity}) => {
	const frame = useCurrentFrame();
	if (opacity <= 0.001) return null;

	return (
		<AbsoluteFill style={{opacity}}>
			<svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
				{/* Breathing concentric rings, centred on the frame. */}
				{[0, 1, 2, 3, 4].map((i) => {
					const base = 200 + i * 165;
					const pulse = Math.sin(frame * 0.028 - i * 0.7);
					return (
						<circle
							key={i}
							cx={WIDTH / 2}
							cy={HEIGHT / 2}
							r={base + pulse * 26}
							stroke={i % 2 ? C.cyan : C.blue}
							strokeWidth={i === 0 ? 2.2 : 1.3}
							fill="none"
							opacity={0.16 + 0.1 * (1 - i / 5) + pulse * 0.05}
							strokeDasharray={i % 2 ? '3 16' : undefined}
						/>
					);
				})}

				{/* Dots riding those orbits. */}
				{ORBIT_DOTS.map((dot, i) => {
					const a = dot.phase + frame * dot.speed;
					return (
						<circle
							key={i}
							cx={WIDTH / 2 + Math.cos(a) * dot.radius}
							cy={HEIGHT / 2 + Math.sin(a) * dot.radius * 1.35}
							r={dot.size}
							fill={dot.color}
							opacity={0.4 + 0.4 * Math.sin(frame * 0.05 + dot.phase)}
							style={{filter: `drop-shadow(0 0 9px ${dot.color})`}}
						/>
					);
				})}
			</svg>
		</AbsoluteFill>
	);
};

/* ------------------------------------------------------------------ *
 * Dot matrix that ripples — used under the "problem" act.
 * ------------------------------------------------------------------ */

export const DotMatrix: React.FC<{opacity: number; color?: string}> = ({
	opacity,
	color = C.danger,
}) => {
	const frame = useCurrentFrame();
	if (opacity <= 0.001) return null;

	const cols = 13;
	const rows = 23;
	const gapX = WIDTH / (cols + 1);
	const gapY = HEIGHT / (rows + 1);

	const dots: React.ReactNode[] = [];
	for (let cx = 0; cx < cols; cx++) {
		for (let cy = 0; cy < rows; cy++) {
			const x = gapX * (cx + 1);
			const y = gapY * (cy + 1);
			/* Ripple radiating from the centre. */
			const dist = Math.hypot(x - WIDTH / 2, y - HEIGHT / 2) / 400;
			const wave = Math.sin(frame * 0.09 - dist * 2.1);
			dots.push(
				<circle
					key={`${cx}-${cy}`}
					cx={x}
					cy={y}
					r={1.4 + Math.max(0, wave) * 2.6}
					fill={color}
					opacity={0.1 + Math.max(0, wave) * 0.32}
				/>,
			);
		}
	}

	return (
		<AbsoluteFill style={{opacity}}>
			<svg width={WIDTH} height={HEIGHT}>
				{dots}
			</svg>
		</AbsoluteFill>
	);
};

/* ------------------------------------------------------------------ *
 * Glitch bands — the screen tearing while everything is broken.
 * ------------------------------------------------------------------ */

export const GlitchBands: React.FC<{opacity: number}> = ({opacity}) => {
	const frame = useCurrentFrame();
	if (opacity <= 0.001) return null;

	const slot = Math.floor(frame / 7);
	const bands = new Array(5).fill(true).map((_, i) => ({
		y: random(`gb-y-${slot}-${i}`) * HEIGHT,
		h: 6 + random(`gb-h-${slot}-${i}`) * 44,
		x: (random(`gb-x-${slot}-${i}`) - 0.5) * 130,
		on: random(`gb-o-${slot}-${i}`) > 0.45,
	}));

	return (
		<AbsoluteFill style={{opacity, mixBlendMode: 'screen'}}>
			{bands.map((b, i) =>
				b.on ? (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: b.x,
							top: b.y,
							width: WIDTH,
							height: b.h,
							background: `linear-gradient(90deg, transparent, ${C.danger}44, ${C.cyan}33, transparent)`,
						}}
					/>
				) : null,
			)}
		</AbsoluteFill>
	);
};

/* ------------------------------------------------------------------ *
 * Radial burst — the moment the brand arrives.
 * ------------------------------------------------------------------ */

export const RadialBurst: React.FC<{opacity: number}> = ({opacity}) => {
	const frame = useCurrentFrame();
	if (opacity <= 0.001) return null;

	const rays = new Array(28).fill(true).map((_, i) => i);

	return (
		<AbsoluteFill style={{opacity}}>
			<svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
				<defs>
					<radialGradient id="burst-fade">
						<stop offset="0%" stopColor={C.cyan} stopOpacity="0.5" />
						<stop offset="100%" stopColor={C.cyan} stopOpacity="0" />
					</radialGradient>
				</defs>
				<g transform={`translate(${WIDTH / 2} ${HEIGHT / 2}) rotate(${frame * 0.22})`}>
					{rays.map((i) => {
						const a = (i / rays.length) * 360;
						const len = 620 + Math.sin(frame * 0.06 + i) * 120;
						return (
							<rect
								key={i}
								x={0}
								y={-2}
								width={len}
								height={4}
								fill="url(#burst-fade)"
								transform={`rotate(${a})`}
								opacity={0.35 + 0.3 * Math.sin(frame * 0.08 + i * 0.5)}
							/>
						);
					})}
				</g>
			</svg>
		</AbsoluteFill>
	);
};

/* ------------------------------------------------------------------ *
 * Data columns — vertical light streams under the service list.
 * ------------------------------------------------------------------ */

const COLUMNS = new Array(16).fill(true).map((_, i) => ({
	x: random(`col-x-${i}`) * WIDTH,
	speed: 2.4 + random(`col-s-${i}`) * 6,
	len: 130 + random(`col-l-${i}`) * 320,
	offset: random(`col-o-${i}`) * HEIGHT,
	color: random(`col-c-${i}`) > 0.5 ? C.cyan : C.blueBright,
	width: random(`col-w-${i}`) > 0.7 ? 3 : 1.6,
}));

export const DataColumns: React.FC<{opacity: number}> = ({opacity}) => {
	const frame = useCurrentFrame();
	if (opacity <= 0.001) return null;

	return (
		<AbsoluteFill style={{opacity}}>
			{COLUMNS.map((col, i) => {
				const span = HEIGHT + col.len;
				const y = ((frame * col.speed + col.offset) % span) - col.len;
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: col.x,
							top: y,
							width: col.width,
							height: col.len,
							background: `linear-gradient(180deg, transparent, ${col.color}, transparent)`,
							opacity: 0.5,
							filter: `blur(0.4px) drop-shadow(0 0 6px ${col.color})`,
						}}
					/>
				);
			})}
		</AbsoluteFill>
	);
};

/* ------------------------------------------------------------------ *
 * Soft orb field — the calm close.
 * ------------------------------------------------------------------ */

const ORBS = new Array(9).fill(true).map((_, i) => ({
	x: random(`orb-x-${i}`) * WIDTH,
	y: random(`orb-y-${i}`) * HEIGHT,
	r: 90 + random(`orb-r-${i}`) * 230,
	speed: 0.004 + random(`orb-s-${i}`) * 0.01,
	phase: random(`orb-p-${i}`) * Math.PI * 2,
	color: random(`orb-c-${i}`) > 0.5 ? C.blue : C.violet,
}));

export const OrbField: React.FC<{opacity: number}> = ({opacity}) => {
	const frame = useCurrentFrame();
	if (opacity <= 0.001) return null;

	return (
		<AbsoluteFill style={{opacity}}>
			{ORBS.map((orb, i) => (
				<div
					key={i}
					style={{
						position: 'absolute',
						left: orb.x - orb.r + Math.sin(frame * orb.speed + orb.phase) * 70,
						top: orb.y - orb.r + Math.cos(frame * orb.speed * 1.3 + orb.phase) * 60,
						width: orb.r * 2,
						height: orb.r * 2,
						borderRadius: '50%',
						background: `radial-gradient(circle at center, ${orb.color}44 0%, transparent 68%)`,
						filter: 'blur(24px)',
					}}
				/>
			))}
		</AbsoluteFill>
	);
};

/* ------------------------------------------------------------------ *
 * The stack: cross-fades the layers across the ad's acts.
 * ------------------------------------------------------------------ */

/** Ramps to 1 between `a`→`b` and back to 0 between `c`→`d`. */
const window_ = (frame: number, a: number, b: number, c: number, d: number) =>
	interpolate(frame, [a, b, c, d], [0, 1, 1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

export const BackdropStack: React.FC = () => {
	const frame = useCurrentFrame();

	const rings = window_(frame, 0, 12, START.scattered - 20, START.scattered + 10);
	const matrix = window_(
		frame,
		START.scattered - 10,
		START.scattered + 20,
		START.birth - 30,
		START.birth,
	);
	const glitch = window_(
		frame,
		START.scattered + 10,
		START.scattered + 40,
		START.birth - 24,
		START.birth - 4,
	);
	const burst = window_(frame, START.birth - 4, START.birth + 14, START.categories, START.seconds);
	const columns = window_(
		frame,
		START.seconds - 10,
		START.services,
		START.payPerUse,
		START.payPerUse + 30,
	);
	const orbs = window_(frame, START.payPerUse, START.payPerUse + 40, 1e9, 1e9);
	/* Rings come back for the close, tying the ending to the opening. */
	const ringsBack = window_(frame, START.benefits, START.cta, 1e9, 1e9);

	return (
		<AbsoluteFill style={{pointerEvents: 'none'}}>
			<OrbField opacity={orbs * 0.9} />
			<RingField opacity={Math.max(rings, ringsBack * 0.8)} />
			<DotMatrix opacity={matrix * 0.75} />
			<DataColumns opacity={columns * 0.85} />
			<RadialBurst opacity={burst} />
			<GlitchBands opacity={glitch * 0.55} />
		</AbsoluteFill>
	);
};
