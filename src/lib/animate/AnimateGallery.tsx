import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {
	Animate,
	backInDown,
	bounceIn,
	bounceInUp,
	fadeInLeft,
	fadeInRight,
	fadeInUp,
	flipInX,
	headShake,
	lightSpeedInRight,
	pulse,
	tada,
	useLoopProgress,
	zoomIn,
	type Preset,
} from './index';

/**
 * A reference sheet: every ported preset, replayed on a loop so you can compare
 * them. Useful when picking an animation for a new scene.
 */

const ENTRANCES: {name: string; preset: Preset}[] = [
	{name: 'fadeInUp', preset: fadeInUp(60)},
	{name: 'fadeInLeft', preset: fadeInLeft(60)},
	{name: 'fadeInRight', preset: fadeInRight(60)},
	{name: 'bounceIn', preset: bounceIn},
	{name: 'bounceInUp', preset: bounceInUp(200)},
	{name: 'backInDown', preset: backInDown(220)},
	{name: 'zoomIn', preset: zoomIn},
	{name: 'flipInX', preset: flipInX},
	{name: 'lightSpeedInRight', preset: lightSpeedInRight(300)},
];

const LOOPS: {name: string; preset: Preset}[] = [
	{name: 'pulse', preset: pulse},
	{name: 'tada', preset: tada},
	{name: 'headShake', preset: headShake},
];

const CYCLE = 60;

const Tile: React.FC<{name: string; children: React.ReactNode}> = ({name, children}) => (
	<div
		style={{
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
			justifyContent: 'center',
			gap: 18,
			height: 250,
			borderRadius: 22,
			border: '1px solid rgba(255,255,255,0.1)',
			backgroundColor: 'rgba(255,255,255,0.04)',
			overflow: 'hidden',
		}}
	>
		{children}
		<div style={{fontSize: 22, color: 'rgba(255,255,255,0.55)', fontFamily: 'monospace'}}>
			{name}
		</div>
	</div>
);

const Swatch: React.FC<{color: string}> = ({color}) => (
	<div
		style={{
			width: 110,
			height: 110,
			borderRadius: 26,
			backgroundColor: color,
			boxShadow: `0 14px 34px ${color}55`,
		}}
	/>
);

const LoopTile: React.FC<{name: string; preset: Preset; color: string}> = ({
	name,
	preset,
	color,
}) => {
	const progress = useLoopProgress(CYCLE);

	return (
		<Tile name={name}>
			<div style={preset(progress)}>
				<Swatch color={color} />
			</div>
		</Tile>
	);
};

export const AnimateGallery: React.FC = () => {
	const frame = useCurrentFrame();

	/* Restart every entrance together, once per cycle, by keying off the loop. */
	const cycleStart = Math.floor(frame / CYCLE) * CYCLE;

	return (
		<AbsoluteFill
			style={{
				backgroundColor: '#0E0F1A',
				color: 'white',
				fontFamily: 'system-ui, sans-serif',
				padding: 80,
			}}
		>
			<div style={{fontSize: 54, fontWeight: 800, marginBottom: 8}}>
				animate.css → Remotion
			</div>
			<div style={{fontSize: 26, color: 'rgba(255,255,255,0.5)', marginBottom: 46}}>
				Keyframes rewritten as pure functions of the frame number
			</div>

			<div
				style={{
					display: 'grid',
					gridTemplateColumns: 'repeat(4, 1fr)',
					gap: 26,
				}}
			>
				{ENTRANCES.map(({name, preset}) => (
					<Sequence key={name} from={cycleStart} durationInFrames={CYCLE} layout="none">
						<Tile name={name}>
							<Animate preset={preset} durationInFrames={34}>
								<Swatch color="#7C5CFF" />
							</Animate>
						</Tile>
					</Sequence>
				))}

				{LOOPS.map(({name, preset}) => (
					<LoopTile key={name} name={name} preset={preset} color="#22D3EE" />
				))}
			</div>
		</AbsoluteFill>
	);
};
