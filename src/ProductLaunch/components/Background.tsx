import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {drift} from '../animation';
import {COLORS} from '../theme';

/**
 * The shared backdrop: two drifting aurora blobs, a seeded starfield and a
 * vignette.
 *
 * The star positions come from `random()` with static seeds rather than
 * `Math.random()`, so the field is identical on every frame and on every render
 * worker. They are computed once at module scope instead of per frame.
 */

const STAR_COUNT = 70;

const STARS = new Array(STAR_COUNT).fill(true).map((_, i) => ({
	x: random(`star-x-${i}`) * 100,
	y: random(`star-y-${i}`) * 100,
	size: 1 + random(`star-size-${i}`) * 2.4,
	phase: random(`star-phase-${i}`) * Math.PI * 2,
	baseOpacity: 0.25 + random(`star-opacity-${i}`) * 0.5,
}));

const auroraBlob = (color: string, size: number): React.CSSProperties => ({
	position: 'absolute',
	width: size,
	height: size,
	borderRadius: '50%',
	background: `radial-gradient(circle at center, ${color} 0%, transparent 68%)`,
	filter: 'blur(60px)',
});

export const Background: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill style={{backgroundColor: COLORS.bg, overflow: 'hidden'}}>
			<AbsoluteFill
				style={{
					background: `radial-gradient(120% 90% at 50% 0%, ${COLORS.bgSoft} 0%, ${COLORS.bg} 60%)`,
				}}
			/>

			<div
				style={{
					...auroraBlob('rgba(124, 92, 255, 0.55)', 1500),
					left: -260 + drift(frame, 0.011, 70),
					top: -480 + drift(frame, 0.009, 50, 1.2),
				}}
			/>
			<div
				style={{
					...auroraBlob('rgba(34, 211, 238, 0.34)', 1200),
					right: -300 + drift(frame, 0.013, 60, 2.1),
					bottom: -420 + drift(frame, 0.01, 55, 0.4),
				}}
			/>
			<div
				style={{
					...auroraBlob('rgba(255, 122, 89, 0.2)', 900),
					left: 700 + drift(frame, 0.008, 90, 3.4),
					bottom: -320 + drift(frame, 0.012, 40, 1.9),
				}}
			/>

			{/* Faint engineering grid, masked so it only reads in the centre. */}
			<AbsoluteFill
				style={{
					backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
					backgroundSize: '80px 80px',
					maskImage:
						'radial-gradient(75% 60% at 50% 45%, rgba(0,0,0,0.9) 0%, transparent 100%)',
					WebkitMaskImage:
						'radial-gradient(75% 60% at 50% 45%, rgba(0,0,0,0.9) 0%, transparent 100%)',
				}}
			/>

			<AbsoluteFill>
				{STARS.map((star, i) => (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: `${star.x}%`,
							top: `${star.y}%`,
							width: star.size,
							height: star.size,
							borderRadius: '50%',
							backgroundColor: COLORS.ink,
							opacity:
								star.baseOpacity * (0.55 + 0.45 * Math.sin(frame * 0.06 + star.phase)),
						}}
					/>
				))}
			</AbsoluteFill>

			{/* Vignette keeps the eye on the middle of the frame. */}
			<AbsoluteFill
				style={{
					background:
						'radial-gradient(70% 70% at 50% 50%, transparent 40%, rgba(0,0,0,0.65) 100%)',
				}}
			/>
		</AbsoluteFill>
	);
};
