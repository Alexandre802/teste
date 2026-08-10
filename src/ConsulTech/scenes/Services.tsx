import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT} from '../theme';
import {PunchLine} from '../components/Kinetic';
import {LogoMark} from '../components/Logo';
import {
	IconCar,
	IconDoc,
	IconGauge,
	IconScales,
	IconSearch,
	IconX,
	type IconComponent,
} from '../components/Icons';
import {BEAT} from '../timing';

const center: React.CSSProperties = {
	alignItems: 'center',
	justifyContent: 'center',
	fontFamily: FONT,
};

/* ------------------------------------------------------------------ *
 * 10 — "Precisa consultar um veículo? Score? CRLV-e? Protestos?"
 *
 * A stack of service rows. Each one slides in on its own narration beat and
 * the earlier ones compress upward, so the list is always moving.
 * ------------------------------------------------------------------ */

type Service = {
	Icon: IconComponent;
	title: string;
	color: string;
	/** The little live readout on the right of each row. */
	readout: 'plate' | 'score' | 'stamp' | 'alert' | 'history';
};

const SERVICES: Service[] = [
	{Icon: IconCar, title: 'Consulta veicular', color: C.cyan, readout: 'plate'},
	{Icon: IconGauge, title: 'Score de crédito', color: C.blueBright, readout: 'score'},
	{Icon: IconDoc, title: 'CRLV-e', color: C.blue, readout: 'stamp'},
	{Icon: IconScales, title: 'Protestos', color: C.violet, readout: 'alert'},
	{Icon: IconSearch, title: 'Histórico veicular', color: C.cyan, readout: 'history'},
];

const Readout: React.FC<{kind: Service['readout']; local: number; color: string}> = ({
	kind,
	local,
	color,
}) => {
	const reveal = interpolate(local, [12, 34], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	if (kind === 'plate') {
		/* Characters of the plate land one by one. */
		const chars = 'ABC1D23'.split('');
		return (
			<div style={{display: 'flex', gap: 6}}>
				{chars.map((ch, i) => {
					const p = interpolate(local, [14 + i * 2.5, 24 + i * 2.5], [0, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					});
					return (
						<div
							key={i}
							style={{
								width: 34,
								height: 46,
								borderRadius: 7,
								border: `1.4px solid ${color}77`,
								background: 'rgba(255,255,255,0.05)',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								fontSize: 25,
								fontWeight: 700,
								color: C.ink,
								opacity: p,
								transform: `translateY(${interpolate(p, [0, 1], [-16, 0])}px)`,
							}}
						>
							{ch}
						</div>
					);
				})}
			</div>
		);
	}

	if (kind === 'score') {
		const value = Math.round(interpolate(reveal, [0, 1], [0, 876]));
		return (
			<div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8}}>
				<div
					style={{
						fontSize: 46,
						fontWeight: 800,
						color: C.ink,
						fontVariantNumeric: 'tabular-nums',
						lineHeight: 1,
					}}
				>
					{value}
				</div>
				<div
					style={{
						width: 170,
						height: 8,
						borderRadius: 8,
						background: 'rgba(255,255,255,0.1)',
						overflow: 'hidden',
					}}
				>
					<div
						style={{
							height: '100%',
							width: `${reveal * 88}%`,
							background: `linear-gradient(90deg, ${C.danger}, ${C.warn}, ${C.ok})`,
						}}
					/>
				</div>
			</div>
		);
	}

	if (kind === 'stamp') {
		const stamp = interpolate(local, [18, 30], [0, 1], {
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		});
		return (
			<div
				style={{
					padding: '10px 22px',
					borderRadius: 12,
					border: `2px solid ${C.ok}`,
					color: C.ok,
					fontSize: 24,
					fontWeight: 700,
					letterSpacing: 1,
					transform: `scale(${interpolate(stamp, [0, 1], [1.8, 1])}) rotate(-8deg)`,
					opacity: stamp,
				}}
			>
				EMITIDO
			</div>
		);
	}

	if (kind === 'alert') {
		return (
			<div style={{display: 'flex', flexDirection: 'column', gap: 7, alignItems: 'flex-end'}}>
				{[0, 1, 2].map((i) => {
					const p = interpolate(local, [16 + i * 5, 26 + i * 5], [0, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					});
					return (
						<div
							key={i}
							style={{
								width: interpolate(p, [0, 1], [0, 130 - i * 26]),
								height: 9,
								borderRadius: 9,
								background: i === 0 ? C.danger : `${C.violet}bb`,
								opacity: p,
							}}
						/>
					);
				})}
			</div>
		);
	}

	/* history — a small sparkline drawing itself */
	return (
		<svg width={170} height={54} viewBox="0 0 170 54">
			<path
				d="M4 44 L34 30 L64 36 L94 16 L124 24 L166 8"
				stroke={color}
				strokeWidth={3}
				fill="none"
				strokeLinecap="round"
				style={{
					strokeDasharray: 220,
					strokeDashoffset: interpolate(reveal, [0, 1], [220, 0]),
					filter: `drop-shadow(0 0 6px ${color})`,
				}}
			/>
		</svg>
	);
};

