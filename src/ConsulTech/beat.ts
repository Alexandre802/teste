import {interpolate} from 'remotion';
import {FPS, START} from './timing';

/**
 * The beat grid of the music bed.
 *
 * The reference ad's edit was measured at 134.6 BPM by autocorrelating its
 * onset envelope, and the bed in `tools/make-audio.py` is built at that tempo.
 * Exposing the same grid here lets the *picture* pulse with the music instead
 * of drifting against it — which is most of what makes those edits feel locked
 * and energetic rather than merely busy.
 */

export const BPM = 134.6;

/** Frames per beat: 60 / 134.6 * 30 ≈ 13.37. */
export const FRAMES_PER_BEAT = (60 / BPM) * FPS;
export const FRAMES_PER_BAR = FRAMES_PER_BEAT * 4;

/** Position within the current beat, 0 → 1. */
export const beatPhase = (frame: number) =>
	(frame % FRAMES_PER_BEAT) / FRAMES_PER_BEAT;

/** Position within the current bar, 0 → 1. */
export const barPhase = (frame: number) => (frame % FRAMES_PER_BAR) / FRAMES_PER_BAR;

/**
 * A percussive envelope that snaps to 1 on each beat and decays.
 * `sharpness` controls how fast it falls away.
 */
export const beatPulse = (frame: number, sharpness = 5) =>
	Math.pow(1 - beatPhase(frame), sharpness);

/** The same, but only on the downbeat of each bar — for bigger accents. */
export const barPulse = (frame: number, sharpness = 6) =>
	Math.pow(1 - barPhase(frame), sharpness);

/**
 * How strongly the picture should respond to the beat at this point in the ad.
 *
 * The bed has no drums until the mark assembles, so the visuals stay unpulsed
 * before that and lock in once the drop lands. Pulsing the picture to a beat
 * the audience cannot hear yet just reads as jitter.
 */
export const beatStrength = (frame: number) =>
	interpolate(
		frame,
		[0, START.scattered, START.birth - 20, START.birth, START.cta, START.cta + 40],
		[0.15, 0.3, 0.3, 1, 1, 0.8],
		{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
	);
