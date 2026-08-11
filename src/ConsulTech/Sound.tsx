import React from 'react';
import {Audio, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {MUSIC_OFFSET, OFFSET, gainFor, musicGain} from './mix';
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
 * Levels follow the mix spec in `mix.ts`: narration is the 0 dB reference,
 * effects live in the -12 … -18 dB band and music in -24 … -30 dB.
 */

const sfx = (name: string) => staticFile(`audio/sfx/${name}.mp3`);

/** `offset` is how far under the narration this cue should sit, in dB. */
type Cue = {at: number; name: string; offset: number};

const Hit: React.FC<Cue> = ({at, name, offset}) => {
	const from = Math.round(at);
	if (from < 0 || from >= TOTAL_DURATION) return null;

	return (
		<Sequence from={from} durationInFrames={TOTAL_DURATION - from}>
			<Audio src={sfx(name)} volume={gainFor(name, offset)} />
		</Sequence>
	);
};

/** A run of evenly spaced cues — used for counters and multi-part reveals. */
const series = (
	start: number,
	count: number,
	step: number,
	name: string,
	offset: number,
): Cue[] =>
	new Array(count).fill(true).map((_, i) => ({at: start + i * step, name, offset}));

/*
 * Presets from `mix.ts`, expressed as dB under the narration rather than as
 * linear gains. The actual gain is worked out per file from its measured level.
 */
const V = OFFSET;

const S = START;

const CUES: Cue[] = [
	/* ---------------------------------------------------------------- *
	 * 01 — profession tiles land one at a time
	 * ---------------------------------------------------------------- */
	{at: S.professions + 2, name: 'text-whoosh', offset: V.textIn},
	...[10, 32, 54, 76].map((d) => ({
		at: S.professions + d,
		name: 'pop',
		offset: V.card,
	})),
	{at: S.professions + 104, name: 'digital-sweep', offset: V.sweep},

	/* 02 — the "?" stinger */
	{at: S.askMe, name: 'whoosh-stereo', offset: V.transition},
	{at: S.askMe + 1, name: 'hit-soft', offset: V.textHit},
	{at: S.askMe + 3, name: 'shimmer', offset: V.shimmer},

	/* ---------------------------------------------------------------- *
	 * 03 — browser windows piling up, each one a small element
	 * ---------------------------------------------------------------- */
	{at: S.scattered, name: 'whoosh-stereo', offset: V.transition},
	...[4, 16, 28, 40, 52, 64].map((d) => ({
		at: S.scattered + d,
		name: 'ui-click',
		offset: V.card,
	})),
	{at: S.scattered + 150, name: 'glitch', offset: V.sweep},
	/* the wasted-time counter ticking up */
	...series(S.scattered + 158, 9, 8, 'beep-low', 0.15),

	/* 04 — "e o pior": the hero warning */
	{at: S.worse, name: 'impact-sub', offset: V.hero},
	{at: S.worse + 2, name: 'glitch', offset: V.low},

	/* ---------------------------------------------------------------- *
	 * 05 — the loss: clock, headline, collapsing chart
	 * ---------------------------------------------------------------- */
	{at: S.loss, name: 'whoosh-stereo', offset: V.low},
	{at: S.loss + 2, name: 'low-whoosh', offset: V.low},
	{at: S.loss + 10, name: 'text-whoosh', offset: V.textIn},
	{at: S.loss + 20, name: 'hit-soft', offset: V.card},
	{at: S.loss + 28, name: 'digital-sweep', offset: V.sweep},
	...series(S.loss + 40, 5, 14, 'ui-click', 0.14),

	/* ---------------------------------------------------------------- *
	 * 06 — the brand assembles. The hero moment of the whole ad.
	 * ---------------------------------------------------------------- */
	{at: S.birth - 50, name: 'rise-clean', offset: V.low},
	{at: S.birth, name: 'impact-clean', offset: V.hero},
	{at: S.birth + 1, name: 'impact-sub', offset: V.hero},
	{at: S.birth + 8, name: 'shimmer', offset: V.shimmer},
	{at: S.birth + 38, name: 'text-whoosh', offset: V.textIn},

	/* ---------------------------------------------------------------- *
	 * 07 — the dashboard: a 3D-ish panel, UI rows, counters, a chart
	 * ---------------------------------------------------------------- */
	{at: S.platform, name: 'whoosh-stereo', offset: V.transition},
	{at: S.platform + 2, name: 'text-whoosh', offset: V.textIn},
	{at: S.platform + 6, name: 'low-whoosh', offset: V.low},
	/* sidebar rows appearing */
	...series(S.platform + 10, 6, 3, 'ui-click', 0.13),
	/* the two KPI figures counting */
	...series(S.platform + 22, 6, 6, 'beep', 0.14),
	/* the line chart drawing itself */
	{at: S.platform + 14, name: 'digital-sweep', offset: V.sweep},
	/* bar row growing */
	...series(S.platform + 28, 4, 4, 'ui-click', 0.12),
	/* "+90" punching over the top */
	{at: S.platform + 78, name: 'hit-soft', offset: V.textHit},
	...series(S.platform + 82, 6, 6, 'beep', 0.17),

	/* ---------------------------------------------------------------- *
	 * 08 — the four categories, one per spoken word
	 * ---------------------------------------------------------------- */
	{at: S.categories, name: 'whoosh-soft', offset: V.card},
	...BEAT.categories.map((b) => ({
		at: S.categories + b,
		name: 'pop',
		offset: V.card,
	})),
	{at: S.categories + 124, name: 'digital-sweep', offset: V.card},

	/* 09 — "em segundos" */
	{at: S.seconds, name: 'whoosh-stereo', offset: V.low},
	{at: S.seconds + 1, name: 'hit-soft', offset: V.textHit},

	/* ---------------------------------------------------------------- *
	 * 10 — the service rows, each with its own live readout
	 * ---------------------------------------------------------------- */
	{at: S.services, name: 'whoosh-soft', offset: V.sweep},
	/* every row: a swipe as it travels, a pop as it lands */
	...BEAT.services.flatMap((b) => [
		{at: S.services + b, name: 'swipe', offset: V.card},
		{at: S.services + b + 5, name: 'pop', offset: V.card},
	]),
	/* row 1 — the plate typing in, character by character */
	...series(S.services + BEAT.services[0] + 14, 7, 2.5, 'ui-click', 0.17),
	/* row 2 — the score counting to 876 */
	...series(S.services + BEAT.services[1] + 13, 5, 5, 'beep', 0.16),
	/* row 3 — "EMITIDO" stamping on */
	{at: S.services + BEAT.services[2] + 18, name: 'stamp', offset: V.textHit},
	/* row 4 — the alert bars */
	...series(S.services + BEAT.services[3] + 16, 3, 5, 'ui-click', 0.16),
	/* row 5 — the sparkline drawing */
	{at: S.services + BEAT.services[4] + 12, name: 'digital-sweep', offset: V.sweep},

	/* ---------------------------------------------------------------- *
	 * 11 — everything collapses into the mark
	 * ---------------------------------------------------------------- */
	{at: S.onePlace, name: 'low-whoosh', offset: V.low},
	{at: S.onePlace + 30, name: 'impact-sub', offset: V.hero},
	{at: S.onePlace + 32, name: 'shimmer', offset: V.shimmer},
	{at: S.onePlace + 44, name: 'text-whoosh', offset: V.textIn},

	/* ---------------------------------------------------------------- *
	 * 12 — striking out the old way, then the direct line
	 * ---------------------------------------------------------------- */
	{at: S.noMiddleman, name: 'whoosh-soft', offset: V.sweep},
	...[4, 21, 38].map((d) => ({
		at: S.noMiddleman + d,
		name: 'text-whoosh',
		offset: V.textIn,
	})),
	...[16, 33, 50].map((d) => ({
		at: S.noMiddleman + d,
		name: 'swipe',
		offset: V.textIn,
	})),
	{at: S.noMiddleman + 62, name: 'digital-sweep', offset: V.sweep},
	{at: S.noMiddleman + 70, name: 'text-whoosh', offset: V.textIn},

	/* ---------------------------------------------------------------- *
	 * 13 — the price cards, then "sem mensalidade"
	 * ---------------------------------------------------------------- */
	{at: S.payPerUse, name: 'whoosh-soft', offset: V.sweep},
	{at: S.payPerUse + 2, name: 'text-whoosh', offset: V.textIn},
	...[12, 32, 52].map((d) => ({at: S.payPerUse + d, name: 'pop', offset: V.card})),
	{at: S.payPerUse + 118, name: 'hit-soft', offset: V.textHit},

	/* ---------------------------------------------------------------- *
	 * 14 — the three benefit rings filling
	 * ---------------------------------------------------------------- */
	{at: S.benefits, name: 'whoosh-soft', offset: V.card},
	...BEAT.benefits.flatMap((b) => [
		{at: S.benefits + b, name: 'pop-high', offset: V.card},
		{at: S.benefits + b + 6, name: 'digital-sweep', offset: V.textIn},
	]),
	{at: S.benefits + 132, name: 'text-whoosh', offset: V.textIn},

	/* ---------------------------------------------------------------- *
	 * 15 — the close: rise into a clean landing
	 * ---------------------------------------------------------------- */
	{at: S.cta - 40, name: 'rise-clean', offset: V.transition},
	{at: S.cta, name: 'whoosh-stereo', offset: V.transition},
	{at: S.cta + 2, name: 'text-whoosh', offset: V.sweep},
	{at: S.cta + 46, name: 'shimmer', offset: V.low},
	{at: S.cta + 56, name: 'impact-clean', offset: V.hero},
	{at: S.cta + 80, name: 'ui-click', offset: V.textIn},
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
		[
			0,
			musicGain(MUSIC_OFFSET.body),
			musicGain(MUSIC_OFFSET.duck),
			musicGain(MUSIC_OFFSET.duck),
			musicGain(MUSIC_OFFSET.peak),
			musicGain(MUSIC_OFFSET.body),
			musicGain(MUSIC_OFFSET.peak),
			musicGain(MUSIC_OFFSET.peak),
			0,
		],
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
