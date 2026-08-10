import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {enter, fadeOutAtEnd, riseIn} from '../animation';
import {COLORS, FONT_FAMILY} from '../theme';

type Stat = {
	value: number;
	prefix?: string;
	suffix: string;
	label: string;
	/** How far the meter under the number fills, 0 → 1. */
	fill: number;
	accent: string;
};

const STATS: Stat[] = [
	{
		value: 100,
		suffix: '%',
		label: 'Deterministic output — same frame, same pixels, every run',
		fill: 1,
		accent: COLORS.accent,
	},
	{
		value: 60,
		suffix: ' fps',
		label: 'Studio preview that matches the final render',
		fill: 0.78,
		accent: COLORS.accentAlt,
	},
	{
		value: 4,
		suffix: 'K',
		label: 'Resolution ceiling, set by one composition prop',
		fill: 0.56,
		accent: COLORS.accentWarm,
	},
];

const StatTile: React.FC<{stat: Stat; index: number}> = ({stat, index}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const progress = enter({frame, fps, delay: 20 + index * 9, damping: 20});

	/**
	 * Counting up is just interpolate() over the spring's progress — no timers,
	 * no state, so seeking to frame 90 shows the right number immediately.
	 */
	const displayed = Math.round(interpolate(progress, [0, 1], [0, stat.value]));

	return (
		<div
			style={{
				flex: 1,
				opacity: progress,
				transform: `translateY(${interpolate(progress, [0, 1], [60, 0])}px)`,
			}}
		>
			<div
				style={{
					fontSize: 150,
					fontWeight: 800,
					letterSpacing: -6,
					lineHeight: 1,
					color: COLORS.ink,
					textShadow: `0 0 60px ${stat.accent}55`,
					fontVariantNumeric: 'tabular-nums',
				}}
			>
				{stat.prefix}
				{displayed}
				<span style={{fontSize: 78, color: stat.accent}}>{stat.suffix}</span>
			</div>

			<div
				style={{
					height: 8,
					borderRadius: 8,
					backgroundColor: COLORS.surfaceStrong,
					margin: '26px 0 22px',
					overflow: 'hidden',
				}}
			>
				<div
					style={{
						height: '100%',
						width: `${progress * stat.fill * 100}%`,
						borderRadius: 8,
						backgroundImage: `linear-gradient(90deg, ${stat.accent}, ${stat.accent}66)`,
						boxShadow: `0 0 22px ${stat.accent}88`,
					}}
				/>
			</div>

			<div style={{fontSize: 26, lineHeight: 1.45, color: COLORS.inkMuted, maxWidth: 420}}>
				{stat.label}
			</div>
		</div>
	);
};

export const StatsScene: React.FC<{heading: string}> = ({heading}) => {
	const frame = useCurrentFrame();
	const {fps, durationInFrames} = useVideoConfig();

	return (
		<AbsoluteFill
			style={{
				fontFamily: FONT_FAMILY,
				color: COLORS.ink,
				padding: '120px',
				justifyContent: 'center',
				opacity: fadeOutAtEnd(frame, durationInFrames),
			}}
		>
			<div
				style={{
					...riseIn({frame, fps, delay: 0, distance: 30}),
					fontSize: 86,
					fontWeight: 750,
					letterSpacing: -3,
					marginBottom: 90,
					maxWidth: 1100,
				}}
			>
				{heading}
			</div>

			<div style={{display: 'flex', gap: 60, alignItems: 'flex-start'}}>
				{STATS.map((stat, i) => (
					<StatTile key={stat.label} stat={stat} index={i} />
				))}
			</div>
		</AbsoluteFill>
	);
};
