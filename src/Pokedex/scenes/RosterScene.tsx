import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {Animate, fadeInDown, lightSpeedInRight} from '../../lib/animate';
import {PokeballWatermark} from '../components/Pokeball';
import {TypeChip} from '../components/TypeChip';
import {ENTRIES, FONT_STACK, primaryColor, type Entry} from '../data';

const EntryCard: React.FC<{entry: Entry; index: number}> = ({entry, index}) => (
	<Animate
		preset={lightSpeedInRight(1200)}
		delay={14 + index * 10}
		durationInFrames={32}
		style={{flex: 1}}
	>
		<div
			style={{
				position: 'relative',
				height: 470,
				borderRadius: 34,
				padding: 38,
				overflow: 'hidden',
				backgroundColor: primaryColor(entry),
				boxShadow: `0 26px 60px ${primaryColor(entry)}66`,
				color: 'white',
				display: 'flex',
				flexDirection: 'column',
			}}
		>
			<PokeballWatermark
				size={260}
				opacity={0.2}
				speed={0.6 + index * 0.15}
				style={{position: 'absolute', right: -70, top: -70}}
			/>

			<div style={{fontSize: 28, fontWeight: 700, opacity: 0.65}}>
				#{String(entry.number).padStart(3, '0')}
			</div>
			<div style={{fontSize: 56, fontWeight: 800, letterSpacing: -1, marginTop: 4}}>
				{entry.name}
			</div>

			<div style={{display: 'flex', gap: 12, marginTop: 20}}>
				{entry.types.map((type) => (
					<TypeChip key={type} type={type} fontSize={22} />
				))}
			</div>

			<Img
				src={staticFile(entry.image)}
				style={{
					position: 'absolute',
					right: 26,
					bottom: 26,
					width: 250,
					height: 250,
					objectFit: 'contain',
					filter: 'drop-shadow(0 18px 26px rgba(0,0,0,0.35))',
				}}
			/>
		</div>
	</Animate>
);

export const RosterScene: React.FC<{heading: string}> = ({heading}) => (
	<AbsoluteFill
		style={{
			backgroundColor: '#F7F8FA',
			fontFamily: FONT_STACK,
			padding: '120px 110px',
			justifyContent: 'center',
		}}
	>
		<Animate
			preset={fadeInDown(50)}
			durationInFrames={26}
			style={{
				fontSize: 82,
				fontWeight: 800,
				color: '#303943',
				letterSpacing: -2,
				marginBottom: 14,
			}}
		>
			{heading}
		</Animate>

		<Animate
			preset={fadeInDown(40)}
			delay={6}
			durationInFrames={26}
			style={{
				fontSize: 32,
				color: 'rgba(48, 57, 67, 0.6)',
				marginBottom: 58,
			}}
		>
			Three cards, one component, staggered with a delay prop.
		</Animate>

		<div style={{display: 'flex', gap: 36}}>
			{ENTRIES.map((entry, i) => (
				<EntryCard key={entry.name} entry={entry} index={i} />
			))}
		</div>
	</AbsoluteFill>
);
