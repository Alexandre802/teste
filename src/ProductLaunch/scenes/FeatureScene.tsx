import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {drift, enter, fadeOutAtEnd, riseIn} from '../animation';
import {IconBolt, IconLayers, IconTimeline} from '../components/icons';
import {COLORS, FONT_FAMILY} from '../theme';

type Feature = {
	icon: React.FC<{color: string; size?: number}>;
	title: string;
	body: string;
	accent: string;
};

const FEATURES: Feature[] = [
	{
		icon: IconTimeline,
		title: 'Frames, not keyframes',
		body: 'Every animation is a pure function of useCurrentFrame(). Scrub anywhere and the picture is always the same.',
		accent: COLORS.accentAlt,
	},
	{
		icon: IconLayers,
		title: 'Composable scenes',
		body: 'Sequence, Series and TransitionSeries turn timing into ordinary component structure you can read at a glance.',
		accent: COLORS.accent,
	},
	{
		icon: IconBolt,
		title: 'Render in parallel',
		body: 'Because frames are independent, they render out of order across every core — or across a fleet of them.',
		accent: COLORS.accentWarm,
	},
];

const FeatureCard: React.FC<{feature: Feature; index: number}> = ({feature, index}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const delay = 18 + index * 8;
	const progress = enter({frame, fps, delay, damping: 18});
	const Icon = feature.icon;

	return (
		<div
			style={{
				flex: 1,
				display: 'flex',
				flexDirection: 'column',
				gap: 22,
				padding: 44,
				borderRadius: 30,
				border: `1px solid ${COLORS.border}`,
				backgroundColor: COLORS.surface,
				backdropFilter: 'blur(14px)',
				opacity: progress,
				transform: `translateY(${interpolate(
					progress,
					[0, 1],
					[90, 0],
				)}px) scale(${interpolate(progress, [0, 1], [0.92, 1])})`,
				boxShadow: `0 30px 80px rgba(0, 0, 0, 0.45)`,
			}}
		>
			<div
				style={{
					width: 74,
					height: 74,
					borderRadius: 20,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					backgroundColor: COLORS.surfaceStrong,
					border: `1px solid ${feature.accent}55`,
					boxShadow: `0 0 34px ${feature.accent}33`,
					/* Each card bobs on its own phase so the row never looks locked. */
					transform: `translateY(${drift(frame, 0.05, 5, index * 1.6)}px)`,
				}}
			>
				<Icon color={feature.accent} size={36} />
			</div>

			<div style={{fontSize: 42, fontWeight: 650, letterSpacing: -1}}>
				{feature.title}
			</div>

			<div style={{fontSize: 27, lineHeight: 1.5, color: COLORS.inkMuted}}>
				{feature.body}
			</div>

			<div
				style={{
					marginTop: 'auto',
					height: 3,
					borderRadius: 3,
					width: `${interpolate(progress, [0, 1], [0, 100])}%`,
					backgroundImage: `linear-gradient(90deg, ${feature.accent}, transparent)`,
				}}
			/>
		</div>
	);
};

export const FeatureScene: React.FC<{sectionLabel: string; heading: string}> = ({
	sectionLabel,
	heading,
}) => {
	const frame = useCurrentFrame();
	const {fps, durationInFrames} = useVideoConfig();

	return (
		<AbsoluteFill
			style={{
				fontFamily: FONT_FAMILY,
				color: COLORS.ink,
				padding: '110px 120px',
				justifyContent: 'center',
				opacity: fadeOutAtEnd(frame, durationInFrames),
			}}
		>
			<div
				style={{
					...riseIn({frame, fps, delay: 0, distance: 26}),
					fontSize: 24,
					letterSpacing: 4,
					textTransform: 'uppercase',
					color: COLORS.inkFaint,
					marginBottom: 18,
				}}
			>
				{sectionLabel}
			</div>

			<div
				style={{
					...riseIn({frame, fps, delay: 5, distance: 34}),
					fontSize: 86,
					fontWeight: 750,
					letterSpacing: -3,
					marginBottom: 66,
					maxWidth: 1200,
				}}
			>
				{heading}
			</div>

			<div style={{display: 'flex', gap: 34, alignItems: 'stretch'}}>
				{FEATURES.map((feature, i) => (
					<FeatureCard key={feature.title} feature={feature} index={i} />
				))}
			</div>
		</AbsoluteFill>
	);
};
