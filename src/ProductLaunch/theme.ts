/**
 * Design tokens for the video. Keeping colours and type in one place means a
 * rebrand is a one-file change instead of a hunt through every scene.
 */

export const COLORS = {
	bg: '#07070E',
	bgSoft: '#0F1020',
	ink: '#F6F7FF',
	inkMuted: 'rgba(246, 247, 255, 0.62)',
	inkFaint: 'rgba(246, 247, 255, 0.38)',
	accent: '#7C5CFF',
	accentAlt: '#22D3EE',
	accentWarm: '#FF7A59',
	surface: 'rgba(255, 255, 255, 0.045)',
	surfaceStrong: 'rgba(255, 255, 255, 0.08)',
	border: 'rgba(255, 255, 255, 0.11)',
} as const;

/**
 * No webfont is loaded on purpose: the video renders identically offline and in
 * CI. To use a real typeface, install `@remotion/google-fonts` and swap this for
 * the `fontFamily` its `loadFont()` returns.
 */
export const FONT_FAMILY =
	'Inter, "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

export const MONO_FAMILY =
	'"JetBrains Mono", "SF Mono", Menlo, Consolas, "Liberation Mono", monospace';

export const GRADIENT = `linear-gradient(100deg, ${COLORS.accentAlt} 0%, ${COLORS.accent} 45%, ${COLORS.accentWarm} 100%)`;