const ServiceRow: React.FC<{service: Service; index: number; sceneFrame: number}> = ({
	service,
	index,
	sceneFrame,
}) => {
	const {fps} = useVideoConfig();
	const local = sceneFrame - BEAT.services[index];
	const p = spring({fps, frame: Math.max(0, local), config: {damping: 14, mass: 0.8}});

	/* Rows already on screen shrink slightly as new ones arrive below. */
	const later = BEAT.services.filter((b) => b > BEAT.services[index] && sceneFrame >= b).length;
	const settle = interpolate(later, [0, 4], [1, 0.9], {extrapolateRight: 'clamp'});

	const iconDraw = interpolate(local, [6, 28], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const Icon = service.Icon;

	return (
		<div
			style={{
				display: 'flex',
				alignItems: 'center',
				gap: 30,
				width: 880,
				padding: '26px 34px',
				borderRadius: 26,
				background: 'linear-gradient(140deg, rgba(255,255,255,0.075), rgba(255,255,255,0.02))',
				border: `1.4px solid ${service.color}44`,
				boxShadow: `0 20px 50px rgba(0,0,0,0.45), 0 0 40px ${service.color}22`,
				opacity: interpolate(p, [0, 0.3], [0, 1], {
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				}),
				transform: `translateX(${interpolate(p, [0, 1], [560, 0])}px) scale(${settle})`,
			}}
		>
			<div
				style={{
					width: 92,
					height: 92,
					borderRadius: 26,
					flexShrink: 0,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					background: 'rgba(255,255,255,0.06)',
					border: `1.4px solid ${service.color}66`,
					boxShadow: `0 0 30px ${service.color}33`,
				}}
			>
				<Icon progress={iconDraw} color={service.color} size={50} strokeWidth={2.2} />
			</div>

			<div style={{flex: 1, fontSize: 40, fontWeight: 600, color: C.ink, letterSpacing: -0.8}}>
				{service.title}
			</div>

			<Readout kind={service.readout} local={local} color={service.color} />
		</div>
	);
};

export const SceneServices: React.FC = () => {
	const frame = useCurrentFrame();

	/* The stack drifts up as rows are added so the newest is always centred. */
	const shift = BEAT.services.reduce(
		(acc, beat) =>
			acc +
			interpolate(frame, [beat, beat + 18], [0, 68], {
				extrapolateLeft: 'clamp',
				extrapolateRight: 'clamp',
			}),
		0,
	);

	return (
		<AbsoluteFill style={center}>
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					gap: 24,
					transform: `translateY(${190 - shift}px)`,
				}}
			>
				{SERVICES.map((service, i) => (
					<ServiceRow key={service.title} service={service} index={i} sceneFrame={frame} />
				))}
			</div>
		</AbsoluteFill>
	);
};

/* ------------------------------------------------------------------ *
 * 11 — "Está tudo em um só lugar."
 * The service icons fly in and collapse into the mark.
 * ------------------------------------------------------------------ */

