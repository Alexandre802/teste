import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT} from '../theme';

/**
 * The ConsulTech hexagon mark, redrawn as SVG so it can assemble itself:
 * the six edges draw on, the inner "C" swoosh sweeps in, then the whole mark
 * settles with a light sweep across it.
 */

const HEX = 'M24 2.6 42.5 13.3v21.4L24 45.4 5.5 34.7V13.3L24 2.6Z';
/* The C-swoosh sitting inside the hexagon. */
const SWOOSH_OUTER = 'M31.5 16.4a10.5 10.5 0 1 0 0 15.2';
const SWOOSH_INNER = 'M24.2 18.6a5.6 5.6 0 0 1 7.3.6';

export const LogoMark: React.FC<{
	size?: number;
	/** 0 → 1 assembly progress. 1 renders the finished mark. */
	progress?: number;
	glow?: boolean;
}> = ({size = 120, progress = 1, glow = true}) => {
	const frame = useCurrentFrame();

	const hexDraw = interpolate(progress, [0, 0.55], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const fillIn = interpolate(progress, [0.45, 0.8], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	/* Starts early and finishes with the fill, so the mark reads as a "C"
	   through most of the assembly instead of a blob at the end. */
	const swoosh = interpolate(progress, [0.32, 0.86], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	/* A specular highlight that keeps travelling once assembled. */
	const sweep = ((frame % 110) / 110) * 2 - 0.5;

	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 48 48"
			fill="none"
			style={glow ? {filter: `drop-shadow(0 0 ${size * 0.22}px ${C.blue}88)`} : undefined}
		>
			<defs>
				<linearGradient id="lg-hex" x1="0" y1="0" x2="1" y2="1">
					<stop offset="0%" stopColor={C.blueBright} />
					<stop offset="55%" stopColor={C.blue} />
					<stop offset="100%" stopColor={C.blueDeep} />
				</linearGradient>
				<linearGradient id="lg-sweep" x1="0" y1="0" x2="1" y2="0">
					<stop offset={`${Math.max(0, sweep * 100 - 12)}%`} stopColor="white" stopOpacity="0" />
					<stop offset={`${sweep * 100}%`} stopColor="white" stopOpacity="0.55" />
					<stop offset={`${Math.min(100, sweep * 100 + 12)}%`} stopColor="white" stopOpacity="0" />
				</linearGradient>
				<clipPath id="lg-clip">
					<path d={HEX} />
				</clipPath>
			</defs>

			<path d={HEX} fill="url(#lg-hex)" opacity={fillIn} />

			<g clipPath="url(#lg-clip)">
				<rect x="0" y="0" width="48" height="48" fill="url(#lg-sweep)" opacity={fillIn} />
			</g>

			<path
				d={HEX}
				stroke={C.blueBright}
				strokeWidth={1.6}
				strokeLinejoin="round"
				style={{
					strokeDasharray: 130,
					strokeDashoffset: interpolate(hexDraw, [0, 1], [130, 0]),
				}}
			/>

			<path
				d={SWOOSH_OUTER}
				stroke="white"
				strokeWidth={4.6}
				strokeLinecap="round"
				fill="none"
				style={{
					strokeDasharray: 60,
					strokeDashoffset: interpolate(swoosh, [0, 1], [60, 0]),
				}}
			/>
			<path
				d={SWOOSH_INNER}
				stroke="white"
				strokeWidth={4.6}
				strokeLinecap="round"
				fill="none"
				opacity={swoosh}
				style={{
					strokeDasharray: 24,
					strokeDashoffset: interpolate(swoosh, [0, 1], [24, 0]),
				}}
			/>
		</svg>
	);
};

/** Mark + "ConsulTech" wordmark, the lockup used in the artwork. */
export const LogoLockup: React.FC<{
	size?: number;
	progress?: number;
	/** Frames to wait before the wordmark types in. */
	wordDelay?: number;
}> = ({size = 96, progress = 1, wordDelay = 10}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const word = spring({fps, frame: Math.max(0, frame - wordDelay), config: {damping: 200}});

	return (
		<div style={{display: 'flex', alignItems: 'center', gap: size * 0.26}}>
			<LogoMark size={size} progress={progress} />
			<div
				style={{
					fontFamily: FONT,
					fontSize: size * 0.62,
					fontWeight: 600,
					letterSpacing: -size * 0.012,
					whiteSpace: 'nowrap',
					opacity: word,
					transform: `translateX(${interpolate(word, [0, 1], [-26, 0])}px)`,
				}}
			>
				<span style={{color: C.ink}}>Consul</span>
				<span style={{color: C.blueBright}}>Tech</span>
			</div>
		</div>
	);
};

/** The small persistent badge in the corner, like the reference ad's logo chip. */
export const LogoBadge: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const enter = spring({fps, frame, config: {damping: 200}});

	return (
		<div
			style={{
				position: 'absolute',
				top: 62,
				left: 60,
				display: 'flex',
				alignItems: 'center',
				gap: 14,
				opacity: enter * 0.96,
				transform: `translateY(${interpolate(enter, [0, 1], [-30, 0])}px)`,
			}}
		>
			<LogoMark size={46} />
			<div style={{fontFamily: FONT, fontSize: 27, fontWeight: 600, letterSpacing: -0.3}}>
				<span style={{color: C.ink}}>Consul</span>
				<span style={{color: C.blueBright}}>Tech</span>
			</div>
		</div>
	);
};
