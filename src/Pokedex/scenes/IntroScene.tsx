import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {
	Animate,
	backInDown,
	bounceIn,
	fadeInUp,
	tada,
	useLoopProgress,
} from '../../lib/animate';
import {DottedTexture} from '../components/Pokeball';
import {FONT_STACK} from '../data';

/**
 * Opening title, built entirely from the animate.css ports:
 * `bounceIn` for the pokeball, `backInDown` for the wordmark, `fadeInUp` for the
 * subtitle, then a looping `tada` once the ball has landed.
 */
export const IntroScene: React.FC<{title: string; subtitle: string}> = ({
	title,
	subtitle,
}) => {
	const frame = useCurrentFrame();

	/* After the entrance finishes at frame 26, hand the ball over to `tada`. */
	const tadaProgress = useLoopProgress(60, 30);
	const settled = frame > 30 ? tada(tadaProgress) : undefined;

	return (
		<AbsoluteFill style={{backgroundColor: '#E23F3F', overflow: 'hidden'}}>
			<AbsoluteFill
				style={{
					background:
						'radial-gradient(90% 80% at 50% 35%, rgba(255,255,255,0.28) 0%, transparent 60%)',
				}}
			/>

			{/* Angled stripe, echoing the reference app's splash screen. */}
			<div
				style={{
					position: 'absolute',
					width: 2600,
					height: 300,
					left: -300,
					top: 760,
					backgroundColor: 'rgba(0,0,0,0.12)',
					transform: `rotate(-6deg) translateX(${interpolate(
						frame,
						[0, 60],
						[-200, 0],
						{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
					)}px)`,
				}}
			/>

			<DottedTexture
				opacity={0.4}
				style={{position: 'absolute', left: 180, top: 200, width: 150, height: 75}}
			/>
			<DottedTexture
				opacity={0.4}
				style={{position: 'absolute', right: 200, bottom: 240, width: 120, height: 60}}
			/>

			<AbsoluteFill
				style={{
					alignItems: 'center',
					justifyContent: 'center',
					fontFamily: FONT_STACK,
					color: 'white',
				}}
			>
				<Animate
					preset={bounceIn}
					durationInFrames={26}
					style={{
						marginBottom: 46,
						filter: 'drop-shadow(0 26px 50px rgba(0,0,0,0.35))',
					}}
				>
					<div style={settled}>
						<Img src={staticFile('pokemon/pokeball.png')} style={{width: 210}} />
					</div>
				</Animate>

				<Animate
					preset={backInDown(700)}
					delay={10}
					durationInFrames={34}
					style={{
						fontSize: 168,
						fontWeight: 800,
						letterSpacing: 14,
						textShadow: '0 12px 40px rgba(0,0,0,0.3)',
					}}
				>
					{title}
				</Animate>

				<Animate
					preset={fadeInUp(50)}
					delay={34}
					durationInFrames={26}
					style={{
						marginTop: 22,
						fontSize: 40,
						fontWeight: 500,
						letterSpacing: 1,
						opacity: 0.92,
					}}
				>
					{subtitle}
				</Animate>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
