import React from 'react';

/**
 * Inline SVG icons. SVG is a first-class citizen in Remotion — it stays crisp at
 * any composition resolution, unlike a rasterised icon font.
 */

type IconProps = {
	color: string;
	size?: number;
};

const base = (size: number) => ({
	width: size,
	height: size,
	viewBox: '0 0 24 24',
	fill: 'none' as const,
	strokeWidth: 1.7,
	strokeLinecap: 'round' as const,
	strokeLinejoin: 'round' as const,
});

export const IconTimeline: React.FC<IconProps> = ({color, size = 34}) => (
	<svg {...base(size)} stroke={color}>
		<rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
		<path d="M2.5 9.5h19" />
		<path d="M8 14h8" />
		<circle cx="8" cy="14" r="1.6" fill={color} stroke="none" />
	</svg>
);

export const IconLayers: React.FC<IconProps> = ({color, size = 34}) => (
	<svg {...base(size)} stroke={color}>
		<path d="M12 3 3 7.5l9 4.5 9-4.5L12 3Z" />
		<path d="m3 12.5 9 4.5 9-4.5" />
		<path d="m3 17 9 4.5L21 17" />
	</svg>
);

export const IconBolt: React.FC<IconProps> = ({color, size = 34}) => (
	<svg {...base(size)} stroke={color}>
		<path d="M13.5 2.5 4.5 13.5h6l-1 8 9-11h-6l1-8Z" />
	</svg>
);

export const Logomark: React.FC<{size?: number}> = ({size = 96}) => (
	<svg width={size} height={size} viewBox="0 0 64 64" fill="none">
		<defs>
			<linearGradient id="logo-fill" x1="0" y1="0" x2="1" y2="1">
				<stop offset="0%" stopColor="#22D3EE" />
				<stop offset="55%" stopColor="#7C5CFF" />
				<stop offset="100%" stopColor="#FF7A59" />
			</linearGradient>
		</defs>
		<rect x="2" y="2" width="60" height="60" rx="18" fill="url(#logo-fill)" />
		<rect
			x="2"
			y="2"
			width="60"
			height="60"
			rx="18"
			stroke="rgba(255,255,255,0.35)"
			strokeWidth="1.5"
		/>
		<path d="M25 21.5 44 32 25 42.5V21.5Z" fill="#07070E" fillOpacity="0.85" />
	</svg>
);
