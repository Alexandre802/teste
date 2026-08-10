import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT, GRAD} from '../theme';

/**
 * Kinetic typography pieces.
 *
 * The reference ad drives its energy from short, heavy words that punch in one
 * at a time — never a paragraph. These components do the same: the copy is used
 * to *reinforce* the voiceover with a few words, not to caption it.
 */

export type WordSpec = {
	text: string;
	/** Fills the word with the brand gradient. */
	accent?: boolean;
	/** Draws a rounded brand chip behind the word. */
	chip?: boolean;
};

/** Big headline whose words punch in one after another. */
export const PunchLine: React.FC<{
	words: WordSpec[];
	delay?: number;
	stagger?: number;
	fontSize?: number;
	lineHeight?: number;
	align?: 'center' | 'flex-start';
	maxWidth?: number;
}> = ({
	words,
	delay = 0,
	stagger = 4,
	fontSize = 96,
	lineHeight = 1.06,
	align = 'center',
	maxWidth = 900,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	return (
		<div
			style={{
				display: 'flex',
				flexWrap: 'wrap',
				justifyContent: align === 'center' ? 'center' : 'flex-start',
				alignItems: 'center',
				columnGap: fontSize * 0.24,
				rowGap: fontSize * 0.12,
				maxWidth,
				fontFamily: FONT,
				fontWeight: 700,
				fontSize,
				lineHeight,
				letterSpacing: -fontSize * 0.028,
				textAlign: align === 'center' ? 'center' : 'left',
			}}
		>
			{words.map((word, i) => {
				const p = spring({
					fps,
					frame: Math.max(0, frame - delay - i * stagger),
					config: {damping: 15, mass: 0.7},
				});

				const style: React.CSSProperties = {
					display: 'inline-block',
					opacity: interpolate(p, [0, 0.35], [0, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
					transform: `translateY(${interpolate(p, [0, 1], [58, 0])}px) scale(${interpolate(
						p,
						[0, 1],
						[0.72, 1],
					)})`,
				};

				if (word.chip) {
					return (
						<span
							key={i}
							style={{
								...style,
								backgroundImage: GRAD.blue,
								color: C.ink,
								padding: `${fontSize * 0.06}px ${fontSize * 0.22}px`,
								borderRadius: fontSize * 0.24,
								boxShadow: `0 0 ${fontSize * 0.5}px ${C.blue}77`,
							}}
						>
							{word.text}
						</span>
					);
				}

				return (
					<span
						key={i}
						style={{
							...style,
							...(word.accent
								? {
										backgroundImage: GRAD.brand,
										WebkitBackgroundClip: 'text',
										backgroundClip: 'text',
										color: 'transparent',
										paddingBottom: '0.06em',
									}
								: {color: C.ink}),
						}}
					>
						{word.text}
					</span>
				);
			})}
		</div>
	);
};

/** Small uppercase label with a brand rule, used above headlines. */
export const Eyebrow: React.FC<{text: string; delay?: number; color?: string}> = ({
	text,
	delay = 0,
	color = C.blueBright,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const p = spring({fps, frame: Math.max(0, frame - delay), config: {damping: 200}});

	return (
		<div
			style={{
				display: 'flex',
				alignItems: 'center',
				gap: 18,
				opacity: p,
				transform: `translateY(${interpolate(p, [0, 1], [22, 0])}px)`,
			}}
		>
			<div
				style={{
					width: interpolate(p, [0, 1], [0, 68]),
					height: 3,
					borderRadius: 3,
					backgroundImage: GRAD.brand,
				}}
			/>
			<div
				style={{
					fontFamily: FONT,
					fontSize: 27,
					fontWeight: 600,
					letterSpacing: 5,
					textTransform: 'uppercase',
					color,
				}}
			>
				{text}
			</div>
		</div>
	);
};

/**
 * A number that counts up. The value is `interpolate()`d over spring progress,
 * so seeking to any frame shows the right figure with no timers involved.
 */
export const Counter: React.FC<{
	to: number;
	delay?: number;
	duration?: number;
	prefix?: string;
	suffix?: string;
	decimals?: number;
	fontSize?: number;
	color?: string;
	gradient?: boolean;
}> = ({
	to,
	delay = 0,
	duration = 34,
	prefix = '',
	suffix = '',
	decimals = 0,
	fontSize = 190,
	color = C.ink,
	gradient = true,
}) => {
	const frame = useCurrentFrame();

	const p = interpolate(frame - delay, [0, duration], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	/* Ease-out so it sprints then settles, like a real odometer. */
	const eased = 1 - Math.pow(1 - p, 3);
	const value = (to * eased).toFixed(decimals).replace('.', ',');

	return (
		<div
			style={{
				fontFamily: FONT,
				fontSize,
				fontWeight: 800,
				letterSpacing: -fontSize * 0.04,
				lineHeight: 1,
				fontVariantNumeric: 'tabular-nums',
				...(gradient
					? {
							backgroundImage: GRAD.brand,
							WebkitBackgroundClip: 'text',
							backgroundClip: 'text',
							color: 'transparent',
						}
					: {color}),
			}}
		>
			{prefix}
			{value}
			{suffix}
		</div>
	);
};

/** Body line — one short sentence max, kept small so it never reads as a caption. */
export const SubLine: React.FC<{
	text: string;
	delay?: number;
	fontSize?: number;
	color?: string;
	maxWidth?: number;
}> = ({text, delay = 0, fontSize = 36, color = C.inkSoft, maxWidth = 760}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const p = spring({fps, frame: Math.max(0, frame - delay), config: {damping: 200}});

	return (
		<div
			style={{
				fontFamily: FONT,
				fontSize,
				fontWeight: 400,
				lineHeight: 1.4,
				color,
				maxWidth,
				textAlign: 'center',
				opacity: p,
				transform: `translateY(${interpolate(p, [0, 1], [26, 0])}px)`,
			}}
		>
			{text}
		</div>
	);
};
