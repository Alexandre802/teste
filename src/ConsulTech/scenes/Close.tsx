import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT, GRAD} from '../theme';
import {Eyebrow, PunchLine} from '../components/Kinetic';
import {LogoLockup} from '../components/Logo';
import {IconBolt, IconRocket, IconShield, type IconComponent} from '../components/Icons';
import {BEAT} from '../timing';

const center: React.CSSProperties = {
	alignItems: 'center',
	justifyContent: 'center',
	fontFamily: FONT,
};

/* ------------------------------------------------------------------ *
 * 13 — "Você paga apenas pelo que usar, sem mensalidade obrigatória."
 * Prices are the real ones from the campaign artwork.
 * ------------------------------------------------------------------ */

const PRICES = [
	{label: 'Score de crédito', value: '1,08', color: C.blueBright},
	{label: 'Cadastral', value: '1,98', color: C.cyan},
	{label: 'CRLV-e', value: '9,90', color: C.violet},
];

export const ScenePayPerUse: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const calendarKill = interpolate(frame, [118, 140], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<AbsoluteFill style={center}>
			<div style={{marginBottom: 66}}>
				<Eyebrow text="Pague pelo que usar" delay={2} />
			</div>

			<div style={{display: 'flex', flexDirection: 'column', gap: 26}}>
				{PRICES.map((price, i) => {
					const delay = 12 + i * 20;
					const p = spring({
						fps,
						frame: Math.max(0, frame - delay),
						config: {damping: 12, mass: 0.7},
					});
					return (
						<div
							key={price.label}
							style={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'space-between',
								width: 800,
								padding: '28px 44px',
								borderRadius: 26,
								background:
									'linear-gradient(140deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))',
								border: `1.4px solid ${price.color}55`,
								boxShadow: `0 0 44px ${price.color}22`,
								opacity: interpolate(p, [0, 0.35], [0, 1], {
									extrapolateLeft: 'clamp',
									extrapolateRight: 'clamp',
								}),
								transform: `translateY(${interpolate(
									p,
									[0, 1],
									[60, 0],
								)}px) scale(${interpolate(p, [0, 1], [0.86, 1])})`,
							}}
						>
							<div style={{fontSize: 40, fontWeight: 500, color: C.inkSoft}}>
								{price.label}
							</div>
							<div style={{display: 'flex', alignItems: 'baseline', gap: 8}}>
								<div style={{fontSize: 32, fontWeight: 600, color: price.color}}>R$</div>
								<div
									style={{
										fontSize: 62,
										fontWeight: 800,
										color: C.ink,
										letterSpacing: -1.5,
									}}
								>
									{price.value}
								</div>
							</div>
						</div>
					);
				})}
			</div>

			{/* "Sem mensalidade" — a calendar getting struck through. */}
			<div
				style={{
					marginTop: 64,
					display: 'flex',
					alignItems: 'center',
					gap: 24,
					opacity: interpolate(frame, [112, 130], [0, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
				}}
			>
				<div style={{position: 'relative'}}>
					<svg width={78} height={78} viewBox="0 0 48 48" fill="none" stroke={C.inkFaint}>
						<rect x="7" y="11" width="34" height="30" rx="4" strokeWidth={2.2} />
						<path d="M7 20h34M16 7v8M32 7v8" strokeWidth={2.2} strokeLinecap="round" />
					</svg>
					<div
						style={{
							position: 'absolute',
							top: '50%',
							left: -6,
							width: `${calendarKill * 92}%`,
							height: 5,
							borderRadius: 5,
							backgroundColor: C.danger,
							transform: 'rotate(-18deg)',
							boxShadow: `0 0 16px ${C.danger}`,
						}}
					/>
				</div>
				<div style={{fontSize: 56, fontWeight: 700, color: C.ink, letterSpacing: -1}}>
					Sem mensalidade
				</div>
			</div>
		</AbsoluteFill>
	);
};

/* ------------------------------------------------------------------ *
 * 14 — "Mais agilidade, mais segurança, mais produtividade."
 * One benefit per narration beat, each with a ring that fills.
 * ------------------------------------------------------------------ */

const BENEFITS: {Icon: IconComponent; label: string; color: string}[] = [
	{Icon: IconBolt, label: 'Agilidade', color: C.warn},
	{Icon: IconShield, label: 'Segurança', color: C.ok},
	{Icon: IconRocket, label: 'Produtividade', color: C.cyan},
];

