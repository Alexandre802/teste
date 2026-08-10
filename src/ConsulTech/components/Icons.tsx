import React from 'react';
import {interpolate} from 'remotion';
import {C} from '../theme';

/**
 * The rounded thin-stroke icon set from the ConsulTech artwork, redrawn as SVG
 * so each one can *draw itself on*.
 *
 * The trick is `strokeDasharray` / `strokeDashoffset`: set the dash to the path
 * length and slide the offset from full length to zero and the stroke appears
 * to be drawn by hand. `progress` is the usual 0 → 1 driven by the frame.
 */

export type IconProps = {
	progress?: number;
	color?: string;
	size?: number;
	strokeWidth?: number;
};

const LEN = 400;

const draw = (progress: number) => ({
	strokeDasharray: LEN,
	strokeDashoffset: interpolate(progress, [0, 1], [LEN, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	}),
});

const svgProps = (size: number, color: string, strokeWidth: number) => ({
	width: size,
	height: size,
	viewBox: '0 0 48 48',
	fill: 'none' as const,
	stroke: color,
	strokeWidth,
	strokeLinecap: 'round' as const,
	strokeLinejoin: 'round' as const,
});

export type IconComponent = React.FC<IconProps>;

/** Consulta veicular. */
export const IconCar: IconComponent = ({
	progress = 1,
	color = C.blueBright,
	size = 56,
	strokeWidth = 2.1,
}) => (
	<svg {...svgProps(size, color, strokeWidth)}>
		<path d="M8 30v6a1.5 1.5 0 0 0 1.5 1.5h3A1.5 1.5 0 0 0 14 36v-2" style={draw(progress)} />
		<path
			d="M34 34v2a1.5 1.5 0 0 0 1.5 1.5h3A1.5 1.5 0 0 0 40 36v-6"
			style={draw(progress)}
		/>
		<path
			d="M7 30v-5.5a3 3 0 0 1 .3-1.3l3.9-8A3 3 0 0 1 13.9 13h20.2a3 3 0 0 1 2.7 1.7l3.9 8a3 3 0 0 1 .3 1.3V30a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2Z"
			style={draw(progress)}
		/>
		<path d="M9 23h30" style={draw(progress)} />
		<circle cx="14.5" cy="27" r="1.9" fill={color} stroke="none" opacity={progress} />
		<circle cx="33.5" cy="27" r="1.9" fill={color} stroke="none" opacity={progress} />
	</svg>
);

/** Score de crédito — the speedometer from the artwork. */
export const IconGauge: IconComponent = ({
	progress = 1,
	color = C.cyan,
	size = 56,
	strokeWidth = 2.1,
}) => (
	<svg {...svgProps(size, color, strokeWidth)}>
		<path d="M8 34a17 17 0 1 1 32 0" style={draw(progress)} />
		<path
			d="M24 34 33 21"
			style={{
				...draw(progress),
				transformOrigin: '24px 34px',
				transform: `rotate(${interpolate(progress, [0, 1], [-70, 0], {
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				})}deg)`,
			}}
		/>
		<circle cx="24" cy="34" r="2.6" fill={color} stroke="none" opacity={progress} />
		<path d="M12 30.5h2.5M35.5 30.5H38M16 21l1.8 1.8M32 21l-1.8 1.8M24 17.5V20" style={draw(progress)} />
	</svg>
);

/** CRLV-e / relatórios — a document. */
export const IconDoc: IconComponent = ({
	progress = 1,
	color = C.blueBright,
	size = 56,
	strokeWidth = 2.1,
}) => (
	<svg {...svgProps(size, color, strokeWidth)}>
		<path
			d="M12 8h16l8 8v24a2 2 0 0 1-2 2H12a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2Z"
			style={draw(progress)}
		/>
		<path d="M28 8v8h8" style={draw(progress)} />
		<path d="M16 24h16M16 30h16M16 36h10" style={draw(progress)} />
	</svg>
);

/** Relatório jurídico — scales. */
export const IconScales: IconComponent = ({
	progress = 1,
	color = C.violet,
	size = 56,
	strokeWidth = 2.1,
}) => (
	<svg {...svgProps(size, color, strokeWidth)}>
		<path d="M24 10v30" style={draw(progress)} />
		<path d="M14 40h20" style={draw(progress)} />
		<path d="M10 17h28" style={draw(progress)} />
		<circle cx="24" cy="13.5" r="2.4" fill={color} stroke="none" opacity={progress} />
		<path d="M10 17 5 29h10L10 17Z" style={draw(progress)} />
		<path d="M38 17l-5 12h10l-5-12Z" style={draw(progress)} />
	</svg>
);

/** Cadastral — folder. */
export const IconFolder: IconComponent = ({
	progress = 1,
	color = C.blueBright,
	size = 56,
	strokeWidth = 2.1,
}) => (
	<svg {...svgProps(size, color, strokeWidth)}>
		<path
			d="M6 14a2 2 0 0 1 2-2h10l4 5h18a2 2 0 0 1 2 2v18a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V14Z"
			style={draw(progress)}
		/>
		<path d="M6 23h36" style={draw(progress)} />
	</svg>
);

