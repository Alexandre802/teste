import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT, GRAD} from '../theme';
import type {IconComponent} from './Icons';

/**
 * Reusable surfaces: the glass panels, rounded icon tiles and mini dashboard
 * mockups that the campaign artwork is built from — all rebuilt as animated
 * vector/DOM, never as pasted images.
 */

/** Rounded icon tile with a glowing border, as used along the bottom of the artwork. */
export const IconTile: React.FC<{
	Icon: IconComponent;
	label?: string;
	sub?: string;
	color?: string;
	delay?: number;
	size?: number;
	/** Keeps a gentle idle float going after the entrance. */
	floatPhase?: number;
}> = ({Icon, label, sub, color = C.blueBright, delay = 0, size = 150, floatPhase = 0}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const p = spring({fps, frame: Math.max(0, frame - delay), config: {damping: 13, mass: 0.8}});
	const drawn = interpolate(frame - delay, [6, 30], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const float = Math.sin((frame - delay) * 0.055 + floatPhase) * 7;

	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				gap: 18,
				opacity: interpolate(p, [0, 0.3], [0, 1], {
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				}),
				transform: `translateY(${interpolate(p, [0, 1], [70, 0]) + float}px) scale(${interpolate(
					p,
					[0, 1],
					[0.6, 1],
				)})`,
			}}
		>
			<div
				style={{
					width: size,
					height: size,
					borderRadius: size * 0.3,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					background: `linear-gradient(150deg, rgba(255,255,255,0.09), rgba(255,255,255,0.02))`,
					border: `1.6px solid ${color}66`,
					boxShadow: `0 0 ${size * 0.36}px ${color}44, inset 0 0 ${size * 0.24}px ${color}1A`,
					position: 'relative',
				}}
			>
				<Icon progress={drawn} color={color} size={size * 0.5} strokeWidth={2.2} />
				{/* Corner accent that pulses. */}
				<div
					style={{
						position: 'absolute',
						top: size * 0.11,
						right: size * 0.11,
						width: 7,
						height: 7,
						borderRadius: '50%',
						backgroundColor: color,
						opacity: 0.45 + 0.55 * Math.abs(Math.sin(frame * 0.09 + floatPhase)),
						boxShadow: `0 0 12px ${color}`,
					}}
				/>
			</div>

			{label ? (
				<div
					style={{
						fontFamily: FONT,
						fontSize: size * 0.16,
						fontWeight: 600,
						color: C.ink,
						textAlign: 'center',
						lineHeight: 1.15,
						letterSpacing: -0.4,
					}}
				>
					{label}
				</div>
			) : null}
			{sub ? (
				<div
					style={{
						fontFamily: FONT,
						fontSize: size * 0.115,
						fontWeight: 500,
						color,
						textAlign: 'center',
					}}
				>
					{sub}
				</div>
			) : null}
		</div>
	);
};

/** Glass panel with an animated gradient hairline along its top edge. */
export const GlassPanel: React.FC<{
	children?: React.ReactNode;
	width?: number | string;
	height?: number | string;
	delay?: number;
	padding?: number;
	radius?: number;
	style?: React.CSSProperties;
}> = ({children, width = 800, height, delay = 0, padding = 40, radius = 34, style}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const p = spring({fps, frame: Math.max(0, frame - delay), config: {damping: 16}});

	return (
		<div
			style={{
				width,
				height,
				padding,
				borderRadius: radius,
				position: 'relative',
				overflow: 'hidden',
				background: 'linear-gradient(160deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02))',
				border: `1.4px solid ${C.border}`,
				boxShadow: `0 30px 90px rgba(0,0,0,0.5), inset 0 0 60px rgba(27,109,255,0.07)`,
				opacity: p,
				transform: `translateY(${interpolate(p, [0, 1], [56, 0])}px) scale(${interpolate(
					p,
					[0, 1],
					[0.94, 1],
				)})`,
				...style,
			}}
		>
			<div
				style={{
					position: 'absolute',
					top: 0,
					left: 0,
					right: 0,
					height: 2,
					backgroundImage: GRAD.edge,
					transform: `translateX(${Math.sin(frame * 0.03) * 30}%)`,
					opacity: 0.9,
				}}
			/>
			{children}
		</div>
	);
};

/**
 * The dashboard mock from the artwork: sidebar, KPI row, and a line chart whose
 * path draws itself on. Every number is animated rather than baked in.
 */
