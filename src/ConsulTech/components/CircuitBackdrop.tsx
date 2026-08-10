import React from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame} from 'remotion';
import {C} from '../theme';
import {HEIGHT, WIDTH} from '../timing';

/**
 * The living background: circuit traces with light pulses running along them,
 * drifting aurora glows, and a seeded particle field.
 *
 * This sits under every scene so the frame is never static — the reference ad
 * keeps its backdrop moving at all times, and so does this.
 *
 * All randomness is seeded with `random()`; positions are computed once at
 * module scope so they don't churn per frame.
 */

/** An L-shaped circuit trace, the way traces run on a PCB. */
type Trace = {
	d: string;
	length: number;
	delay: number;
	speed: number;
	width: number;
	color: string;
};

const buildTraces = (): Trace[] => {
	const traces: Trace[] = [];

	for (let i = 0; i < 16; i++) {
		const startY = 60 + random(`ty-${i}`) * (HEIGHT - 120);
		const fromLeft = random(`side-${i}`) > 0.5;
		const x0 = fromLeft ? -40 : WIDTH + 40;
		const midX = fromLeft
			? 120 + random(`mx-${i}`) * (WIDTH * 0.42)
			: WIDTH - 120 - random(`mx-${i}`) * (WIDTH * 0.42);
		const dy = (random(`dy-${i}`) - 0.5) * 520;
		const endY = startY + dy;
		const endX = fromLeft
			? midX + 90 + random(`ex-${i}`) * 220
			: midX - 90 - random(`ex-${i}`) * 220;

		/* Straight run, 45° elbow, straight run — a PCB trace. */
		const elbow = Math.sign(dy) * Math.min(Math.abs(dy), 90);
		const d = `M ${x0} ${startY} H ${midX} L ${midX + Math.sign(endX - midX) * 90} ${
			startY + elbow
		} H ${endX} V ${endY}`;

		traces.push({
			d,
			length: Math.abs(midX - x0) + 130 + Math.abs(endX - midX) + Math.abs(endY - startY),
			delay: random(`de-${i}`) * 120,
			speed: 0.55 + random(`sp-${i}`) * 0.85,
			width: random(`w-${i}`) > 0.72 ? 2 : 1.2,
			color: random(`c-${i}`) > 0.62 ? C.cyan : C.blue,
		});
	}

	return traces;
};

const TRACES = buildTraces();

const NODES = new Array(26).fill(true).map((_, i) => ({
	x: random(`nx-${i}`) * WIDTH,
	y: random(`ny-${i}`) * HEIGHT,
	r: 2 + random(`nr-${i}`) * 3.5,
	phase: random(`np-${i}`) * Math.PI * 2,
	color: random(`nc-${i}`) > 0.5 ? C.cyan : C.blueBright,
}));

const DUST = new Array(70).fill(true).map((_, i) => ({
	x: random(`dx-${i}`) * WIDTH,
	y: random(`dy2-${i}`) * HEIGHT,
	r: 0.8 + random(`dr-${i}`) * 1.8,
	phase: random(`dp-${i}`) * Math.PI * 2,
	rise: 8 + random(`drs-${i}`) * 26,
}));

