import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {AnimatedWords} from '../components/AnimatedWords';
import {Logomark} from '../components/icons';
import {enter, riseIn} from '../animation';
import {COLORS, FONT_FAMILY, MONO_FAMILY} from '../theme';

type Props = {
	closingLine: string;
	ctaCommand: string;
	website: string;
};

export const OutroScene: React.FC<Props> = ({closingLine, ctaCommand, website}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const logo = enter({frame, fps, delay: 0, damping: 13});
	const pill = enter({frame, fps, delay: 30, damping: 16});

	/* A caret that blinks on a frame count — deterministic, unlike setInterval. */
	const caretVisible = Math.floor(frame / 12) % 2 === 0;

	return (
		<AbsoluteFill
			style={{
				fontFamily: FONT_FAMILY,
				color: COLORS.ink,
				alignItems: 'center',
				justifyContent: 'center',
				textAlign: 'center',
			}}
		>
			<div
				style={{
					opacity: logo,
					transform: `scale(${interpolate(logo, [0, 1], [0.5, 1])})`,
					marginBottom: 40,
					filter: 'drop-shadow(0 20px 50px rgba(34, 211, 238, 0.4))',
				}}
			>
				<Logomark size={84} />
			</div>

			<AnimatedWords
				text={closingLine}
				delay={6}
				stagger={3}
				style={{
					fontSize: 104,
					fontWeight: 780,
					letterSpacing: -4,
					lineHeight: 1.1,
					maxWidth: 1400,
					marginBottom: 56,
				}}
			/>

			<div
				style={{
					opacity: pill,
					transform: `translateY(${interpolate(pill, [0, 1], [40, 0])}px)`,
					display: 'flex',
					alignItems: 'center',
					gap: 18,
					padding: '26px 44px',
					borderRadius: 20,
					border: `1px solid ${COLORS.border}`,
					backgroundColor: COLORS.surfaceStrong,
					fontFamily: MONO_FAMILY,
					fontSize: 40,
				}}
			>
				<span style={{color: COLORS.accentAlt}}>$</span>
				<span>{ctaCommand}</span>
				<span
					style={{
						width: 16,
						height: 40,
						backgroundColor: COLORS.accent,
						opacity: caretVisible ? 1 : 0,
					}}
				/>
			</div>

			<div
				style={{
					...riseIn({frame, fps, delay: 44, distance: 22}),
					marginTop: 44,
					fontSize: 30,
					letterSpacing: 2,
					color: COLORS.inkFaint,
				}}
			>
				{website}
			</div>
		</AbsoluteFill>
	);
};
