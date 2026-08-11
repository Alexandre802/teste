import React from 'react';
import {
	AbsoluteFill,
	Audio,
	interpolate,
	Series,
	staticFile,
	useCurrentFrame,
} from 'remotion';

import {BackdropStack} from './components/Backdrops';
import {Camera, type CameraMove} from './components/Camera';
import {CircuitBackdrop} from './components/CircuitBackdrop';
import {HudFrame} from './components/HudFrame';
import {LogoBadge} from './components/Logo';
import {MASTER_GAIN} from './mix';
import {SoundDesign, type Stem} from './Sound';
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
 *
 * Three things keep it from reading as flat: a virtual camera that pushes,
 * pulls and punches per scene (`components/Camera`), a background that changes
 * with the act rather than holding one look (`components/Backdrops`), and a
 * synthesised music bed with effects pinned to the animation (`Sound.tsx`).
 */

/** The camera move for each scene, chosen to match what the scene is doing. */
const CAMERA: Record<keyof typeof DUR, {move: CameraMove; strength?: number; shake?: number}> = {
	/* Tiles land one by one — pull back to take them all in. */
	professions: {move: 'pull'},
	/* A single stinger: hit it hard. */
	askMe: {move: 'punch', shake: 0.7},
	/* Windows pile up around the viewer — creep outward as the mess grows. */
	scattered: {move: 'pull', strength: 1.25},
	/* The warning slams in. */
	worse: {move: 'punch', strength: 1.2, shake: 1},
	/* Slow press in as the loss sinks in. */
	loss: {move: 'push', strength: 1.1},
	/* Recoil off the impact of the mark assembling. */
	birth: {move: 'recoil', shake: 0.8},
	/* Push into the dashboard, then the counter lands. */
	platform: {move: 'push', strength: 1.2},
	/* Pull back as the four categories fill the grid. */
	categories: {move: 'pull'},
	/* Speed line — punch. */
	seconds: {move: 'punch', strength: 0.9},
	/* The list stacks upward, so the camera cranes with it. */
	services: {move: 'craneUp', strength: 1.15},
	/* Everything converges: hard recoil on the collapse. */
	onePlace: {move: 'recoil', strength: 0.9, shake: 0.6},
	/* Drift across the struck-out list. */
	noMiddleman: {move: 'driftRight', strength: 0.8},
	/* Push down the price stack. */
	payPerUse: {move: 'push', strength: 0.9},
	/* Pull back over the three rings. */
	benefits: {move: 'pull', strength: 0.9},
	/* Settle on the close. */
	cta: {move: 'push', strength: 0.7},
};

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

/**
 * The background pushes in slightly against every camera move so the zoom reads
 * as depth rather than a flat scale of the whole picture.
 */
const BackgroundLayer: React.FC = () => {
	const frame = useCurrentFrame();
	const {intensity, mood} = useBackdropDrive();

	const parallax = 1.06 + Math.sin(frame * 0.0085) * 0.035;

	return (
		<AbsoluteFill style={{transform: `scale(${parallax})`}}>
			<CircuitBackdrop intensity={intensity} mood={mood} />
			<BackdropStack />
		</AbsoluteFill>
	);
};

type SceneKey = keyof typeof DUR;

const SCENES: {key: SceneKey; Component: React.FC}[] = [
	{key: 'professions', Component: SceneProfessions},
	{key: 'askMe', Component: SceneAskMe},
	{key: 'scattered', Component: SceneScattered},
	{key: 'worse', Component: SceneWorse},
	{key: 'loss', Component: SceneLoss},
	{key: 'birth', Component: SceneBirth},
	{key: 'platform', Component: ScenePlatform},
	{key: 'categories', Component: SceneCategories},
	{key: 'seconds', Component: SceneSeconds},
	{key: 'services', Component: SceneServices},
	{key: 'onePlace', Component: SceneOnePlace},
	{key: 'noMiddleman', Component: SceneNoMiddleman},
	{key: 'payPerUse', Component: ScenePayPerUse},
	{key: 'benefits', Component: SceneBenefits},
	{key: 'cta', Component: SceneCTA},
];

export const ConsulTechAd: React.FC<{stem?: Stem}> = ({stem = 'all'}) => {
	const frame = useCurrentFrame();

	/* The corner badge steps aside when a full logo owns the frame. */
	const badgeHidden =
		(frame >= START.birth - 6 && frame < START.platform) ||
		(frame >= START.onePlace - 6 && frame < START.noMiddleman) ||
		frame >= START.cta - 6;

	return (
		<AbsoluteFill style={{backgroundColor: C.bg}}>
			{stem === 'all' || stem === 'voice' ? (
				<Audio src={staticFile('audio/narration.mp3')} volume={MASTER_GAIN} />
			) : null}
			<SoundDesign stem={stem} />

			{/* One continuous backdrop under every scene — it never restarts. */}
			<BackgroundLayer />

			<Series>
				{SCENES.map(({key, Component}) => (
					<Series.Sequence key={key} durationInFrames={DUR[key]}>
						<Camera duration={DUR[key]} {...CAMERA[key]}>
							<Component />
						</Camera>
					</Series.Sequence>
				))}
			</Series>

			<HudFrame />

			{!badgeHidden ? <LogoBadge /> : null}

			<CutFlashes />
		</AbsoluteFill>
	);
};