export const CircuitBackdrop: React.FC<{
	/** 0 = calm, 1 = agitated. Scenes about the problem crank this up. */
	intensity?: number;
	/** Tints the glows red for the "problem" scenes. */
	mood?: 'brand' | 'danger';
}> = ({intensity = 0.5, mood = 'brand'}) => {
	const frame = useCurrentFrame();

	const glowA = mood === 'danger' ? 'rgba(255, 77, 94, 0.20)' : 'rgba(27, 109, 255, 0.30)';
	const glowB = mood === 'danger' ? 'rgba(192, 38, 211, 0.16)' : 'rgba(34, 211, 238, 0.20)';

	return (
		<AbsoluteFill style={{backgroundColor: C.bg, overflow: 'hidden'}}>
			{/* Aurora glows, drifting on sine so they never sit still. */}
			<div
				style={{
					position: 'absolute',
					width: 1500,
					height: 1500,
					left: -420 + Math.sin(frame * 0.008) * 90,
					top: -520 + Math.cos(frame * 0.0065) * 70,
					background: `radial-gradient(circle at center, ${glowA} 0%, transparent 64%)`,
					filter: 'blur(40px)',
				}}
			/>
			<div
				style={{
					position: 'absolute',
					width: 1300,
					height: 1300,
					right: -400 + Math.cos(frame * 0.0095) * 80,
					bottom: -420 + Math.sin(frame * 0.0072) * 90,
					background: `radial-gradient(circle at center, ${glowB} 0%, transparent 64%)`,
					filter: 'blur(40px)',
				}}
			/>

			<svg
				width={WIDTH}
				height={HEIGHT}
				style={{position: 'absolute', inset: 0}}
				viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
			>
				<defs>
					<linearGradient id="trace-fade" x1="0" y1="0" x2="1" y2="0">
						<stop offset="0%" stopColor={C.blue} stopOpacity="0" />
						<stop offset="50%" stopColor={C.blue} stopOpacity="0.5" />
						<stop offset="100%" stopColor={C.blue} stopOpacity="0" />
					</linearGradient>
				</defs>

				{TRACES.map((trace, i) => {
					/* The dim trace itself. */
					const base = 0.1 + intensity * 0.14;

					/* A short bright dash running along the trace — the "pulse". */
					const cycle = trace.length + 300;
					const travelled =
						((frame * trace.speed * (1 + intensity) + trace.delay) * 4) % cycle;

					return (
						<g key={i}>
							<path
								d={trace.d}
								stroke={trace.color}
								strokeWidth={trace.width}
								fill="none"
								opacity={base}
							/>
							<path
								d={trace.d}
								stroke={trace.color}
								strokeWidth={trace.width + 1.4}
								fill="none"
								strokeLinecap="round"
								opacity={0.85}
								style={{
									strokeDasharray: `70 ${cycle}`,
									strokeDashoffset: cycle - travelled,
									filter: `drop-shadow(0 0 7px ${trace.color})`,
								}}
							/>
						</g>
					);
				})}

				{NODES.map((node, i) => {
					const pulse = 0.35 + 0.65 * Math.abs(Math.sin(frame * 0.045 + node.phase));
					return (
						<circle
							key={i}
							cx={node.x}
							cy={node.y}
							r={node.r * (0.8 + pulse * 0.5)}
							fill={node.color}
							opacity={pulse * (0.25 + intensity * 0.4)}
							style={{filter: `drop-shadow(0 0 8px ${node.color})`}}
						/>
					);
				})}

				{DUST.map((d, i) => {
					/* Slow upward drift, wrapping around the frame height. */
					const y = (d.y - frame * (d.rise / 60)) % HEIGHT;
					return (
						<circle
							key={i}
							cx={d.x + Math.sin(frame * 0.02 + d.phase) * 12}
							cy={y < 0 ? y + HEIGHT : y}
							r={d.r}
							fill={C.cyan}
							opacity={0.1 + 0.2 * Math.abs(Math.sin(frame * 0.03 + d.phase))}
						/>
					);
				})}
			</svg>

			{/* Vignette keeps attention centred. */}
			<AbsoluteFill
				style={{
					background:
						'radial-gradient(78% 62% at 50% 45%, transparent 30%, rgba(2,4,10,0.82) 100%)',
				}}
			/>

			{/* Very subtle scanline shimmer, moving. */}
			<AbsoluteFill
				style={{
					backgroundImage:
						'repeating-linear-gradient(0deg, rgba(255,255,255,0.028) 0px, rgba(255,255,255,0.028) 1px, transparent 1px, transparent 4px)',
					transform: `translateY(${(frame * 0.6) % 4}px)`,
					opacity: 0.5,
				}}
			/>
		</AbsoluteFill>
	);
};

/** Quick brand-blue flash used on hard cuts between scenes. */
export const CutFlash: React.FC<{at: number; duration?: number}> = ({at, duration = 8}) => {
	const frame = useCurrentFrame();
	const opacity = interpolate(frame, [at, at + 2, at + duration], [0, 0.5, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<AbsoluteFill
			style={{
				background: `linear-gradient(180deg, ${C.blue}, ${C.cyan})`,
				opacity,
				mixBlendMode: 'screen',
			}}
		/>
	);
};