export const SceneOnePlace: React.FC = () => {
	const frame = useCurrentFrame();

	const converge = interpolate(frame, [0, 34], [1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const land = interpolate(frame, [30, 46], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	const orbit = [IconCar, IconGauge, IconDoc, IconScales, IconSearch];

	return (
		<AbsoluteFill style={center}>
			{orbit.map((Icon, i) => {
				const angle = (i / orbit.length) * Math.PI * 2 - Math.PI / 2;
				const dist = converge * 520;
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							transform: `translate(${Math.cos(angle) * dist}px, ${
								Math.sin(angle) * dist
							}px) scale(${0.4 + converge * 0.8})`,
							opacity: converge > 0.06 ? 1 : 0,
						}}
					>
						<Icon progress={1} color={C.cyan} size={92} strokeWidth={2} />
					</div>
				);
			})}

			{/* Impact flash + mark */}
			<AbsoluteFill
				style={{
					background: `radial-gradient(circle at 50% 50%, ${C.cyan}cc 0%, transparent 34%)`,
					opacity: interpolate(land, [0, 0.3, 1], [0, 0.8, 0]),
					mixBlendMode: 'screen',
				}}
			/>

			<div style={{transform: `scale(${interpolate(land, [0, 1], [0.3, 1])})`, opacity: land}}>
				<LogoMark size={260} />
			</div>

			<div
				style={{
					position: 'absolute',
					bottom: 480,
					opacity: interpolate(frame, [44, 58], [0, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
				}}
			>
				<PunchLine
					words={[{text: 'Um'}, {text: 'só'}, {text: 'lugar.', accent: true}]}
					delay={44}
					stagger={3}
					fontSize={104}
				/>
			</div>
		</AbsoluteFill>
	);
};

/* ------------------------------------------------------------------ *
 * 12 — "Sem pular de sistema em sistema. Sem depender de terceiros."
 * ------------------------------------------------------------------ */

const CROSSED = ['Vários sites', 'Esperar terceiros', 'Retrabalho'];

export const SceneNoMiddleman: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	return (
		<AbsoluteFill style={center}>
			<div style={{display: 'flex', flexDirection: 'column', gap: 30, marginBottom: 70}}>
				{CROSSED.map((label, i) => {
					const delay = 4 + i * 17;
					const p = spring({
						fps,
						frame: Math.max(0, frame - delay),
						config: {damping: 15},
					});
					const strike = interpolate(frame - delay - 12, [0, 14], [0, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					});

					return (
						<div
							key={label}
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: 26,
								padding: '22px 40px',
								width: 720,
								borderRadius: 22,
								background: 'rgba(255,77,94,0.07)',
								border: `1.4px solid ${C.danger}44`,
								opacity: interpolate(p, [0, 0.4], [0, 1], {
									extrapolateLeft: 'clamp',
									extrapolateRight: 'clamp',
								}),
								transform: `translateX(${interpolate(p, [0, 1], [-70, 0])}px)`,
							}}
						>
							<IconX progress={strike} size={44} color={C.danger} strokeWidth={3} />
							<div
								style={{
									position: 'relative',
									fontSize: 42,
									fontWeight: 500,
									color: strike > 0.6 ? C.inkFaint : C.inkSoft,
								}}
							>
								{label}
								{/* The line that strikes the item out. */}
								<div
									style={{
										position: 'absolute',
										top: '52%',
										left: 0,
										height: 3,
										width: `${strike * 100}%`,
										borderRadius: 3,
										backgroundColor: C.danger,
									}}
								/>
							</div>
						</div>
					);
				})}
			</div>

			{/* The direct connection that replaces them. */}
			<svg width={860} height={130} viewBox="0 0 860 130">
				{(() => {
					const p = interpolate(frame, [62, 92], [0, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					});
					return (
						<>
							<path
								d="M60 65 H800"
								stroke={C.blue}
								strokeWidth={5}
								strokeLinecap="round"
								style={{
									strokeDasharray: 760,
									strokeDashoffset: interpolate(p, [0, 1], [760, 0]),
									filter: `drop-shadow(0 0 12px ${C.blue})`,
								}}
							/>
							<circle cx={60} cy={65} r={20} fill={C.blueBright} opacity={p} />
							<circle
								cx={800}
								cy={65}
								r={20}
								fill={C.cyan}
								opacity={interpolate(p, [0.8, 1], [0, 1], {
									extrapolateLeft: 'clamp',
									extrapolateRight: 'clamp',
								})}
							/>
							{/* Data packet zipping down the line. */}
							<circle
								cx={interpolate((frame * 9) % 100, [0, 100], [60, 800])}
								cy={65}
								r={9}
								fill={C.ink}
								opacity={p > 0.95 ? 1 : 0}
								style={{filter: `drop-shadow(0 0 12px ${C.ink})`}}
							/>
						</>
					);
				})()}
			</svg>

			<div style={{marginTop: 16}}>
				<PunchLine
					words={[{text: 'Direto.'}, {text: 'Sem'}, {text: 'intermediário.', accent: true}]}
					delay={70}
					stagger={4}
					fontSize={72}
					maxWidth={860}
				/>
			</div>
		</AbsoluteFill>
	);
};
