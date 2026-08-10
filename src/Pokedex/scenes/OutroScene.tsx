import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {
	Animate,
	bounceIn,
	fadeInUp,
	headShake,
	pulse,
	useLoopProgress,
} from '../../lib/animate';
import {DottedTexture} from '../components/Pokeball';
import {FONT_STACK} from '../data';

export const OutroScene: React.FC<{line: string; command: string}> = ({line, command}) => {
	const pulseProgress = useLoopProgress(50, 24);
	const shakeProgress = useLoopProgress(70, 40);

	return (
		<AbsoluteFill style={{backgroundColor: '#303943', overflow: 'hidden'}}>
			<AbsoluteFill
				style={{
					background:
						'radial-gradient(80% 70% at 50% 40%, rgba(226, 63, 63, 0.35) 0%, transparent 62%)',
				}}
			/>
			<DottedTexture
				opacity={0.25}
				style={{position: 'absolute', left: 220, bottom: 200, width: 130, height: 65}}
			/>

			<AbsoluteFill
				style={{
					alignItems: 'center',
					justifyContent: 'center',
					fontFamily: FONT_STACK,
					color: 'white',
					textAlign: 'center',
				}}
			>
				<Animate preset={bounceIn} durationInFrames={26} style={{marginBottom: 44}}>
					<div style={pulse(pulseProgress)}>
						{/* The source asset is a black silhouette — invert it for the dark scene. */}
						<Img
							src={staticFile('pokemon/pokeball.png')}
							style={{width: 150, filter: 'invert(1)'}}
						/>
					</div>
				</Animate>

				<Animate
					preset={fadeInUp(60)}
					delay={14}
					durationInFrames={28}
					style={{fontSize: 96, fontWeight: 800, letterSpacing: -2, maxWidth: 1400}}
				>
					<div style={headShake(shakeProgress)}>{line}</div>
				</Animate>

				<Animate
					preset={fadeInUp(40)}
					delay={30}
					durationInFrames={26}
					style={{
						marginTop: 46,
						padding: '24px 44px',
						borderRadius: 18,
						backgroundColor: 'rgba(255,255,255,0.1)',
						border: '1px solid rgba(255,255,255,0.18)',
						fontFamily: '"JetBrains Mono", Menlo, Consolas, monospace',
						fontSize: 36,
					}}
				>
					{command}
				</Animate>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
