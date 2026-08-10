import React from 'react';
import {Composition} from 'remotion';
import {ProductLaunch} from './ProductLaunch/ProductLaunch';
import {HelloFrame} from './HelloFrame';
import {FPS, HEIGHT, TOTAL_DURATION, WIDTH} from './ProductLaunch/timing';
import {PokedexShowcase, POKEDEX_DURATION} from './Pokedex/PokedexShowcase';
import {AnimateGallery} from './lib/animate/AnimateGallery';

/**
 * Every `<Composition>` registered here shows up as an entry in Remotion Studio
 * and as a render target for `npx remotion render <id>`.
 */
export const RemotionRoot: React.FC = () => {
	return (
		<>
			<Composition
				id="ProductLaunch"
				component={ProductLaunch}
				durationInFrames={TOTAL_DURATION}
				fps={FPS}
				width={WIDTH}
				height={HEIGHT}
				defaultProps={{
					eyebrow: 'Now shipping',
					productName: 'Remotion',
					tagline:
						'Write your video as a React component. Animate it with the frame number. Render it on every core you have.',
					sectionLabel: 'Why it works',
					featureHeading: 'Video that behaves like code.',
					statsHeading: 'What you get out of the box.',
					closingLine: 'Your next video is a component.',
					ctaCommand: 'npx create-video@latest',
					website: 'remotion.dev',
				}}
			/>

			<Composition
				id="PokedexShowcase"
				component={PokedexShowcase}
				durationInFrames={POKEDEX_DURATION}
				fps={FPS}
				width={WIDTH}
				height={HEIGHT}
				defaultProps={{
					title: 'POKÉDEX',
					subtitle: 'A Flutter app, re-cut as a React video',
					rosterHeading: 'Kanto starters',
					entryIndex: 0,
					closingLine: "Gotta render 'em all.",
					command: 'npx remotion render PokedexShowcase',
				}}
			/>

			<Composition
				id="AnimateGallery"
				component={AnimateGallery}
				durationInFrames={180}
				fps={FPS}
				width={WIDTH}
				height={HEIGHT}
				defaultProps={{}}
			/>

			<Composition
				id="HelloFrame"
				component={HelloFrame}
				durationInFrames={90}
				fps={FPS}
				width={WIDTH}
				height={HEIGHT}
				defaultProps={{label: 'Hello, frame'}}
			/>
		</>
	);
};
