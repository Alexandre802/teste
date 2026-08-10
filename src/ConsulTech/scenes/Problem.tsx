import React from 'react';
import {
	AbsoluteFill,
	interpolate,
	random,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {C, FONT, GRAD} from '../theme';
import {Counter, Eyebrow, PunchLine} from '../components/Kinetic';
import {IconTile} from '../components/Surfaces';
import {
	IconChart,
	IconClock,
	IconScales,
	IconStore,
	IconUser,
} from '../components/Icons';

const center: React.CSSProperties = {
	alignItems: 'center',
	justifyContent: 'center',
	fontFamily: FONT,
};

/* ------------------------------------------------------------------ *
 * 01 — "Você que é despachante, lojista, advogado, análise de crédito"
 * Four rounded icon tiles land one per profession as the narrator names them.
 * ------------------------------------------------------------------ */

const PROFESSIONS = [
	{Icon: IconUser, label: 'Despachante', color: C.blueBright},
	{Icon: IconStore, label: 'Lojista', color: C.cyan},
	{Icon: IconScales, label: 'Advogado', color: C.violet},
	{Icon: IconChart, label: 'Crédito', color: C.blueBright},
] as const;

export const SceneProfessions: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill style={center}>
			<div style={{marginBottom: 78}}>
				<Eyebrow text="Se isso é você" delay={2} />
			</div>

			<div
				style={{
					display: 'grid',
					gridTemplateColumns: 'repeat(2, 1fr)',
					gap: 78,
					placeItems: 'center',
				}}
			>
				{PROFESSIONS.map((p, i) => (
					<IconTile
						key={p.label}
						Icon={p.Icon}
						label={p.label}
						color={p.color}
						delay={10 + i * 22}
						size={232}
						floatPhase={i * 1.4}
					/>
				))}
			</div>

			{/* A connecting pulse that sweeps across the grid once all four have landed. */}
			<div
				style={{
					marginTop: 74,
					width: interpolate(frame, [104, 132], [0, 560], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
					height: 3,
					borderRadius: 3,
					backgroundImage: GRAD.brand,
					boxShadow: `0 0 26px ${C.blue}`,
				}}
			/>
		</AbsoluteFill>
	);
};

/* ------------------------------------------------------------------ *
 * 02 — "…me responde uma coisa."  A single hard beat.
 * ------------------------------------------------------------------ */

export const SceneAskMe: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const pop = spring({fps, frame, config: {damping: 9, mass: 0.6}});
	const ring = interpolate(frame, [0, 26], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<AbsoluteFill style={center}>
			{/* Expanding shockwave rings behind the mark. */}
			{[0, 1, 2].map((i) => {
				const r = interpolate(ring, [0, 1], [0, 1], {extrapolateRight: 'clamp'});
				const scale = 0.4 + r * (1.6 + i * 0.55);
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							width: 460,
							height: 460,
							borderRadius: '50%',
							border: `2px solid ${C.blue}`,
							opacity: (1 - r) * 0.5,
							transform: `scale(${scale})`,
						}}
					/>
				);
			})}

			<div
				style={{
					fontSize: 400,
					fontWeight: 800,
					lineHeight: 1,
					backgroundImage: GRAD.brand,
					WebkitBackgroundClip: 'text',
					backgroundClip: 'text',
					color: 'transparent',
					transform: `scale(${interpolate(pop, [0, 1], [0.2, 1])}) rotate(${interpolate(
						pop,
						[0, 1],
						[-16, 0],
					)}deg)`,
					filter: `drop-shadow(0 0 60px ${C.blue}aa)`,
				}}
			>
				?
			</div>
		</AbsoluteFill>
	);
};

/* ------------------------------------------------------------------ *
 * 03 — Tab chaos: windows pile up, every one of them still loading.
 * ------------------------------------------------------------------ */

type FakeWindow = {
	x: number;
	y: number;
	rot: number;
	w: number;
	delay: number;
	title: string;
};

const WINDOWS: FakeWindow[] = [
	{x: -300, y: -430, rot: -7, w: 430, delay: 4, title: 'consulta-veicular'},
	{x: 210, y: -300, rot: 6, w: 400, delay: 16, title: 'score-credito'},
	{x: -250, y: -60, rot: 4, w: 460, delay: 28, title: 'detran-estadual'},
	{x: 250, y: 130, rot: -5, w: 420, delay: 40, title: 'protestos-cartorio'},
	{x: -290, y: 340, rot: 8, w: 400, delay: 52, title: 'receita-cadastro'},
	{x: 190, y: 520, rot: -4, w: 440, delay: 64, title: 'processos-tj'},
];