/** Financeiro — card. */
export const IconCard: IconComponent = ({
	progress = 1,
	color = C.cyan,
	size = 56,
	strokeWidth = 2.1,
}) => (
	<svg {...svgProps(size, color, strokeWidth)}>
		<rect x="5" y="12" width="38" height="24" rx="3.5" style={draw(progress)} />
		<path d="M5 20h38" style={draw(progress)} />
		<path d="M11 29h7" style={draw(progress)} />
	</svg>
);

/** Pessoa / despachante. */
export const IconUser: IconComponent = ({
	progress = 1,
	color = C.blueBright,
	size = 56,
	strokeWidth = 2.1,
}) => (
	<svg {...svgProps(size, color, strokeWidth)}>
		<circle cx="24" cy="17" r="7.5" style={draw(progress)} />
		<path d="M9 40c0-8.3 6.7-13 15-13s15 4.7 15 13" style={draw(progress)} />
	</svg>
);

/** Loja / negócio. */
export const IconStore: IconComponent = ({
	progress = 1,
	color = C.cyan,
	size = 56,
	strokeWidth = 2.1,
}) => (
	<svg {...svgProps(size, color, strokeWidth)}>
		<path d="M8 20v18a2 2 0 0 0 2 2h28a2 2 0 0 0 2-2V20" style={draw(progress)} />
		<path d="M5 20 9 9h30l4 11a5 5 0 0 1-9.5 2.4A5 5 0 0 1 24 22.4a5 5 0 0 1-9.5 0A5 5 0 0 1 5 20Z" style={draw(progress)} />
		<path d="M19 40V29h10v11" style={draw(progress)} />
	</svg>
);

/** Análise / gráfico. */
export const IconChart: IconComponent = ({
	progress = 1,
	color = C.violet,
	size = 56,
	strokeWidth = 2.1,
}) => (
	<svg {...svgProps(size, color, strokeWidth)}>
		<path d="M8 40V8" style={draw(progress)} />
		<path d="M8 40h32" style={draw(progress)} />
		<path d="M14 33v-7M22 33V19M30 33v-11M38 33V14" style={draw(progress)} />
	</svg>
);

/** Relógio — tempo perdido. */
export const IconClock: IconComponent = ({
	progress = 1,
	color = C.danger,
	size = 56,
	strokeWidth = 2.1,
}) => (
	<svg {...svgProps(size, color, strokeWidth)}>
		<circle cx="24" cy="25" r="16" style={draw(progress)} />
		<path d="M24 15v10l7 4" style={draw(progress)} />
	</svg>
);

/** Busca. */
export const IconSearch: IconComponent = ({
	progress = 1,
	color = C.blueBright,
	size = 56,
	strokeWidth = 2.1,
}) => (
	<svg {...svgProps(size, color, strokeWidth)}>
		<circle cx="21" cy="21" r="12" style={draw(progress)} />
		<path d="m30 30 10 10" style={draw(progress)} />
	</svg>
);

/** Escudo — segurança. */
export const IconShield: IconComponent = ({
	progress = 1,
	color = C.ok,
	size = 56,
	strokeWidth = 2.1,
}) => (
	<svg {...svgProps(size, color, strokeWidth)}>
		<path d="M24 6 9 12v12c0 9.4 6.4 15.9 15 18 8.6-2.1 15-8.6 15-18V12L24 6Z" style={draw(progress)} />
		<path d="m17 24 5 5 9-10" style={draw(progress)} />
	</svg>
);

/** Raio — agilidade. */
export const IconBolt: IconComponent = ({
	progress = 1,
	color = C.warn,
	size = 56,
	strokeWidth = 2.1,
}) => (
	<svg {...svgProps(size, color, strokeWidth)}>
		<path d="M27 5 11 27h11l-2 16 16-22H25l2-16Z" style={draw(progress)} />
	</svg>
);

/** Foguete — produtividade. */
export const IconRocket: IconComponent = ({
	progress = 1,
	color = C.cyan,
	size = 56,
	strokeWidth = 2.1,
}) => (
	<svg {...svgProps(size, color, strokeWidth)}>
		<path
			d="M24 5c6 4.5 9.5 11 9.5 18.5L30 32H18l-3.5-8.5C14.5 16 18 9.5 24 5Z"
			style={draw(progress)}
		/>
		<circle cx="24" cy="19" r="4" style={draw(progress)} />
		<path d="M18 32l-4 8 7-3M30 32l4 8-7-3" style={draw(progress)} />
	</svg>
);

/** Check. */
export const IconCheck: IconComponent = ({
	progress = 1,
	color = C.ok,
	size = 56,
	strokeWidth = 2.6,
}) => (
	<svg {...svgProps(size, color, strokeWidth)}>
		<path d="m10 25 9 9 19-20" style={draw(progress)} />
	</svg>
);

/** X — o que a ConsulTech elimina. */
export const IconX: IconComponent = ({
	progress = 1,
	color = C.danger,
	size = 56,
	strokeWidth = 2.6,
}) => (
	<svg {...svgProps(size, color, strokeWidth)}>
		<path d="M13 13 35 35" style={draw(progress)} />
		<path d="M35 13 13 35" style={draw(progress)} />
	</svg>
);
