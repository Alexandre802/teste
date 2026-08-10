import {continueRender, delayRender, staticFile} from 'remotion';

/**
 * ConsulTech brand system, read off the campaign artwork:
 * near-black navy field, electric blue as the lead colour, cyan and violet as
 * the secondary glow, thin-stroke rounded icons, circuit-board line motifs.
 */

/**
 * Poppins — the brand typeface (it is the font embedded in the rate-card PDF).
 *
 * The .woff2 files live in `public/fonts/` rather than being pulled from Google
 * at render time: a webfont fetched over the network is a non-deterministic
 * dependency, and a render worker that cannot reach the CDN silently falls back
 * to a different face. Loading locally keeps every frame identical offline.
 *
 * `delayRender()` holds the first frame until the faces are actually ready, so
 * nothing is ever captured mid-swap.
 */
export const FONT = 'Poppins';

const WEIGHTS = [400, 500, 600, 700, 800] as const;

if (typeof document !== 'undefined') {
	const handle = delayRender('Loading Poppins');

	Promise.all(
		WEIGHTS.map(async (weight) => {
			const face = new FontFace(
				FONT,
				`url(${staticFile(`fonts/poppins-${weight}.woff2`)}) format('woff2')`,
				{weight: String(weight), style: 'normal'},
			);
			await face.load();
			document.fonts.add(face);
		}),
	)
		.then(() => continueRender(handle))
		.catch(() => continueRender(handle));
}
export const MONO = '"JetBrains Mono", "SF Mono", Menlo, Consolas, monospace';

export const C = {
	/** Page field — the deep navy the artwork sits on. */
	bg: '#04070F',
	bgLift: '#070C1A',
	panel: 'rgba(255, 255, 255, 0.045)',
	panelSolid: '#0A1122',
	border: 'rgba(120, 170, 255, 0.20)',
	borderBright: 'rgba(120, 170, 255, 0.45)',

	ink: '#FFFFFF',
	inkSoft: 'rgba(233, 240, 255, 0.72)',
	inkFaint: 'rgba(233, 240, 255, 0.42)',

	/** The logo blue. */
	blue: '#1B6DFF',
	blueBright: '#3B8CFF',
	blueDeep: '#0B49C4',
	cyan: '#22D3EE',
	violet: '#8B5CF6',
	magenta: '#C026D3',

	danger: '#FF4D5E',
	warn: '#FFB020',
	ok: '#22C55E',
} as const;

export const GRAD = {
	brand: `linear-gradient(120deg, ${C.cyan} 0%, ${C.blue} 52%, ${C.violet} 100%)`,
	blue: `linear-gradient(135deg, ${C.blueBright} 0%, ${C.blueDeep} 100%)`,
	edge: `linear-gradient(90deg, transparent, ${C.blue}, ${C.cyan}, transparent)`,
} as const;

/** Text that should read as "brand highlight" inside a white headline. */
export const gradientText: React.CSSProperties = {
	backgroundImage: GRAD.brand,
	WebkitBackgroundClip: 'text',
	backgroundClip: 'text',
	color: 'transparent',
};

export const glow = (color: string, size = 40, strength = 0.55) =>
	`0 0 ${size}px ${color}${Math.round(strength * 255)
		.toString(16)
		.padStart(2, '0')}`;