const LoadingWindow: React.FC<{win: FakeWindow; sceneFrame: number}> = ({win, sceneFrame}) => {
	const {fps} = useVideoConfig();
	const local = sceneFrame - win.delay;
	const p = spring({fps, frame: Math.max(0, local), config: {damping: 11, mass: 0.7}});

	/* Nervous jitter that grows as more windows pile up. */
	const agitation = interpolate(sceneFrame, [60, 190], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const jitterX = Math.sin(sceneFrame * 0.9 + win.delay) * 5 * agitation;
	const jitterY = Math.cos(sceneFrame * 1.1 + win.delay) * 4 * agitation;

	/* Each window fades toward red the longer it "waits". */
	const stale = interpolate(local, [30, 130], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const borderColor = stale > 0.5 ? C.danger : C.border;

	return (
		<div
			style={{
				position: 'absolute',
				width: win.w,
				left: '50%',
				top: '50%',
				marginLeft: win.x - win.w / 2,
				marginTop: win.y,
				borderRadius: 18,
				overflow: 'hidden',
				background: 'rgba(10, 16, 32, 0.92)',
				border: `1.4px solid ${borderColor}${stale > 0.5 ? '' : ''}`,
				boxShadow: `0 24px 60px rgba(0,0,0,0.6), 0 0 ${30 * stale}px ${C.danger}55`,
				opacity: interpolate(p, [0, 0.3], [0, 1], {
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				}),
				transform: `rotate(${win.rot}deg) translate(${jitterX}px, ${jitterY}px) scale(${interpolate(
					p,
					[0, 1],
					[0.7, 1],
				)})`,
				fontFamily: FONT,
			}}
		>
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					gap: 8,
					padding: '12px 16px',
					borderBottom: `1px solid ${C.border}`,
					background: 'rgba(255,255,255,0.04)',
				}}
			>
				{['#FF5F57', '#FEBC2E', '#28C840'].map((dot) => (
					<div
						key={dot}
						style={{width: 10, height: 10, borderRadius: '50%', backgroundColor: dot}}
					/>
				))}
				<div style={{fontSize: 17, color: C.inkFaint, marginLeft: 8}}>{win.title}</div>
			</div>

			<div
				style={{
					padding: 24,
					display: 'flex',
					alignItems: 'center',
					gap: 16,
					minHeight: 96,
				}}
			>
				{/* Endless spinner — the point of the scene. */}
				<svg width={34} height={34} viewBox="0 0 40 40">
					<circle
						cx="20"
						cy="20"
						r="15"
						stroke={C.border}
						strokeWidth="4"
						fill="none"
					/>
					<circle
						cx="20"
						cy="20"
						r="15"
						stroke={stale > 0.5 ? C.danger : C.blueBright}
						strokeWidth="4"
						fill="none"
						strokeLinecap="round"
						strokeDasharray="26 70"
						style={{
							transformOrigin: '20px 20px',
							transform: `rotate(${sceneFrame * 11}deg)`,
						}}
					/>
				</svg>
				<div>
					<div
						style={{
							fontSize: 19,
							color: stale > 0.5 ? C.danger : C.inkSoft,
							fontWeight: 500,
						}}
					>
						{stale > 0.5 ? 'Sem resposta…' : 'Carregando…'}
					</div>
					<div
						style={{
							marginTop: 8,
							width: 150,
							height: 6,
							borderRadius: 6,
							background: 'rgba(255,255,255,0.08)',
							overflow: 'hidden',
						}}
					>
						<div
							style={{
								height: '100%',
								/* Creeps up then stalls — never finishes. */
								width: `${interpolate(local, [0, 70], [4, 68], {
									extrapolateLeft: 'clamp',
									extrapolateRight: 'clamp',
								})}%`,
								background: stale > 0.5 ? C.danger : C.blueBright,
							}}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export const SceneScattered: React.FC = () => {
	const frame = useCurrentFrame();

	/* The windows drift apart as the pile grows — the screen gets busier. */
	const spread = interpolate(frame, [0, 150], [0.82, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<AbsoluteFill style={center}>
			<AbsoluteFill style={{transform: `scale(${spread})`}}>
				{WINDOWS.map((win) => (
					<LoadingWindow key={win.title} win={win} sceneFrame={frame} />
				))}
			</AbsoluteFill>

			{/* Wasted-time counter rising over the chaos. */}
			<div
				style={{
					position: 'absolute',
					bottom: 250,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					gap: 6,
					opacity: interpolate(frame, [150, 172], [0, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
				}}
			>
				<div
					style={{
						fontSize: 30,
						letterSpacing: 5,
						textTransform: 'uppercase',
						color: C.danger,
						fontWeight: 600,
					}}
				>
					Tempo perdido
				</div>
				<Counter
					to={47}
					delay={156}
					duration={80}
					suffix=" min"
					fontSize={150}
					gradient={false}
					color={C.danger}
				/>
			</div>
		</AbsoluteFill>
	);
};

/* ------------------------------------------------------------------ *
 * 04 — "E o pior…"  One red strike.
 * ------------------------------------------------------------------ */

export const SceneWorse: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const pop = spring({fps, frame, config: {damping: 8, mass: 0.5}});

	return (
		<AbsoluteFill style={center}>
			<AbsoluteFill
				style={{
					background: `radial-gradient(circle at 50% 45%, ${C.danger}33 0%, transparent 58%)`,
					opacity: 0.5 + 0.5 * Math.abs(Math.sin(frame * 0.35)),
				}}
			/>

			<svg
				width={300}
				height={300}
				viewBox="0 0 48 48"
				fill="none"
				style={{
					transform: `scale(${interpolate(pop, [0, 1], [0.3, 1])})`,
					filter: `drop-shadow(0 0 40px ${C.danger})`,
				}}
			>
				<path
					d="M24 6 44 40H4L24 6Z"
					stroke={C.danger}
					strokeWidth={2.4}
					strokeLinejoin="round"
					fill={`${C.danger}22`}
				/>
				<path d="M24 18v11" stroke={C.danger} strokeWidth={3} strokeLinecap="round" />
				<circle cx="24" cy="34" r="1.9" fill={C.danger} />
			</svg>
		</AbsoluteFill>
	);
};

/* ------------------------------------------------------------------ *
 * 05 — "Cada minuto de espera pode significar um negócio perdido."
 * A deal card slips away while the revenue line falls.
 * ------------------------------------------------------------------ */

export const SceneLoss: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const fall = interpolate(frame, [28, 96], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const clock = spring({fps, frame, config: {damping: 200}});

	/* Coins/notes dropping away, seeded so they are identical every render. */
	const drops = new Array(12).fill(true).map((_, i) => ({
		x: (random(`lx-${i}`) - 0.5) * 760,
		delay: 10 + random(`ld-${i}`) * 84,
		size: 16 + random(`ls-${i}`) * 22,
	}));

	return (
		<AbsoluteFill style={center}>
			<div
				style={{
					opacity: clock,
					transform: `translateY(${interpolate(clock, [0, 1], [-40, 0])}px)`,
					marginBottom: 54,
				}}
			>
				<IconClock
					progress={interpolate(frame, [4, 30], [0, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					})}
					size={140}
					color={C.danger}
					strokeWidth={1.8}
				/>
			</div>

			<PunchLine
				words={[
					{text: 'Cada'},
					{text: 'minuto'},
					{text: 'custa'},
					{text: 'dinheiro', accent: true},
				]}
				delay={10}
				stagger={5}
				fontSize={92}
				maxWidth={880}
			/>

			{/* Falling value */}
			<div style={{position: 'relative', width: 900, height: 300, marginTop: 30}}>
				{drops.map((d, i) => {
					const p = interpolate(frame, [d.delay, d.delay + 55], [0, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					});
					return (
						<div
							key={i}
							style={{
								position: 'absolute',
								left: '50%',
								top: 0,
								marginLeft: d.x,
								fontSize: d.size,
								fontWeight: 700,
								color: C.danger,
								fontFamily: FONT,
								opacity: (1 - p) * 0.85,
								transform: `translateY(${p * 470}px) rotate(${p * 60 - 30}deg)`,
							}}
						>
							R$
						</div>
					);
				})}

				{/* Revenue line collapsing */}
				<svg
					width={900}
					height={220}
					viewBox="0 0 900 220"
					style={{position: 'absolute', bottom: 0, left: 0}}
				>
					<path
						d="M20 60 L180 40 L340 80 L500 60 L660 150 L860 205"
						stroke={C.danger}
						strokeWidth={5}
						fill="none"
						strokeLinecap="round"
						style={{
							strokeDasharray: 1000,
							strokeDashoffset: interpolate(fall, [0, 1], [1000, 0]),
							filter: `drop-shadow(0 0 12px ${C.danger})`,
						}}
					/>
					<circle
						cx={interpolate(fall, [0, 1], [20, 860])}
						cy={interpolate(fall, [0, 0.4, 0.7, 1], [60, 70, 150, 205])}
						r={10}
						fill={C.danger}
						opacity={fall > 0.05 ? 1 : 0}
						style={{filter: `drop-shadow(0 0 16px ${C.danger})`}}
					/>
				</svg>
			</div>
		</AbsoluteFill>
	);
};
