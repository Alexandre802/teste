import React from 'react';
import {
	AbsoluteFill,
	interpolate,
	random,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

/**
 * A deliberately small composition showing the four primitives every Remotion
 * component is built from: useCurrentFrame, useVideoConfig, interpolate, spring
 * — plus seeded random() standing in for the forbidden Math.random().
 *
 * Read `ProductLaunch/` for the real example; read this one first if Remotion is
 * new to you.
 */
export const HelloFrame: React.FC<{label: string}> = ({label}) => {
	const frame = useCurrentFrame();
	const {fps, durationInFrames} = useVideoConfig();

	// spring(): physical, overshooting motion. Great for entrances.
	const scale = spring({fps, frame, config: {damping: 12}});

	// interpolate(): straight mapping from one range to another. Always clamp.
	const hue = interpolate(frame, [0, durationInFrames], [255, 320], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<AbsoluteFill
			style={{
				backgroundColor: `hsl(${hue}, 62%, 8%)`,
				alignItems: 'center',
				justifyContent: 'center',
				gap: 28,
				fontFamily: 'sans-serif',
				color: 'white',
			}}
		>
			<div
				style={{
					fontSize: 120,
					fontWeight: 800,
					transform: `scale(${scale})`,
				}}
			>
				{label}
			</div>

			<div style={{fontSize: 40, opacity: 0.6, fontVariantNumeric: 'tabular-nums'}}>
				frame {frame} / {durationInFrames}
			</div>

			<div style={{display: 'flex', gap: 14}}>
				{new Array(12).fill(true).map((_, i) => (
					<div
						key={i}
						style={{
							width: 18,
							height: 18,
							borderRadius: '50%',
							backgroundColor: 'white',
							// Seeded per-dot offset: identical on every render.
							opacity: 0.2 + 0.8 * Math.abs(Math.sin(frame * 0.1 + random(`dot-${i}`) * 6)),
						}}
					/>
				))}
			</div>
		</AbsoluteFill>
	);
};
