import React from 'react';
import {AbsoluteFill} from 'remotion';
import {linearTiming, springTiming, TransitionSeries} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {slide} from '@remotion/transitions/slide';
import {wipe} from '@remotion/transitions/wipe';

import {Background} from './components/Background';
import {TitleScene} from './scenes/TitleScene';
import {FeatureScene} from './scenes/FeatureScene';
import {StatsScene} from './scenes/StatsScene';
import {OutroScene} from './scenes/OutroScene';
import {SCENE_DURATION, TRANSITION_DURATION} from './timing';
import {COLORS} from './theme';

export type ProductLaunchProps = {
	eyebrow: string;
	productName: string;
	tagline: string;
	sectionLabel: string;
	featureHeading: string;
	statsHeading: string;
	closingLine: string;
	ctaCommand: string;
	website: string;
};

/**
 * The whole video.
 *
 * `<Background />` sits outside the `<TransitionSeries>` so the aurora keeps
 * drifting across cuts — only the foreground scenes transition. Each scene is
 * mounted just for its own frames, and inside one, `useCurrentFrame()` restarts
 * at 0, so scenes can be written as if they were the only thing in the video.
 */
export const ProductLaunch: React.FC<ProductLaunchProps> = ({
	eyebrow,
	productName,
	tagline,
	sectionLabel,
	featureHeading,
	statsHeading,
	closingLine,
	ctaCommand,
	website,
}) => {
	return (
		<AbsoluteFill style={{backgroundColor: COLORS.bg}}>
			<Background />

			<TransitionSeries>
				<TransitionSeries.Sequence durationInFrames={SCENE_DURATION.title}>
					<TitleScene
						eyebrow={eyebrow}
						productName={productName}
						tagline={tagline}
					/>
				</TransitionSeries.Sequence>

				<TransitionSeries.Transition
					presentation={fade()}
					timing={linearTiming({
						durationInFrames: TRANSITION_DURATION.titleToFeatures,
					})}
				/>

				<TransitionSeries.Sequence durationInFrames={SCENE_DURATION.features}>
					<FeatureScene sectionLabel={sectionLabel} heading={featureHeading} />
				</TransitionSeries.Sequence>

				<TransitionSeries.Transition
					presentation={slide({direction: 'from-right'})}
					timing={springTiming({
						config: {damping: 200},
						durationInFrames: TRANSITION_DURATION.featuresToStats,
					})}
				/>

				<TransitionSeries.Sequence durationInFrames={SCENE_DURATION.stats}>
					<StatsScene heading={statsHeading} />
				</TransitionSeries.Sequence>

				<TransitionSeries.Transition
					presentation={wipe({direction: 'from-bottom'})}
					timing={linearTiming({
						durationInFrames: TRANSITION_DURATION.statsToOutro,
					})}
				/>

				<TransitionSeries.Sequence durationInFrames={SCENE_DURATION.outro}>
					<OutroScene
						closingLine={closingLine}
						ctaCommand={ctaCommand}
						website={website}
					/>
				</TransitionSeries.Sequence>
			</TransitionSeries>
		</AbsoluteFill>
	);
};
