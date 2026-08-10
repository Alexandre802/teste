import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {AnimatedWords} from '../components/AnimatedWords';
import {Logomark} from '../components/icons';
import {enter, fadeOutAtEnd, riseIn} from '../animation';
import {COLORS, FONT_FAMILY, GRADIENT} from '../theme';

type Props = {
	eyebrow: string;
	productName: string;
	tagline: string;
};

export const TitleScene: React.FC<Props> = ({eyebrow, productName, tagline}) => {
	const frame = useCurrentFrame();
	const {fps, durationInFrames} = useVideoConfig();

	const logo = enter({frame, fps, delay: 0, damping: 14});
	const rule = enter({frame, fps, delay: 34});

	return (
		<AbsoluteFill
			style={{
				fontFamily: FONT_FAMILY,
				color: COLORS.ink,
				alignItems: 'center',
				justifyContent: 'center',
				opacity: fadeOutAtEnd(frame, durationInFrames),
			}}
		>
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					maxWidth: 1400,
					textAlign: 'center',
				}}
			>
				<div
					style={{
						opacity: logo,
						transform: `scale(${interpolate(logo, [0, 1], [0.4, 1])}) rotate(${interpolate(
							logo,
							[0, 1],
							[-18, 0],
						)}deg)`,
						marginBottom: 34,
						filter: 'drop-shadow(0 24px 60px rgba(124, 92, 255, 0.45))',
					}}
				>
					<Logomark size={104} />
				</div>

				<div
					style={{
						...riseIn({frame, fps, delay: 2, distance: 20}),
						display: 'flex',
						alignItems: 'center',
						gap: 12,
						padding: '10px 22px',
						borderRadius: 999,
						border: `1px solid ${COLORS.border}`,
						backgroundColor: COLORS.surface,
						fontSize: 24,
						letterSpacing: 3,
						textTransform: 'uppercase',
						color: COLORS.inkMuted,
						marginBottom: 40,
					}}
				>
					<span
						style={{
							width: 10,
							height: 10,
							borderRadius: '50%',
							backgroundColor: COLORS.accentAlt,
							boxShadow: `0 0 16px ${COLORS.accentAlt}`,
							opacity: 0.6 + 0.4 * Math.sin(frame * 0.18),
						}}
					/>
					{eyebrow}
				</div>

				<AnimatedWords
					text={productName}
					delay={8}
					stagger={4}
					style={{
						fontSize: 190,
						fontWeight: 800,
						letterSpacing: -6,
						lineHeight: 1,
					}}
					wordStyle={() => ({
						backgroundImage: GRADIENT,
						WebkitBackgroundClip: 'text',
						backgroundClip: 'text',
						color: 'transparent',
						paddingBottom: '0.08em',
					})}
				/>

				<div
					style={{
						width: interpolate(rule, [0, 1], [0, 460]),
						height: 4,
						borderRadius: 4,
						backgroundImage: GRADIENT,
						margin: '28px 0 34px',
						boxShadow: '0 0 30px rgba(124, 92, 255, 0.7)',
					}}
				/>

				<AnimatedWords
					text={tagline}
					delay={26}
					stagger={1.6}
					style={{
						fontSize: 46,
						fontWeight: 400,
						color: COLORS.inkMuted,
						maxWidth: 1100,
						lineHeight: 1.35,
					}}
				/>
			</div>
		</AbsoluteFill>
	);
};
