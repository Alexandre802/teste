import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';

/**
 * The pokeball watermark the reference app puts behind its detail page.
 *
 * `staticFile()` resolves a path inside `public/` — the skill's rule for local
 * assets. The rotation is `frame * speed`, so it is continuous and seekable.
 */
export const PokeballWatermark: React.FC<{
	size: number;
	opacity?: number;
	speed?: number;
	style?: React.CSSProperties;
}> = ({size, opacity = 0.14, speed = 0.9, style}) => {
	const frame = useCurrentFrame();

	return (
		<Img
			src={staticFile('pokemon/pokeball.png')}
			style={{
				width: size,
				height: size,
				opacity,
				transform: `rotate(${frame * speed}deg)`,
				...style,
			}}
		/>
	);
};

/** The dotted texture used as a subtle overlay in the reference app's cards. */
export const DottedTexture: React.FC<{opacity?: number; style?: React.CSSProperties}> = ({
	opacity = 0.5,
	style,
}) => (
	<Img
		src={staticFile('pokemon/dotted.png')}
		style={{width: 92, height: 46, opacity, ...style}}
	/>
);

/** Full-bleed backdrop: flat type colour, pokeball, dots. */
export const PokedexBackdrop: React.FC<{color: string}> = ({color}) => (
	<AbsoluteFill style={{backgroundColor: color, overflow: 'hidden'}}>
		<AbsoluteFill
			style={{
				background: `radial-gradient(120% 100% at 80% 0%, rgba(255,255,255,0.22) 0%, transparent 55%)`,
			}}
		/>
		<PokeballWatermark
			size={860}
			opacity={0.13}
			style={{position: 'absolute', right: -180, top: -170}}
		/>
		{/* Kept clear of the header text on the left and the sprite on the right. */}
		<DottedTexture
			opacity={0.35}
			style={{position: 'absolute', left: 1080, top: 130, width: 140, height: 70}}
		/>
	</AbsoluteFill>
);
