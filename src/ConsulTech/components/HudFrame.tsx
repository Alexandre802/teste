import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {barPulse, beatPulse, beatStrength} from '../beat';
import {C, FONT, GRAD} from '../theme';
import {HEIGHT, START, TOTAL_DURATION, WIDTH} from '../timing';

/**
 * A persistent HUD over the whole ad: corner brackets, edge ticks and a
 * progress rail.
 *
 * A 9:16 frame leaves a lot of empty canvas above and below the message. The
 * reference ad fills that space with decorative shapes that never stop moving;
 * this is the same idea in ConsulTech's language, and it gives the vertical
 * format a deliberate structure instead of dead margin.
 */

const Bracket: React.FC<{
	corner: 'tl' | 'tr' | 'bl' | 'br';
	progress: number;
}> = ({corner, progress}) => {
	const size = 74;
	const inset = 36;

	const top = corner.startsWith('t');
	const left = corner.endsWith('l');

	return (
		<div
			style={{
				position: 'absolute',
				[top ? 'top' : 'bottom']: inset,
				[left ? 'left' : 'right']: inset,
				width: size,
				height: size,
				borderTop: top ? `3px solid ${C.blue}` : undefined,
				borderBottom: top ? undefined : `3px solid ${C.blue}`,
				borderLeft: left ? `3px solid ${C.blue}` : undefined,
				borderRight: left ? undefined : `3px solid ${C.blue}`,
				borderTopLeftRadius: top && left ? 16 : undefined,
				borderTopRightRadius: top && !left ? 16 : undefined,
				borderBottomLeftRadius: !top && left ? 16 : undefined,
				borderBottomRightRadius: !top && !left ? 16 : undefined,
				opacity: progress * 0.5,
				transform: `translate(${left ? -1 : 1}px, ${top ? -1 : 1}px) scale(${interpolate(
					progress,
					[0, 1],
					[0.5, 1],
				)})`,
				boxShadow: `0 0 22px ${C.blue}55`,
			}}
		/>
	);
};

export const HudFrame: React.FC = () => {
	const frame = useCurrentFrame();

	const enter = interpolate(frame, [0, 22], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const progress = frame / TOTAL_DURATION;

	/* The frame itself breathes with the track. */
	const strength = beatStrength(frame);
	const pulse = beatPulse(frame, 5) * strength;
	const accent = barPulse(frame, 5) * strength;

	/* The closing scene shows the URL full size — don't print it twice. */
	const captionOpacity = interpolate(frame, [START.cta - 20, START.cta], [1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	/* Edge ticks that slide along the left and right rails. */
	const ticks = new Array(9).fill(true).map((_, i) => i);

	return (
		<AbsoluteFill style={{pointerEvents: 'none'}}>
			<Bracket corner="tl" progress={enter + accent * 0.5} />
			<Bracket corner="tr" progress={enter + accent * 0.5} />
			<Bracket corner="bl" progress={enter + accent * 0.5} />
			<Bracket corner="br" progress={enter + accent * 0.5} />

			{/* Vertical rails with travelling ticks. */}
			{[36, WIDTH - 38].map((x, side) => (
				<div
					key={x}
					style={{
						position: 'absolute',
						left: x,
						top: 190,
						bottom: 190,
						width: 2,
						background: `linear-gradient(180deg, transparent, ${C.blue}33 20%, ${C.blue}33 80%, transparent)`,
						opacity: enter,
					}}
				>
					{ticks.map((i) => {
						const span = HEIGHT - 380;
						const speed = side === 0 ? 1 : -1;
						const y = ((i / ticks.length) * span + frame * 1.1 * speed) % span;
						return (
							<div
								key={i}
								style={{
									position: 'absolute',
									left: -5,
									top: y < 0 ? y + span : y,
									width: 12,
									height: 2,
									backgroundColor: C.cyan,
									opacity: 0.55,
									boxShadow: `0 0 8px ${C.cyan}`,
								}}
							/>
						);
					})}
				</div>
			))}

			{/* Progress rail along the bottom. */}
			<div
				style={{
					position: 'absolute',
					left: 130,
					right: 130,
					bottom: 66,
					height: 4,
					borderRadius: 4,
					background: 'rgba(255,255,255,0.08)',
					opacity: enter,
					overflow: 'hidden',
				}}
			>
				<div
					style={{
						height: '100%',
						width: `${progress * 100}%`,
						backgroundImage: GRAD.brand,
						boxShadow: `0 0 ${14 + pulse * 22}px ${C.blue}`,
					}}
				/>
			</div>

			{/* Small caption under the rail — brand, not narration. */}
			<div
				style={{
					position: 'absolute',
					bottom: 34,
					left: 0,
					right: 0,
					textAlign: 'center',
					fontFamily: FONT,
					fontSize: 19,
					letterSpacing: 5,
					textTransform: 'uppercase',
					color: C.inkFaint,
					opacity: enter * captionOpacity * 0.75,
				}}
			>
				consultech.com.br
			</div>
		</AbsoluteFill>
	);
};
