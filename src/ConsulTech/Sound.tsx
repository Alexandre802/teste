import React from 'react';
import {Audio, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {BEAT, START, TOTAL_DURATION} from './timing';

/**
 * Sound design: one music bed plus effects pinned to what is actually moving
 * on screen.
 *
 * Both the music and the effects are synthesised by `tools/make-audio.py` —
 * there are no sampled assets, so nothing here needs a licence. Regenerate with
 * `npm run audio`.
 *
 * Levels are set so the voiceover always wins: narration at unity, effects in
 * the -8..-14 dB range, music around -18 dB and ducked further whenever the
 * narrator is mid-sentence.
 */

const sfx = (name: string) => staticFile(`audio/sfx/${name}.mp3`);

/** One-shot effect at an absolute frame. */
const Hit: React.FC<{at: number; name: string; volume?: number}> = ({
	at,
	name,
	volume = 0.5,
}) => {
	if (at < 0 || at >= TOTAL_DURATION) return null;

	return (
		<Sequence from={Math.round(at)} durationInFrames={TOTAL_DURATION - Math.round(at)}>
			<Audio src={sfx(name)} volume={volume} />
		</Sequence>
	);
};

/* Scene changes — every cut gets air moving through it. */
const TRANSITIONS: {at: number; name: string; volume: number}[] = [
	{at: START.askMe, name: 'whoosh', volume: 0.42},
	{at: START.scattered, name: 'whoosh-soft', volume: 0.34},
	{at: START.worse, name: 'boom', volume: 0.62},
	{at: START.loss, name: 'whoosh-soft', volume: 0.32},
	{at: START.birth, name: 'boom', volume: 0.7},
	{at: START.platform, name: 'whoosh', volume: 0.36},
	{at: START.categories, name: 'whoosh-soft', volume: 0.3},
	{at: START.seconds, name: 'whoosh', volume: 0.46},
	{at: START.services, name: 'whoosh-soft', volume: 0.32},
	{at: START.onePlace, name: 'boom', volume: 0.58},
	{at: START.noMiddleman, name: 'whoosh-soft', volume: 0.3},
	{at: START.payPerUse, name: 'whoosh-soft', volume: 0.3},
	{at: START.benefits, name: 'whoosh-soft', volume: 0.32},
	{at: START.cta, name: 'whoosh', volume: 0.4},
];

/** Effects tied to individual elements landing, not just to cuts. */
const ELEMENTS: {at: number; name: string; volume: number}[] = [
	// four profession tiles
	...[10, 32, 54, 76].map((d) => ({at: START.professions + d, name: 'pop', volume: 0.3})),
	// the "?" stinger
	{at: START.askMe + 1, name: 'riser', volume: 0.3},
	// browser windows piling up
	...[4, 16, 28, 40, 52, 64].map((d) => ({
		at: START.scattered + d,
		name: 'tick',
		volume: 0.34,
	})),
	{at: START.scattered + 150, name: 'glitch', volume: 0.3},
	{at: START.worse + 2, name: 'glitch', volume: 0.42},
	// the mark assembling
	{at: START.birth - 44, name: 'riser', volume: 0.42},
	{at: START.birth + 10, name: 'chime', volume: 0.34},
	// +90 counter punching in
	{at: START.platform + 78, name: 'pop-high', volume: 0.42},
	// the four categories, on the narrator's beats
	...BEAT.categories.map((b) => ({at: START.categories + b, name: 'pop', volume: 0.34})),
	// the five service rows sliding in
	...BEAT.services.map((b) => ({at: START.services + b, name: 'swipe', volume: 0.36})),
	// "EMITIDO" stamping onto the CRLV-e row
	{at: START.services + BEAT.services[2] + 18, name: 'stamp', volume: 0.42},
	// icons collapsing into the logo
	{at: START.onePlace + 30, name: 'chime', volume: 0.3},
	// three items being struck out
	...[16, 33, 50].map((d) => ({at: START.noMiddleman + d, name: 'stamp', volume: 0.3})),
	// price chips
	...[12, 32, 52].map((d) => ({at: START.payPerUse + d, name: 'pop', volume: 0.32})),
	{at: START.payPerUse + 118, name: 'stamp', volume: 0.36},
	// benefit rings
	...BEAT.benefits.map((b) => ({at: START.benefits + b, name: 'pop-high', volume: 0.32})),
	// the close
	{at: START.cta + 46, name: 'chime', volume: 0.38},
	{at: START.cta + 56, name: 'pop-high', volume: 0.36},
];

export const SoundDesign: React.FC = () => {
	const frame = useCurrentFrame();

	/**
	 * Music level. It sits low under the voice, lifts in the gaps where the
	 * narrator is not speaking, and opens up for the final CTA.
	 */
	const musicVolume = interpolate(
		frame,
		[
			0,
			30,
			START.scattered,
			START.birth - 30,
			START.birth,
			START.services,
			START.cta,
			TOTAL_DURATION - 40,
			TOTAL_DURATION,
		],
		[0, 0.14, 0.12, 0.1, 0.2, 0.16, 0.24, 0.22, 0],
		{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
	);

	return (
		<>
			<Audio src={staticFile('audio/music.mp3')} volume={musicVolume} />

			{TRANSITIONS.map((t, i) => (
				<Hit key={`t-${i}`} {...t} />
			))}

			{ELEMENTS.map((e, i) => (
				<Hit key={`e-${i}`} {...e} />
			))}
		</>
	);
};
