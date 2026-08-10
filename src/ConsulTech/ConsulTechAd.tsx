import React from 'react';
import {
	AbsoluteFill,
	Audio,
	interpolate,
	Series,
	staticFile,
	useCurrentFrame,
} from 'remotion';

import {CircuitBackdrop} from './components/CircuitBackdrop';
import {HudFrame} from './components/HudFrame';
import {LogoBadge} from './components/Logo';
import {C} from './theme';
import {DUR, START} from './timing';

import {
	SceneAskMe,
	SceneLoss,
	SceneProfessions,
	SceneScattered,
	SceneWorse,
} from './scenes/Problem';
import {
	SceneBirth,
	SceneCategories,
	ScenePlatform,
	SceneSeconds,
} from './scenes/Solution';
import {SceneNoMiddleman, SceneOnePlace, SceneServices} from './scenes/Services';
import {SceneBenefits, SceneCTA, ScenePayPerUse} from './scenes/Close';

/**
 * ConsulTech — 70s vertical ad, cut to the supplied voiceover.
 *
 * Structure follows the narration: hook the professional, twist the knife on
 * the problem, introduce the platform, walk the services, then close on price
 * and a CTA. Every cut lands in a pause of the voice track (see `timing.ts`).
 *
 * There are no subtitles — the on-screen copy is only ever a few heavy words
 * reinforcing what is being said, in the style of the reference ad.
 */

/** Backdrop mood/intensity ride the story rather than sitting at one setting. */
const useBackdropDrive = () => {
	const frame = useCurrentFrame();

	const problemStart = START.scattered;
	const problemEnd = START.birth;

	const intensity = interpolate(
		frame,
		[0, problemStart, problemStart + 60, problemEnd - 20, problemEnd + 30, START.cta],
		[0.35, 0.5, 1, 1, 0.55, 0.8],
		{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
	);

	/* Red during the problem act, brand blue everywhere else. */
	const mood: 'brand' | 'danger' =
		frame >= problemStart && frame < problemEnd ? 'danger' : 'brand';

	return {intensity, mood};
};

/** White flash on the hardest cuts, so the edit has punctuation. */
const CutFlashes: React.FC = () => {
	const frame = useCurrentFrame();
	const hits = [START.worse, START.birth, START.onePlace];

	const opacity = hits.reduce((acc, hit) => {
		return (
			acc +
			interpolate(frame, [hit - 1, hit + 1, hit + 9], [0, 0.55, 0], {
				extrapolateLeft: 'clamp',
				extrapolateRight: 'clamp',
			})
		);
	}, 0);

	return (
		<AbsoluteFill
			style={{
				background: `linear-gradient(180deg, ${C.cyan}, ${C.blue})`,
				opacity: Math.min(opacity, 0.6),
				mixBlendMode: 'screen',
				pointerEvents: 'none',
			}}
		/>
	);
};

export const ConsulTechAd: React.FC = () => {
	const frame = useCurrentFrame();
	const {intensity, mood} = useBackdropDrive();

	/* The corner badge steps aside when a full logo owns the frame. */
	const badgeHidden =
		(frame >= START.birth - 6 && frame < START.platform) ||
		(frame >= START.onePlace - 6 && frame < START.noMiddleman) ||
		frame >= START.cta - 6;

	return (
		<AbsoluteFill style={{backgroundColor: C.bg}}>
			<Audio src={staticFile('audio/narration.mp3')} />

			{/* One continuous backdrop under every scene — it never restarts. */}
			<CircuitBackdrop intensity={intensity} mood={mood} />

			<Series>
				<Series.Sequence durationInFrames={DUR.professions}>
					<SceneProfessions />
				</Series.Sequence>

				<Series.Sequence durationInFrames={DUR.askMe}>
					<SceneAskMe />
				</Series.Sequence>

				<Series.Sequence durationInFrames={DUR.scattered}>
					<SceneScattered />
				</Series.Sequence>

				<Series.Sequence durationInFrames={DUR.worse}>
					<SceneWorse />
				</Series.Sequence>

				<Series.Sequence durationInFrames={DUR.loss}>
					<SceneLoss />
				</Series.Sequence>

				<Series.Sequence durationInFrames={DUR.birth}>
					<SceneBirth />
				</Series.Sequence>

				<Series.Sequence durationInFrames={DUR.platform}>
					<ScenePlatform />
				</Series.Sequence>

				<Series.Sequence durationInFrames={DUR.categories}>
					<SceneCategories />
				</Series.Sequence>

				<Series.Sequence durationInFrames={DUR.seconds}>
					<SceneSeconds />
				</Series.Sequence>

				<Series.Sequence durationInFrames={DUR.services}>
					<SceneServices />
				</Series.Sequence>

				<Series.Sequence durationInFrames={DUR.onePlace}>
					<SceneOnePlace />
				</Series.Sequence>

				<Series.Sequence durationInFrames={DUR.noMiddleman}>
					<SceneNoMiddleman />
				</Series.Sequence>

				<Series.Sequence durationInFrames={DUR.payPerUse}>
					<ScenePayPerUse />
				</Series.Sequence>

				<Series.Sequence durationInFrames={DUR.benefits}>
					<SceneBenefits />
				</Series.Sequence>

				<Series.Sequence durationInFrames={DUR.cta}>
					<SceneCTA />
				</Series.Sequence>
			</Series>

			<HudFrame />

			{!badgeHidden ? <LogoBadge /> : null}

			<CutFlashes />
		</AbsoluteFill>
	);
};
