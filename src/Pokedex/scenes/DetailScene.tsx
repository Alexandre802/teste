import React from 'react';
import {
	AbsoluteFill,
	Img,
	interpolate,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {
	Animate,
	bounceInUp,
	fadeInLeft,
	fadeInUp,
	flipInX,
	useEnterProgress,
	zoomIn,
} from '../../lib/animate';
import {PokedexBackdrop} from '../components/Pokeball';
import {TypeChip} from '../components/TypeChip';
import {ENTRIES, FONT_STACK, STAT_MAX, primaryColor, type Entry, type Stat} from '../data';

/**
 * The detail page from hungps/flutter_pokedex, rebuilt as a Remotion scene:
 * type-tinted background, rotating pokeball watermark, and a white sheet that
 * slides up over it carrying the base stats.
 */

const StatBar: React.FC<{stat: Stat; index: number; color: string}> = ({
	stat,
	index,
	color,
}) => {
	const progress = useEnterProgress(64 + index * 5, 26);
	const ratio = Math.min(stat.value / STAT_MAX, 1);

	return (
		<div style={{display: 'flex', alignItems: 'center', gap: 26, height: 54}}>
			<div
				style={{
					width: 150,
					fontSize: 27,
					fontWeight: 600,
					color: 'rgba(48, 57, 67, 0.55)',
				}}
			>
				{stat.label}
			</div>

			<div
				style={{
					width: 70,
					fontSize: 28,
					fontWeight: 700,
					color: '#303943',
					fontVariantNumeric: 'tabular-nums',
				}}
			>
				{Math.round(interpolate(progress, [0, 1], [0, stat.value]))}
			</div>

			<div
				style={{
					flex: 1,
					height: 10,
					borderRadius: 10,
					backgroundColor: 'rgba(48, 57, 67, 0.08)',
					overflow: 'hidden',
				}}
			>
				<div
					style={{
						height: '100%',
						width: `${progress * ratio * 100}%`,
						borderRadius: 10,
						backgroundColor: color,
					}}
				/>
			</div>
		</div>
	);
};

export const DetailScene: React.FC<{entryIndex?: number}> = ({entryIndex = 0}) => {
	const frame = useCurrentFrame();
	const {height} = useVideoConfig();
	const entry: Entry = ENTRIES[entryIndex];
	const color = primaryColor(entry);

	/* The sheet slides up from the bottom edge and stops two thirds down. */
	const sheetProgress = useEnterProgress(46, 30);
	const sheetTop = interpolate(sheetProgress, [0, 1], [height, 430], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<AbsoluteFill style={{fontFamily: FONT_STACK}}>
			<PokedexBackdrop color={color} />

			{/* Header: number, name, genus, types */}
			<div style={{position: 'absolute', left: 110, top: 110, color: 'white'}}>
				<Animate preset={fadeInLeft(70)} durationInFrames={26} style={{marginBottom: 6}}>
					<div style={{fontSize: 30, fontWeight: 700, opacity: 0.7}}>
						#{String(entry.number).padStart(3, '0')}
					</div>
				</Animate>

				<Animate preset={fadeInLeft(90)} delay={4} durationInFrames={28}>
					<div style={{fontSize: 116, fontWeight: 800, letterSpacing: -3, lineHeight: 1}}>
						{entry.name}
					</div>
				</Animate>

				<Animate preset={fadeInUp(40)} delay={12} durationInFrames={24}>
					<div style={{fontSize: 32, opacity: 0.78, marginTop: 12}}>{entry.genus}</div>
				</Animate>

				<div style={{display: 'flex', gap: 14, marginTop: 26}}>
					{entry.types.map((type, i) => (
						<Animate key={type} preset={zoomIn} delay={20 + i * 6} durationInFrames={22}>
							<TypeChip type={type} fontSize={28} />
						</Animate>
					))}
				</div>
			</div>

			{/* The white sheet, positioned by frame rather than by CSS transition. */}
			<div
				style={{
					position: 'absolute',
					left: 0,
					right: 0,
					top: sheetTop,
					height,
					backgroundColor: 'white',
					borderTopLeftRadius: 46,
					borderTopRightRadius: 46,
					padding: '78px 110px',
					boxShadow: '0 -24px 60px rgba(0,0,0,0.18)',
				}}
			>
				<Animate
					preset={flipInX}
					delay={58}
					durationInFrames={26}
					style={{
						fontSize: 44,
						fontWeight: 800,
						color: '#303943',
						marginBottom: 10,
						transformOrigin: 'left center',
					}}
				>
					Base Stats
				</Animate>

				<Animate
					preset={fadeInUp(30)}
					delay={62}
					durationInFrames={24}
					style={{
						fontSize: 27,
						lineHeight: 1.5,
						color: 'rgba(48, 57, 67, 0.6)',
						maxWidth: 1000,
						marginBottom: 30,
					}}
				>
					{entry.description}
				</Animate>

				<div style={{display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 1150}}>
					{entry.stats.map((stat, i) => (
						<StatBar key={stat.label} stat={stat} index={i} color={color} />
					))}
				</div>
			</div>

			{/* Sprite sits above the sheet, bouncing in from below. */}
			<Animate
				preset={bounceInUp(900)}
				delay={26}
				durationInFrames={40}
				style={{position: 'absolute', right: 130, top: 210}}
			>
				<Img
					src={staticFile(entry.image)}
					style={{
						width: 520,
						height: 520,
						objectFit: 'contain',
						filter: 'drop-shadow(0 30px 42px rgba(0,0,0,0.32))',
						/* Gentle idle float once it has landed. */
						transform: `translateY(${
							frame > 66 ? Math.sin((frame - 66) * 0.07) * 10 : 0
						}px)`,
					}}
				/>
			</Animate>
		</AbsoluteFill>
	);
};
