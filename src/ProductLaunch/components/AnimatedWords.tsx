import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {enter} from '../animation';

type Props = {
	text: string;
	/** Frames to wait before the first word moves. */
	delay?: number;
	/** Frames between consecutive words. */
	stagger?: number;
	style?: React.CSSProperties;
	/** Per-word overrides, e.g. to gradient-fill the last two words. */
	wordStyle?: (index: number, word: string) => React.CSSProperties;
};

/**
 * Splits a line into words and springs each one up with a stagger.
 *
 * Note what is *not* here: no `useState`, no `useEffect`, no timers. The word's
 * position is a pure function of the current frame, which is exactly what lets
 * Remotion scrub, seek and render out of order.
 */
export const AnimatedWords: React.FC<Props> = ({
	text,
	delay = 0,
	stagger = 3,
	style,
	wordStyle,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const words = text.split(' ');

	return (
		<div
			style={{
				display: 'flex',
				flexWrap: 'wrap',
				justifyContent: 'center',
				columnGap: '0.28em',
				rowGap: '0.1em',
				...style,
			}}
		>
			{words.map((word, i) => {
				const progress = enter({frame, fps, delay: delay + i * stagger});

				return (
					<span
						key={`${word}-${i}`}
						style={{
							display: 'inline-block',
							opacity: progress,
							transform: `translateY(${interpolate(
								progress,
								[0, 1],
								[64, 0],
							)}px) rotate(${interpolate(progress, [0, 1], [4, 0])}deg)`,
							...wordStyle?.(i, word),
						}}
					>
						{word}
					</span>
				);
			})}
		</div>
	);
};