const BenefitRing: React.FC<{
	Icon: IconComponent;
	label: string;
	color: string;
	delay: number;
	sceneFrame: number;
}> = ({Icon, label, color, delay, sceneFrame}) => {
	const {fps} = useVideoConfig();
	const local = sceneFrame - delay;
	const p = spring({fps, frame: Math.max(0, local), config: {damping: 13, mass: 0.7}});

	const ring = interpolate(local, [6, 40], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const R = 86;
	const circumference = 2 * Math.PI * R;

	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				gap: 22,
				opacity: interpolate(p, [0, 0.35], [0, 1], {
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				}),
				transform: `translateY(${interpolate(p, [0, 1], [64, 0])}px) scale(${interpolate(
					p,
					[0, 1],
					[0.7, 1],
				)})`,
			}}
		>
			<div style={{position: 'relative', width: 200, height: 200}}>
				<svg width={200} height={200} style={{position: 'absolute', inset: 0}}>
					<circle cx={100} cy={100} r={R} stroke="rgba(255,255,255,0.09)" strokeWidth={7} fill="none" />
					<circle
						cx={100}
						cy={100}
						r={R}
						stroke={color}
						strokeWidth={7}
						fill="none"
						strokeLinecap="round"
						transform="rotate(-90 100 100)"
						style={{
							strokeDasharray: circumference,
							strokeDashoffset: circumference * (1 - ring),
							filter: `drop-shadow(0 0 10px ${color})`,
						}}
					/>
				</svg>
				<div
					style={{
						position: 'absolute',
						inset: 0,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					<Icon
						progress={interpolate(local, [10, 34], [0, 1], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						})}
						color={color}
						size={86}
						strokeWidth={2}
					/>
				</div>
			</div>
			<div style={{fontSize: 40, fontWeight: 600, color: C.ink, letterSpacing: -0.6}}>
				{label}
			</div>
		</div>
	);
};

export const SceneBenefits: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill style={center}>
			<div style={{display: 'flex', gap: 60, alignItems: 'center'}}>
				{BENEFITS.map((benefit, i) => (
					<BenefitRing
						key={benefit.label}
						{...benefit}
						delay={BEAT.benefits[i]}
						sceneFrame={frame}
					/>
				))}
			</div>

			<div style={{marginTop: 96}}>
				<PunchLine
					words={[{text: 'Todo'}, {text: 'dia.'}, {text: 'Toda'}, {text: 'consulta.', accent: true}]}
					delay={132}
					stagger={4}
					fontSize={74}
					maxWidth={900}
				/>
			</div>
		</AbsoluteFill>
	);
};

/* ------------------------------------------------------------------ *
 * 15 — "Informação certa, na hora certa. Cadastre-se agora."
 * ------------------------------------------------------------------ */

export const SceneCTA: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const logo = spring({fps, frame: Math.max(0, frame - 46), config: {damping: 14}});
	const button = spring({fps, frame: Math.max(0, frame - 56), config: {damping: 12, mass: 0.7}});

	/* The CTA keeps breathing so the last frame is never static. */
	const breathe = 1 + Math.sin(frame * 0.13) * 0.022;

	return (
		<AbsoluteFill style={center}>
			<PunchLine
				words={[
					{text: 'Informação'},
					{text: 'certa,', accent: true},
					{text: 'na'},
					{text: 'hora'},
					{text: 'certa.', accent: true},
				]}
				delay={2}
				stagger={4}
				fontSize={96}
				maxWidth={900}
			/>

			<div
				style={{
					marginTop: 86,
					opacity: logo,
					transform: `scale(${interpolate(logo, [0, 1], [0.8, 1])})`,
				}}
			>
				<LogoLockup size={112} wordDelay={54} />
			</div>

			{/* CTA button */}
			<div
				style={{
					marginTop: 76,
					opacity: interpolate(button, [0, 0.4], [0, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
					transform: `translateY(${interpolate(button, [0, 1], [50, 0])}px) scale(${
						breathe * interpolate(button, [0, 1], [0.86, 1])
					})`,
					position: 'relative',
				}}
			>
				{/* Pulsing halo behind the button. */}
				<div
					style={{
						position: 'absolute',
						inset: -18,
						borderRadius: 34,
						backgroundImage: GRAD.brand,
						filter: 'blur(28px)',
						opacity: 0.35 + 0.25 * Math.sin(frame * 0.13),
					}}
				/>
				<div
					style={{
						position: 'relative',
						padding: '34px 74px',
						borderRadius: 26,
						backgroundImage: GRAD.blue,
						border: `1.6px solid ${C.borderBright}`,
						fontSize: 52,
						fontWeight: 700,
						color: C.ink,
						letterSpacing: -0.8,
						boxShadow: `0 24px 70px ${C.blue}66`,
					}}
				>
					Cadastre-se agora
				</div>
			</div>

			<div
				style={{
					marginTop: 46,
					fontSize: 34,
					fontWeight: 500,
					letterSpacing: 3,
					color: C.inkSoft,
					opacity: interpolate(frame, [80, 100], [0, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
				}}
			>
				consultech.com.br
			</div>
		</AbsoluteFill>
	);
};
