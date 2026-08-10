import React from 'react';
import {Audio, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {BEAT, START, TOTAL_DURATION} from './timing';

/**
 * Sound design: a music bed plus effects pinned to individual things moving on
 * screen — not just to the cuts.
 *
 * The effect vocabulary follows the agreed event → SFX mapping:
 *
 *   text entering ............ text-whoosh    (short, airy)
 *   text with impact ......... hit-soft       (mid punch, no sub)
 *   card appearing ........... pop            (UI click / pop)
 *   number counting up ....... beep ×N        (digital ticks)
 *   line or chart drawing .... digital-sweep  (stepped, digital)
 *   3D element entering ...... low-whoosh     (dark, moves air)
 *   scene transition ......... whoosh-stereo  (travels L→R)
 *   light sweep .............. shimmer
 *   small elements ........... ui-click       (dry, tight)
 *   hero moment .............. impact-sub     (impact + restrained sub)
 *   final CTA ................ rise-clean → impact-clean
 *
 * Everything is synthesised by `tools/make-audio.py` — no sampled assets, so
 * nothing needs a licence. Regenerate with `npm run audio`.
 *
 * Levels keep the voiceover on top: narration at unity, transitions around
 * -10 dB, small UI elements down at -18 dB, music near -18 dB.
 */

const sfx = (name: string) => staticFile(`audio/sfx/${name}.mp3`);

type Cue = {at: number; name: string; volume: number};

const Hit: React.FC<Cue> = ({at, name, volume}) => {
	const from = Math.round(at);
	if (from < 0 || from >= TOTAL_DURATION) return null;

	return (
		<Sequence from={from} durationInFrames={TOTAL_DURATION - from}>
			<Audio src={sfx(name)} volume={volume} />
		</Sequence>
	);
};

/** A run of evenly spaced cues — used for counters and multi-part reveals. */
const series = (
	start: number,
	count: number,
	step: number,
	name: string,
	volume: number,
): Cue[] =>
	new Array(count).fill(true).map((_, i) => ({at: start + i * step, name, volume}));

/* Volume presets, so related events stay consistent across scenes. */
const V = {
	transition: 0.4,
	hero: 0.62,
	textIn: 0.24,
	textHit: 0.4,
	card: 0.3,
	tick: 0.19,
	beep: 0.2,
	sweep: 0.3,
	low: 0.42,
	shimmer: 0.3,
};

const S = START;

const CUES: Cue[] = [
	/* ---------------------------------------------------------------- *
	 * 01 — profession tiles land one at a time
	 * ---------------------------------------------------------------- */
	{at: S.professions + 2, name: 'text-whoosh', volume: V.textIn},
	...[10, 32, 54, 76].map((d) => ({
		at: S.professions + d,
		name: 'pop',
		volume: V.card,
	})),
	{at: S.professions + 104, name: 'digital-sweep', volume: V.sweep},

	/* 02 — the "?" stinger */
	{at: S.askMe, name: 'whoosh-stereo', volume: V.transition},
	{at: S.askMe + 1, name: 'hit-soft', volume: V.textHit},
	{at: S.askMe + 3, name: 'shimmer', volume: 0.22},

	/* ---------------------------------------------------------------- *
	 * 03 — browser windows piling up, each one a small element
	 * ---------------------------------------------------------------- */
	{at: S.scattered, name: 'whoosh-stereo', volume: V.transition},
	...[4, 16, 28, 40, 52, 64].map((d) => ({
		at: S.scattered + d,
		name: 'ui-click',
		volume: 0.26,
	})),
	{at: S.scattered + 150, name: 'glitch', volume: 0.28},
	/* the wasted-time counter ticking up */
	...series(S.scattered + 158, 9, 8, 'beep-low', 0.15),

	/* 04 — "e o pior": the hero warning */
	{at: S.worse, name: 'impact-sub', volume: V.hero},
	{at: S.worse + 2, name: 'glitch', volume: 0.34},

	/* ---------------------------------------------------------------- *
	 * 05 — the loss: clock, headline, collapsing chart
	 * ---------------------------------------------------------------- */
	{at: S.loss, name: 'whoosh-stereo', volume: 0.34},
	{at: S.loss + 2, name: 'low-whoosh', volume: 0.34},
	{at: S.loss + 10, name: 'text-whoosh', volume: V.textIn},
	{at: S.loss + 20, name: 'hit-soft', volume: 0.3},
	{at: S.loss + 28, name: 'digital-sweep', volume: 0.28},
	...series(S.loss + 40, 5, 14, 'ui-click', 0.14),

	/* ---------------------------------------------------------------- *
	 * 06 — the brand assembles. The hero moment of the whole ad.
	 * ---------------------------------------------------------------- */
	{at: S.birth - 50, name: 'rise-clean', volume: 0.34},
	{at: S.birth, name: 'impact-clean', volume: 0.6},
	{at: S.birth + 1, name: 'impact-sub', volume: 0.5},
	{at: S.birth + 8, name: 'shimmer', volume: V.shimmer},
	{at: S.birth + 38, name: 'text-whoosh', volume: V.textIn},

	/* ---------------------------------------------------------------- *
	 * 07 — the dashboard: a 3D-ish panel, UI rows, counters, a chart
	 * ---------------------------------------------------------------- */
	{at: S.platform, name: 'whoosh-stereo', volume: V.transition},
	{at: S.platform + 2, name: 'text-whoosh', volume: V.textIn},
	{at: S.platform + 6, name: 'low-whoosh', volume: V.low},
	/* sidebar rows appearing */
	...series(S.platform + 10, 6, 3, 'ui-click', 0.13),
	/* the two KPI figures counting */
	...series(S.platform + 22, 6, 6, 'beep', 0.14),
	/* the line chart drawing itself */
	{at: S.platform + 14, name: 'digital-sweep', volume: V.sweep},
	/* bar row growing */
	...series(S.platform + 28, 4, 4, 'ui-click', 0.12),
	/* "+90" punching over the top */
	{at: S.platform + 78, name: 'hit-soft', volume: 0.44},
	...series(S.platform + 82, 6, 6, 'beep', 0.17),

	/* ---------------------------------------------------------------- *
	 * 08 — the four categories, one per spoken word
	 * ---------------------------------------------------------------- */
	{at: S.categories, name: 'whoosh-soft', volume: 0.3},
	...BEAT.categories.map((b) => ({
		at: S.categories + b,
		name: 'pop',
		volume: V.card,
	})),
	{at: S.categories + 124, name: 'digital-sweep', volume: 0.26},

	/* 09 — "em segundos" */
	{at: S.seconds, name: 'whoosh-stereo', volume: 0.46},
	{at: S.seconds + 1, name: 'hit-soft', volume: V.textHit},

	/* ---------------------------------------------------------------- *
	 * 10 — the service rows, each with its own live readout
	 * ---------------------------------------------------------------- */
	{at: S.services, name: 'whoosh-soft', volume: 0.28},
	/* every row: a swipe as it travels, a pop as it lands */
	...BEAT.services.flatMap((b) => [
		{at: S.services + b, name: 'swipe', volume: 0.3},
		{at: S.services + b + 5, name: 'pop', volume: 0.26},
	]),
	/* row 1 — the plate typing in, character by character */
	...series(S.services + BEAT.services[0] + 14, 7, 2.5, 'ui-click', 0.17),
	/* row 2 — the score counting to 876 */
	...series(S.services + BEAT.services[1] + 13, 5, 5, 'beep', 0.16),
	/* row 3 — "EMITIDO" stamping on */
	{at: S.services + BEAT.services[2] + 18, name: 'stamp', volume: 0.4},
	/* row 4 — the alert bars */
	...series(S.services + BEAT.services[3] + 16, 3, 5, 'ui-click', 0.16),
	/* row 5 — the sparkline drawing */
	{at: S.services + BEAT.services[4] + 12, name: 'digital-sweep', volume: 0.28},

	/* ---------------------------------------------------------------- *
	 * 11 — everything collapses into the mark
	 * ---------------------------------------------------------------- */
	{at: S.onePlace, name: 'low-whoosh', volume: 0.46},
	{at: S.onePlace + 30, name: 'impact-sub', volume: 0.54},
	{at: S.onePlace + 32, name: 'shimmer', volume: V.shimmer},
	{at: S.onePlace + 44, name: 'text-whoosh', volume: V.textIn},

	/* ---------------------------------------------------------------- *
	 * 12 — striking out the old way, then the direct line
	 * ---------------------------------------------------------------- */
	{at: S.noMiddleman, name: 'whoosh-soft', volume: 0.28},
	...[4, 21, 38].map((d) => ({
		at: S.noMiddleman + d,
		name: 'text-whoosh',
		volume: 0.2,
	})),
	...[16, 33, 50].map((d) => ({
		at: S.noMiddleman + d,
		name: 'swipe',
		volume: 0.24,
	})),
	{at: S.noMiddleman + 62, name: 'digital-sweep', volume: V.sweep},
	{at: S.noMiddleman + 70, name: 'text-whoosh', volume: V.textIn},

	/* ---------------------------------------------------------------- *
	 * 13 — the price cards, then "sem mensalidade"
	 * ---------------------------------------------------------------- */
	{at: S.payPerUse, name: 'whoosh-soft', volume: 0.28},
	{at: S.payPerUse + 2, name: 'text-whoosh', volume: V.textIn},
	...[12, 32, 52].map((d) => ({at: S.payPerUse + d, name: 'pop', volume: V.card})),
	{at: S.payPerUse + 118, name: 'hit-soft', volume: 0.38},

	/* ---------------------------------------------------------------- *
	 * 14 — the three benefit rings filling
	 * ---------------------------------------------------------------- */
	{at: S.benefits, name: 'whoosh-soft', volume: 0.3},
	...BEAT.benefits.flatMap((b) => [
		{at: S.benefits + b, name: 'pop-high', volume: V.card},
		{at: S.benefits + b + 6, name: 'digital-sweep', volume: 0.2},
	]),
	{at: S.benefits + 132, name: 'text-whoosh', volume: V.textIn},

	/* ---------------------------------------------------------------- *
	 * 15 — the close: rise into a clean landing
	 * ---------------------------------------------------------------- */
	{at: S.cta - 40, name: 'rise-clean', volume: 0.36},
	{at: S.cta, name: 'whoosh-stereo', volume: V.transition},
	{at: S.cta + 2, name: 'text-whoosh', volume: 0.28},
	{at: S.cta + 46, name: 'shimmer', volume: 0.34},
	{at: S.cta + 56, name: 'impact-clean', volume: 0.5},
	{at: S.cta + 80, name: 'ui-click', volume: 0.2},
];

export const SoundDesign: React.FC = () => {
	const frame = useCurrentFrame();

	/**
	 * Music level: low under the voice, lifting where the narrator pauses and
	 * opening up for the drop and the CTA.
	 */
	const musicVolume = interpolate(
		frame,
		[
			0,
			30,
			S.scattered,
			S.birth - 30,
			S.birth,
			S.services,
			S.cta,
			TOTAL_DURATION - 40,
			TOTAL_DURATION,
		],
		[0, 0.14, 0.12, 0.1, 0.2, 0.16, 0.24, 0.22, 0],
		{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
	);

	return (
		<>
			<Audio src={staticFile('audio/music.mp3')} volume={musicVolume} />
			{CUES.map((cue, i) => (
				<Hit key={i} {...cue} />
			))}
		</>
	);
};
