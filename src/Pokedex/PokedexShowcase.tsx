import React from 'react';
import {AbsoluteFill} from 'remotion';
import {linearTiming, TransitionSeries} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {slide} from '@remotion/transitions/slide';
import {wipe} from '@remotion/transitions/wipe';

import {IntroScene} from './scenes/IntroScene';
import {RosterScene} from './scenes/RosterScene';
import {DetailScene} from './scenes/DetailScene';
import {OutroScene} from './scenes/OutroScene';

export type PokedexShowcaseProps = {
	title: string;
	subtitle: string;
	rosterHeading: string;
	entryIndex: number;
	closingLine: string;
	command: string;
};

export const POKEDEX_SCENES = {
	intro: 96,
	roster: 150,
	detail: 190,
	outro: 100,
} as const;

export const POKEDEX_TRANSITIONS = {
	introToRoster: 20,
	rosterToDetail: 24,
	detailToOutro: 20,
} as const;

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);

export const POKEDEX_DURATION =
	sum(Object.values(POKEDEX_SCENES)) - sum(Object.values(POKEDEX_TRANSITIONS));

/**
 * A Pokédex walkthrough animated entirely with the animate.css ports in
 * `src/lib/animate`, styled after hungps/flutter_pokedex.
 */
export const PokedexShowcase: React.FC<PokedexShowcaseProps> = ({
	title,
	subtitle,
	rosterHeading,
	entryIndex,
	closingLine,
	command,
}) => {
	return (
		<AbsoluteFill style={{backgroundColor: '#F7F8FA'}}>
			<TransitionSeries>
				<TransitionSeries.Sequence durationInFrames={POKEDEX_SCENES.intro}>
					<IntroScene title={title} subtitle={subtitle} />
				</TransitionSeries.Sequence>

				<TransitionSeries.Transition
					presentation={wipe({direction: 'from-bottom'})}
					timing={linearTiming({
						durationInFrames: POKEDEX_TRANSITIONS.introToRoster,
					})}
				/>

				<TransitionSeries.Sequence durationInFrames={POKEDEX_SCENES.roster}>
					<RosterScene heading={rosterHeading} />
				</TransitionSeries.Sequence>

				<TransitionSeries.Transition
					presentation={slide({direction: 'from-right'})}
					timing={linearTiming({
						durationInFrames: POKEDEX_TRANSITIONS.rosterToDetail,
					})}
				/>

				<TransitionSeries.Sequence durationInFrames={POKEDEX_SCENES.detail}>
					<DetailScene entryIndex={entryIndex} />
				</TransitionSeries.Sequence>

				<TransitionSeries.Transition
					presentation={fade()}
					timing={linearTiming({
						durationInFrames: POKEDEX_TRANSITIONS.detailToOutro,
					})}
				/>

				<TransitionSeries.Sequence durationInFrames={POKEDEX_SCENES.outro}>
					<OutroScene line={closingLine} command={command} />
				</TransitionSeries.Sequence>
			</TransitionSeries>
		</AbsoluteFill>
	);
};