export const DashboardMock: React.FC<{
	delay?: number;
	width?: number;
	scale?: number;
}> = ({delay = 0, width = 820, scale = 1}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const local = frame - delay;

	const p = spring({fps, frame: Math.max(0, local), config: {damping: 17}});
	const chart = interpolate(local, [14, 54], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	const height = width * 0.66;
	const sidebar = width * 0.24;

	const kpis = [
		{label: 'Consultas hoje', to: 1482, color: C.blueBright},
		{label: 'Taxa de sucesso', to: 98, suffix: '%', color: C.cyan},
	];

	const bars = [0.45, 0.62, 0.38, 0.78, 0.55, 0.9, 0.7];

	return (
		<div
			style={{
				width,
				height,
				borderRadius: 26,
				overflow: 'hidden',
				display: 'flex',
				background: C.panelSolid,
				border: `1.4px solid ${C.border}`,
				boxShadow: `0 34px 90px rgba(0,0,0,0.62), 0 0 70px ${C.blue}2E`,
				opacity: p,
				transform: `perspective(1400px) rotateY(${interpolate(
					p,
					[0, 1],
					[14, 0],
				)}deg) translateY(${interpolate(p, [0, 1], [60, 0])}px) scale(${
					scale * interpolate(p, [0, 1], [0.92, 1])
				})`,
				fontFamily: FONT,
			}}
		>
			{/* Sidebar */}
			<div
				style={{
					width: sidebar,
					background: 'rgba(255,255,255,0.03)',
					borderRight: `1px solid ${C.border}`,
					padding: width * 0.026,
					display: 'flex',
					flexDirection: 'column',
					gap: width * 0.018,
				}}
			>
				{['Dashboard', 'Consultas', 'Veicular', 'Financeiro', 'Jurídico', 'Relatórios'].map(
					(item, i) => {
						const active = i === 0;
						const appear = interpolate(local, [10 + i * 3, 22 + i * 3], [0, 1], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						});
						return (
							<div
								key={item}
								style={{
									display: 'flex',
									alignItems: 'center',
									gap: width * 0.012,
									padding: `${width * 0.011}px ${width * 0.014}px`,
									borderRadius: width * 0.012,
									backgroundColor: active ? C.blue : 'transparent',
									opacity: appear,
									transform: `translateX(${interpolate(appear, [0, 1], [-14, 0])}px)`,
								}}
							>
								<div
									style={{
										width: width * 0.016,
										height: width * 0.016,
										borderRadius: 4,
										border: `1.4px solid ${active ? C.ink : C.inkFaint}`,
									}}
								/>
								<div
									style={{
										fontSize: width * 0.019,
										fontWeight: active ? 600 : 400,
										color: active ? C.ink : C.inkFaint,
									}}
								>
									{item}
								</div>
							</div>
						);
					},
				)}
			</div>

			{/* Content */}
			<div
				style={{
					flex: 1,
					padding: width * 0.03,
					display: 'flex',
					flexDirection: 'column',
					gap: width * 0.022,
				}}
			>
				<div style={{display: 'flex', gap: width * 0.02}}>
					{kpis.map((kpi, i) => {
						const appear = interpolate(local, [16 + i * 6, 30 + i * 6], [0, 1], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						});
						const count = interpolate(local, [20 + i * 6, 56 + i * 6], [0, 1], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						});
						const eased = 1 - Math.pow(1 - count, 3);

						return (
							<div
								key={kpi.label}
								style={{
									flex: 1,
									padding: width * 0.022,
									borderRadius: width * 0.018,
									background: 'rgba(255,255,255,0.045)',
									border: `1px solid ${C.border}`,
									opacity: appear,
									transform: `translateY(${interpolate(appear, [0, 1], [18, 0])}px)`,
								}}
							>
								<div style={{fontSize: width * 0.017, color: C.inkFaint}}>{kpi.label}</div>
								<div
									style={{
										fontSize: width * 0.042,
										fontWeight: 700,
										color: kpi.color,
										fontVariantNumeric: 'tabular-nums',
										marginTop: width * 0.006,
									}}
								>
									{Math.round(kpi.to * eased).toLocaleString('pt-BR')}
									{kpi.suffix ?? ''}
								</div>
							</div>
						);
					})}
				</div>

				{/* Line chart that draws itself */}
				<div
					style={{
						flex: 1,
						borderRadius: width * 0.018,
						background: 'rgba(255,255,255,0.03)',
						border: `1px solid ${C.border}`,
						padding: width * 0.02,
						display: 'flex',
						flexDirection: 'column',
					}}
				>
					<div style={{fontSize: width * 0.017, color: C.inkFaint, marginBottom: width * 0.01}}>
						Consultas por dia
					</div>
					<svg width="100%" height="100%" viewBox="0 0 300 100" preserveAspectRatio="none">
						<defs>
							<linearGradient id="dash-fill" x1="0" y1="0" x2="0" y2="1">
								<stop offset="0%" stopColor={C.blue} stopOpacity="0.5" />
								<stop offset="100%" stopColor={C.blue} stopOpacity="0" />
							</linearGradient>
						</defs>
						<path
							d="M0 78 L42 62 L84 68 L126 40 L168 47 L210 24 L252 30 L300 10 L300 100 L0 100 Z"
							fill="url(#dash-fill)"
							opacity={chart}
						/>
						<path
							d="M0 78 L42 62 L84 68 L126 40 L168 47 L210 24 L252 30 L300 10"
							stroke={C.cyan}
							strokeWidth={2.6}
							fill="none"
							strokeLinecap="round"
							style={{
								strokeDasharray: 420,
								strokeDashoffset: interpolate(chart, [0, 1], [420, 0]),
								filter: `drop-shadow(0 0 6px ${C.cyan})`,
							}}
						/>
					</svg>
				</div>

				{/* Bar row */}
				<div
					style={{
						height: width * 0.14,
						display: 'flex',
						alignItems: 'flex-end',
						gap: width * 0.012,
					}}
				>
					{bars.map((bar, i) => {
						const grow = interpolate(local, [26 + i * 3, 46 + i * 3], [0, 1], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						});
						return (
							<div
								key={i}
								style={{
									flex: 1,
									height: `${bar * grow * 100}%`,
									borderRadius: 5,
									backgroundImage: `linear-gradient(180deg, ${C.blueBright}, ${C.violet})`,
									opacity: 0.9,
								}}
							/>
						);
					})}
				</div>
			</div>
		</div>
	);
};
