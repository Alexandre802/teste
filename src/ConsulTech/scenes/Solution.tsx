import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT, GRAD} from '../theme';
import {Counter, Eyebrow, PunchLine} from '../components/Kinetic';
import {LogoMark} from '../components/Logo';
import {DashboardMock, IconTile} from '../components/Surfaces';
import {IconCar, IconCard, IconFolder, IconScales} from '../components/Icons';
import {BEAT} from '../timing';

const center: React.CSSProperties = {
	alignItems: 'center',
	justifyContent: 'center',
	fontFamily: FONT,
};

/* ------------------------------------------------------------------ *
 * 06 — "Foi para resolver esse problema que nasceu a ConsulTech."
 * The turn of the ad: scattered light converges and the mark assembles.
 * ------------------------------------------------------------------ */

export const SceneBirth: React.FC = () => {
	const frame = useCurrentFrame();

	const assemble = interpolate(frame, [2, 36], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const burst = interpolate(frame, [28, 46], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	/* Twelve beams rushing inward, then the flash. */
	const beams = new Array(12).fill(true).map((_, i) => (i / 12) * Math.PI * 2);

	return (
		<AbsoluteFill style={center}>
			{beams.map((angle, i) => {
				const travel = interpolate(frame, [i * 1.1, 30 + i * 1.1], [1, 0], {
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				});
				const dist = 240 + travel * 720;
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							width: 7,
							height: 210 * (0.4 + travel),
							borderRadius: 4,
							background: `linear-gradient(180deg, transparent, ${C.cyan})`,
							opacity: (1 - travel) * 0.9,
							transform: `rotate(${(angle * 180) / Math.PI}deg) translateY(${-dist}px)`,
						}}
					/>
				);
			})}

			{/* White flash at the moment of assembly. */}
			<AbsoluteFill
				style={{
					background: `radial-gradient(circle at 50% 50%, ${C.ink} 0%, ${C.cyan} 22%, transparent 46%)`,
					opacity: interpolate(burst, [0, 0.35, 1], [0, 0.85, 0]),
					mixBlendMode: 'screen',
				}}
			/>

			<div style={{transform: `scale(${interpolate(assemble, [0, 1], [0.75, 1])})`}}>
				<LogoMark size={300} progress={assemble} />
			</div>

			<div style={{marginTop: 56, opacity: interpolate(frame, [38, 56], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>
				<div style={{fontSize: 88, fontWeight: 700, letterSpacing: -2}}>
					<span style={{color: C.ink}}>Consul</span>
					<span style={{color: C.blueBright}}>Tech</span>
				</div>
			</div>
		</AbsoluteFill>
	);
};

/* ------------------------------------------------------------------ *
 * 07 — "Em uma única plataforma, mais de 90 tipos de consultas."
 * ------------------------------------------------------------------ */

export const ScenePlatform: React.FC = () => {
	const frame = useCurrentFrame();

	const dashOut = interpolate(frame, [74, 96], [1, 0.35], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<AbsoluteFill style={center}>
			<div style={{marginBottom: 60}}>
				<Eyebrow text="Uma única plataforma" delay={2} />
			</div>

			<div style={{opacity: dashOut, transform: `scale(${0.9 + dashOut * 0.1})`}}>
				<DashboardMock delay={6} width={880} />
			</div>

			{/* The +90 punches over the dashboard once it has settled. */}
			<AbsoluteFill
				style={{
					...center,
					opacity: interpolate(frame, [78, 92], [0, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
				}}
			>
				<div style={{display: 'flex', alignItems: 'baseline', gap: 6}}>
					<div
						style={{
							fontSize: 150,
							fontWeight: 800,
							backgroundImage: GRAD.brand,
							WebkitBackgroundClip: 'text',
							backgroundClip: 'text',
							color: 'transparent',
						}}
					>
						+
					</div>
					<Counter to={90} delay={80} duration={44} fontSize={280} />
				</div>
				<div
					style={{
						fontSize: 46,
						fontWeight: 600,
						color: C.ink,
						letterSpacing: -0.5,
						marginTop: 4,
						textShadow: `0 6px 40px ${C.bg}`,
					}}
				>
					tipos de consultas
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

/* ------------------------------------------------------------------ *
 * 08 — "cadastrais, veiculares, financeiras e jurídicas"
 * One tile per word, timed to the narrator's list.
 * ------------------------------------------------------------------ */

const CATEGORIES = [
	{Icon: IconFolder, label: 'Cadastrais', color: C.blueBright},
	{Icon: IconCar, label: 'Veiculares', color: C.cyan},
	{Icon: IconCard, label: 'Financeiras', color: C.blue},
	{Icon: IconScales, label: 'Jurídicas', color: C.violet},
] as const;

export const SceneCategories: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill style={center}>
			<div
				style={{
					display: 'grid',
					gridTemplateColumns: 'repeat(2, 1fr)',
					gap: 90,
					placeItems: 'center',
				}}
			>
				{CATEGORIES.map((cat, i) => (
					<IconTile
						key={cat.label}
						Icon={cat.Icon}
						label={cat.label}
						color={cat.color}
						delay={BEAT.categories[i]}
						size={248}
						floatPhase={i * 1.7}
					/>
				))}
			</div>

			{/* Lines linking the four once they are all in. */}
			<svg
				width={900}
				height={900}
				viewBox="0 0 900 900"
				style={{position: 'absolute', pointerEvents: 'none'}}
			>
				{[
					'M 250 300 H 650',
					'M 250 600 H 650',
					'M 250 300 V 600',
					'M 650 300 V 600',
				].map((d, i) => {
					const p = interpolate(frame, [124 + i * 5, 146 + i * 5], [0, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					});
					return (
						<path
							key={d}
							d={d}
							stroke={C.blue}
							strokeWidth={2}
							fill="none"
							opacity={0.5}
							style={{
								strokeDasharray: 400,
								strokeDashoffset: interpolate(p, [0, 1], [400, 0]),
								filter: `drop-shadow(0 0 6px ${C.blue})`,
							}}
						/>
					);
				})}
			</svg>
		</AbsoluteFill>
	);
};

/* ------------------------------------------------------------------ *
 * 09 — "com resultado em segundos"
 * ------------------------------------------------------------------ */

export const SceneSeconds: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const pop = spring({fps, frame, config: {damping: 10, mass: 0.6}});

	/* Speed streaks flying past. */
	const streaks = new Array(14).fill(true).map((_, i) => ({
		y: -420 + i * 62,
		delay: i * 1.6,
		len: 180 + (i % 4) * 120,
	}));

	return (
		<AbsoluteFill style={center}>
			{streaks.map((s, i) => {
				const t = interpolate(frame - s.delay, [0, 22], [0, 1], {
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				});
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							top: '50%',
							left: '50%',
							marginTop: s.y,
							width: s.len,
							height: 3,
							borderRadius: 3,
							background: `linear-gradient(90deg, transparent, ${C.cyan})`,
							opacity: (1 - t) * 0.65,
							transform: `translateX(${interpolate(t, [0, 1], [-900, 700])}px)`,
						}}
					/>
				);
			})}

			<div
				style={{
					transform: `scale(${interpolate(pop, [0, 1], [0.4, 1])})`,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
				}}
			>
				<PunchLine
					words={[{text: 'Em'}, {text: 'segundos.', accent: true}]}
					delay={0}
					stagger={3}
					fontSize={132}
				/>
			</div>
		</AbsoluteFill>
	);
};
